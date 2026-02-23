## ADDED Requirements

### Requirement: Load and display company data
The UI SHALL fetch `data/companies.json` on page load and display all companies in a scrollable list.

#### Scenario: Initial page load
- **WHEN** the page loads
- **THEN** all companies from `companies.json` are fetched and rendered as a list with company name, city, and software count visible for each entry

### Requirement: County filter
The UI SHALL display a list of checkboxes for all counties (extracted from the loaded data). Selecting one or more counties filters the company list to show only companies active in any of the selected counties (OR logic).

#### Scenario: No county selected
- **WHEN** no county checkbox is checked
- **THEN** all companies are displayed

#### Scenario: Single county selected
- **WHEN** the user checks "Budapest"
- **THEN** only companies that have "Budapest" in their `counties` array are displayed

#### Scenario: Multiple counties selected
- **WHEN** the user checks "Budapest" and "Pest megye"
- **THEN** companies active in Budapest OR Pest megye are displayed

#### Scenario: Select all / clear all
- **WHEN** the user clicks "Mind" button
- **THEN** all county checkboxes are checked
- **WHEN** the user clicks "Egyik sem" button
- **THEN** all county checkboxes are unchecked

### Requirement: Free-text search
The UI SHALL provide a text input that filters companies by matching against company name, city, intro text, and software names. The search SHALL be case-insensitive substring match with 300ms debounce.

#### Scenario: Search by company name
- **WHEN** the user types "silicon" in the search box
- **THEN** companies whose name contains "silicon" (case-insensitive) are displayed

#### Scenario: Search combined with county filter
- **WHEN** the user has "Budapest" county selected AND types "erp" in search
- **THEN** only companies matching BOTH the county filter AND the search term are displayed

#### Scenario: Empty search
- **WHEN** the search box is empty
- **THEN** the search filter has no effect (only county filter applies)

### Requirement: Company detail view
The UI SHALL allow expanding/clicking a company to see its full details: address, contact info, website, intro text, case study, list of softwares, and list of tenders.

#### Scenario: Expand company details
- **WHEN** the user clicks on a company in the list
- **THEN** the company's full details are displayed including all available fields

#### Scenario: Website link
- **WHEN** a company has a website field
- **THEN** the website is displayed as a clickable link opening in a new tab

### Requirement: Result count display
The UI SHALL display the number of currently visible (filtered) companies.

#### Scenario: Count updates on filter
- **WHEN** the user applies any combination of filters
- **THEN** the displayed count reflects the number of matching companies (e.g., "Találatok: 42 cég")
