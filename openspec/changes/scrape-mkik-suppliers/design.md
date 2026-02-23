## Context

A https://vallalkozzdigitalisan.mkik.hu/szallitok oldalon ~1710 IT beszállító van nyilvánosan listázva. Az adatok 3 forrásból érhetők el:

1. **Lista oldal** (`/szallitok`) - 2.8 MB egyetlen HTML, minden cég benne van, nincs pagination
2. **Részlet oldalak** (`/szallito.html?id=XXX`) - per-cég adatok: székhely, kontakt, pályázatok, esettanulmány
3. **Szoftver API** (`/szoftverek_katalogusa_be?action=get_public_szoftver_dt`) - 1810 szoftver rekord JSON DataTables formátumban

Az oldal szerver-renderelt HTML, jQuery DataTables-szel. Nincs szükség headless browserre.

## Goals / Non-Goals

**Goals:**
- Minden nyilvánosan elérhető beszállító adat letöltése és SQLite DB-be mentése
- Normalizált adatbázis séma: cégek, szoftverek, pályázatok, megyék, kapcsolatok
- Idempotens scraper: újrafuttatható, meglévő adatokat frissíti
- Későbbi elemzésekhez és funkciókhoz használható adatbázis alap

**Non-Goals:**
- Bejelentkezéshez kötött adatok (pl. árajánlat részletek, PDF-ek letöltése)
- Real-time szinkronizáció
- Web UI az adatok megjelenítéséhez (ez egy későbbi lépés)
- Az oldal terhelése - udvarias throttling

## Decisions

### 1. Node.js + Cheerio a scraping-hez
**Választás**: Node.js cheerio HTML parser-rel
**Miért**: A projekt Node.js alapú, cheerio gyors és memória-hatékony HTML parsing-hoz, nincs szükség headless browser-re mert minden adat szerver-renderelt HTML-ben / plain JSON API-ban elérhető.
**Alternatíva**: Python + BeautifulSoup - jó lenne, de a projekt Node.js-es, maradjunk egyben.

### 2. SQLite adatbázis better-sqlite3-mal
**Választás**: SQLite + better-sqlite3
**Miért**: Szinkron API (egyszerűbb kód), kiváló teljesítmény, egyetlen fájl DB, zero-config. ~1700 cég + ~1800 szoftver jól kezelhető SQLite-ban.
**Alternatíva**: PostgreSQL - túlzás ennyi adathoz, nehezebb setup.

### 3. 3-fázisú scraping stratégia
**Választás**: Szekvenciális fázisok, párhuzamos kérések fázison belül
```
Fázis 1: Lista oldal (1 kérés) → cég alapadatok + ID-k
Fázis 2: Szoftver API (1 kérés, iDisplayLength=9999) → összes szoftver
Fázis 3: Részlet oldalak (N kérés, max 5 párhuzamos) → részletek
```
**Miért**: A lista és API egyetlen kéréssel leszedi az összeset. Csak a részlet oldalakhoz kell sok kérés - ezeket throttle-oljuk.

### 4. Normalizált DB séma
```
┌─────────────┐     ┌──────────────────┐     ┌────────────┐
│  companies  │────<│ company_counties │>────│  counties  │
│             │     └──────────────────┘     └────────────┘
│  id (PK)    │
│  name       │     ┌──────────────────┐     ┌────────────┐
│  hq_zip     │────<│ company_tenders │>────│  tenders   │
│  hq_city    │     └──────────────────┘     └────────────┘
│  hq_address │
│  mail_addr  │     ┌──────────────────┐
│  contact    │────<│   softwares     │
│  email      │     │  id, name       │
│  website    │     │  type, deploy   │
│  intro      │     │  focus_areas    │
│  case_study │     │  company_id(FK) │
│  logo_url   │     └──────────────────┘
│  scraped_at │
└─────────────┘
```

### 5. HTTP kérések kezelése
- `node-fetch` vagy natív `fetch` (Node 18+)
- SSL verify kikapcsolva (`NODE_TLS_REJECT_UNAUTHORIZED=0`) - az oldal tanúsítványa nem ellenőrizhető
- 5 párhuzamos kérés max a részlet oldalaknál
- 200ms szünet kérések között
- Retry logika: max 3 próba, exponential backoff

## Risks / Trade-offs

- **[SSL tanúsítvány hiba]** → `NODE_TLS_REJECT_UNAUTHORIZED=0` environment variable-lel kerüljük meg, csak a scraper futtatásakor
- **[Oldal struktúra változás]** → A HTML parsing törékeny. Ha az oldal megváltozik, a scraper-t frissíteni kell. Mitigation: jól strukturált selector-ok, informatív hibaüzenetek
- **[Rate limiting]** → Udvarias throttling (5 párhuzamos, 200ms szünet). Ha blokkolnak, csökkentjük
- **[Hiányos adatok]** → Nem minden cégnek van minden mező kitöltve. NULL-okat kezelünk az adatbázisban
- **[Szoftver API HTML-t ad vissza adat mezőkben]** → A szoftver API response-ban HTML snippetek vannak a cella értékekben (gombok, linkek). Ezeket parse-olni kell a tiszta adat kinyeréséhez
