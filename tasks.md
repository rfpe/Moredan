# Project Management - Tasks

## Legend
- [ ] Open
- [~] In progress
- [x] Done

## Open Tasks
- [x] Implement Phase 1: Core Linear Grid (12 rows x 31 days)
- [x] Implement Phase 1 (Enhanced): Top-left labels & Unified spans
- [x] Fix Event Spanning & Title Truncation bugs
- [x] Implement Phase 2: Simple Snaking Connection (Vertical nubs at month boundaries)
- [ ] Implement Phase 3: Stacking refinement (Sync snakes across rows)
- [x] Implement Phase 4: Interaction
- [x] Implement Phase 5: Vertical Weekday Alignment
- [x] Roadmap Enhancement: Switchable year (selector for 2026, 2027, etc.)
- [ ] Roadmap Enhancement: User Layout Preferences (Toggles for label positioning, alignment modes)
- [x] Roadmap Enhancement: User-selectable locale for dates
- [x] Roadmap Enhancement: Export data to CSV format (TXT and XLSX deferred)
- [ ] Roadmap Enhancement: White-labeling (Branding, logos, custom themes, fonts)
- [ ] Roadmap Enhancement: Advanced styled "S-curve" snaking
- [x] Roadmap Enhancement: Week number display (ISO 8601, badge on week-start day cells, both alignment modes)
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

## Locale Feature Plan (branch: feature-locale)
**Design decisions:**
- Locale stored in `localStorage('moredan_locale')`, defaults to `navigator.language`
- Settings modal (gear icon in header) houses locale selector and future preferences
- Predefined list of 12 locales shown by their native name; "Browser default (xx-XX)" prepended
- Only month/weekday labels localised; all UI stays in English; layout stays LTR

**Implementation steps:**
1. [x] Update `generateYearData` in `calendar.ts` to accept a `locale` param
2. [x] Create `src/components/SettingsModal.tsx` with locale dropdown
3. [x] Add `locale` state + gear button + settings modal wiring in `App.tsx`
4. [x] Style gear button in `App.css`
5. [x] Visual QA: switch locales, verify month/weekday names update, layout stays LTR

## Phase 5 Plan (branch: feature-weekday-alignment)
**Design decisions:**
- Week start day derived from locale via `Intl.Locale.weekInfo`, fallback to Monday
- Grid always 42 slots (6 weeks) in weekday mode; consistent column widths across all months
- Offset cells (before day 1): subtle crosshatch, no click, no day number
- Weekday header row above timeline; weekday labels removed from day cells in weekday mode
- Toggle in Settings modal alongside locale selector

**Implementation steps:**
1. [x] Add `getWeekStart`, `getMonthOffset` to `calendar.ts`; extend `getMonthSpans` with weekday-align params
2. [x] Add alignment toggle to `SettingsModal.tsx`
3. [x] Wire `weekdayAlign` state + weekday header row + offset cells in `App.tsx`
4. [x] Add CSS for 42-column grid, header row, offset crosshatch
5. [ ] Visual QA: test all months, event bars, snaking nubs, locale changes

## Next Tasks
- [ ] Implement Phase 3: Stacking sync across rows for snaking events

## Known Bugs
- [ ] **Weekday mode: event bar misalignment when stacking.** Repro: Event A (1/2–1/2) and Event B (1/3–1/5) in January. Event A renders starting at day 1/1 (one column too far left), Event B ends at 1/6 (one column too far right). Stacking logic (greedy row assignment) also misbehaves. Root cause likely in `startColumn`/`endColumn` offset calculation in `getMonthSpans` — the `+1`/`+2` adjustments may need revisiting when `offset > 0`.

## Pending Decisions
- [ ] None.

## Done Tasks
- [x] Initialize project with React + Vite + TS
- [x] Implement initial 4x3 wall calendar grid
- [x] Implement category and event CRUD (basic)
- [x] Implement LocalStorage persistence
- [x] Fix TypeScript 'verbatimModuleSyntax' errors
