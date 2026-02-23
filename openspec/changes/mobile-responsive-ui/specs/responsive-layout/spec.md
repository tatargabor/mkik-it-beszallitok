## ADDED Requirements

### Requirement: Mobile responsive layout
The UI SHALL switch to a single-column layout on viewports narrower than 768px. The sidebar SHALL be hidden by default on mobile and accessible via a hamburger menu button. On desktop (>= 768px) the existing two-column layout SHALL be preserved.

#### Scenario: Mobile viewport shows single column
- **WHEN** the viewport width is less than 768px
- **THEN** the sidebar is hidden, the main content takes full width, and a hamburger button is visible in the header

#### Scenario: Desktop viewport shows two columns
- **WHEN** the viewport width is 768px or greater
- **THEN** the sidebar is visible as a fixed left panel (220px) and the hamburger button is hidden

### Requirement: Hamburger sidebar toggle
The header SHALL contain a hamburger menu button (visible only on mobile) that toggles the sidebar as a slide-in overlay from the left. The toggle SHALL add/remove a `sidebar-open` class on the body element.

#### Scenario: Open sidebar on mobile
- **WHEN** the user taps the hamburger button on a mobile viewport
- **THEN** the sidebar slides in from the left as an overlay, a semi-transparent backdrop appears behind it, and `body` has class `sidebar-open`

#### Scenario: Close sidebar on mobile
- **WHEN** the sidebar is open and the user taps the backdrop or the hamburger button
- **THEN** the sidebar slides out, the backdrop disappears, and `sidebar-open` class is removed from body

### Requirement: Touch-friendly sizing on mobile
On mobile viewports, interactive elements SHALL meet minimum touch target sizes. Checkbox rows SHALL have a minimum height of 44px. Input fields SHALL use 16px font-size to prevent iOS auto-zoom.

#### Scenario: Checkbox rows are touch-friendly
- **WHEN** the viewport is mobile (< 768px)
- **THEN** each county checkbox label row has at least 44px height

#### Scenario: Search input prevents iOS zoom
- **WHEN** the viewport is mobile and the user focuses the search input
- **THEN** the input has font-size >= 16px, preventing iOS Safari from zooming

### Requirement: Visual upgrade - header gradient
The header SHALL use a linear-gradient background from `#1a2f4f` to `#2a4d7a` instead of a flat color, on both mobile and desktop.

#### Scenario: Header displays gradient
- **WHEN** the page loads
- **THEN** the header background is a left-to-right gradient from #1a2f4f to #2a4d7a

### Requirement: Visual upgrade - card styling
Company cards SHALL have a subtle box-shadow by default (not only on hover), `border-radius: 8px`, and an enhanced hover shadow. The design SHALL remain clean and minimal.

#### Scenario: Card has default shadow
- **WHEN** a company card is rendered
- **THEN** it has a visible subtle box-shadow and 8px border-radius

#### Scenario: Card hover enhances shadow
- **WHEN** the user hovers over a company card
- **THEN** the box-shadow becomes more prominent

### Requirement: Visual upgrade - tag badges
Tag badges (counties, tenders, software type) SHALL have a slightly more refined appearance with increased border-radius and subtle gradient or softer background colors.

#### Scenario: Tags appear refined
- **WHEN** tags are displayed on a company card
- **THEN** they have rounded corners (border-radius >= 10px) and a soft background color

### Requirement: Visual upgrade - search bar
The search input SHALL be larger and more prominent with a search icon placeholder and improved focus styling.

#### Scenario: Search bar is prominent
- **WHEN** the page loads
- **THEN** the search input has a visible search icon (via placeholder or pseudo-element), padding >= 10px, and border-radius >= 6px

### Requirement: Visual upgrade - sidebar styling
The sidebar SHALL have a refined background color, better section spacing, and active/selected county highlighting.

#### Scenario: Selected counties are highlighted
- **WHEN** a county checkbox is checked
- **THEN** the label row has a visible background highlight

### Requirement: Visual upgrade - result count badge
The result count SHALL be displayed as a badge-style element with a background color and border-radius.

#### Scenario: Result count shows as badge
- **WHEN** results are displayed
- **THEN** the result count has a pill/badge appearance with background color and rounded corners

### Requirement: Hamburger button accessibility
The hamburger button SHALL include `aria-label="Menü megnyitása"` and `aria-expanded` attribute that reflects the sidebar state (true/false).

#### Scenario: Aria attributes are correct when closed
- **WHEN** the sidebar is closed
- **THEN** the hamburger button has `aria-expanded="false"` and `aria-label="Menü megnyitása"`

#### Scenario: Aria attributes update when opened
- **WHEN** the sidebar is opened
- **THEN** the hamburger button has `aria-expanded="true"`
