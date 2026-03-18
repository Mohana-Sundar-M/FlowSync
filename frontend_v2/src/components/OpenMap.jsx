import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Component to dynamically update map view if needed
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

function OpenMap({ data, onNodeClick, selectedNode }) {
  const [nodes, setNodes] = useState([]);



  useEffect(() => {
    if (data) {
      const processedNodes = Object.entries(data).map(([key, details]) => {
        let color = '#3b82f6'; // fallback default
        
        // V15: NS-Primary Visual Balancing
        // Shows 50/50 Red/Green split by using NS axis as map-level reference
        if (details.phase === 'NS_GREEN') {
          color = '#22c55e'; // Green
        } else if (details.phase.includes('YELLOW')) {
          color = '#eab308'; // Yellow
        } else if (details.phase === 'EW_GREEN') {
          color = '#ef4444'; // Red (from NS perspective)
        } else {
          color = '#ef4444'; // Red (ALL_RED)
        }

        return {
          id: key,
          pos: [details.lat, details.lon],
          color: color,
          details: details
        };
      });
      setNodes(processedNodes);
    }
  }, [data]);

  return (
    <div className="map-container" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', height: '100%', minHeight: '600px' }}>
      <MapContainer 
        center={[12.9716, 77.5946]} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        preferCanvas={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Massive dataset optimization using CircleMarkers. Stable keys + Canvas = 0 lag */}
        {nodes.map((node) => (
          <CircleMarker
            key={node.id}
            center={node.pos}
            pathOptions={{ 
              color: node.color, 
              fillColor: node.color, 
              fillOpacity: 0.9,
              weight: 3,
              opacity: 1
            }}
            radius={7}
            eventHandlers={{
              click: () => {
                if (onNodeClick) onNodeClick(node.details);
              },
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}

export default OpenMap;
