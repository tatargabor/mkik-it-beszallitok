## Context

A webes felület (`docs/`) már működik, header alá kell egy info banner. Minimális módosítás: HTML + CSS.

## Goals / Non-Goals

**Goals:**
- Forrás megjelölés és link az MKIK oldalra
- Letöltés dátumának megjelenítése
- Vizuálisan elkülönülő de nem zavaró banner

**Non-Goals:**
- Dinamikus dátum (statikus, a JSON generáláskor kapott dátum)
- Cookie consent vagy jogi disclaimer

## Decisions

### Banner elhelyezés és stílus
**Döntés:** Halvány háttérszínű info sáv a header alatt, nem bezárható. Tartalmaz egy linket az eredeti MKIK oldalra.

**Miért:** Mindig látható kell legyen, nem opcionális információ.

## Risks / Trade-offs

Nincs érdemi kockázat, pár sor HTML + CSS.
