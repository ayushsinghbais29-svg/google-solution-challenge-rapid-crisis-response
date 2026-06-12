import React, { useState, useEffect, useRef } from 'react';
import Dashboard from './components/Dashboard';

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8080';

function App() {
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem('crDarkMode') === 'true';
    } catch {
      return false;
    }
  });
  const [wsStatus, setWsStatus] = useState('connecting');
  const [wsMessages, setWsMessages] = useState([]);
  const wsRef = useRef(null);

  // Persist dark mode preference
  useEffect(() => {
    try {
      localStorage.setItem('crDarkMode', String(dark));
    } catch { /* ignore */ }
    document.body.style.backgroundColor = dark ? '#0f172a' : '#f1f5f9';
  }, [dark]);

  // WebSocket connection
  useEffect(() => {
    let ws;
    let reconnectTimer;
    let isMounted = true;

    const connect = () => {
      if (!isMounted) return;
      setWsStatus('connecting');
      try {
        ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isMounted) return;
          setWsStatus('connected');
          console.log('✅ WebSocket connected');
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const msg = JSON.parse(event.data);
            setWsMessages((prev) => [msg, ...prev].slice(0, 20));
          } catch {
            // ignore non-JSON messages
          }
        };

        ws.onclose = () => {
          if (!isMounted) return;
          setWsStatus('disconnected');
          // Reconnect after 5 seconds
          reconnectTimer = setTimeout(connect, 5000);
        };

        ws.onerror = () => {
          if (!isMounted) return;
          setWsStatus('disconnected');
        };
      } catch {
        setWsStatus('disconnected');
        reconnectTimer = setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      isMounted = false;
      clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, []);

  return (
    <Dashboard
      dark={dark}
      onToggleDark={() => setDark((v) => !v)}
      wsStatus={wsStatus}
      wsMessages={wsMessages}
    />
  );
}

export default App;
