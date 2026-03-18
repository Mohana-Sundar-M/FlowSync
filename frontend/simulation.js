// Exported so dashboard can hook into it
window.updateSimulationUI = function(junctions) {
    for (const [key, details] of Object.entries(junctions)) {
        const sim = document.getElementById(`sim-${key}`);
        if (!sim) continue;
        
        // Update vehicle counting visual
        sim.querySelector('.sim-count span').textContent = details.vehicle_count;
        
        // Reset the signal display if new predictions ran
        const signalCircle = sim.querySelector('.signal-circle');
        signalCircle.className = 'signal-circle';
    }
};

function optimizeSignals() {
    const junctions = window.trafficState.data;
    
    if (!junctions) {
        alert("Please click 'Run Prediction' first to get real-time traffic data!");
        return;
    }
    
    // Switch signal visuals logically to map coordinates API backend data
    for (const [key, details] of Object.entries(junctions)) {
        const sim = document.getElementById(`sim-${key}`);
        if (!sim) continue;
        
        const signalCircle = sim.querySelector('.signal-circle');
        signalCircle.className = 'signal-circle'; // Reset inline style caching
        
        if (details.signal === 'GREEN') {
            signalCircle.classList.add('signal-green');
        } else if (details.signal === 'RED') {
            signalCircle.classList.add('signal-red');
        }
    }
}
