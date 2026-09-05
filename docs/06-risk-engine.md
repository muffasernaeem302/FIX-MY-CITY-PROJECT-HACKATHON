# Risk Engine, Duplicates, Routing, Status, AI

## Risk Engine (MVP)

Score is transparent: each factor contributes a known weight, stored in `risk_factors` JSONB so the UI can show a breakdown.

| Factor                       | Weight | How computed                                       |
|------------------------------|--------|----------------------------------------------------|
| Severity base                | 30     | LOW=10, MEDIUM=20, HIGH=30, CRITICAL=40 (capped)   |
| Traffic/pedestrian exposure  | 15     | Heuristic from address/category (road = high)      |
| Nearby critical locations    | 10     | Hospitals/schools within 500m (simple POI table)   |
| Report count (duplicates)    | 15     | log-scaled number of reports in same dup-group     |
| Time unresolved              | 20     | Linear, caps at 14 days                            |
| Historical incidents nearby  | 5      | Past 90d incidents within 200m                     |
| Environmental conditions     | 5      | Stubbed (rainy season flag) - clearly MVP          |

**Total raw -> clamped to 0..100.**

**Thresholds (documented MVP choices):**
- 0-24 -> LOW
- 25-49 -> MEDIUM
- 50-74 -> HIGH
- 75-100 -> CRITICAL

These thresholds are encoded in one place (`services/risk.py`).

## Duplicate Detection (MVP)

Inputs:
- Geo proximity (Haversine <= 75 m) - weight 0.4
- Text similarity (TF-IDF cosine on title+description) - weight 0.3
- Category match - weight 0.2
- Time window (<= 14 days) - weight 0.1
- Optional image similarity (perceptual hash) when available - bonus 0.1

Output: `duplicate_probability` in [0,1]. If >= 0.65, assign/append to a `duplicate_group_id` and add a row to `incident_duplicates`. Individual reports are never deleted; the UI shows "Similar reports (N)".

## Department Routing (Default Map)

| Category              | Department code | Department name        |
|-----------------------|-----------------|------------------------|
| POTHOLE_ROAD_DAMAGE   | ROADS           | Road Maintenance       |
| BROKEN_STREETLIGHT    | LIGHTING        | Street Lighting        |
| GARBAGE_ACCUMULATION  | WASTE           | Waste Management       |
| WATER_LEAKAGE         | WATER           | Water & Sanitation     |

Admin can override via `POST /api/incidents/{id}/assign`.

## Status Lifecycle

```
SUBMITTED -> AI_ANALYZING -> UNDER_REVIEW -> ASSIGNED -> IN_PROGRESS
                                                       -> REPAIR_SUBMITTED
                                                       -> VERIFICATION
                                                       -> RESOLVED
                                                       -> NEEDS_REVIEW
ASSIGNED -> REJECTED (admin with reason)
```

Transitions are validated in `services/incidents.py::transition_status()`. Every change writes a row to `incident_status_history`.

## AI Classification & Verification

- `POST /api/ai/classify` accepts an image (multipart), returns `{ category, confidence, severity_hint, description }` for the 4 MVP categories.
- Real provider is an adapter (`ai/vision_provider.py`); if `AI_PROVIDER=dev_fallback` or key missing, use `ai/dev_fallback.py` which returns a clearly labeled, deterministic result with `"source": "dev_fallback"`. The UI shows a visible banner when in fallback mode.
- Verification (`POST /api/incidents/{id}/verify`): compares BEFORE/AFTER image sets, returns `{ verdict: "LIKELY_RESOLVED"|"NEEDS_HUMAN_REVIEW", confidence, reason }`. Never claims 100%.