## Why

A felhasználóknak tudniuk kell, honnan származnak az adatok, mikor lettek letöltve, és hogy az eredeti forrás hol érhető el. Egy disclaimer banner az oldal tetején ezt egyértelművé teszi.

## What Changes

- Disclaimer/info banner hozzáadása a header alá, ami tartalmazza:
  - Az adatok forrását (MKIK Vállalkozz Digitálisan program)
  - Link az eredeti oldalra (https://vallalkozzdigitalisan.mkik.hu/szallitok)
  - Az adatok letöltésének dátumát
  - Megjegyzés hogy az adatok nem valós idejűek

## Capabilities

### New Capabilities
- `disclaimer-banner`: Info sáv az oldal tetején az adat forrásáról, dátumáról és linkkel az eredetihez

### Modified Capabilities

## Impact

- `docs/index.html` - új banner elem
- `docs/style.css` - banner styling
