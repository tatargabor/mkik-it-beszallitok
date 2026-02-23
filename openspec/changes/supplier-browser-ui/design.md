## Context

Az MKIK beszállító adatok SQLite DB-ben vannak (`data/mkik.db`): 1716 cég, 1810 szoftver, 22 megye, 14 pályázat. A DB sémája normalizált (companies, softwares, counties, tenders + junction táblák). Jelenleg nincs semmilyen felület az adatok megtekintésére.

A cél egy statikus webes felület, ami szerver nélkül deployolható, és lehetővé teszi az adatok böngészését, szűrését, valamint LLM-alapú lekérdezését.

## Goals / Non-Goals

**Goals:**
- Egyetlen paranccsal generálható JSON az SQLite-ból
- Statikus felület ami böngészőben megnyitva azonnal működik
- Megye szűrő, szabad szöveges keresés
- Cég részletek (kontakt, szoftverek, pályázatok)
- OpenAI chat integráció a szűrt adatokon
- Egyszerű deploy (Netlify / Vercel / GitHub Pages)

**Non-Goals:**
- Szerver-oldali logika, API backend
- Felhasználó kezelés, auth (unlisted URL elég)
- Adat szerkesztés / admin felület
- Mobilra optimalizálás (desktop-first, de legyen használható)
- Offline LLM / lokális model futtatás

## Decisions

### 1. JSON export: egyetlen denormalizált fájl

**Döntés:** Egyetlen `companies.json` fájl, ahol minden cég tartalmazza a hozzá tartozó megyéket, pályázatokat és szoftvereket beágyazva.

**Miért:** A kliens-oldali szűréshez nem kell relációs struktúra. Egyetlen fetch hívás betölti az összes adatot, utána minden memóriában szűrhető. ~1700 cég denormalizálva becsülve 1-3 MB, gzip után <500 KB.

**Struktúra:**
```json
[
  {
    "id": 123,
    "name": "Cég Kft.",
    "hq_city": "Budapest",
    "hq_zip": "1234",
    "hq_address": "Fő utca 1.",
    "mail_address": "...",
    "contact_name": "Kiss János",
    "contact_email": "kiss@ceg.hu",
    "website": "https://ceg.hu",
    "intro": "...",
    "case_study": "...",
    "logo_url": "...",
    "counties": ["Budapest", "Pest megye"],
    "tenders": [{"id": 2, "name": "GINOP..."}],
    "softwares": [{"name": "ERP", "type": "Saját szoftver", "deployment": "felhő", "focus_areas": "ERP, kereskedelem"}]
  }
]
```

**Alternatíva:** Több JSON fájl (companies.json + counties.json + stb.) - feleslegesen bonyolítaná a kliens-oldali join-okat.

### 2. Frontend: vanilla HTML/CSS/JS, nincs build step

**Döntés:** Egyetlen `web/` mappa: `index.html`, `style.css`, `app.js`, `llm.js`. Nincs framework, nincs bundler.

**Miért:** 1700 cég megjelenítése nem igényel virtuális scrollingot vagy összetett state managementet. A vanilla JS DOM manipulation elég. Nulla build step = egyszerűbb deploy, egyszerűbb fejlesztés.

**Alternatíva:** React/Vue + Vite - overkill erre a méretre.

### 3. Megye szűrő: checkbox lista

**Döntés:** Multi-select checkbox lista a 22 megyével. Egy cég megjelenik ha bármelyik kiválasztott megyében aktív (OR logika). Ha nincs megye kiválasztva, minden cég látszik.

**Miért:** 22 megye jól fér el egy sidebar-ban vagy egy lenyíló panelben. A checkbox természetes multi-select.

### 4. Szabad szöveges keresés: kliens-oldali, case-insensitive

**Döntés:** Egyetlen input mező, ami a cégnévben, bemutatkozásban, székhelyben és szoftver nevekben keres. Case-insensitive substring match. Debounce: 300ms.

**Miért:** 1700 rekordon a JS `filter()` + `includes()` azonnali (<10ms).

### 5. LLM integráció: OpenAI API fetch a böngészőből

**Döntés:** A böngésző közvetlenül hívja az OpenAI API-t. Az API key-t a user adja meg egy settings panelen, localStorage-ba mentjük. A szűrt cégek adatai mennek system prompt-ként. Model: `gpt-4o-mini` (olcsó, gyors).

**Miért:** Nincs szükség szerverre. Az API key a user saját key-e. A szűrt halmaz (<100 cég tipikusan) belefér a context-be.

**Context limit kezelés:** Ha a szűrt halmaz >50 cég, csak a legfontosabb mezőket küldjük (id, név, város, szoftver típusok) - nem a teljes intro/case_study szöveget.

**Alternatíva:** Szerver-oldali proxy - szükségtelenül bonyolítaná, és szerverre lenne szükség.

### 6. Layout

```
┌──────────────────────────────────────────────────────────┐
│  MKIK Beszállító Kereső                    [⚙️ Settings] │
├────────────┬─────────────────────────────────────────────┤
│ SZŰRŐK     │  🔍 Keresés: [________________]            │
│            │                                             │
│ □ Budapest │  Találatok: 342 cég                        │
│ □ Pest m.  │  ┌─────────────────────────────────────┐   │
│ □ Baranya  │  │ Cégnév Kft.        Budapest         │   │
│ □ Bács-K.  │  │ web: ceg.hu  │ ERP, CRM │ GINOP    │   │
│ □ Békés    │  ├─────────────────────────────────────┤   │
│ ...        │  │ Másik Zrt.         Debrecen          │   │
│            │  │ web: masik.hu │ Webshop              │   │
│ [Mind]     │  └─────────────────────────────────────┘   │
│ [Egyik sem]│                                             │
├────────────┴─────────────────────────────────────────────┤
│  🤖 Kérdezd meg az AI-t a szűrt cégekről               │
│  ┌────────────────────────────────────────────────┐ [→] │
│  │ Melyik cégeknek van esettanulmánya?            │     │
│  └────────────────────────────────────────────────┘     │
│  AI válasz: ...                                          │
└──────────────────────────────────────────────────────────┘
```

## Risks / Trade-offs

- **[API key a kliensen]** → Az API key localStorage-ban van, DevTools-szal kiolvasható. Elfogadható mert az oldal unlisted, és a user saját key-ét adja meg.
- **[Teljes adat a kliensen]** → Az 1700 cég összes adata letöltődik. Ez nyilvánosan elérhető adat, nincs valódi biztonsági kockázat. A ~1-3 MB gzip után elfogadható.
- **[OpenAI CORS]** → Az OpenAI API engedélyezi a böngésző-oldali hívásokat (nincs CORS probléma a `api.openai.com`-on). Ha mégis lenne, egy egyszerű proxy kellene.
- **[Context limit]** → Ha valaki nem szűr és mind az 1700 céget akarja LLM-nek küldeni, az nem fér bele. Megoldás: max 50 cég megy a context-be, ha több van, kérjük a szűkítést.
