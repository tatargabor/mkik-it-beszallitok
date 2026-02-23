## 1. Visual Upgrades (Desktop + Mobile)

- [x] 1.1 Update header to use linear-gradient background (#1a2f4f → #2a4d7a)
- [x] 1.2 Update company cards: default box-shadow, border-radius 8px, enhanced hover shadow
- [x] 1.3 Refine tag badges: increased border-radius (pill shape), softer background
- [x] 1.4 Improve search bar: larger padding, border-radius 6px, search icon placeholder
- [x] 1.5 Style sidebar: refined background, better spacing, checked-county highlight
- [x] 1.6 Style result count as a pill/badge with background and border-radius

## 2. Mobile Responsive Layout

- [x] 2.1 Add hamburger menu button to header in index.html (hidden on desktop, visible on mobile)
- [x] 2.2 Add backdrop overlay element to index.html for sidebar
- [x] 2.3 Add CSS media query (max-width: 767px): hide sidebar, full-width main, show hamburger
- [x] 2.4 Add CSS for sidebar slide-in overlay on mobile (position fixed, left transition, z-index)
- [x] 2.5 Add CSS for backdrop (semi-transparent overlay behind sidebar)

## 3. Touch-Friendly Sizing

- [x] 3.1 Mobile county checkbox rows: min-height 44px, proper padding
- [x] 3.2 Mobile search input: font-size 16px to prevent iOS zoom
- [x] 3.3 Mobile buttons: min-height 44px

## 4. JavaScript - Sidebar Toggle

- [x] 4.1 Add sidebar toggle JS: hamburger click toggles `sidebar-open` class on body
- [x] 4.2 Add backdrop click handler to close sidebar
- [x] 4.3 Add aria-label and aria-expanded attributes to hamburger button, update on toggle

## 5. Testing & Polish

- [x] 5.1 Verify desktop layout unchanged (sidebar + content side by side)
- [x] 5.2 Verify mobile layout: single column, hamburger works, sidebar overlay slides in/out
- [x] 5.3 Verify AI chat section is usable on mobile
