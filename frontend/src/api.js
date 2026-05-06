const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const createHeaders = () => {
  const token = localStorage.getItem('ttm_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export async function post(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify(body)
  });
  return res.json();
}

export async function get(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: createHeaders()
  });
  return res.json();
}

export async function put(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: createHeaders(),
    body: JSON.stringify(body)
  });
  return res.json();
}

export async function remove(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: createHeaders()
  });
  return res.json();
}
