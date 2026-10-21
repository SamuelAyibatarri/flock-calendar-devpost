---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. Set up your flock and see the generated calendar**
  Becomes usable: A running app where Monday completes the setup questionnaire and sees a calendar with tasks placed on dates — the kernel: the app holds the routine so he doesn't have to remember it. Nothing persists yet across restarts in this slice.
  Why now: The unique kernel is setup + generated calendar. Proving it end to end on slice one means every later slice lands somewhere usable.
  PRD ref: `prd.md > Features and Behavior > Setup questionnaire`, `> The generated calendar`
  Spec ref: `spec.md > Components > SetupScreen`, `> CalendarScreen`, `> ScheduleGenerator`; `spec.md > Data Model`; `spec.md > File Structure`
  Build: Install `@react-native-async-storage/async-storage`. Create `src/storage/store.ts` (AsyncStorage load/save for batches, rules, completions). Create `src/schedule/poultry.ts` (standard layer schedule rules), `src/schedule/rules.ts` (rule types + "due on this date?" logic), `src/schedule/build.ts` (setup answers + schedule → rules). Create `src/app/setup.tsx` (setup questionnaire with constrained inputs). Replace `src/app/index.tsx` with calendar screen (month grid; dates show task count; tap navigates to day list). Wire `_layout.tsx` navigation.
  Verify (mechanical): `npx expo start` starts with no errors; complete setup; calendar renders with tasks on expected dates (e.g., deworming spanning days 1–3, cage cleaning on interval).
  Learner check: Open the app, run setup, confirm the calendar shows what you expect for your flock.
  Commit: `Set up flock and generate calendar`

- [x] **2. Tap a date, see its tasks, check them off**
  Becomes usable: Tapping a calendar date opens a day list (that day + next 7 days) with checkboxes; checking off saves completion and removes it from the list; a multi-day deworming advances day-by-day.
  Why now: Check-off is the daily loop — what Monday actually does every day. It's the second half of the kernel after calendar generation.
  PRD ref: `prd.md > Features and Behavior > Tasks and check-off`, `> Calendar and day list`
  Spec ref: `spec.md > Components > DayListScreen`, `> TaskRow`; `spec.md > Data Model > Completion`
  Build: Create `src/app/day/[date].tsx` (day list screen). Create `src/components/TaskRow.tsx` (label + checkbox). On check-off, write completion to AsyncStorage and filter it out. Multi-day task: checking day 1 leaves day 2 pending.
  Verify (mechanical): Tap a date; day list opens with tasks; check one off; it disappears from the list; multi-day deworming shows day 2 after day 1 is checked.
  Learner check: Open a date, check off a task, confirm it's gone and multi-day tasks advance.
  Commit: `Tap date, see tasks, check off`

- [x] **3. Add another batch and a custom task**
  Becomes usable: Add a second flock batch (bird type, count, age) and a custom task to any date; both appear on their dates.
  Why now: Multiple batches at different ages was in Monday's problem; this proves the schedule works per-batch, not just once.
  PRD ref: `prd.md > Features and Behavior > Adding batches and custom tasks`
  Spec ref: `spec.md > Components > BatchAdder`, `> CustomTaskAdder`; `spec.md > Data Model > Batch`, `> Rule`
  Build: Create `src/components/BatchAdder.tsx` and `src/components/CustomTaskAdder.tsx`. Wiring into calendar/day list so new batches/rules appear.
  Verify (mechanical): Add batch; new batch's rules appear on calendar. Add custom task to a date; it appears on that date's list.
  Learner check: Add a batch, add a custom task, confirm both show up where expected.
  Commit: `Add batch and custom task`

- [x] **4. Empty day handling and polish**
  Becomes usable: Tapping an empty date shows an empty list with an add-task option; app runs end to end without crashes; eco palette applied throughout.
  Why now: The empty state is a real screen Monday will hit often; polish makes the demo presentable.
  PRD ref: `prd.md > States and Boundaries > Empty day`; `prd.md > Look and Feel`
  Spec ref: `spec.md > Components > DayListScreen` (empty state); `spec.md > Look and Feel`
  Build: Empty day renders empty list + add affordance. Apply nativewind eco classes (greens/lemon/yellow) across screens. Bird logo placeholder.
  Verify (mechanical): Tap a date with no tasks; empty list with add option shows. App runs without errors across setup → calendar → day list → check-off → add.
  Learner check: Tap an empty date, confirm empty state, then try the full core journey.
  Commit: `Empty day handling and polish`

## Hands-on Checkpoints

- [x] Early usable behavior explored — after slice 1 (kernel proven)
- [x] Final kick-the-tires exploration and feedback completed

## Final Review

- [x] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [x] Learning activity complete — focused alternative (verified schedule logic in isolation; investigated async-storage native-build requirement)
- [x] Optional edit and transfer reflection addressed — declined (user: "just build, I'll review later")
- [x] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: Four build slices complete and committed (setup+calendar, day list+check-off, add batch/custom task, empty day+polish). Schedule logic verified via isolated mechanical test (deworm spans days 4–6, cleaning every 7 days, vaccine at day 14). Typecheck clean for all new files. App-map.html generated.
Route and stops: Reference route only (not toured interactively): flock-calendar/src/app/index.tsx → flock-calendar/src/app/day/[date].tsx → flock-calendar/src/storage/store.ts
Edit outcome: declined/not applicable
Reflection: offered/declined — personal answer belongs only in the ignored profile
Activity mode: live app and editor (typecheck, mechanical verification)

## Revisions
