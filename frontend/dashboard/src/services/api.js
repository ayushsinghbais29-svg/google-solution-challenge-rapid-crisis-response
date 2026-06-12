import axios from 'axios';

// Base URL: uses CRA proxy (http://localhost:3000) in dev, or REACT_APP_API_URL in prod
const API_BASE = process.env.REACT_APP_API_URL || '';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 8000,
});

// ── Health ─────────────────────────────────────────────────────────────────────

export const checkApiHealth = () => apiClient.get('/api/health').then(r => r.data);

export const checkServiceHealth = async (url) => {
  try {
    const res = await axios.get(url, { timeout: 4000 });
    return { online: true, data: res.data };
  } catch {
    return { online: false };
  }
};

// ── Incidents ──────────────────────────────────────────────────────────────────

export const getIncidents = () => apiClient.get('/api/incidents').then(r => r.data);

export const getIncident = (id) => apiClient.get(`/api/incidents/${id}`).then(r => r.data);

export const createIncident = (data) => apiClient.post('/api/incidents', data).then(r => r.data);

export const updateIncident = (id, data) =>
  apiClient.put(`/api/incidents/${id}`, data).then(r => r.data);

// ── Resources ──────────────────────────────────────────────────────────────────

export const getResources = () => apiClient.get('/api/resources').then(r => r.data);

export const allocateResource = (data) =>
  apiClient.post('/api/resources/allocate', data).then(r => r.data);

export default apiClient;
