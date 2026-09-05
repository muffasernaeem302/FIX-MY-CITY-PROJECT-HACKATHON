# Risks & Technical Challenges

| Risk                                                | Mitigation                                                       |
|-----------------------------------------------------|------------------------------------------------------------------|
| AI provider rate limits or downtime during demo     | Dev fallback is deterministic and clearly labeled                 |
| Free-tier vision API returns inconsistent categories | Strong schema validation, normalize into 4-category enum          |
| Postgres not installed locally on judges' machines  | Provide `docker-compose.yml` so DB runs with one command          |
| Map tiles blocked in venue wifi                     | Pre-cache OSM tiles in `public/leaflet/` for the demo area        |
| Time pressure on email integration                  | Console email provider works end-to-end; SMTP is one adapter swap |
| Image storage on ephemeral deploy filesystem        | Keep storage adapter interface; document S3 swap in deploy guide  |
| Hackathon scope creep                               | Lock P0 list; defer P1 unless time remains                       |
| Leaflet CSS conflicts with Tailwind                 | Use a small custom wrapper + scoped CSS, verified in Phase 2     |
| JWT secret too short                                | Enforce >= 32 bytes in config validation                          |
| File upload path traversal                          | Sanitize filenames, never trust user-supplied paths              |
| Citizen escalating to admin via direct API call     | RBAC enforced at every admin endpoint dependency                  |
| Slow AI calls blocking report submission             | Background task with polling; return `AI_ANALYZING` immediately   |

# Security Checklist

- [ ] Password hashing: bcrypt, rounds=12
- [ ] JWT: HS256, TTL <= 60 min, rotate on login
- [ ] Input validation: Pydantic on every request body + query params
- [ ] File validation: MIME allow-list, size cap 8 MB, extension check
- [ ] SQL injection: SQLAlchemy parameterized queries only (no raw SQL)
- [ ] XSS: React auto-escapes; no `dangerouslySetInnerHTML` with user data
- [ ] CORS: explicit allow-list, no `*` in production
- [ ] Rate limiting: per-IP token bucket, configurable
- [ ] Error handling: single handler returns `{ ok: false, error: {...} }`
- [ ] Secrets: `.env` only, never logged, never in frontend bundle
- [ ] RBAC: dependency `require_role()` on every admin route
- [ ] Scoping: citizen queries always filter `reporter_id = current_user.id`
- [ ] Audit trail: every status change + assignment + verification is logged
- [ ] File URLs: never expose internal storage paths