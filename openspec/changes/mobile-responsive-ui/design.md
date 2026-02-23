## Context

A jelenlegi UI egyetlen `style.css` (324 sor) + `index.html` + `app.js`. Nincs egyetlen `@media` query sem. A layout fix `display: flex` sidebar (220px) + main content. A feladat: reszponzív + szebb vizuál, letisztultságot megtartva.

## Goals / Non-Goals

**Goals:**
- Mobilon (< 768px) jól használható, egyoszlopos layout
- Szebb vizuális megjelenés: modernebb kártyák, finomabb színek, hover effektek
- A meglévő funkcionalitás változatlan marad
- CSS-only megoldás amennyire lehet, minimális JS a sidebar toggle-höz

**Non-Goals:**
- Teljes UI redesign / framework bevezetés
- Dark mode
- Animációk / transitions (a lényegen túl)

## Decisions

### 1. Breakpoint-ok
- **Mobile**: < 768px (egyoszlopos, hamburger sidebar)
- **Desktop**: >= 768px (jelenlegi layout, vizuális javításokkal)
Nincs szükség tablet breakpoint-ra - a jelenlegi layout 768px felett jól működik.

### 2. Sidebar mobilon: overlay + hamburger
Mobilon a sidebar rejtett, egy hamburger gomb nyitja ki overlay-ként. CSS transition-nel csúszik be balról. A JS csak egy class-t toggle-ol (`sidebar-open` a body-n).

```
Desktop:                    Mobile (zárt):        Mobile (nyit):
┌──────┬──────────────┐    ┌──────────────────┐   ┌──────┬───────────┐
│ Side │              │    │ ☰ Keresés...     │   │ Side │ (overlay) │
│ bar  │   Content    │    │                  │   │ bar  │           │
│      │              │    │   Content        │   │      │  Content  │
│      │              │    │                  │   │      │  (dim)    │
└──────┴──────────────┘    └──────────────────┘   └──────┴───────────┘
```

### 3. Vizuális javítások (desktop + mobil)
- Header: linear-gradient háttér `#1a2f4f → #2a4d7a`
- Kártyák: `box-shadow` default is (nem csak hover-re), `border-radius: 8px`
- Tag badge-ek: enyhe gradiens háttér, lekerekítettebb
- Keresés: nagyobb, ikon-os input mező (🔍 pseudo-element vagy placeholder)
- Sidebar: finomabb háttér, aktív megye kiemelés
- Eredmény szám: badge-szerű megjelenés

### 4. Touch-barát méretezés (mobilon)
- Checkbox-ok: `min-height: 44px` sorok (Apple HIG ajánlás)
- Gombok: min 44px magasság
- Input: 16px font-size (megakadályozza az iOS zoom-ot)

## Risks / Trade-offs

- **[CSS specificitás]** → A meglévő stílusokat nem töröljük, csak felülírjuk media query-kben. Minimum override elv.
- **[Hamburger gomb accessibility]** → `aria-label` és `aria-expanded` attribútumok
