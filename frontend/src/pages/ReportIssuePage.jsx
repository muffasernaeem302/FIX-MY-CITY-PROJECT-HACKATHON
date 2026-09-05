/** Report issue page. */

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import useGeolocation from "../hooks/useGeolocation";

const B = "block w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none";
const CATS = [
  { value: "POTHOLE_ROAD_DAMAGE", label: "Pothole / Road Damage" },
  { value: "BROKEN_STREETLIGHT", label: "Broken Streetlight" },
  { value: "GARBAGE_ACCUMULATION", label: "Garbage" },
  { value: "WATER_LEAKAGE", label: "Water Leakage" },
];

export default function ReportIssuePage() {
  const navigate = useNavigate();
  const { coords, error: geoErr, loading: geoLoad, request } = useGeolocation();
  const fileRef = useRef(null);

  const [cat, setCat] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errs, setErrs] = useState({});

  useEffect(() => {
    request();
  }, [request]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      setErrs((p) => ({ ...p, img: "JPEG/PNG/WebP only." }));
      return;
    }
    if (f.size > 8 * 1024 * 1024) {
      setErrs((p) => ({ ...p, img: "Max 8 MB." }));
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setErrs((p) => ({ ...p, img: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const nextErrors = {};

    if (!file) nextErrors.img = "Photo required.";
    if (!cat) nextErrors.cat = "Category required.";
    if (!title.trim()) nextErrors.title = "Title required.";
    if (!desc.trim()) nextErrors.desc = "Description required.";

    const resolvedCoords = coords || (lat && lng ? { lat: Number.parseFloat(lat), lng: Number.parseFloat(lng) } : null);
    if (!resolvedCoords) nextErrors.loc = "Location required.";

    if (Object.keys(nextErrors).length) {
      setErrs(nextErrors);
      return;
    }

    setSaving(true);
    setErrs({});

    try {
      const formData = new FormData();
      formData.append("lat", String(resolvedCoords.lat));
      formData.append("lng", String(resolvedCoords.lng));
      formData.append("category", cat);
      formData.append("title", title.trim());
      formData.append("description", desc.trim());
      formData.append("address", `${Number(resolvedCoords.lat).toFixed(4)}, ${Number(resolvedCoords.lng).toFixed(4)}`);
      if (file) formData.append("image", file);

      const { default: api } = await import("../services/api");
      const resp = await api.createIncident(formData);
      const saved = resp.data;
      navigate(`/report/result/${saved.id}`, { state: { report: saved } });
    } catch (err) {
      setErrs({ submit: err.message || "Failed to submit. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Report an Issue</h1>
          <p className="mt-2 text-slate-400">Submit a civic issue and get an instant AI risk assessment.</p>
        </div>

        <form onSubmit={submit} className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">

          {preview && (
            <div className="relative overflow-hidden rounded-xl border border-slate-700">
              <img src={preview} alt="Preview" className="h-52 w-full object-cover" />
              <button
                type="button"
                onClick={() => { setFile(null); setPreview(null); setErrs((p) => ({ ...p, img: undefined })); }}
                className="absolute right-2 top-2 rounded-full bg-slate-900/90 px-2 py-1 text-xs text-white hover:bg-red-500"
              >
                Remove
              </button>
            </div>
          )}

          <div
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 p-8 cursor-pointer hover:border-cyan-400/50 transition-colors"
          >
            <svg className="h-10 w-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="mt-2 text-sm text-slate-400">{preview ? "Change photo" : "Tap to upload photo"}</p>
            <p className="mt-1 text-xs text-slate-500">JPEG, PNG, WebP · Max 8 MB</p>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFile} />
          </div>
          {errs.img && <p className="text-xs text-red-400">{errs.img}</p>}

          <Select
            label="Category"
            required
            options={CATS}
            value={cat}
            onChange={(e) => {
              setCat(e.target.value);
              setErrs((p) => ({ ...p, cat: undefined }));
            }}
            error={errs.cat}
            placeholder="Select issue type"
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={200}
              placeholder="Brief summary"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrs((p) => ({ ...p, title: undefined }));
              }}
              className={B}
            />
            {errs.title && <p className="mt-1 text-xs text-red-400">{errs.title}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              rows={5}
              placeholder="Describe the issue, nearby hazards, and urgency"
              value={desc}
              onChange={(e) => {
                setDesc(e.target.value);
                setErrs((p) => ({ ...p, desc: undefined }));
              }}
              className={`${B} resize-none`}
            />
            {errs.desc && <p className="mt-1 text-xs text-red-400">{errs.desc}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Latitude</label>
              <input
                type="number"
                step="any"
                placeholder={coords ? coords.lat.toFixed(4) : "e.g. 40.7128"}
                value={lat}
                onChange={(e) => {
                  setLat(e.target.value);
                  setErrs((p) => ({ ...p, loc: undefined }));
                }}
                className={B}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Longitude</label>
              <input
                type="number"
                step="any"
                placeholder={coords ? coords.lng.toFixed(4) : "e.g. -74.0060"}
                value={lng}
                onChange={(e) => {
                  setLng(e.target.value);
                  setErrs((p) => ({ ...p, loc: undefined }));
                }}
                className={B}
              />
            </div>
          </div>

          {geoLoad && <div className="text-sm text-slate-400">Looking up your location…</div>}
          {errs.loc && <p className="text-xs text-red-400">{errs.loc}</p>}
          {errs.submit && <p className="text-xs text-red-400">{errs.submit}</p>}

          <div className="flex items-center justify-between gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" loading={saving} disabled={saving}>
              {saving ? "AI analyzing…" : "Submit report"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


    
