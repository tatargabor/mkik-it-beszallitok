## ADDED Requirements

### Requirement: Disclaimer banner displays data source info
The UI SHALL display a persistent info banner below the header containing: the data source name ("MKIK Vállalkozz Digitálisan"), a clickable link to the original page, the date the data was scraped, and a note that data may not be current.

#### Scenario: Banner content
- **WHEN** the page loads
- **THEN** a banner is visible below the header showing: "Az adatok forrása: MKIK Vállalkozz Digitálisan beszállítói adatbázis (2025. február). Az adatok nem valós idejűek." with a link to https://vallalkozzdigitalisan.mkik.hu/szallitok

#### Scenario: Link opens original page
- **WHEN** the user clicks the source link in the banner
- **THEN** the MKIK szállítók oldal opens in a new tab

### Requirement: API key help in settings
The settings panel SHALL include a brief help text explaining how to get an OpenAI API key, with a link to the OpenAI platform.

#### Scenario: Help text visible
- **WHEN** the user opens the settings modal
- **THEN** a help text is shown below the API key input explaining: go to platform.openai.com, create account, generate API key, with a direct link
