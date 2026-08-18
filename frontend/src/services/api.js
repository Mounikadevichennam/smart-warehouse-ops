const API_BASE = '/api';

const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  } catch (err) {
    throw new Error('Network error: Unable to reach backend server');
  }

  let data;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (e) {
      data = { message: 'Invalid JSON response from server' };
    }
  } else {
    const text = await response.text();
    data = { message: text || `Server returned status ${response.status} (${response.statusText})` };
  }

  if (!response.ok) {
    throw new Error(data.message || `API Request Failed with status ${response.status}`);
  }
  return data;
};

export const api = {
  // Auth
  loginManagement: (credentials) =>
    fetchWithAuth('/auth/login-management', { method: 'POST', body: JSON.stringify(credentials) }),
  loginWorker: (credentials) =>
    fetchWithAuth('/auth/login-worker', { method: 'POST', body: JSON.stringify(credentials) }),

  // Orders
  getOrders: () => fetchWithAuth('/orders'),
  getOrderDetails: (id) => fetchWithAuth(`/orders/${id}`),
  createOrder: (orderData) => fetchWithAuth('/orders', { method: 'POST', body: JSON.stringify(orderData) }),
  cancelOrder: (id) => fetchWithAuth(`/orders/${id}/cancel`, { method: 'POST' }),

  // Tasks
  getMyActiveTask: () => fetchWithAuth('/tasks/my-active'),
  completeTask: (id, data = {}) => fetchWithAuth(`/tasks/${id}/complete`, { method: 'POST', body: JSON.stringify(data) }),
  reassignTask: (data) => fetchWithAuth('/tasks/reassign', { method: 'POST', body: JSON.stringify(data) }),

  // Exceptions
  getExceptions: () => fetchWithAuth('/exceptions'),
  reportException: (data) => fetchWithAuth('/exceptions/report', { method: 'POST', body: JSON.stringify(data) }),
  resolveException: (id, data) =>
    fetchWithAuth(`/exceptions/${id}/resolve`, { method: 'POST', body: JSON.stringify(data) }),

  // Inventory & Locations
  getInventory: () => fetchWithAuth('/inventory'),
  getLocations: () => fetchWithAuth('/inventory/locations'),

  // Restock
  getRestockRequests: () => fetchWithAuth('/restock'),
  createRestockRequest: (data) => fetchWithAuth('/restock/request', { method: 'POST', body: JSON.stringify(data) }),
  confirmRestock: (id) => fetchWithAuth(`/restock/${id}/confirm`, { method: 'POST' }),

  // Workers & Analytics
  getWorkers: () => fetchWithAuth('/workers'),
  getUsers: () => fetchWithAuth('/workers/users'),
  getOverviewMetrics: () => fetchWithAuth('/analytics/overview'),
  getBottleneckDetails: () => fetchWithAuth('/analytics/bottlenecks'),
};
