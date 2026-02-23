## 1. Project Setup

- [x] 1.1 Initialize package.json with project metadata
- [x] 1.2 Install dependencies: cheerio, better-sqlite3, node-fetch (or use native fetch)
- [x] 1.3 Create project directory structure: `src/`, `data/`

## 2. Database Layer

- [x] 2.1 Create `src/db.js` - SQLite database initialization with all tables (companies, counties, tenders, softwares, company_counties, company_tenders)
- [x] 2.2 Implement upsert functions for each entity (insertCompany, insertCounty, insertTender, insertSoftware)
- [x] 2.3 Implement junction table functions (linkCompanyCounty, linkCompanyTender) with delete-before-reinsert
- [x] 2.4 Implement transaction wrappers for batch operations

## 3. Scraper - Phase 1: List Page

- [x] 3.1 Create `src/scrape-list.js` - fetch `/szallitok` page with SSL disabled
- [x] 3.2 Parse HTML to extract all supplier entries: ID, name, counties, logo URL
- [x] 3.3 Return structured array of supplier basic data

## 4. Scraper - Phase 2: Software API

- [x] 4.1 Create `src/scrape-software.js` - fetch software catalog API endpoint
- [x] 4.2 Parse JSON response and extract clean data from HTML-embedded cells (strip buttons/dropdowns, extract names, IDs, URLs, emails)
- [x] 4.3 Return structured array of software records with supplier mapping

## 5. Scraper - Phase 3: Detail Pages

- [x] 5.1 Create `src/scrape-details.js` - fetch individual supplier detail pages
- [x] 5.2 Implement throttled parallel fetcher (max 5 concurrent, 200ms delay)
- [x] 5.3 Implement retry logic (3 attempts, exponential backoff)
- [x] 5.4 Parse detail page HTML: headquarters (zip/city/address), mailing address, contact name, contact email, website, intro, case study, tender IDs
- [x] 5.5 Return structured detail data per supplier

## 6. Main Orchestrator

- [x] 6.1 Create `src/scrape.js` - main entry point that runs all 3 phases in sequence
- [x] 6.2 Wire phase 1 results into DB (companies basic data + counties)
- [x] 6.3 Wire phase 2 results into DB (softwares + link to companies)
- [x] 6.4 Wire phase 3 results into DB (update companies with details + tenders)
- [x] 6.5 Add progress logging (phase names, counts, errors, summary)

## 7. Verification

- [ ] 7.1 Run full scrape and verify data in SQLite (spot-check ~5 companies)
- [ ] 7.2 Verify county normalization (no duplicates, correct linking)
- [ ] 7.3 Verify software records match expected count (~1810)
- [ ] 7.4 Add npm script: `npm run scrape` to run the scraper
