---
doc: prd
status: approved
---

# Flock Calendar — Product Requirements

One line: a care schedule for layer farms that asks a few setup questions, generates a calendar of recurring flock care, and lets the farmer see and check off what's due — so the routine lives in the app, not in his head.
Source: `scope.md > The Core Journey`, `> The POC Boundary`.

## The Core Journey
The complete path, end to end.

1. Monday opens Flock Calendar for the first time. Nothing is set up yet, so he sees the **setup questionnaire**.
2. He answers a short set of questions: what kind of birds (layers), his own schedule (student or worker), how many birds, how long they've lived, how many times a day he does regular checkups, how many times a day they're fed, and the vaccine/deworm timing.
3. The app **generates a suitable calendar** from his answers. He can adjust it, or add dates himself.
4. He lands on the **main screen: a calendar**. Dates carry the tasks marked for them.
5. He **clicks a date**. A **list** opens showing the selected day **plus upcoming days** — checkups, feeding, water, egg-pick, cage cleaning, vaccines, deworming.
6. When he finishes a task, he **checks it off**. A multi-day task (a 3-day deworming) **advances to the next day** when he checks off the current one.
7. He can **add another batch later**, **add a custom task to any day**, and **adjust the calendar**.
8. When he closes and reopens the app, the schedule and the day's tasks are **still there**.

Success: he opens the app, clicks a date, sees exactly what needs doing that day, checks them off, and never has to hold the routine in his head.

## Screens and Layout
Source: `scope.md > The Core Loop`.

- **Setup questionnaire** (first run only) — one question at a time or a short form; the questions listed above.
- **Main screen — calendar section.** A calendar view where dates show what's marked. Clicking a date opens the day list.
- **Day list section.** The selected day's tasks **plus upcoming days**. Each task is a row with a checkbox and a short label.
- **Add-batch flow** — a small form to add another batch (bird type, count, age).
- **Add-custom-task flow** — pick a date, name the task.

*Decision (locked at review): the calendar is a **month view**, and "upcoming days" means the **next 7 days**.*

## Look and Feel
Source: `scope.md > Inspiration & Identity`; direction supplied by Monday.

- **Palette:** eco-friendly — greens, lemon, and yellow.
- **Mood:** farm vibe, but on a phone — plain, warm, readable, high-contrast enough for quick use outdoors.
- **Identity:** a bird logo; clear calendar section and list section.
- **Avoid:** generic AI-app styling, clutter, anything that needs explaining.

## Features and Behavior

### Setup questionnaire
- On first run, asks: bird type; the caretaker's own schedule (student or worker); number of birds; how long they've lived (age); checkups per day; feedings per day; vaccine and deworm timing.
- Inputs are **constrained** — you cannot enter something that makes no sense (no free-text counts, no invalid dates).
- From the answers, the app generates a suitable calendar. He can adjust it, or add dates himself.
- [ ] Acceptance: completing setup produces a calendar with tasks on dates.
- [ ] Acceptance: there is no way to submit an invalid value (e.g., zero birds, a nonsensical date).

### The generated calendar
- The app generates a **default schedule** from bird age and standard intervals; he can **adjust** it or **enter dates manually**.
- **Multi-day tasks** (e.g., deworming) span consecutive days.
- [ ] Acceptance: the generated calendar reflects the bird age and the caretaker's schedule.
- [ ] Acceptance: editing a generated task updates the calendar.

### Calendar and day list
- The calendar shows dates; clicking a date opens the list.
- The list shows the **selected day plus upcoming days**.
- An **empty day** shows nothing, plus a way to **add** to that day.
- [ ] Acceptance: clicking a date shows that day's tasks and the following days'.
- [ ] Acceptance: an empty day shows an empty list with an add affordance.

### Tasks and check-off
- Task types: **checkup, feed, water, pick eggs** (recurring, at the frequencies he set — his day runs morning, afternoon, night); **cage cleaning** (on some days); **vaccines**; **deworming** (multi-day).
- Mark done with a **checkbox**. Marking day 1 of a multi-day task **advances to day 2**.
- [ ] Acceptance: checking a task clears it from the pending list for that day.
- [ ] Acceptance: a 3-day deworming advances through days 1 → 2 → 3 as each is checked off.

### Adding batches and custom tasks
- Add another batch later (bird type, count, age).
- Add a custom task to any date.
- [ ] Acceptance: a new batch appears with its own schedule.
- [ ] Acceptance: a custom task appears on the chosen date.

### History
- A simple record of completed tasks.
- [ ] Acceptance: a completed task appears in the history for its date.

## States and Boundaries
- **First use** — setup questionnaire, because nothing is configured yet.
- **Normal use** — calendar + day list.
- **Empty day** — empty list plus an add affordance.
- **Input** — constrained; invalid entries cannot be submitted (no error state needed for bad input).
- **Persistence** — the schedule and the day's tasks remain between sessions; no account is required.
- **Boundary** — one caretaker; layers only; no sharing or multi-user.

## Product Decisions
- **Setup questionnaire instead of manual entry** — builds the schedule from a few answers rather than making him enter every date.
- **Ask about the caretaker's own schedule (student/worker)** — so tasks fit around his life, not just the birds.
- **Generate defaults from bird age and intervals, but let him adjust or enter dates manually** — "both," his words.
- **Calendar → list navigation** — click a date to see its tasks.
- **Multi-day tasks** — deworming runs over three days.
- **Constrained inputs** — "the option shouldn't even exist to enter something that makes no sense."
- **Eco green / lemon / yellow farm palette, bird logo, phone-first.**

## What We're Building
- First-run setup questionnaire (constrained inputs).
- Generated, editable calendar from bird age and intervals.
- Calendar view with a day list (selected day + upcoming days).
- Recurring daily tasks (checkup, feed, water, pick eggs) at set frequencies.
- Cage cleaning on some days.
- Vaccines and multi-day deworming.
- Checkbox check-off; multi-day tasks advance.
- Add another batch; add a custom task to any date.
- A simple history of completed tasks.
- Persistence between sessions; no account.
- Mobile-friendly, eco farm look.

## Deferred From the POC
- **Notifications / reminders** — the PoC proves the schedule, not delivery.
- **Other poultry (broilers) and other livestock** — kept out so the demo stays sharp; the schedule should be data so this is cheap later.
- **Treatment records and notes per batch** — later.
- **Reports and trends** — later.
- **Native mobile app** — the PoC is mobile-friendly; a native app is later.
- **Multi-caretaker / sharing** — not needed to prove the kernel.

## Possible Later Enhancements
- Notifications and reminders for due tasks.
- More animal types, each with its own schedule data.
- Per-batch treatment records and notes.
- Charts: tasks completed over time, missed tasks.
- A native mobile app with offline use.

## Non-Goals
- **Money / profit tracking** — a second kernel, deliberately deferred (`scope.md > Explicitly Cut`).
- **Other animal types** — out for now.
- **Notifications** — later.
- **Accounts, sharing, multi-user** — not needed.

## Open Questions
- **Runs on a phone** — as a mobile-friendly web app, or native? *(tech decision for `4-spec`; a web app is the likely default)*

## Resolved at Review
- **Calendar view** — month view.
- **"Upcoming days" scope** — next 7 days.
- **History** — included as a simple record of completed tasks.
