# Moredan - Project Instructions

## Project Vision
Moredan is a yearly calendar application focused on a **Linear Timeline Layout**. It displays 12 monthly rows, each rendered as a horizontal band of day cells, allowing users to visualize event durations as color-coded bars.

## Architectural Principles
- **Linear Timeline:** 12 rows (Jan–Dec). Default mode: `60px (label) + repeat(31, 1fr)`. Weekday alignment mode: `60px (label) + repeat(42, 1fr)` with offset filler cells.
- **Scrolling:** Vertical scrolling accommodates stacked events. Horizontal scrolling must be avoided.
- **Data Persistence:** All categories and events are persisted in `localStorage` (`moredan_categories`, `moredan_events`).
- **Dependencies:** Prefer vanilla TypeScript and CSS for UI. ExcelJS is accepted as a lazy-loaded dependency for XLSX export only (`await import('exceljs')` inside the handler). Avoid adding new heavy dependencies without justification.

## General Constraints
- **Translations/i18n:** Do not add, suggest, or refactor for translations or internationalization unless explicitly asked.

## Coding Conventions
- **Component Structure:**
  - `App.tsx` manages all core state and the main timeline render loop.
  - `src/utils/calendar.ts` contains date logic and the greedy stacking algorithm.
  - `src/components/` contains reusable UI elements (`Modal`, `EventForm`, `CategoryForm`, `SettingsModal`).
- **TypeScript:**
  - Use `import type` for type-only imports (`verbatimModuleSyntax` is enabled).
  - Interfaces and types are centralized in `src/types.ts`.
- **Styling:**
  - Day cells align day numbers and 3-letter weekdays (e.g., `15 Mon`) to the **top-left**.
  - Event bars use `position: absolute` as direct children of `.month-row` with explicit `grid-column` / `grid-row`. This is required — a second independent CSS Grid causes sub-pixel column width rounding divergence and bars bleed into adjacent cells.
  - Event bars start below cell text (`top: 20px` offset in stacking logic).
  - Event titles truncate with ellipsis inside bars.

## Alignment / Drift Rule — READ THIS BEFORE TOUCHING ANY LAYOUT

**Any time the user reports misalignment, drift, or elements not lining up on resize — the cause is almost always two separate CSS Grids with the same `grid-template-columns` trying to stay in sync. They never will. Do not attempt to fix it by tweaking borders, padding, `min-width`, `box-sizing`, or `1fr` calculations. Those are dead ends that waste hours.**

**The only correct fix: merge the misaligned elements into a single shared grid.** Use `grid-row` to stack them in separate rows of the same grid. Children in the same grid share the exact same column geometry by definition — no math, no hacks required.

This was learned the hard way across multiple sessions:
- Day view: event bars were a second grid → fixed by making them `position: absolute` children of the day-cell grid.
- Year-Week view: month-name header was a sibling grid to the week-cell row → fixed by moving month labels into `grid-row: 1` of the same `.month-row--yearweek` grid, week cells to `grid-row: 2`.

**First response to any alignment/drift report: identify whether two grids are involved. If yes, merge them. Do not propose any other fix first.**

## Core Logic: Stacking & Spanning
- **Spanning:** Events are projected onto each month they touch. Multi-month events render as separate bars per row.
- **Stacking:** The greedy algorithm in `getMonthSpans` calculates `rowOffset` to prevent overlap. Rows store `{start, end}` pairs; overlap uses `newStart < existingEnd && newEnd > existingStart`.
- **Stacking sync:** Multi-month events share a globally consistent `rowOffset` so snaking nubs connect at the same vertical position across rows.
- **Snaking connectors:** Vertical nubs rendered at month boundaries (`snake-nub--end` / `snake-nub--start`) visually link a continuous event across rows.
- **Drag and drop:** `dragStateRef` (mutable, no re-renders) tracks the active drag. `dragPreview` state triggers re-renders. `effectiveEvents` useMemo swaps the dragging event's dates for preview dates fed into `getMonthSpans`. `body.drag-active` sets `pointer-events: none` on all bars so `elementFromPoint` reaches `data-month` / `data-day` attributes on day cells.

## Project Management
- Always update `tasks.md` after significant changes.
- Use branches for new feature implementation (e.g., `feat/my-feature`).
- Maintain the "Linear Timeline" aesthetic in all UI additions.
