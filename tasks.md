# Project Management - Tasks

## Open Tasks
- [x] Implement Phase 1: Core Linear Grid (12 rows x 31 days)
- [x] Implement Phase 1 (Enhanced): Top-left labels & Unified spans
- [x] Fix Event Spanning & Title Truncation bugs
- [x] Implement Phase 2: Simple Snaking Connection (Vertical nubs at month boundaries)
- [ ] Implement Phase 3: Stacking refinement (Sync snakes across rows)
- [x] Implement Phase 4: Interaction
- [ ] Implement Phase 5: Roadmap - Vertical Weekday Alignment (vs 1st-day alignment toggle)
- [x] Roadmap Enhancement: Switchable year (selector for 2026, 2027, etc.)
- [ ] Roadmap Enhancement: User Layout Preferences (Toggles for label positioning, alignment modes)
- [ ] Roadmap Enhancement: User-selectable locale for dates (default to browser)
- [ ] Roadmap Enhancement: Export data to TXT/CSV/Excel formats
- [ ] Roadmap Enhancement: White-labeling (Branding, logos, custom themes, fonts)
- [ ] Roadmap Enhancement: Advanced styled "S-curve" snaking
- [ ] Roadmap Enhancement: Hover on snake connector highlights entire event across all months

## Phase 2 Plan (branch: phase-2-snaking)
**Design:** Small vertical nubs rendered as child elements of event bars.
- `isEndContinuation` bar → nub at bottom-right, extending downward into row gap
- `isStartContinuation` bar → nub at top-left, extending upward into row gap
- Mirrored (both ends draw a nub), same color as event, purely decorative

**Implementation steps:**
1. [x] Remove `overflow: hidden` from `.event-bar` (text truncation still handled by `.event-title`)
2. [x] Add `.snake-nub`, `.snake-nub--end`, `.snake-nub--start` CSS classes
3. [x] Render nub `<div>`s inside event bars in `App.tsx` based on `isEndContinuation` / `isStartContinuation`
4. [ ] Visual QA: test with events spanning 2, 3, and 12 months

## Phase 4 Plan (branch: phase-4-interaction)
**Design decisions:**
- Click any event bar → edit form opens directly (no day detail intermediate step)
- Click any day cell (empty or occupied) → Add Event form opens directly, pre-filled with that date
- Day detail modal removed (bar click replaces it for editing)
- Edit form includes a Delete button
- Date inputs: no year constraints (allow any date)

**Implementation steps:**
1. [x] Update `EventForm`: support edit mode via `initialEvent` prop, `initialDate` prop for pre-fill, remove hardcoded year min/max, add Delete button in edit mode, dynamic "Save"/"Update" label
2. [x] Update `App.tsx`: add `editingEvent` state, wire bar click → edit modal, wire day cell click → add modal with pre-filled date, add `handleUpdateEvent`, remove day detail modal
3. [ ] Visual QA: test add pre-fill, edit, delete from bar, year-agnostic dates

**Improvement idea:** Day summary view — a way to see all events on a given day at a glance (removed with day detail modal; could be a hover tooltip or a dedicated panel in a future phase)

## Next Tasks
- [ ] Implement Phase 3: Stacking sync across rows for snaking events

## Pending Decisions
- [ ] None.

## Done Tasks
- [x] Initialize project with React + Vite + TS
- [x] Implement initial 4x3 wall calendar grid
- [x] Implement category and event CRUD (basic)
- [x] Implement LocalStorage persistence
- [x] Fix TypeScript 'verbatimModuleSyntax' errors
