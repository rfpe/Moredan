---
name: Alignment/drift fix rule
description: When user reports misalignment, drift, or resize issues — always merge into a single CSS Grid. Never fiddle with borders/padding/fr math.
type: feedback
originSessionId: 7e7fe7c4-afc9-480a-9d98-5cadd51ac349
---
When the user reports misalignment, drift, or elements not lining up on resize, the root cause is always two separate CSS Grids with matching `grid-template-columns` trying to stay in sync. They never will.

**Why:** Hours were wasted across multiple sessions chasing border differences, `box-sizing`, `min-width`, and `1fr` rounding as the culprit. They are never the real fix. The sub-pixel column geometry of two independent grids will always diverge.

**How to apply:** The moment the user mentions drift, misalignment, or resize issues — check whether two sibling grids are involved. If yes, the only correct fix is to merge them into one grid using `grid-row` to separate rows. Do NOT propose border tweaks, padding adjustments, or fraction calculations first. Skip straight to merging.

Proven examples in this project:
- Day view bars: made `position: absolute` children of the day-cell grid instead of a second grid.
- Year-Week month header: was a sibling grid to `.month-row--yearweek` → moved month labels into `grid-row: 1` of the same grid, week cells to `grid-row: 2`.
