# Moredan - Project Instructions

## Project Vision
Moredan is a yearly calendar application focused on a **Linear Timeline Layout**. It displays 12 monthly rows, each with 31 day columns, allowing users to visualize event durations as horizontal bars.

## Architectural Principles
- **Linear Timeline:** 12 rows (Jan-Dec). Each row is a CSS Grid: `60px (label) repeat(31, 1fr)`.
- **Scrolling:** Vertical scrolling is enabled to accommodate stacked events; horizontal scrolling should be avoided by maintaining a flexible grid.
- **Data Persistence:** All Categories and Events are persisted in `localStorage` (`moredan_categories`, `moredan_events`).
- **Lean Dependencies:** Prefer vanilla TypeScript and CSS. Zero-dependency custom Modals and Forms.

## Coding Conventions
- **Component Structure:** 
  - `App.tsx` manages core state and the main timeline loop.
  - `src/utils/calendar.ts` contains date logic and stacking algorithms.
  - `src/components/` contains reusable UI elements (Modal, EventForm, CategoryForm).
- **TypeScript:** 
  - Use `import type` for type-only imports to satisfy `verbatimModuleSyntax`.
  - Interfaces/Types are centralized in `src/types.ts`.
- **Styling:**
  - Day cells must align day numbers and 3-letter weekdays (e.g., `15 Mon`) to the **top-left**.
  - Event bars must start below the cell text (`top: 20px` offset in the stacking logic).
  - Event titles must be truncated with ellipsis inside bars.

## Core Logic: Stacking & Spanning
- **Spanning:** Events are projected onto each month. If an event spans across months, it is rendered as separate bars in each month's row.
- **Stacking:** A "Greedy" algorithm in `getMonthSpans` calculates `rowOffset` to prevent overlapping bars from covering each other.
- **Unified Spans:** Multi-month events should eventually be visually connected (see Roadmap).

## Roadmap & Future Work
1.  **Phase 2 (Snaking):** Implement vertical "snaking" connectors (simple vertical lines) at the boundaries of months for continuous events.
2.  **Phase 3 (Stacking Sync):** Ensure stacking offsets are consistent across month rows for snaking events.
3.  **Phase 4 (Interaction):** Implement full CRUD for events within the new layout:
    -   **Direct Edit:** Clicking an event bar opens the edit form immediately.
    -   **Day Detail Edit:** In the "Day Detail" list, the whole event row is clickable to edit. On hover, a pencil icon appears to indicate editability.
    -   **Refinement:** Pre-fill the "Add Event" date when clicking an empty day cell.
4.  **Phase 5 (Preferences):** Implement a "Settings" or "Preferences" system:

    -   **Alignment Mode:** Toggle between aligning the 1st of every month vs. vertical weekday alignment (columns representing the same weekday).
    -   **Label Positioning:** Option to move day numbers/weekdays from inside cells to a single "Header Row" above the timeline.
    -   **Year Switching:** Add a selector to change the active year (e.g., 2025, 2026, 2027).
4.  **Locale Support:** Implement user-selectable locale for month/day names (default to browser), keeping input UI in English.
5.  **Data Export:** Provide functionality to export event data in TXT, CSV, and Excel (XLSX) formats.
6.  **White-labeling:** Enable corporate personalization:
    -   Custom branding (Logo, Product Name).
    -   Theming (Corporate primary/secondary colors, custom font family).
    -   Pre-configured Category defaults (Names and Colors).


## Project Management
- Always update `tasks.md` after significant changes.
- Use branches for new feature implementation (e.g., `linear-timeline-layout`).
- Maintain the "Linear Timeline" aesthetic in all UI additions.
