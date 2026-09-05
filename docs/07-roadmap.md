# Development Roadmap (Phases)

| Phase | Title                          | Deliverable                                                                 |
|-------|--------------------------------|-----------------------------------------------------------------------------|
| 0     | Architecture & Planning        | This document set + folder skeleton                                          |
| 1     | Dev environment                | `.gitignore`, `.env.example`, `requirements.txt`, `package.json`, scripts   |
| 2     | Frontend foundation            | Vite + Tailwind + Router + AuthContext skeleton + UI primitives             |
| 3     | Authentication                 | Register/Login/JWT on both sides, ProtectedRoute, RBAC                      |
| 4     | Database                       | Postgres + Alembic migrations + models                                      |
| 5     | Citizen reporting              | Report form, validation, submit to backend                                  |
| 6     | Image storage                  | Upload endpoint + static serving + frontend upload widget                   |
| 7     | Geolocation & maps             | Browser geolocation + Leaflet map (citizen + admin)                          |
| 8     | AI classification              | Provider adapter + dev fallback + integration into report flow              |
| 9     | Severity                       | Severity mapping from AI output + manual override                           |
| 10    | Duplicate detection            | Geo+text+time+image service + grouping                                      |
| 11    | Risk engine                    | Factor computation + risk score stored + breakdown UI                       |
| 12    | Department routing             | Default routing + admin override                                            |
| 13    | Admin dashboard                | Metrics, live map, priority queue, detail view, timeline                    |
| 14    | Repair evidence                | After-repair upload, status transition                                      |
| 15    | AI verification                | Before/after comparison + verdict                                           |
| 16    | Email                          | Pluggable provider + triggers                                               |
| 17    | Analytics                      | Category breakdown, trends, duplicates view                                |
| 18    | Security hardening             | Rate limit, validation pass, headers, secret audit                          |
| 19    | Testing                        | pytest + vitest, manual checklist                                           |
| 20    | Deployment                     | Dockerfiles, docker-compose, deployment guide                               |
| 21    | Demo prep                      | Seed data, demo script, screenshots, README polish                           |

## Recommended MVP Scope (HACKATHON PRIORITY ORDER)

### Must-have for a winning demo (P0)
1. Citizen registration/login
2. Report flow (image + description + geolocation)
3. AI classification (real provider OR clearly labeled fallback)
4. Severity assignment
5. Duplicate detection + grouping
6. Civic risk score with factor breakdown
7. Department routing (default + admin override)
8. Admin command-center dashboard with live map and priority queue
9. Repair evidence upload + AI before/after verification
10. Status lifecycle with history
11. Notifications (in-app; email best-effort)
12. Mobile-friendly responsive UI

### Nice-to-have (P1)
- Email (real SMTP)
- Analytics charts
- Heatmap of hotspots
- Per-user notification preferences
- Internationalization

### Explicitly out of scope for MVP
- Mobile native apps
- Multi-tenant cities
- Predictive ML training pipelines
- Payment/incentive systems
- Social login (kept simple per spec)