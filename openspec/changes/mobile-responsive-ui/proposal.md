## Why

A böngésző felület (`docs/index.html` + `docs/style.css`) jelenleg kizárólag desktop nézetre van optimalizálva és vizuálisan egyszerű. Mobilon a sidebar és a tartalom egymás mellé szorulnak, a checkbox-ok nehezen kattinthatók. Emellett a dizájn szebb, vizuálisabb lehetne - letisztult maradjon, de kapjon egy modernebb, igényesebb megjelenést.

## What Changes

- Reszponzív CSS media query-k: mobilon egyoszlopos layout, összecsuható sidebar
- Vizuális frissítés: szebb kártyák (subtle shadow, hover effektek), finomabb színátmenetek, jobb tipográfia
- Touch-barát elemek: nagyobb gombok, checkbox-ok, input mezők mobilon
- Modernebb header: gradient háttér, jobb elrendezés
- Cég kártyák: szebb megjelenés (ikon, badge-ek a szoftver típushoz/megyéhez)
- AI chat szekció mobilon is jól használható
- Hamburger menü gomb a sidebar toggle-hoz mobilon

## Capabilities

### New Capabilities
- `responsive-layout`: Reszponzív layout + vizuális frissítés, mobilbarát, letisztult de szebb dizájn

### Modified Capabilities

## Impact

- Módosított fájlok: `docs/style.css` (fő módosítás), `docs/index.html` (hamburger gomb), `docs/app.js` (sidebar toggle)
- Nincs új függőség - tisztán CSS + minimális JS
