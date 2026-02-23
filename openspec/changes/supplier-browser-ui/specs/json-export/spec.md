## ADDED Requirements

### Requirement: Export denormalized JSON from SQLite
The system SHALL provide a Node.js script (`src/export-json.js`) that reads the SQLite database and writes a single JSON file containing all companies with their related data (counties, tenders, softwares) denormalized into each company object.

#### Scenario: Successful export
- **WHEN** `node src/export-json.js` is executed
- **THEN** a file `web/data/companies.json` is created containing a JSON array of all companies

#### Scenario: Company data structure
- **WHEN** the JSON is generated
- **THEN** each company object SHALL contain: `id`, `name`, `hq_zip`, `hq_city`, `hq_address`, `mail_address`, `contact_name`, `contact_email`, `website`, `intro`, `case_study`, `logo_url`, `counties` (string array), `tenders` (array of `{id, name}`), `softwares` (array of `{name, type, deployment, focus_areas}`)

#### Scenario: Output directory creation
- **WHEN** the `web/data/` directory does not exist
- **THEN** the script SHALL create it before writing the JSON file

### Requirement: Null field handling
The system SHALL omit fields with null/empty values from the JSON output to reduce file size.

#### Scenario: Null fields excluded
- **WHEN** a company has `hq_city` as NULL in the database
- **THEN** the `hq_city` key SHALL not appear in that company's JSON object
