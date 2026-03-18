// Utility function parsing traffic levels to colors
function getTrafficColor(level) {
    if (level === 'LOW') return 'var(--green-color)';
    if (level === 'MEDIUM') return 'var(--yellow-color)';
    if (level === 'HIGH' || level === 'VERY HIGH') return 'var(--red-color)';
    return '#334155';
}

async function runPrediction() {
    try {
        const btn = document.getElementById('btn-predict');
        const originalText = btn.innerText;
        btn.innerText = "Loading...";
        btn.disabled = true;

        // Fetch API request
        const response = await fetch("http://localhost:8000/traffic-system");
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Store globally to be accessed by sim & maps logic
        window.trafficState.data = data.junctions;
        
        // Update local UI
        updateDashboardUI(window.trafficState.data);
        
        // Notify other scripts
        if (typeof window.updateSimulationUI === 'function') {
            window.updateSimulationUI(window.trafficState.data);
        }
        
        if (typeof window.updateMapUI === 'function') {
            window.updateMapUI(window.trafficState.data);
        }
        
        btn.innerText = originalText;
        btn.disabled = false;
        
    } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to fetch data from backend. Make sure the FastAPI backend is running on http://localhost:8000.\n\nInstructions to start backend:\n1. cd backend\n2. pip install -r requirements.txt\n3. uvicorn main:app --reload");
        
        const btn = document.getElementById('btn-predict');
        btn.innerText = "Run Prediction";
        btn.disabled = false;
    }
}

function updateDashboardUI(junctions) {
    for (const [key, details] of Object.entries(junctions)) {
        const card = document.getElementById(`card-${key}`);
        if (!card) continue;
        
        card.querySelector('.v-count').textContent = details.vehicle_count;
        
        const currentTag = card.querySelector('.t-current');
        currentTag.textContent = details.current;
        currentTag.style.color = '#fff';
        currentTag.style.backgroundColor = getTrafficColor(details.current);
        
        const predictTag = card.querySelector('.t-predict');
        predictTag.textContent = details.predicted;
        predictTag.style.color = '#fff';
        predictTag.style.backgroundColor = getTrafficColor(details.predicted);
        
        card.style.borderTopColor = getTrafficColor(details.current);
    }
}
