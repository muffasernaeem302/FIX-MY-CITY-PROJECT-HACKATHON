# Database Design (PostgreSQL)

All tables use `id BIGSERIAL PRIMARY KEY`, `created_at TIMESTAMPTZ DEFAULT now()`, `updated_at TIMESTAMPTZ DEFAULT now()`. Foreign keys are indexed. Enums are stored as `VARCHAR` with CHECK constraints (portable, easy to evolve).

## Core tables

### users
| Column          | Type                  | Notes                                    |
|-----------------|-----------------------|------------------------------------------|
| id              | BIGSERIAL PK          |                                          |
| email           | VARCHAR(255) UNIQUE   |                                          |
| password_hash   | VARCHAR(255)          | bcrypt                                   |
| full_name       | VARCHAR(120)          |                                          |
| phone           | VARCHAR(20) NULL      |                                          |
| role            | VARCHAR(16)           | CHECK in (`CITIZEN`,`ADMIN`)             |
| is_active       | BOOLEAN DEFAULT true  |                                          |
| created_at      | TIMESTAMPTZ           |                                          |
| updated_at      | TIMESTAMPTZ           |                                          |

### departments
| Column       | Type            | Notes                                      |
|--------------|-----------------|--------------------------------------------|
| id           | BIGSERIAL PK    |                                            |
| code         | VARCHAR(32) UQ  | e.g. `ROADS`, `LIGHTING`, `WASTE`, `WATER` |
| name         | VARCHAR(120)    |                                            |
| contact_email| VARCHAR(255)    |                                            |
| created_at   | TIMESTAMPTZ     |                                            |

### incidents
| Column           | Type             | Notes                                             |
|------------------|------------------|---------------------------------------------------|
| id               | BIGSERIAL PK     |                                                   |
| reporter_id      | BIGINT FK->users |                                                   |
| category         | VARCHAR(32)      | CHECK in (4 MVP categories)                       |
| title            | VARCHAR(200)     |                                                   |
| description      | TEXT             |                                                   |
| latitude         | DOUBLE PRECISION |                                                   |
| longitude        | DOUBLE PRECISION |                                                   |
| address          | VARCHAR(500)     | reverse-geocoded if available                     |
| status           | VARCHAR(32)      | CHECK in lifecycle set                            |
| severity         | VARCHAR(16)      | `LOW`/`MEDIUM`/`HIGH`/`CRITICAL`                  |
| risk_score       | INTEGER          | 0..100                                            |
| risk_factors     | JSONB            | factor breakdown                                  |
| ai_confidence    | NUMERIC(5,4)     | 0..1                                              |
| ai_raw           | JSONB            | raw provider response                             |
| assigned_dept_id | BIGINT FK->departments NULL |                                           |
| duplicate_group_id| UUID NULL      |                                                   |
| is_duplicate     | BOOLEAN DEFAULT false |                                               |
| verified         | BOOLEAN DEFAULT false |                                               |
| verification_raw | JSONB            |                                                   |
| created_at       | TIMESTAMPTZ      |                                                   |
| updated_at       | TIMESTAMPTZ      |                                                   |

Indexes: `(status)`, `(category)`, `(latitude, longitude)`, `(risk_score DESC)`, `(created_at DESC)`, `(duplicate_group_id)`.

### incident_images
| Column      | Type            | Notes                                          |
|-------------|-----------------|------------------------------------------------|
| id          | BIGSERIAL PK    |                                                |
| incident_id | BIGINT FK->incidents ON DELETE CASCADE |     |
| kind        | VARCHAR(16)     | `BEFORE` / `AFTER`                             |
| url         | VARCHAR(1000)   | storage URL                                    |
| storage_key | VARCHAR(500)    | internal key                                   |
| mime_type   | VARCHAR(64)     |                                                |
| size_bytes  | BIGINT          |                                                |
| uploaded_by | BIGINT FK->users|                                                |
| created_at  | TIMESTAMPTZ     |                                                |

### incident_duplicates (pairwise links, optional audit)
| Column          | Type            | Notes                              |
|-----------------|-----------------|------------------------------------|
| id              | BIGSERIAL PK    |                                    |
| incident_a_id   | BIGINT FK->incidents |                                |
| incident_b_id   | BIGINT FK->incidents |                                |
| similarity      | NUMERIC(5,4)    | 0..1                               |
| reason          | VARCHAR(200)    | "geo+text+time"                    |
| created_at      | TIMESTAMPTZ     |                                    |