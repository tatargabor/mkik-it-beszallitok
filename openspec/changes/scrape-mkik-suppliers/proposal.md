## Why

Az MKIK "Vállalkozz Digitálisan" programjában regisztrált ~1700 IT beszállító adatait szeretnénk leszedni és strukturált adatbázisba rendezni. Ezekből az adatokból elemzéseket akarunk készíteni (megye, szoftver típus, pályázatok, fókuszterületek) és további funkciókhoz felhasználni. Az adatok nyilvánosan elérhetők a https://vallalkozzdigitalisan.mkik.hu/szallitok oldalon.

## What Changes

- Scraper eszköz létrehozása, ami leszedi az összes beszállító adatát 3 forrásból:
  - Lista oldal (`/szallitok`) - cégek alapadatai, szolgáltatási területek
  - Részletes oldalak (`/szallito.html?id=XXX`) - székhely, kontakt, pályázatok, esettanulmány
  - Szoftver katalógus API (`/szoftverek_katalogusa_be`) - szoftverek, típusok, fókuszterületek
- SQLite adatbázis felépítése a leszedett adatokból, normalizált struktúrában
- Minden adat mentése, ami elérhető: cégadatok, szoftverek, pályázatok, megyék, kontaktok
- Az adatbázis későbbi elemzésekhez és további funkciókhoz használható alapként szolgál

## Capabilities

### New Capabilities
- `scraper`: MKIK beszállító adatok letöltése HTTP kérésekkel (curl/fetch), HTML parsing, szoftver API hívás
- `database`: SQLite adatbázis séma és adatbetöltés - normalizált táblák a beszállítók, szoftverek, pályázatok, megyék számára

### Modified Capabilities

## Impact

- Új függőségek: `cheerio` (HTML parsing), `better-sqlite3` vagy `sqlite3` (DB)
- ~1710 HTTP kérés a részletes oldalakhoz (throttled)
- ~30-50 MB letöltött adat összesen
- Generált SQLite DB fájl (~5-10 MB becsülve)
