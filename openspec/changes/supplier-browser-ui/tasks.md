## 1. JSON Export

- [x] 1.1 Create `src/export-json.js` - read SQLite DB, join companies with counties/tenders/softwares, write denormalized `web/data/companies.json` (omit null fields)
- [x] 1.2 Run export and verify JSON output structure and file size

## 2. Web UI alapok

- [x] 2.1 Create `web/index.html` - layout structure: sidebar (county filters), main area (search + results), bottom (LLM chat), settings modal
- [x] 2.2 Create `web/style.css` - clean, minimal styling for the layout (sidebar, cards/list, chat area, settings modal)
- [x] 2.3 Create `web/app.js` - fetch `data/companies.json` on load, store in memory, render initial company list

## 3. Szűrés és keresés

- [x] 3.1 County filter - extract unique counties from data, render checkboxes in sidebar, "Mind"/"Egyik sem" buttons, filter companies on change (OR logic)
- [x] 3.2 Free-text search - search input with 300ms debounce, case-insensitive match on name/city/intro/software names, combine with county filter
- [x] 3.3 Result count display - show "Találatok: N cég" updated on every filter change

## 4. Cég részletek

- [x] 4.1 Company detail expand/collapse - click a company to show full details (address, contact, website link, intro, case study, softwares table, tenders list)

## 5. LLM Chat integráció

- [x] 5.1 Create `web/llm.js` - OpenAI API fetch wrapper (model: gpt-4o-mini), context builder from filtered companies (full data ≤50, truncated >50)
- [x] 5.2 Settings panel - modal with API key input, save/delete to localStorage, masked display
- [x] 5.3 Chat UI - text input + send button, loading indicator, response display area, error handling
- [x] 5.4 Wire up chat - on send, build context from current filtered companies, call OpenAI API, display response
