// src/api.js

// ✅ FIX 1: Use relative URL in dev (proxy in package.json forwards to :5000)
//           Set REACT_APP_API_URL in production .env only
const API_BASE = process.env.REACT_APP_API_URL || '/api';

const createHeaders = () => {
  const token = localStorage.getItem('ttm_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

// ✅ FIX 2: Central response handler — throws on any non-2xx status
async function handleResponse(res) {
  if (res.status === 204) return null; // No Content

  let data;
  try {
    data = await res.json();
  } catch {
    // Response body wasn't JSON (e.g. HTML error page from crashed server)
    throw new Error(`Server error ${res.status}: response was not JSON`);
  }

  if (!res.ok) {
    // ✅ FIX 3: Use server's own error message if available
    const message =
      data?.message ||
      data?.error ||
      `Request failed with status ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export async function post(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify(body)
  });
  return handleResponse(res);
}

export async function get(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: createHeaders()
  });
  return handleResponse(res);
}

export async function put(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: createHeaders(),
    body: JSON.stringify(body)
  });
  return handleResponse(res);
}

export async function remove(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: createHeaders()
  });
  return handleResponse(res);
}