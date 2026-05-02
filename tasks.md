# Project Management - Tasks

## Legend
- [ ] Open
- [~] In progress
- [x] Done

## Core Features
- [x] Phase 1: Core Linear Grid (12 rows x 31 days)
- [x] Phase 1 (Enhanced): Top-left labels & Unified spans
- [x] Fix Event Spanning & Title Truncation bugs
- [x] Phase 2: Snaking Connection (vertical nubs at month boundaries)
- [x] Phase 3: Stacking refinement — sync rowOffset across months for snaking events
- [x] Phase 4: Interaction (direct edit from bar, pre-filled add, delete from form)
- [x] Phase 5: Vertical Weekday Alignment (42-column grid, offset cells, header row)

## Enhancements (Shipped)
- [x] Switchable year (selector with persistence)
- [x] User-selectable locale (month/weekday names, Settings modal)
- [x] CSV export (native browser download)
- [x] Week number display (ISO 8601, toggled in Settings)

## Enhancements (Roadmap)
- [ ] Bird's eye view — zoom levels: (1) weeks as cells per month row, (2) months as cells per year row; allows quick navigation of large date ranges
- [ ] Vertical layout — months as columns, days as rows (transpose of current layout)
- [ ] Mobile UI/UX — touch-friendly layout and interactions for small screens
- [x] Drag and drop event bars — move an event to a new start date; duration is preserved
- [ ] User Layout Preferences: label positioning toggle (day numbers/weekdays in header row vs. inside cells)
- [ ] White-labeling (custom branding, logo, theme colors, fonts, default categories)
- [ ] Advanced "S-curve" snaking connectors (replaces current nubs)
- [ ] Hover on snaking connector highlights entire event across all months
- [x] Export: XLSX format (via ExcelJS, lazy-loaded; CSV removed — XLSX covers all export needs)
- [ ] Cell summary — click/hover a cell to see all events within that period at a glance; works across zoom levels (cell = day, week, or month)

## Known Bugs
- [x] **Weekday mode: stacking false-positive.** Fixed in `getMonthSpans`: rows now store `{start, end}` pairs; overlap check uses `newStart < existingEnd && newEnd > existingStart` instead of just `newStart < existingEnd`.
- [x] **Misalignment (two issues):**
  - [x] Fix 1: Visual uniformity — render 31 filler cells for short months so every row has the same visual width
  - [x] Fix 2: Stacking sync — multi-month events get globally consistent rowOffset so snaking nubs connect at the same height
- [x] **Event bar sub-pixel spill.** Bars bled into adjacent day columns at 100%+ zoom. Root cause: `.event-row-overlay` created a second independent CSS Grid; fractional `1fr` column widths rounded differently across the two grids. Fix: removed the overlay wrapper; event bars are now `position:absolute` direct children of `.month-row` with explicit `grid-column`/`grid-row`. Per CSS Grid spec, their containing block is the grid area — same column lines as day cells, no independent rounding possible. Confirmed via PoC (`sample/poc_grid_alignment.html`).

## Pending Decisions
- [ ] None.
