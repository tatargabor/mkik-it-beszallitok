## ADDED Requirements

### Requirement: Scrape supplier list page
The system SHALL fetch the `/szallitok` page and extract all supplier entries. For each supplier, the system SHALL extract: MKIK ID (from URL), company name, service counties, and logo URL.

#### Scenario: Successful list scrape
- **WHEN** the scraper runs phase 1 (list page)
- **THEN** it SHALL fetch `https://vallalkozzdigitalisan.mkik.hu/szallitok` with SSL verification disabled
- **THEN** it SHALL parse all `.partner-item-div` elements
- **THEN** it SHALL extract the ID from `href="/szallito.html?id=XXX"` links
- **THEN** it SHALL extract the company name from `.partner-name-link b` text
- **THEN** it SHALL extract counties from `.szolg-terulet-div` text
- **THEN** it SHALL extract logo URL from `img[src*="/dl/partners/"]`

#### Scenario: Handle missing data in list
- **WHEN** a supplier entry has a missing logo or empty county field
- **THEN** the system SHALL store NULL for missing fields and continue processing

### Requirement: Scrape supplier detail pages
The system SHALL fetch each supplier's detail page (`/szallito.html?id=XXX`) and extract: headquarters address (zip, city, street), mailing address, contact name, contact email, website URL, company introduction text, case study text, and available tender IDs.

#### Scenario: Successful detail scrape
- **WHEN** the scraper runs phase 3 (detail pages)
- **THEN** for each known supplier ID, it SHALL fetch `/szallito.html?id={id}`
- **THEN** it SHALL extract the `Székhely` field and parse it into zip code, city, and street address
- **THEN** it SHALL extract `Levelezési cím`, `Kapcsolattartó neve`, `Kapcsolattartó e-mail címe`, `Weboldal`
- **THEN** it SHALL extract the company introduction from the `Cégbemutató` panel body
- **THEN** it SHALL extract the case study from the `Esettanulmány` panel body
- **THEN** it SHALL extract all tender IDs from `select#tenderID option[value]` elements

#### Scenario: Throttled parallel requests
- **WHEN** scraping detail pages
- **THEN** the system SHALL send a maximum of 5 concurrent requests
- **THEN** the system SHALL wait at least 200ms between starting new requests

#### Scenario: Retry on failure
- **WHEN** a detail page request fails (network error or non-200 status)
- **THEN** the system SHALL retry up to 3 times with exponential backoff (1s, 2s, 4s)
- **THEN** if all retries fail, the system SHALL log the error and continue with remaining suppliers

### Requirement: Fetch software catalog via API
The system SHALL call the software catalog API endpoint and extract all software records with supplier mapping.

#### Scenario: Successful software API call
- **WHEN** the scraper runs phase 2 (software API)
- **THEN** it SHALL send a GET request to `/szoftverek_katalogusa_be?action=get_public_szoftver_dt&iDisplayStart=0&iDisplayLength=9999`
- **THEN** it SHALL parse the JSON response and extract from each `aaData` row:
  - Column 0: Supplier name and ID (parse from HTML), supplier website and email (from links)
  - Column 1: Software name and ID (parse from HTML)
  - Column 2: Software type (e.g., "Saját szoftver", "Microsoft")
  - Column 3: Deployment model (e.g., "lokális", "felhő")
  - Column 4: Focus areas (semicolon/comma separated tags)

#### Scenario: Parse HTML-embedded data in API response
- **WHEN** API response cells contain HTML markup (buttons, dropdowns, links)
- **THEN** the system SHALL strip HTML and extract only the relevant text and attribute values (IDs from onclick handlers, URLs from href attributes, emails from mailto links)

### Requirement: Progress reporting
The system SHALL report progress during scraping.

#### Scenario: Console progress output
- **WHEN** the scraper is running
- **THEN** it SHALL log: phase name, current/total count for detail pages, errors encountered
- **THEN** on completion it SHALL log total companies scraped, total softwares scraped, total errors
