// ==========================================
// AZURE MAPS SETUP
// ==========================================
const AZURE_MAPS_KEY = "YOUR_AZURE_MAPS_KEY_HERE";

let map;
let dataSource;

function initMap() {
    // Basic verification catch to indicate mapping placeholder
    if (AZURE_MAPS_KEY === "YOUR_AZURE_MAPS_KEY_HERE" || !AZURE_MAPS_KEY) {
        document.getElementById('map').innerHTML = `
            <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100%; background-color:#1e293b; color:#94a3b8; text-align:center; padding: 2rem;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:1rem; color:#475569;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">Map Initialization Pending</p>
                <p style="font-size: 0.9rem; max-width: 80%;">Update the <code style="background:#0f172a; padding:2px 4px; border-radius:4px;">AZURE_MAPS_KEY</code> variable in <strong>map.js</strong> with your actual Azure Maps Primary Key to enable map functionality.</p>
            </div>
        `;
        return;
    }

    try {
        // Instantiate Map
        map = new atlas.Map('map', {
            center: [77.5946, 12.9716], // Bengaluru center bounds
            zoom: 11,
            style: 'night', 
            authOptions: {
                authType: 'subscriptionKey',
                subscriptionKey: AZURE_MAPS_KEY
            }
        });

        // Add pins logic only when the map's ready
        map.events.add('ready', function () {
            dataSource = new atlas.source.DataSource();
            map.sources.add(dataSource);
            
            const symbolLayer = new atlas.layer.SymbolLayer(dataSource, null, {
                iconOptions: {
                    image: ['get', 'icon'],
                    size: 1.2,
                    allowOverlap: true
                },
                textOptions: {
                    textField: ['get', 'title'],
                    offset: [0, 1.5],
                    color: '#ffffff',
                    haloColor: '#000000',
                    haloWidth: 2,
                    size: 14
                }
            });
            map.layers.add(symbolLayer);
        });
    } catch(e) {
        console.error("Map initialization failed:", e);
    }
}

// Map hook
window.updateMapUI = function(junctions) {
    if (!dataSource) return;
    
    dataSource.clear();
    
    // Coordinates targeting key intersections mapped in Bengaluru
    const coordinates = {
        "A": [77.5946, 12.9716], // City Center 
        "B": [77.6360, 12.9300], // Koramangala
        "C": [77.5600, 13.0100]  // Malleshwaram
    };
    
    const points = [];
    
    for (const [key, details] of Object.entries(junctions)) {
        let pinIcon = 'marker-blue';
        
        // Bind traffic map levels to visual rendering limits
        if (details.predicted === 'VERY HIGH') {
             pinIcon = 'marker-red';
        } else if (details.predicted === 'HIGH') {
             pinIcon = 'marker-yellow';
        } else if (details.predicted === 'MEDIUM') {
             pinIcon = 'marker-yellow';
        } else {
             pinIcon = 'marker-green';
        }
        
        const point = new atlas.Shape(new atlas.data.Point(coordinates[key]), key);
        point.addProperty('title', `Junction ${key}\n${details.predicted}`);
        point.addProperty('icon', pinIcon);
        
        points.push(point);
    }
    
    // Draw all
    dataSource.add(points);
};

window.addEventListener('load', initMap);
