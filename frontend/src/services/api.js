const API_BASE = 'http://localhost:5000/api';

/**
 * Core API fetch wrapper with JWT auth
 */
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('smartseason_token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }

  return data;
}

// ── Auth API ──
export const authAPI = {
  login: (email, password) =>
    apiFetch('/auth/login', { method: 'POST', body: { email, password } }),

  register: (name, email, password, role) =>
    apiFetch('/auth/register', { method: 'POST', body: { name, email, password, role } }),

  getMe: () => apiFetch('/auth/me'),
};

// ── Users API ──
export const usersAPI = {
  getAll: (role) =>
    apiFetch(`/users${role ? `?role=${role}` : ''}`),

  getById: (id) =>
    apiFetch(`/users/${id}`),

  update: (id, data) =>
    apiFetch(`/users/${id}`, { method: 'PUT', body: data }),

  delete: (id) =>
    apiFetch(`/users/${id}`, { method: 'DELETE' }),
};

// ── Fields API ──
export const fieldsAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.stage) params.append('stage', filters.stage);
    if (filters.crop_type) params.append('crop_type', filters.crop_type);
    const query = params.toString();
    return apiFetch(`/fields${query ? `?${query}` : ''}`);
  },

  getById: (id) =>
    apiFetch(`/fields/${id}`),

  create: (data) =>
    apiFetch('/fields', { method: 'POST', body: data }),

  update: (id, data) =>
    apiFetch(`/fields/${id}`, { method: 'PUT', body: data }),

  delete: (id) =>
    apiFetch(`/fields/${id}`, { method: 'DELETE' }),

  assign: (id, agentId) =>
    apiFetch(`/fields/${id}/assign`, { method: 'PUT', body: { agent_id: agentId } }),

  addUpdate: (id, data) =>
    apiFetch(`/fields/${id}/updates`, { method: 'POST', body: data }),

  getUpdates: (id) =>
    apiFetch(`/fields/${id}/updates`),
};

// ── Dashboard API ──
export const dashboardAPI = {
  getStats: () => apiFetch('/dashboard/stats'),
  getRecentUpdates: (limit = 10) => apiFetch(`/dashboard/recent-updates?limit=${limit}`),
};

export default apiFetch;
