## ADDED Requirements

### Requirement: SQLite database schema
The system SHALL create an SQLite database with normalized tables for companies, counties, tenders, softwares, and their relationships.

#### Scenario: Database initialization
- **WHEN** the scraper starts and no database file exists
- **THEN** it SHALL create `data/mkik.db` with the following tables:

**companies** table:
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | MKIK supplier ID |
| name | TEXT NOT NULL | Company name |
| hq_zip | TEXT | Headquarters zip code |
| hq_city | TEXT | Headquarters city |
| hq_address | TEXT | Headquarters street address |
| mail_address | TEXT | Mailing address |
| contact_name | TEXT | Contact person name |
| contact_email | TEXT | Contact person email |
| website | TEXT | Company website URL |
| intro | TEXT | Company introduction text |
| case_study | TEXT | Case study text |
| logo_url | TEXT | Logo image URL |
| scraped_at | TEXT | ISO timestamp of last scrape |

**counties** table:
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY AUTOINCREMENT | |
| name | TEXT NOT NULL UNIQUE | County name (e.g., "Budapest", "Pest megye") |

**tenders** table:
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Tender ID from the website |
| name | TEXT NOT NULL | Tender full name |

**softwares** table:
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY AUTOINCREMENT | |
| company_id | INTEGER REFERENCES companies(id) | Supplier FK |
| name | TEXT NOT NULL | Software name |
| type | TEXT | Software type (Saját szoftver, Microsoft, etc.) |
| deployment | TEXT | Deployment model (lokális, felhő, hibrid) |
| focus_areas | TEXT | Focus area tags |
| sw_api_id | INTEGER | Software ID from the API (if available) |

**company_counties** junction table:
| Column | Type | Description |
|--------|------|-------------|
| company_id | INTEGER REFERENCES companies(id) | |
| county_id | INTEGER REFERENCES counties(id) | |
| PRIMARY KEY (company_id, county_id) | | |

**company_tenders** junction table:
| Column | Type | Description |
|--------|------|-------------|
| company_id | INTEGER REFERENCES companies(id) | |
| tender_id | INTEGER REFERENCES tenders(id) | |
| PRIMARY KEY (company_id, tender_id) | | |

### Requirement: Upsert behavior
The system SHALL use INSERT OR REPLACE semantics so re-running the scraper updates existing records.

#### Scenario: Re-run scraper
- **WHEN** the scraper runs and a company with the same ID already exists
- **THEN** it SHALL update all fields with the new data
- **THEN** it SHALL update `scraped_at` timestamp

#### Scenario: Re-run preserves junction tables
- **WHEN** the scraper re-runs for a company
- **THEN** it SHALL delete existing company_counties and company_tenders for that company before re-inserting

### Requirement: Transaction safety
The system SHALL wrap bulk inserts in transactions for performance and atomicity.

#### Scenario: Batch insert with transaction
- **WHEN** inserting scraped data into the database
- **THEN** each phase (list, software, details) SHALL be wrapped in a transaction
- **THEN** if an error occurs mid-transaction, the transaction SHALL be rolled back

### Requirement: Database file location
The system SHALL store the database at `data/mkik.db` relative to the project root.

#### Scenario: Data directory creation
- **WHEN** the `data/` directory does not exist
- **THEN** the system SHALL create it before initializing the database
