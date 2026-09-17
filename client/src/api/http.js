// In dev, Vite proxies /api to server/.

function encodeBody(body) {
  if (body === undefined) return {};
  if (body instanceof Blob) return { headers: { "Content-Type": body.type }, body };
  return { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}

export async function request(path, { method = "GET", body } = {}) {
  const res = await fetch(`/api${path}`, { method, ...encodeBody(body) });
  if (method === "GET" && res.status === 404) return null;
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({}));
    throw new Error(error ?? `${method} /api${path} failed with ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}
