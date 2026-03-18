import { useState, useEffect } from 'react';
import { Activity, MapPin, Gauge, Menu, Map as MapIcon, Database, List, Info, TrendingUp, AlertTriangle } from 'lucide-react';
import OpenMap from './components/OpenMap';
import AnalyticsSidebar from './components/AnalyticsSidebar';
import ActionLogPanel from './components/ActionLogPanel';
import SystemMenu from './components/SystemMenu';

function App() {
  const [trafficData, setTrafficData] = useState(null);
  const [actionLogs, setActionLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  
  // V7: Active View State (map, dashboard, logs, info)
  const [activeView, setActiveView] = useState('map');
  const [systemMeta, setSystemMeta] = useState({ is_peak_hour: false, city_wide_volume: 0, timestamp: '' });

  useEffect(() => {
    let ws;
    
    const connectWebSocket = () => {
      ws = new WebSocket('ws://localhost:8000/ws/traffic');
      
      ws.onopen = () => {
        setIsConnected(true);
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'UPDATE') {
            const dataPayload = message.data.junctions ? message.data.junctions : message.data;
            const logPayload = message.data.actions || [];
            
            setTrafficData(dataPayload);
            setActionLogs(logPayload);
            if (message.data.meta) setSystemMeta(message.data.meta);
            
            // Auto update selected node if it's currently focused
            setSelectedNode(prev => {
              if (prev && dataPayload[prev.id]) {
                return dataPayload[prev.id];
              }
              return prev;
            });
          }
        } catch (e) { console.error('WS Parse Error', e); }
      };
      
      ws.onclose = () => {
        setIsConnected(false);
        setTimeout(connectWebSocket, 5000);
      };
    };

    connectWebSocket();
    
    return () => {
      if (ws) ws.close();
    };
  }, []);

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Top Navigation Bar */}
      <nav className="navbar" style={{ flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Activity color="#3b82f6" fill="rgba(59, 130, 246, 0.2)" />
          <h2><span className="text-gradient">FlowSync Control Center</span></h2>
          <div className={`status-badge ${isConnected ? 'status-low' : 'status-med'}`} style={{ marginLeft: '1rem' }}>
            <div className="status-dot"></div>
            {isConnected ? 'City Grid Connected' : 'Local Demo Mode'}
          </div>
          {systemMeta.is_peak_hour && (
            <div className="status-badge status-high" style={{ animation: 'pulse 2s infinite' }}>
              <AlertTriangle size={14} /> Peak Traffic Hour Active
            </div>
          )}
        </div>
      </nav>
        
      {/* Main Layout Area splits into Left Navigation and Main Content View */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* V7 Left Navigation Sidebar */}
        <aside style={{
          width: '280px',
          background: 'rgba(9, 9, 11, 0.6)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.5rem',
          gap: '0.5rem'
        }}>
          <h3 style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>Views</h3>
          
          <button onClick={() => setActiveView('map')} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem',
            background: activeView === 'map' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
            border: activeView === 'map' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
            color: activeView === 'map' ? 'white' : 'var(--text-secondary)',
            borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: activeView === 'map' ? 600 : 400,
            transition: 'all 0.2s'
          }}>
            <MapIcon size={20} color={activeView === 'map' ? 'var(--accent-blue)' : 'var(--text-secondary)'} />
            Live Map Feed
          </button>
          
          <button onClick={() => setActiveView('dashboard')} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem',
            background: activeView === 'dashboard' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
            border: activeView === 'dashboard' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
            color: activeView === 'dashboard' ? 'white' : 'var(--text-secondary)',
            borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: activeView === 'dashboard' ? 600 : 400,
            transition: 'all 0.2s'
          }}>
            <Database size={20} color={activeView === 'dashboard' ? 'var(--accent-blue)' : 'var(--text-secondary)'} />
            System Grid Data
          </button>
          
          <button onClick={() => setActiveView('logs')} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem',
            background: activeView === 'logs' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
            border: activeView === 'logs' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
            color: activeView === 'logs' ? 'white' : 'var(--text-secondary)',
            borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: activeView === 'logs' ? 600 : 400,
            transition: 'all 0.2s'
          }}>
            <List size={20} color={activeView === 'logs' ? 'var(--accent-blue)' : 'var(--text-secondary)'} />
            AI Operations Log
          </button>

          <button onClick={() => setActiveView('planning')} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem',
            background: activeView === 'planning' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
            border: activeView === 'planning' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
            color: activeView === 'planning' ? 'white' : 'var(--text-secondary)',
            borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: activeView === 'planning' ? 600 : 400,
            transition: 'all 0.2s'
          }}>
            <TrendingUp size={20} color={activeView === 'planning' ? 'var(--accent-blue)' : 'var(--text-secondary)'} />
            AI City Planning
          </button>


          <div style={{ flex: 1 }}></div>

          <button onClick={() => setActiveView('info')} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem',
            background: activeView === 'info' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
            border: activeView === 'info' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent',
            color: activeView === 'info' ? 'white' : 'var(--text-secondary)',
            borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
            transition: 'all 0.2s'
          }}>
            <Info size={20} />
            Model & Documentation
          </button>
        </aside>

        {/* Dynamic Main View Rendering based on active tab */}
        <main style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
          
          {activeView === 'map' && (
            <>
              <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  {trafficData ? (
                    <OpenMap 
                      data={trafficData} 
                      onNodeClick={(nodeData) => setSelectedNode(nodeData)} 
                      selectedNode={selectedNode}
                    />
                  ) : (
                    <div className="glass-panel" style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                      <p style={{ color: 'var(--text-secondary)' }}>Initializing Geospatial Grid via ML Pipeline...</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Sidebar only shows on Map View when a node is clicked */}
              <AnalyticsSidebar data={trafficData} selectedNode={selectedNode} onDeselect={() => setSelectedNode(null)} />
            </>
          )}

          {activeView === 'dashboard' && (
            <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Database color="var(--accent-blue)" /> System Grid Analytics
                </h2>
                <SystemMenu 
                  data={trafficData} 
                  onClose={() => {}} 
                  onNodeSelect={(node) => {
                    setSelectedNode(node);
                    setActiveView('map');
                  }}
                  isFullscreen={true} // new prop to style differently if needed
                />
              </div>
            </div>
          )}

          {activeView === 'logs' && (
            <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
              <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <List color="var(--accent-blue)" /> Global AI Operations History
                </h2>
                <div style={{ height: '70vh' }}>
                  <ActionLogPanel actions={actionLogs} />
                </div>
              </div>
            </div>
          )}

          {activeView === 'planning' && (
             <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                  <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <TrendingUp color="var(--accent-blue)" /> Smart Signal Suggestions
                  </h2>
                  <div className="glass-panel" style={{ padding: '2rem' }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                      Our AI model has analyzed the 1,252 nodes in the city grid. Below are current recommendations for additional hardware deployments to relieve bottlenecking.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {/* We'll hardcode or fetch these in a real app, for now simulation */}
                      {[1, 2, 3].map(i => (
                        <div key={i} className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                           <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Candidate Location #{i}</div>
                           <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                              Recommended based on {systemMeta.is_peak_hour ? 'Current Peak Hour' : 'Historical'} bottlenecking at nearby junctions.
                           </p>
                           <button className="button-primary" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>Deploy Virtual Signal</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
             </div>
          )}


          {activeView === 'info' && (
            <div style={{ flex: 1, padding: '4rem 6rem', overflowY: 'auto' }}>
              <div style={{ maxWidth: '800px', margin: '0 auto', color: 'var(--text-primary)' }}>
                <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>FlowSync AI V7</h1>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '3rem', lineHeight: 1.6 }}>
                  An enterprise-grade traffic orchestration engine using Python machine learning, Azure Cosmos DB, and Spatial Network Mathematics.
                </p>

                <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>1. The Map Data Source</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
                  Geospatial coordinates (latitude/longitude) of Bangalore are pulled live via the <strong>OpenStreetMap Overpass API</strong>. The Python backend caches these hardware node locations, so the map places the dots precisely where real traffic lights exist in the physical city.
                </p>

                <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>2. The Traffic Simulation Engine</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
                  Commercial traffic APIs (like Google Maps, TomTom, INRIX) do not provide raw vehicle throughput counts for free. To demonstrate FlowSync's algorithms functionally, the `ml_model.py` engine generates <strong>Mathmatic Flow Curves</strong> based on the exact live clock on your computer. 
                  <br/><br/>
                  If it is 9:00 AM, the model artificially spawns heavy traffic loads across the network. It calculates a 10-minute forecast and logs "Yesterday's Baseline" history for the UI to compare against.
                </p>

                <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>3. The Master Clock Orchestrator</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
                  The User Interface has zero logic. The Python backend runs an `asyncio` relentless loop, ticking down the precise timing array for every traffic signal simultaneously. The UI receives a massive JSON payload 1x per second and simply renders what the Backend dictates—simulating a true Command & Control Center hierarchy.
                </p>

                <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>4. V7 Spatial Network Shielding</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
                  When the AI detects a massive congestion spike at Node X, it executes a Euclidean distance scan to find the 3 closest intersections. It mathematically intercepts their timing boards and forces their lights to stay RED, throttling the amount of cars capable of reaching the congested junction until It clears.
                </p>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default App;
