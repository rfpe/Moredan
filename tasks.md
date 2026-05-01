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
- [ ] Phase 3: Stacking refinement — sync rowOffset across months for snaking events
- [x] Phase 4: Interaction (direct edit from bar, pre-filled add, delete from form)
- [x] Phase 5: Vertical Weekday Alignment (42-column grid, offset cells, header row)

## Enhancements (Shipped)
- [x] Switchable year (selector with persistence)
- [x] User-selectable locale (month/weekday names, Settings modal)
- [x] CSV export (native browser download)
- [x] Week number display (ISO 8601, toggled in Settings)

## Enhancements (Roadmap)
- [ ] User Layout Preferences: label positioning toggle (day numbers/weekdays in header row vs. inside cells)
- [ ] White-labeling (custom branding, logo, theme colors, fonts, default categories)
- [ ] Advanced "S-curve" snaking connectors (replaces current nubs)
- [ ] Hover on snaking connector highlights entire event across all months
- [ ] Export: TXT and XLSX formats (CSV already done)
- [ ] Day summary view — see all events on a given day at a glance (removed with old day detail modal; tooltip or side panel)

## Known Bugs
- [ ] **Weekday mode: event bar misalignment when stacking.** Repro: Event A (1/2–1/2) and Event B (1/3–1/5) in January. Event A renders starting at day 1/1 (one column too far left), Event B ends at 1/6 (one column too far right). Stacking logic also misbehaves. Root cause likely in `startColumn`/`endColumn` offset arithmetic in `getMonthSpans`.

## Pending Decisions
- [ ] None.
