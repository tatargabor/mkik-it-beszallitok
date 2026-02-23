# MKIK Akkreditált IT Beszállítók

Az MKIK "Vállalkozz Digitálisan" program akkreditált IT beszállítóinak kereshető, szűrhető adatbázisa.

**[Weboldal megnyitása](https://tatargabor.github.io/mkik-it-beszallitok/)**

---

## Módszertan

Az adatok az [MKIK Vállalkozz Digitálisan beszállítói adatbázisából](https://vallalkozzdigitalisan.mkik.hu/szallitok) származnak, automatizált scraping segítségével legyűjtve.

### Adatgyűjtés folyamata

Az adatgyűjtés 3 fázisban történik:

1. **Lista oldal** -- A `/szallitok` oldal HTML-jéből kinyerjük az összes beszállító alapadatát (név, ID, logo, szolgáltatási terület)
2. **Szoftver API** -- A `/szoftverek_katalogusa_be` JSON API-ból lekérjük a teljes szoftverkatalógust (név, típus, deployment, fókuszterület) és a szoftver-cég összerendelést
3. **Részletes oldalak** -- Minden cég egyedi oldaláról (`/szallito.html?id=XXX`) kinyerjük a részletes adatokat: székhely, kapcsolattartó, email, weboldal, bemutatkozás, esettanulmány, megyék teljes listája

### Adatbázis

Az adatok SQLite adatbázisba kerülnek normalizált struktúrában:
- **companies** -- 1716 cég alapadatai és részletes információi
- **softwares** -- 1810 szoftver termék
- **counties** -- 22 megye
- **tenders** -- 14 pályázat (referencia tábla)
- Junction táblák a több-több kapcsolatokhoz (company_counties)

A böngésző felület a `docs/data/companies.json` exportált JSON-ból dolgozik.

## Funkciók

- **Keresés** -- Szabad szöveges keresés cégnév, város, bemutatkozás és szoftvernév alapján
- **Megye szűrő** -- Oldalsávban checkbox-okkal szűrhető a szolgáltatási terület (Mind/Egyik sem gyorsgombok)
- **Cég kártyák** -- Kattintásra kinyíló részletes nézet: székhely, kapcsolattartó, email, weboldal, megyék, szoftverek táblázat, bemutatkozás, esettanulmány
- **AI chat** -- OpenAI API kulccsal a szűrt cégekről kérdezhető AI asszisztens
- **Reszponzív dizájn** -- Mobilon egyoszlopos layout, hamburger menüvel elérhető oldalsáv, touch-barát méretek

## Tech stack

- **Scraper**: Node.js, [cheerio](https://cheerio.js.org/) (HTML parsing), [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) (SQLite)
- **Frontend**: Vanilla HTML/CSS/JS, GitHub Pages

## Futtatás

```bash
npm install

# Adatok legyűjtése (SQLite adatbázis: data/mkik.db)
npm run scrape

# JSON export a frontend számára
npm run export

# Lokális szerver indítása
npm run serve
```
