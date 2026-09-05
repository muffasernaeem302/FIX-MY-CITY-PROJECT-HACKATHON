import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Select from "../components/ui/Select";
import Input from "../components/ui/Input";
import useGeolocation from "../hooks/useGeolocation";
import api from "../services/api";

const DEFAULT_CENTER = [40.7128, -74.0060];
const DEFAULT_ZOOM = 11;

const RISK_COLORS = { LOW: "cyan", MEDIUM: "amber", HIGH: "orange", CRITICAL: "red" };
const RISK_ICON_COLORS = { LOW: "#06b6d4", MEDIUM: "#f59e0b", HIGH: "#f97316", CRITICAL: "#ef4444" };

const CATEGORY_LABELS = {
  POTHOLE_ROAD_DAMAGE: "Pothole / Road Damage",
  BROKEN_STREETLIGHT: "Broken Streetlight",
  GARBAGE_ACCUMULATION: "Garbage",
  WATER_LEAKAGE: "Water Leakage",
};

const STATUS_LABELS = {
  SUBMITTED: "Reported", AI_ANALYZING: "AI Analyzed", UNDER_REVIEW: "Under Review",
  ASSIGNED: "Assigned", IN_PROGRESS: "In Progress", REPAIR_SUBMITTED: "Repair Submitted",
  VERIFICATION: "Verification", RESOLVED: "Resolved", NEEDS_REVIEW: "Needs Review", REJECTED: "Rejected",
};

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});


function RiskMarker({ incident }) {
  const severity = incident.severity || "LOW";
  const color = RISK_ICON_COLORS[severity] || RISK_ICON_COLORS.LOW;
  const icon = useRef(null);
  if (!icon.current) {
    icon.current = L.divIcon({
      className: "custom-risk-marker",
      html: `<div style="width:20px;height:20px;border-radius:50%;background:${color};border:3px solid #0f172a;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:10px;">${severity[0]}</div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, -10],
    });
  }
  return (
    <Marker position={[incident.latitude, incident.longitude]} icon={icon.current}>
      <Popup><MarkerPopup incident={incident} /></Popup>
    </Marker>
  );
}

function MarkerPopup({ incident }) {
  const handleViewReport = () => { window.location.href = `/report/result/${incident.id}`; };
  return (
    <div style={{ minWidth: "280px" }} className="p-2">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-mono text-xs text-slate-500">#{incident.id}</span>
        <Badge tone={RISK_COLORS[incident.severity] || "slate"} size="sm">{incident.severity || "LOW"}</Badge>
      </div>
      <h3 className="font-semibold text-white text-sm mb-1">{incident.title || "Untitled"}</h3>
      <p className="text-xs text-slate-400 mb-2">{incident.description || "No description"}</p>
      <div className="space-y-1 text-xs text-slate-300">
        <div><span className="font-medium text-white">Category:</span> {CATEGORY_LABELS[incident.category] || incident.category}</div>
        <div><span className="font-medium text-white">Location:</span> {incident.address || `${Number(incident.latitude).toFixed(4)}, ${Number(incident.longitude).toFixed(4)}`}</div>
        <div><span className="font-medium text-white">Risk Score:</span> {incident.risk_score || 0}/100</div>
        <div><span className="font-medium text-white">Priority:</span> {incident.priority || "Normal"}</div>
        <div><span className="font-medium text-white">Status:</span> {STATUS_LABELS[incident.status] || incident.status}</div>
        <div><span className="font-medium text-white">Department:</span> {incident.assigned_dept && incident.assigned_dept.name || "Unassigned"}</div>
        <div><span className="font-medium text-white">Created:</span> {incident.created_at ? new Date(incident.created_at).toLocaleDateString() : "Unknown"}</div>
      </div>
      <Button onClick={handleViewReport} variant="primary" size="sm" className="mt-3 w-full">View Report</Button>
    </div>
  );
}

function UserLocationMarker({ position }) {
  const icon = useRef(null);
  if (!icon.current) {
    icon.current = L.divIcon({
      className: "user-location-marker",
      html: `<div style="width:24px;height:24px;border-radius:50%;background:#06b6d4;border:3px solid #0f172a;box-shadow:0 0 0 3px #06b6d4;animation:pulse 2s infinite;"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  }
  return (
    <Marker position={position} icon={icon.current}>
      <Popup>
        <div className="text-center p-1">
          <p className="font-medium text-white text-sm">Your Location</p>
          <p className="text-xs text-slate-400">{position[0].toFixed(4)}, {position[1].toFixed(4)}</p>
        </div>
      </Popup>
    </Marker>
  );
}

function MapCenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => { map.setView(center, zoom, { animate: true }); }, [center, zoom, map]);
  return null;
}


export default function MapPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ category: "", severity: "", status: "", department: "", search: "" });
  const [summary, setSummary] = useState({ total: 0, critical: 0, high: 0, inProgress: 0, resolved: 0 });
  const [userLocation, setUserLocation] = useState(null);
  const [showUserLocation, setShowUserLocation] = useState(false);
  const { coords, error: geoError, loading: geoLoading, request: requestGeo } = useGeolocation();

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = "@keyframes pulse { 0% { box-shadow: 0 0 0 3px #06b6d4; } 70% { box-shadow: 0 0 0 10px rgba(6,182,212,0); } 100% { box-shadow: 0 0 0 3px #06b6d4; } }";
    document.head.appendChild(style);
    return () => { if (document.head.contains(style)) document.head.removeChild(style); };
  }, []);

  const fetchIncidents = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.severity) params.append("severity", filters.severity);
      if (filters.status) params.append("status", filters.status);
      const query = params.toString();
      const resp = await api.getIncidents(query ? "?" + query : "");
      const data = resp.data.incidents || [];
      setIncidents(data);
      const total = data.length;
      const critical = data.filter(i => i.severity === "CRITICAL").length;
      const high = data.filter(i => i.severity === "HIGH").length;
      const inProgress = data.filter(i => ["ASSIGNED","IN_PROGRESS","REPAIR_SUBMITTED","VERIFICATION","UNDER_REVIEW","AI_ANALYZING"].includes(i.status)).length;
      const resolved = data.filter(i => i.status === "RESOLVED").length;
      setSummary({ total, critical, high, inProgress, resolved });
    } catch (err) {
      setError(err.message || "Failed to load incidents.");
      try { const stored = JSON.parse(localStorage.getItem("fixmycity_reports") || "[]"); setIncidents(stored); } catch {}
    } finally { setLoading(false); }
  }, [filters.category, filters.severity, filters.status, filters.department]);

  useEffect(() => { fetchIncidents(); }, [fetchIncidents]);

  const handleMyLocation = () => {
    if (!coords && !geoLoading) { requestGeo(); return; }
    if (coords) { setUserLocation([coords.lat, coords.lng]); setShowUserLocation(true); }
  };

  useEffect(() => { if (coords && showUserLocation) setUserLocation([coords.lat, coords.lng]); }, [coords, showUserLocation]);

  const filteredIncidents = incidents.filter(inc => {
    if (inc.latitude == null || inc.longitude == null) return false;
    if (filters.search) {
      const s = filters.search.toLowerCase();
      const matchesId = String(inc.id).includes(s);
      const matchesCat = (CATEGORY_LABELS[inc.category] || inc.category).toLowerCase().includes(s);
      const matchesLoc = (inc.address || "").toLowerCase().includes(s) || (inc.latitude + "," + inc.longitude).includes(s);
      const matchesDept = (inc.assigned_dept && inc.assigned_dept.name || "").toLowerCase().includes(s);
      if (!matchesId && !matchesCat && !matchesLoc && !matchesDept) return false;
    }
    if (filters.department && String(inc.assigned_dept_id) !== String(filters.department)) return false;
    return true;
  });

  const hasFiltered = filters.category || filters.severity || filters.status || filters.department || filters.search;
  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const clearFilters = () => setFilters({ category: "", severity: "", status: "", department: "", search: "" });

  const departments = [
    { id: 1, name: "Road Maintenance" },
    { id: 2, name: "Street Lighting" },
    { id: 3, name: "Waste Management" },
    { id: 4, name: "Water & Sanitation" },
  ];

  let mapCenter = DEFAULT_CENTER;
  let mapZoom = DEFAULT_ZOOM;
  if (showUserLocation && userLocation) { mapCenter = userLocation; mapZoom = 13; }
  else if (filteredIncidents.length > 0) { mapCenter = [filteredIncidents[0].latitude, filteredIncidents[0].longitude]; }
  else if (incidents.length > 0 && incidents[0].latitude != null) { mapCenter = [incidents[0].latitude, incidents[0].longitude]; }


  return (
    <div className="h-screen flex flex-col bg-slate-950">
      <header className="sticky top-0 z-[1000] border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl p-4">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">City Map</span>
          <span className="px-2 py-1 text-xs font-mono text-slate-300 bg-slate-800 rounded">{summary.total} incidents</span>
          <Badge tone="red" size="sm">Critical: {summary.critical}</Badge>
          <Badge tone="amber" size="sm">High: {summary.high}</Badge>
          <Badge tone="amber" size="sm">In Progress: {summary.inProgress}</Badge>
          <Badge tone="emerald" size="sm">Resolved: {summary.resolved}</Badge>
          <div className="flex-1" />
          <Link to="/dashboard"><Button variant="secondary" size="sm">Dashboard</Button></Link>
          <Button variant="secondary" size="sm" onClick={clearFilters} disabled={!hasFiltered}>Clear Filters</Button>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[150px] max-w-[200px]">
            <Select label="Category" options={[
              { value: "", label: "All Categories" },
              { value: "POTHOLE_ROAD_DAMAGE", label: "Pothole / Road Damage" },
              { value: "BROKEN_STREETLIGHT", label: "Broken Streetlight" },
              { value: "GARBAGE_ACCUMULATION", label: "Garbage" },
              { value: "WATER_LEAKAGE", label: "Water Leakage" },
            ]} value={filters.category} onChange={(e) => handleFilterChange("category", e.target.value)} />
          </div>
          <div className="flex-1 min-w-[130px] max-w-[180px]">
            <Select label="Risk" options={[
              { value: "", label: "All Risks" },
              { value: "LOW", label: "Low" },
              { value: "MEDIUM", label: "Medium" },
              { value: "HIGH", label: "High" },
              { value: "CRITICAL", label: "Critical" },
            ]} value={filters.severity} onChange={(e) => handleFilterChange("severity", e.target.value)} />
          </div>
          <div className="flex-1 min-w-[150px] max-w-[200px]">
            <Select label="Status" options={[
              { value: "", label: "All Statuses" },
              { value: "SUBMITTED", label: "Reported" },
              { value: "AI_ANALYZING", label: "AI Analyzed" },
              { value: "UNDER_REVIEW", label: "Under Review" },
              { value: "ASSIGNED", label: "Assigned" },
              { value: "IN_PROGRESS", label: "In Progress" },
              { value: "RESOLVED", label: "Resolved" },
              { value: "NEEDS_REVIEW", label: "Needs Review" },
              { value: "REJECTED", label: "Rejected" },
            ]} value={filters.status} onChange={(e) => handleFilterChange("status", e.target.value)} />
          </div>
          <div className="flex-1 min-w-[150px] max-w-[200px]">
            <Select label="Department" options={[
              { value: "", label: "All Departments" },
              ...departments.map(d => ({ value: String(d.id), label: d.name })),
            ]} value={filters.department} onChange={(e) => handleFilterChange("department", e.target.value)} />
          </div>
          <div className="flex-1 min-w-[200px] max-w-md">
            <Input label="Search" placeholder="ID, category, location, dept..." value={filters.search} onChange={(e) => handleFilterChange("search", e.target.value)} />
          </div>
          <Button variant="primary" size="sm" onClick={handleMyLocation} disabled={geoLoading} className="h-10">
            {geoLoading ? "Locating..." : "My Location"}
          </Button>
        </div>

        {error && (<div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">{error}</div>)}
        {geoError && showUserLocation && (<div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-300">Geolocation unavailable. You can enter coordinates manually on the report page.</div>)}
      </header>

      <main className="flex-1 relative">
        <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} scrollWheelZoom={true} className="w-full h-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filteredIncidents.map((incident) => (<RiskMarker key={incident.id} incident={incident} />))}
          {userLocation && showUserLocation && (<UserLocationMarker position={userLocation} />)}
          <MapCenter center={mapCenter} zoom={mapZoom} />
        </MapContainer>


        {loading && incidents.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 z-[500]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent mx-auto"></div>
              <p className="mt-4 text-slate-300">Loading city incidents...</p>
            </div>
          </div>
        )}

        {filteredIncidents.length === 0 && !loading && incidents.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 z-[500] pointer-events-none">
            <Card className="max-w-md mx-4 text-center pointer-events-auto">
              <p className="text-slate-300 font-medium">No incidents match the current filters.</p>
              <p className="mt-1 text-xs text-slate-500">Try clearing the filters or selecting different criteria.</p>
              <Button variant="secondary" size="sm" onClick={clearFilters} className="mt-4">Clear Filters</Button>
            </Card>
          </div>
        )}

        {incidents.length === 0 && !loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 z-[500] pointer-events-none">
            <Card className="max-w-md mx-4 text-center pointer-events-auto">
              <p className="text-slate-300 font-medium">No incidents reported yet.</p>
              <p className="mt-1 text-xs text-slate-500">Be the first to report an issue!</p>
              <Link to="/report"><Button variant="primary" size="sm" className="mt-4">Report an Issue</Button></Link>
            </Card>
          </div>
        )}

        {incidents.some(i => i.latitude == null || i.longitude == null) && (
          <div className="absolute bottom-20 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-[500]">
            <Card className="bg-amber-500/10 border-amber-500/30">
              <div className="flex items-center gap-2 p-3">
                <span className="text-amber-400 text-lg">!</span>
                <p className="text-sm text-amber-300">
                  {incidents.filter(i => i.latitude == null || i.longitude == null).length} incident(s) have no coordinates and are not displayed on the map.
                </p>
              </div>
            </Card>
          </div>
        )}

        <div className="absolute bottom-4 left-4 z-[500]">
          <Card className="p-3 bg-slate-950/90 border-slate-700">
            <p className="text-xs font-semibold text-slate-300 mb-2">Risk Legend</p>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: RISK_ICON_COLORS.LOW }}></span><span className="text-slate-300">Low</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: RISK_ICON_COLORS.MEDIUM }}></span><span className="text-slate-300">Medium</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: RISK_ICON_COLORS.HIGH }}></span><span className="text-slate-300">High</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: RISK_ICON_COLORS.CRITICAL }}></span><span className="text-slate-300">Critical</span></div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
