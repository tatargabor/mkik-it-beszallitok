## ADDED Requirements

### Requirement: README tartalmazza a weboldal linket
A README elején SHALL szerepelnie a GitHub Pages weboldal linknek kiemelten.

#### Scenario: Link megjelenik
- **WHEN** valaki megnyitja a README-t GitHubon
- **THEN** az első szekciókban látja a weboldal URL-jét kattintható linkként

### Requirement: README tartalmazza a módszertant
A README SHALL tartalmazzon egy "Módszertan" szekciót, ami leírja az adatgyűjtés forrását (MKIK Vállalkozz Digitálisan), a scraping 3 fázisát (lista oldal, szoftver API, részletes oldalak), és az adatbázis struktúráját röviden.

#### Scenario: Módszertan szekció megjelenik
- **WHEN** valaki olvassa a README-t
- **THEN** megérti honnan származnak az adatok és hogyan lettek legyűjtve

### Requirement: README tartalmazza a funkciókat
A README SHALL tartalmazzon egy "Funkciók" szekciót, ami felsorolja a weboldal fő képességeit: keresés, megye szűrő, cég kártyák részletekkel, AI chat.

#### Scenario: Funkciók szekció megjelenik
- **WHEN** valaki olvassa a README-t
- **THEN** áttekintést kap a weboldal összes funkciójáról

### Requirement: README tartalmazza a tech stacket és futtatást
A README SHALL tartalmazzon egy rövid technikai részt (Node.js, cheerio, better-sqlite3, vanilla JS frontend) és az npm script-ek leírását.

#### Scenario: Tech stack és futtatás megjelenik
- **WHEN** egy fejlesztő olvassa a README-t
- **THEN** tudja milyen technológiákat használ a projekt és hogyan futtathatja
