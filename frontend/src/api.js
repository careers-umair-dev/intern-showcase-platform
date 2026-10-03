const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const assetUrl = value => {
  if (!value) return value;
  if (/^(https?:)?\/\//.test(value) || value.startsWith('data:')) return value;
  return `${API_BASE}${value.startsWith('/') ? value : `/${value}`}`;
};

export async function api(path, { method = 'GET', body, form, signal } = {}) {
  const t = localStorage.getItem('t');
  const r = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers: {
      ...(t && { Authorization: 'Bearer ' + t }),
      ...(body && { 'Content-Type': 'application/json' }),
    },
    body: form || (body && JSON.stringify(body)),
    signal,
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.message || 'Something went wrong');
  return d;
}

export const upload = async file => {
  const f = new FormData();
  f.append('file', file);
  return (await api('/upload', { method: 'POST', form: f })).url;
};
