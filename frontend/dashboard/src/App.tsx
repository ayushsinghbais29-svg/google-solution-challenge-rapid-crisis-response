import React, { useState, useEffect, useCallback } from 'react';
import './index.css';
import SystemStatus from './components/SystemStatus';
import IncidentManager from './components/IncidentManager';
import AIAnalysis from './components/AIAnalysis';
import Resources from './components/Resources';
import Analytics from './components/Analytics';
import SendAlert from './components/SendAlert';
import GenerateReport from './components/GenerateReport';
import ViewLogs from './components/ViewLogs';
import { NotificationContainer, NotificationItem, createNotification } from './components/Notification';

const API_BASE = 'http://localhost:3000';

interface Incident {
  id: string;
  threat_type: string;
  severity: string;
  status: string;
  location?: { lat: number; lng: number };
  description?: string;
  created_at?: string;
}

const App: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [loadingIncidents, setLoadingIncidents] = useState(false);

  const notify = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setNotifications((prev) => createNotification(prev, message, type));
  }, []);

  const dismissNotification = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const fetchIncidents = useCallback(async () => {
    setLoadingIncidents(true);
    try {
      const response = await fetch(`${API_BASE}/api/incidents`);
      const data = await response.json();
      setIncidents(data.incidents || []);
    } catch {
      // Show mock data when API is offline
      setIncidents([
        {
          id: 'INC-001',
          threat_type: 'FIRE',
          severity: 'CRITICAL',
          status: 'ACTIVE',
          location: { lat: 40.7128, lng: -74.0060 },
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoadingIncidents(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const handleIncidentCreated = (incident: Incident) => {
    setIncidents((prev) => [incident, ...prev]);
  };

  return (
    <div className={`app-container${darkMode ? ' dark-mode' : ''}`}>
      {/* Header */}
      <div className="header">
        <h1>🚨 Rapid Crisis Response Dashboard</h1>
        <div className="header-actions">
          <button
            className="theme-toggle"
            onClick={fetchIncidents}
            disabled={loadingIncidents}
            title="Refresh all data"
          >
            {loadingIncidents ? '⏳ Refreshing…' : '🔄 Refresh'}
          </button>
          <button
            className="theme-toggle"
            onClick={() => setDarkMode((d) => !d)}
            title="Toggle dark mode"
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        <SystemStatus />
        <IncidentManager
          incidents={incidents}
          onIncidentCreated={handleIncidentCreated}
          onNotify={notify}
        />
        <AIAnalysis onNotify={notify} />
        <Resources onNotify={notify} />
        <Analytics onNotify={notify} />
        <SendAlert onNotify={notify} />
        <GenerateReport onNotify={notify} />
        <ViewLogs onNotify={notify} />
      </div>

      {/* Notifications */}
      <NotificationContainer notifications={notifications} onDismiss={dismissNotification} />
    </div>
  );
};

export default App;