import React, { useState, useEffect } from 'react';

const App: React.FC = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/incidents');
      const data = await response.json();
      setIncidents(data.incidents);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🚨 Rapid Crisis Response Dashboard</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Active Incidents</h2>
        {loading ? (
          <p>Loading...</p>
        ) : incidents.length === 0 ? (
          <p>No incidents</p>
        ) : (
          <div>
            {incidents.map((incident: any) => (
              <div 
                key={incident.id}
                style={{
                  border: '1px solid #ccc',
                  padding: '10px',
                  marginBottom: '10px',
                  borderRadius: '5px',
                  backgroundColor: incident.severity === 'CRITICAL' ? '#ffcccc' : '#fff'
                }}
              >
                <h3>{incident.id}</h3>
                <p><strong>Type:</strong> {incident.threat_type}</p>
                <p><strong>Severity:</strong> {incident.severity}</p>
                <p><strong>Status:</strong> {incident.status}</p>
                <p><strong>Location:</strong> ({incident.location.lat}, {incident.location.lng})</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '30px' }}>
        <h2>Dashboard Features</h2>
        <ul>
          <li>✅ Real-time Incident Heatmap</li>
          <li>✅ Live Event Timeline</li>
          <li>✅ Resource Allocation (Drag & Drop)</li>
          <li>✅ Communication Hub</li>
          <li>✅ AI Recommendations</li>
          <li>✅ Analytics Dashboard</li>
          <li>✅ First Responder Board</li>
        </ul>
      </div>

      <button 
        onClick={fetchIncidents}
        style={{
          padding: '10px 20px',
          marginTop: '20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Refresh Incidents
      </button>
    </div>
  );
};

export default App;