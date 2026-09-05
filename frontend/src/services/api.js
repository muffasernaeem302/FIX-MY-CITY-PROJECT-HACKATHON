/* Frontend API service - connects to backend at http://127.0.0.1:8000 */
const BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

/** @returns {string|null} */
function getToken() {
  return localStorage.getItem("fmc_token");
}

async function request(method, path, body, isForm) {
  const headers = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  let data = body;
  if (body && !isForm) {
    headers["Content-Type"] = "application/json";
    data = JSON.stringify(body);
  }
  const resp = await fetch(`${BASE}${path}`, { method, headers, body: data });
  const json = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(json.detail || `HTTP ${resp.status}`);
  return json;
}

export const api = {
  // Auth
  register: (email, password, full_name) => request("POST", "/auth/register", { email, password, full_name }),
  login: (email, password) => request("POST", "/auth/login", { email, password }),
  me: () => request("GET", "/auth/me"),
  // Incidents
  createIncident: async (formData) => {
    const token = getToken();
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const resp = await fetch(`${BASE}/incidents`, { method: "POST", headers, body: formData });
    const json = await resp.json().catch(() => ({}));
    if (!resp.ok) throw new Error(json.detail || `HTTP ${resp.status}`);
    return json;
  },
  getIncidents: (params = "") => request("GET", `/incidents${params ? `?${params}` : ""}`),
  getMyIncidents: () => request("GET", "/incidents/mine"),
  getIncident: (id) => request("GET", `/incidents/${id}`),
  updateStatus: (id, status, note) => request("POST", `/incidents/${id}/status`, { status, note }),
  // Public
  getCategories: () => request("GET", "/public/categories"),
  getDepartments: () => request("GET", "/public/departments"),
  getDashboardStats: () => request("GET", "/public/dashboard/stats"),
  // Storage base URL for images
  storageBase: BASE.replace("/api", ""),
};

export default api;
