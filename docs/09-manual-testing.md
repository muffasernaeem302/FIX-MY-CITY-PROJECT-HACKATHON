# Manual Testing Checklist

## Authentication

- [ ] Register as citizen with valid email/password
- [ ] Register rejects duplicate email
- [ ] Register validates password length (< 8 chars rejected)
- [ ] Login with correct credentials returns JWT
- [ ] Login with wrong password returns 401
- [ ] Login with unknown email returns 401
- [ ] Access `/api/auth/me` with valid JWT returns user profile
- [ ] Access with expired/invalid JWT returns 401
- [ ] Admin login works with admin credentials
- [ ] Citizen cannot access any `/api/admin/*` endpoint (403)

## Incident CRUD

- [ ] Citizen can create incident with image + description + location
- [ ] Incident is saved with status `SUBMITTED`
- [ ] Incident appears in citizen's "My Reports" list
- [ ] Incident detail shows AI classification + severity + risk score
- [ ] Admin can see all incidents
- [ ] Admin can change incident status (valid transition)
- [ ] Admin cannot change to invalid status (e.g. RESOLVED -> SUBMITTED)
- [ ] Status change creates history row
- [ ] Incident detail shows full status timeline
- [ ] Citizen cannot modify incident status
- [ ] Image upload rejects non-image files (validate MIME type)
- [ ] Image upload rejects files > 8 MB
- [ ] File validation returns clear error message

## Geolocation & Map

- [ ] Browser geolocation prompt appears on report form
- [ ] Manual location entry works if geolocation denied
- [ ] Map shows correct marker at incident location
- [ ] Admin map shows all incident markers
- [ ] Admin map allows filtering by status
- [ ] Admin map allows filtering by category
- [ ] Admin map shows risk-score-colored markers

## AI Classification

- [ ] `/api/ai/classify` returns a valid 4-category result
- [ ] Response includes confidence score (0-1)
- [ ] Response includes severity_hint
- [ ] If `AI_PROVIDER=dev_fallback`, response includes `"source": "dev_fallback"`
- [ ] UI shows "DEMO MODE" banner when in fallback mode
- [ ] Real provider (when configured) returns comparable schema

## Severity & Risk

- [ ] Severity defaults from AI `severity_hint`
- [ ] Risk score is computed and stored (0-100)
- [ ] Risk factors JSON is populated
- [ ] UI shows risk factor breakdown
- [ ] Severity thresholds map correctly: 0-24=LOW, 25-49=MEDIUM, 50-74=HIGH, 75-100=CRITICAL
- [ ] Admin can override severity manually
- [ ] Risk score updates when severity changes

## Duplicate Detection

- [ ] Two reports within 75m with same category are flagged as duplicate candidates
- [ ] Duplicate probability >= 0.65 creates a duplicate_group_id
- [ ] UI shows "Similar reports (N)" on incident detail
- [ ] Individual citizen reports are NOT deleted
- [ ] Text-only similarity produces lower probability (no geo match)
- [ ] Adding a third similar report increases count but same group

## Department Routing

- [ ] New Pothole/Road Damage incident routes to Road Maintenance
- [ ] New Broken Streetlight incident routes to Street Lighting
- [ ] New Garbage incident routes to Waste Management
- [ ] New Water Leakage incident routes to Water & Sanitation
- [ ] Admin can override department assignment
- [ ] Assignment change is tracked in history
- [ ] Assigned department sees the incident in their queue

## Admin Dashboard

- [ ] Metrics row shows correct counts from DB
- [ ] Map renders with all active incident markers
- [ ] Priority queue is sorted by risk_score descending
- [ ] Incident detail shows full history timeline
- [ ] Analytics charts render without errors
- [ ] Filters (status, category, date range) work correctly

## Repair Evidence & Verification

- [ ] Admin can upload after-repair image
- [ ] Status transitions to `REPAIR_SUBMITTED`
- [ ] `/api/incidents/{id}/verify` returns verdict
- [ ] Verdict is one of `LIKELY_RESOLVED` or `NEEDS_HUMAN_REVIEW`
- [ ] Verification result is stored
- [ ] UI shows before/after images side by side

## Notifications

- [ ] In-app notification created on new incident
- [ ] In-app notification created on assignment
- [ ] In-app notification created on status change
- [ ] In-app notification created on resolution
- [ ] `/api/notifications` returns only current user's notifications
- [ ] Email (if configured) sends on submission
- [ ] Email sends on resolution

## Security

- [ ] SQL injection in search/description fields is neutralized
- [ ] JWT cannot be reused after expiry
- [ ] CORS blocks requests from unauthorized origins
- [ ] Rate limiter returns 429 after limit exceeded
- [ ] Uploaded file URLs do not expose filesystem paths
- [ ] Error responses do not contain stack traces
- [ ] Passwords are never returned in any API response
- [ ] Admin-only endpoints return 403 for citizens

## File Upload

- [ ] JPEG, PNG, WebP accepted
- [ ] GIF, SVG, PDF rejected
- [ ] 7 MB file accepted
- [ ] 9 MB file rejected with "file too large" message
- [ ] Image is served at returned URL
- [ ] Multiple images can be uploaded per incident
- [ ] Images are associated correctly with incident