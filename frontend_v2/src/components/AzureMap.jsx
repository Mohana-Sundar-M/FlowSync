import React, { useEffect, useRef } from 'react';

// For production, insert from environment variables (.env)
const AZURE_MAPS_KEY = "YOUR_AZURE_MAPS_KEY_HERE";

// Coordinates Map
const coordinates = {
  "A": [77.5946, 12.9716],
  "B": [77.6360, 12.9300],
  "C": [77.5600, 13.0100]
};

function AzureMap({ data }) {
  const mapRef = useRef(null);
  const dataSourceRef = useRef(null);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    if (AZURE_MAPS_KEY === "YOUR_AZURE_MAPS_KEY_HERE") return; // Bypass if key not set
    if (mapRef.current) return; // Prevent double init in dev

    try {
      const map = new window.atlas.Map(mapContainerRef.current, {
        center: [77.5946, 12.9716],
        zoom: 11,
        style: 'night', 
        authOptions: {
          authType: 'subscriptionKey',
          subscriptionKey: AZURE_MAPS_KEY
        }
      });

      map.events.add('ready', () => {
        const dataSource = new window.atlas.source.DataSource();
        map.sources.add(dataSource);
        dataSourceRef.current = dataSource;
  
        const symbolLayer = new window.atlas.layer.SymbolLayer(dataSource, null, {
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
        
        // Initial render if data exists
        renderPins();
      });

      mapRef.current = map;
    } catch(err) {
      console.error(err);
    }
  }, []);

  // Update effect whenever data prop updates natively from Websocket
  useEffect(() => {
    if (dataSourceRef.current && data) {
      renderPins();
    }
  }, [data]);

  const renderPins = () => {
    if (!dataSourceRef.current || !data) return;
    
    dataSourceRef.current.clear();
    const points = [];
    
    for (const [key, details] of Object.entries(data)) {
      let pinIcon = 'marker-blue';
      if (details.predicted === 'VERY HIGH') pinIcon = 'marker-red';
      else if (details.predicted === 'HIGH') pinIcon = 'marker-yellow';
      else if (details.predicted === 'MEDIUM') pinIcon = 'marker-yellow';
      else pinIcon = 'marker-green';
      
      const point = new window.atlas.Shape(new window.atlas.data.Point(coordinates[key]), key);
      point.addProperty('title', `Jnc ${key} (${details.predicted})`);
      point.addProperty('icon', pinIcon);
      points.push(point);
    }
    
    dataSourceRef.current.add(points);
  };

  if (AZURE_MAPS_KEY === "YOUR_AZURE_MAPS_KEY_HERE") {
    return (
      <div className="map-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Config Required</p>
        <p style={{ fontSize: '0.875rem' }}>Update <code>AZURE_MAPS_KEY</code> inside <kbd>src/components/AzureMap.jsx</kbd> to unlock map rendering.</p>
      </div>
    );
  }

  return (
    <div className="map-container" ref={mapContainerRef}></div>
  );
}

export default AzureMap;
