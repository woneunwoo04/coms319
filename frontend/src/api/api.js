const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api';


export function authHeader() {
const token = localStorage.getItem('token');
return token ? { Authorization: `Bearer ${token}` } : {};
}


export async function api(path, opts = {}) {
const res = await fetch(`${API_BASE}${path}`, {
headers: { 'Content-Type': 'application/json', ...authHeader(), ...(opts.headers||{}) },
...opts,
});
if (!res.ok) throw new Error((await res.json()).message || 'Request failed');
return res.json();
}