# Project Management - Tasks

## Legend
- [ ] Open
- [~] In progress
- [x] Done

---

## Shipped

### Core Layout
- [x] Phase 1: Core Linear Grid (12 rows × 31 days)
- [x] Phase 1 (Enhanced): Top-left labels & unified spans
- [x] Phase 2: Snaking connectors (vertical nubs at month boundaries)
- [x] Phase 3: Stacking sync — consistent rowOffset across months for snaking events
- [x] Phase 5: Weekday alignment mode (42-column grid, offset cells, header row)

### Interaction
- [x] Phase 4: Full event CRUD (direct edit from bar, pre-filled add, delete from form)
- [x] Drag and drop event bars — move to new start date; duration preserved

### Settings & Display
- [x] Switchable year (selector with persistence)
- [x] User-selectable locale (month/weekday names)
- [x] Week number display (ISO 8601, toggled in Settings)
- [x] Category filter pills (show/hide by category; select all / none)
- [x] Load demo data action
- [x] Clear all data action

### Export
- [x] Export XLSX (via ExcelJS, lazy-loaded)

### Infrastructure
- [x] GitHub Pages deployment via GitHub Actions

---

## Known Bugs
- [x] Weekday mode stacking false-positive — fixed overlap check in `getMonthSpans`
- [x] Month row misalignment — 31 filler cells for short months; global rowOffset sync
- [x] Event bar sub-pixel spill — removed `.event-row-overlay`; bars are now `position:absolute` direct grid children per CSS Grid spec §10

---

## Open: Missing / Incomplete Features
- [x] Edit category — inline rename and color change in manage modal
- [x] Delete category — inline confirm: delete events or reassign to Uncategorized
- [ ] Resize event bars by dragging start/end edges (change duration directly on the grid)
- [ ] Keyboard accessibility — navigate cells and open forms without a mouse

---

## Open: Roadmap

### Layout Variants
- [x] Zoom: week view — ISO week cells per row; sub-week events as dots, multi-week as bars; auto-activates on mobile
- [x] Zoom: month view — single row × 12 month cells; dot/pill indicators per category; multi-month events as bars
- [x] Zoom: year-week view — single row × 52/53 ISO week cells; sub-week events as dots, multi-week as bars; click opens CellOverlay
- [~] Vertical layout — months as columns, days as rows; each month is a separate render branch; stacking pushes events sideways (busy months are wider by design)
  - [x] Grid structure: sticky day-label column + 12 month columns, 31 day rows
  - [x] Greedy horizontal stacking per month column
  - [x] Click day cell → CellOverlay / Add Event (reuses existing handlers)
  - [x] Weekend highlight, today highlight, filler cells for short months
  - [x] Integrated into view-mode zoom toggle (after month)
  - [ ] Polish: snake nubs at top/bottom of bars for multi-month events
  - [ ] Polish: drag-and-drop support in vertical view
  - [ ] Polish: today scroll / navigate in vertical view
  - [ ] Polish: week numbers in vertical view
- [ ] Mobile UI/UX — touch-friendly layout and interactions for small screens

### Calendar Intelligence
- [x] Cell summary — click a cell to see all events in that period; adapts to zoom level (day / week / month)
- [x] Today highlight + navigate — "Today" button in header: switches to day view, sets year, scrolls to and highlights today's cell
- [x] Multi-year month view — in month view, auto-show prev/next year rows; each row has an individual hide toggle
- [ ] Recurring events — define events that repeat (daily, weekly, monthly, yearly)
- [ ] Event dependencies — link events with an arrow to show sequencing

### Visuals & Polish
- [x] Week number in day zoom is too small — moved to a thin row above each month row; badge is larger and more prominent
- [x] Header button styling inconsistency — "A-/A+", "+ Month -", "All/None", and "Settings" use different styles than "Today", "Add Event", "Category", "Import", "Download"; standardize across all header controls
- [ ] Advanced S-curve snaking connectors (replaces current nubs)
- [ ] Hover on snaking connector highlights entire event across all months
- [ ] Event color customization per event (override category color)
- [ ] Dark mode

### Preferences & Customization
- [ ] User layout preferences: label positioning toggle (day numbers/weekdays in header vs. inside cells)
- [ ] White-labeling — custom branding, logo, theme colors, fonts, default categories

### Data & Integration
- [x] Import from XLSX — client-side FileReader + lazy ExcelJS; matches export schema; auto-creates missing categories; confirmation modal before appending.
- [ ] iCal / .ics export for calendar app integration
- [ ] Share / publish a read-only view via URL
- [ ] Multi-year view — span events across year boundaries

---

## Pending Decisions
- [x] Category deletion behavior: user chooses at delete time — hard delete or reassign to Uncategorized
