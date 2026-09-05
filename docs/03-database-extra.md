### incident_status_history
| Column      | Type            | Notes                                |
|-------------|-----------------|--------------------------------------|
| id          | BIGSERIAL PK    |                                      |
| incident_id | BIGINT FK->incidents                    |
| from_status | VARCHAR(32) NULL|                                      |
| to_status   | VARCHAR(32)     |                                      |
| changed_by  | BIGINT FK->users |                                      |
| note        | TEXT NULL       |                                      |
| created_at  | TIMESTAMPTZ     |                                      |

### risk_scores (denormalized snapshots for analytics)
| Column        | Type         | Notes                                 |
|---------------|--------------|---------------------------------------|
| id            | BIGSERIAL PK |                                       |
| incident_id   | BIGINT FK->incidents                   |
| score         | INTEGER      |                                       |
| factors       | JSONB        |                                       |
| computed_at   | TIMESTAMPTZ  |                                       |

### repair_evidence
| Column       | Type         | Notes                                  |
|--------------|--------------|----------------------------------------|
| id           | BIGSERIAL PK |                                        |
| incident_id  | BIGINT FK->incidents                    |
| after_image_id | BIGINT FK->incident_images NULL       |
| notes        | TEXT NULL    |                                        |
| submitted_by | BIGINT FK->users                        |
| created_at   | TIMESTAMPTZ  |                                        |

### notifications
| Column      | Type            | Notes                                     |
|-------------|-----------------|-------------------------------------------|
| id          | BIGSERIAL PK    |                                           |
| user_id     | BIGINT FK->users |                                           |
| incident_id | BIGINT FK->incidents NULL |                                    |
| channel     | VARCHAR(16)     | `EMAIL`/`IN_APP`                          |
| type        | VARCHAR(32)     | e.g. `SUBMITTED`,`ASSIGNED`,`RESOLVED`    |
| payload     | JSONB           |                                           |
| sent_at     | TIMESTAMPTZ NULL|                                           |
| status      | VARCHAR(16)     | `PENDING`/`SENT`/`FAILED`                 |
| created_at  | TIMESTAMPTZ     |                                           |

### related_signals (root-cause / cross-category hints)
| Column          | Type         | Notes                                    |
|-----------------|--------------|------------------------------------------|
| id              | BIGSERIAL PK |                                          |
| incident_id     | BIGINT FK->incidents                    |
| related_to_id   | BIGINT FK->incidents                    |
| relationship    | VARCHAR(64)  | e.g. `WATER_LEAK -> ROAD_DAMAGE`         |
| confidence      | NUMERIC(5,4) |                                          |
| created_at      | TIMESTAMPTZ  |                                          |