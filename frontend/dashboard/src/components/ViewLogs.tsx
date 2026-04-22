import React, { useState, useEffect, useRef, useCallback } from 'react';
import Modal from './Modal';

type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

interface LogEntry {
  id: number;
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
}

interface Props {
  onNotify: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const SERVICES = ['api-server', 'gemini-service', 'vertex-ai', 'vision-service', 'websocket'];

const LOG_MESSAGES: Record<LogLevel, string[]> = {
  ERROR: [
    'Connection to database timed out after 5000ms',
    'Failed to authenticate request — invalid token',
    'Gemini API rate limit exceeded',
    'WebSocket connection dropped unexpectedly',
    'Unhandled promise rejection in incident handler',
  ],
  WARN: [
    'High memory usage detected: 82% heap used',
    'Response time exceeding SLA threshold (>2s)',
    'Retry attempt 3/5 for external API call',
    'Cache miss rate above 40% — consider warming',
    'Certificate expiry in 7 days',
  ],
  INFO: [
    'Incident INC-001 status updated to ACTIVE',
    'Resource allocation request processed',
    'Health check passed for all services',
    'New WebSocket connection established',
    'AI analysis completed — confidence: 94%',
    'Report generated and exported successfully',
  ],
  DEBUG: [
    'Fetching incidents from database: query took 12ms',
    'Token refresh successful for user session',
    'Cache hit for incidents list',
    'WebSocket ping/pong latency: 18ms',
    'Gemini model loaded in 340ms',
  ],
};

let logIdCounter = 1;

const generateLog = (): LogEntry => {
  const levels: LogLevel[] = ['ERROR', 'WARN', 'INFO', 'INFO', 'INFO', 'DEBUG', 'DEBUG'];
  const level = levels[Math.floor(Math.random() * levels.length)];
  const messages = LOG_MESSAGES[level];
  const message = messages[Math.floor(Math.random() * messages.length)];
  const service = SERVICES[Math.floor(Math.random() * SERVICES.length)];
  return {
    id: logIdCounter++,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    level,
    service,
    message,
  };
};

const INITIAL_LOGS: LogEntry[] = Array.from({ length: 15 }, generateLog).reverse();

const ViewLogs: React.FC<Props> = ({ onNotify }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [streaming, setStreaming] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleOpen = () => {
    onNotify('📜 Loading system logs…', 'info');
    setIsOpen(true);
    setStreaming(true);
  };

  const startStreaming = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setLogs((prev) => {
        const newLog = generateLog();
        const updated = [...prev, newLog];
        return updated.length > 200 ? updated.slice(-200) : updated;
      });
    }, 2000);
  }, []);

  const stopStreaming = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (streaming && isOpen) {
      startStreaming();
    } else {
      stopStreaming();
    }
    return stopStreaming;
  }, [streaming, isOpen, startStreaming, stopStreaming]);

  useEffect(() => {
    if (autoScroll && logsEndRef.current && isOpen) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll, isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setStreaming(false);
  };

  const filteredLogs = logs.filter((log) => {
    const levelMatch = filterLevel === 'ALL' || log.level === filterLevel;
    const searchMatch = !searchQuery || log.message.toLowerCase().includes(searchQuery.toLowerCase()) || log.service.toLowerCase().includes(searchQuery.toLowerCase());
    return levelMatch && searchMatch;
  });

  const errorCount = logs.filter((l) => l.level === 'ERROR').length;

  return (
    <div className="card">
      <h2 className="card-title">📜 System Logs</h2>

      <div className="metric">
        <span className="metric-label">Total Log Entries</span>
        <span className="metric-value">{logs.length}</span>
      </div>
      <div className="metric">
        <span className="metric-label">Error Count</span>
        <span className="metric-value" style={{ color: errorCount > 0 ? '#e74c3c' : '#27ae60' }}>{errorCount}</span>
      </div>
      <div className="metric">
        <span className="metric-label">Log Streaming</span>
        <span className={`metric-value ${streaming ? 'status-online' : 'status-offline'}`}>
          {streaming ? '🟢 Live' : '⏹️ Stopped'}
        </span>
      </div>

      <button className="button" onClick={handleOpen}>
        📜 View Logs
      </button>

      <Modal isOpen={isOpen} onClose={handleClose} title="📜 System Logs Viewer" size="wide">
        <div>
          {/* Toolbar */}
          <div className="logs-toolbar">
            <input
              type="text"
              className="search-input"
              placeholder="🔍 Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="filter-select"
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
            >
              <option value="ALL">All Levels</option>
              <option value="ERROR">🔴 ERROR</option>
              <option value="WARN">🟡 WARN</option>
              <option value="INFO">🔵 INFO</option>
              <option value="DEBUG">🟢 DEBUG</option>
            </select>
            <button
              className="button"
              style={{ margin: 0, width: 'auto', padding: '8px 14px' }}
              onClick={() => setStreaming((s) => !s)}
            >
              {streaming ? '⏹️ Stop' : '▶️ Stream'}
            </button>
            <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.85rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={autoScroll} onChange={(e) => setAutoScroll(e.target.checked)} />
              Auto-scroll
            </label>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
            {(['ERROR', 'WARN', 'INFO', 'DEBUG'] as LogLevel[]).map((level) => {
              const count = logs.filter((l) => l.level === level).length;
              return (
                <span
                  key={level}
                  className={`log-level ${level}`}
                  style={{ cursor: 'pointer', padding: '4px 10px' }}
                  onClick={() => setFilterLevel(filterLevel === level ? 'ALL' : level)}
                >
                  {level}: {count}
                </span>
              );
            })}
            <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: '#888', alignSelf: 'center' }}>
              Showing {filteredLogs.length} / {logs.length} entries
            </span>
          </div>

          {/* Log Container */}
          <div className="logs-container">
            {filteredLogs.length === 0 ? (
              <div style={{ color: '#666', textAlign: 'center', padding: 20 }}>No logs match your filter</div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="log-entry">
                  <span className="log-time">{log.timestamp}</span>
                  <span className={`log-level ${log.level}`}>{log.level}</span>
                  <span style={{ color: '#6c7086', marginRight: 8, fontSize: '0.78rem' }}>[{log.service}]</span>
                  <span className="log-message">{log.message}</span>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>

          <div className="button-group" style={{ marginTop: 12 }}>
            <button
              className="button button-secondary"
              onClick={() => {
                setLogs([]);
                onNotify('🗑️ Logs cleared', 'info');
              }}
            >
              🗑️ Clear Logs
            </button>
            <button className="button button-secondary" onClick={handleClose}>
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ViewLogs;
