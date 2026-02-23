## Why

A lescrapelt ~1700 MKIK beszállító adat jelenleg csak SQLite DB-ben érhető el. Szükség van egy egyszerű, deployolható webes felületre, ahol böngészni, szűrni és keresni lehet a cégek között. Az LLM integráció (OpenAI API, böngészőből hívva) lehetőséget ad természetes nyelvű kérdésekre a szűrt adathalmazon.

## What Changes

- JSON export script: SQLite DB-ből kigenerálja az összes cégadatot egyetlen JSON fájlba (denormalizálva: cég + megyék + pályázatok + szoftverek)
- Statikus webes felület (vanilla HTML/CSS/JS):
  - Megye kiválasztó szűrő (multi-select a 22 megyéből)
  - Szabad szöveges keresés (cégnév, bemutatkozás, stb.)
  - Cég lista táblázat/kártya nézet a szűrt eredményekkel
  - Cég részletek megjelenítése (kontakt, szoftverek, pályázatok, esettanulmány)
- LLM chat integráció:
  - OpenAI API hívás közvetlenül a böngészőből (fetch)
  - API key bekérése és localStorage-ba mentése (settings panel)
  - Az aktuálisan szűrt cégek adatai mennek context-ként az LLM-nek
  - Természetes nyelvű kérdezés a szűrt halmazról
- Nincs szerver, nincs auth - unlisted URL-en deployolva (Netlify/Vercel/GitHub Pages)

## Capabilities

### New Capabilities
- `json-export`: SQLite → JSON export script ami a teljes denormalizált adathalmazt kigenerálja a frontend számára
- `browser-ui`: Statikus webes felület cég böngészéssel, megye szűrővel, szabad szöveges kereséssel és cég részletek megjelenítéssel
- `llm-chat`: Böngésző-oldali OpenAI API integráció természetes nyelvű kérdezéshez a szűrt cégadatokon, API key kezelés localStorage-ban

### Modified Capabilities

## Impact

- Új fájlok: `src/export-json.js`, `web/index.html`, `web/style.css`, `web/app.js`, `web/llm.js`
- Generált fájl: `web/data/companies.json` (~1-3 MB)
- Nincs új szerver dependency, a meglévő `better-sqlite3` elég az exporthoz
- Deploy: bármely statikus hosting (Netlify, Vercel, GitHub Pages)
