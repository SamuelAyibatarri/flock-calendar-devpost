---
doc: spec
status: approved
---

# Flock Calendar — Technical Spec

## How This Works, In Plain Language

Flock Calendar is a phone app that holds a layer farm's care routine so Monday doesn't have to remember it himself.

When he first opens the app, he answers a short setup questionnaire: what kind of birds he has, how many, how old they are, whether he's a student or worker, how many times a day he feeds and checks the birds, and when vaccines/deworming happen. The app takes those answers and a built-in standard poultry schedule (age-based rules for vaccines, deworming, cage cleaning, water changes) and generates a calendar. Every date on the calendar shows what's due that day.

Monday opens the app and sees a calendar. He taps a date, and a list opens showing that day's tasks plus the next few days — things like feed, water, check up, pick eggs, cage cleaning, deworming, vaccines. Each task has a checkbox. When he checks one off, it's saved so it won't show up again tomorrow. If it's a multi-day task like deworming, checking day 1 off moves to day 2.

He can add another batch of birds later, or add a custom task to any day. Everything is saved on his phone, so when he closes and reopens the app, the schedule and his progress are still there. No accounts, no internet needed, no backend — it all lives in a small file on his phone.

## The Core Journey Through the System

Source: `prd.md > The Core Journey`.

1. Monday opens the app. The **Setup** screen shows if nothing is saved yet (`src/app/setup.tsx`). He answers the questionnaire. The app merges his answers with the **built-in poultry schedule** (`src/schedule/poultry.ts`) into per-batch care rules (`src/schedule/build.ts`) and saves them (`src/storage/store.ts`).
2. He's taken to the **calendar** (`src/app/index.tsx`). Each date shows how many tasks are due, computed live from the rules.
3. He taps a date → the **day list** (`src/app/day/[date].tsx`) opens: that day's tasks plus the next 7 days.
4. He checks a task off → it's saved to completions (`src/storage/store.ts`) and drops off the pending list. A multi-day task advances to its next day.
5. He can consult **Flock AI** (`src/components/FlockAiModal.tsx`) from the home briefing or any day view for veterinary symptoms or bird-count dosage calculations. Tapping "Add to Calendar" automatically parses and injects recovery tasks into his schedule.
6. He can add notes to any day, share routines with farmhands via WhatsApp/SMS, or add custom tasks/batches.
7. He reopens the app → AsyncStorage loads → same calendar, same progress.

## Stack

- **Expo SDK ~58** — the runtime and build toolchain for a React Native app that runs on physical devices and emulators. https://docs.expo.dev/
- **Expo Router ~58** — file-based routing under `src/app/`; screens are route modules. https://docs.expo.dev/router/introduction/
- **React Native 0.88** — the UI framework; mobile components like View, Text, ScrollView, Pressable. https://reactnative.dev/
- **React 19** — component model with hooks. https://react.dev/
- **Google Gemini API (`gemini-3.5-flash-lite`)** — lightweight, ultra-fast veterinary guidance and schedule recovery recommendations via direct client fetch.
- **nativewind 4.2.7** — Tailwind utility classes in React Native with dark & light theme support. https://www.nativewind.dev/
- **Tailwind CSS ^3.4** — utility classes consumed by nativewind. https://tailwindcss.com/
- **AsyncStorage** (via `@react-native-async-storage/async-storage`) — key-value persistence for batches, rules, completions, notes, and custom API keys.
- **Phosphor React Native Icons** — high-contrast duotone icons for task categories and actions.

## Where It Runs and How Someone Tries It

- **Runs on:** an Expo development build or the Expo Go app on a phone, or an emulator/simulator on a laptop. Also works on web (React Native Web) but the PoC targets phone.
- **Start:** `cd flock-calendar && npx expo start` — opens Expo DevTools; press `a` for Android emulator, `i` for iOS simulator, or scan the QR with Expo Go on a phone.
- **Demo recording:** run the app, record the screen (emulator or phone), show: setup → calendar → tap date → day list → check off → reopen and it's still there. Upload the recording as the 1–3 minute demo video; push the repo to GitHub.
- **Deployment:** optional, not required. If Monday wants others to try it directly, Expo Application Services (EAS) or `expo publish` can host it; record target and steps in `6-ship`. Reviewers won't clone or run code — the video is the proof.
- **Environment:** Node.js, npx/bun, Expo CLI. No API keys.

## Look and Feel

Source: `prd.md > Look and Feel`, `scope.md > Inspiration & Identity`.

- **Palette:** eco-friendly — greens (`--primary` ~120 hue), lemon (`--secondary` ~60 hue), yellow (`--accent` ~50 hue). Defined as CSS variables in `global.css`, consumed via nativewind classes like `bg-primary`, `bg-secondary`, `text-accent-foreground`.
- **Typography:** Inter (regular, medium, bold) via `nativewind/preset` font family tokens.
- **Mood:** farm vibe, phone-first — plain, warm, readable, high-contrast enough for quick use outdoors. Spacious but not sparse; big tap targets.
- **Identity:** bird logo (placeholder until an actual logo asset exists); clear calendar section and list section.
- Stack constraint: nativewind on React Native supports most Tailwind utilities; some web-only features (e.g., complex grid, backdrop filters) may not honor and should be avoided.

## Components

### CalendarScreen
What it does: month grid; each date cell shows a dot/count when tasks are due; tapping a date navigates to the day list.
What it talks to: `src/schedule/rules.ts` for "due on this date?" logic; AsyncStorage via store for batches/rules.
PRD ref: `prd.md > Features and Behavior > The generated calendar`, `> Calendar and day list`.

### DayListScreen
What it does: shows the selected day's tasks plus upcoming days; each row is a task label with a checkbox; checking off saves completion; multi-day tasks advance.
What it talks to: `src/storage/store.ts` (read tasks, write completions).
PRD ref: `prd.md > Features and Behavior > Tasks and check-off`, `> Calendar and day list`.

### SetupScreen
What it does: the first-run questionnaire (bird type, caretaker schedule, bird count, age, checkups/day, feedings/day, vaccine/deworm timing); constrained inputs; generates the calendar from answers + built-in schedule.
What it talks to: `src/schedule/build.ts` (answers → rules), `src/storage/store.ts` (persist batches/rules).
PRD ref: `prd.md > Features and Behavior > Setup questionnaire`, `> The generated calendar`.

### TaskRow
What it does: a single task row — label, checkbox, due-state styling.
What it talks to: nothing external; presentational.
PRD ref: `prd.md > Features and Behavior > Tasks and check-off`.

### CustomTaskAdder
What it does: small form to add a custom task to any date.
What it talks to: `src/storage/store.ts`.
PRD ref: `prd.md > Features and Behavior > Adding batches and custom tasks`.

### BatchAdder
What it does: small form to add another batch (bird type, count, age).
What it talks to: `src/storage/store.ts`.
PRD ref: `prd.md > Features and Behavior > Adding batches and custom tasks`.

### ScheduleGenerator (module, not UI)
What it does: pure function — takes setup answers + standard poultry rules → produces per-batch care rules with due dates.
What it talks to: `src/schedule/poultry.ts` (standard schedule data).
PRD ref: `prd.md > Features and Behavior > The generated calendar`.

## Data Model

Everything stored in AsyncStorage as JSON under a single key `flock:v1`. Where it lives: on the phone. How it gets updated: writes on setup, task completion, add batch/task. What happens when the user leaves and comes back: AsyncStorage loads on app open; calendar and day list re-derive from the stored rules.

- **Batch** — `id: string`, `label: string` (e.g. "Batch A"), `birdCount: number`, `hatchDate: string` (ISO date; age is derived, not stored)
- **Rule** — `id: string`, `batchId: string`, `kind: 'checkup'|'feed'|'water'|'eggs'|'cleaning'|'vaccine'|'deworm'|'custom'`, `title: string`, `intervalDays?: number` (for recurring), `startOffsetDays?: number` (for hatch-relative like vaccines), `durationDays?: number` (multi-day like deworming), `timesPerDay?: number` (for feed/water/checkup)
- **Completion** — `ruleId: string`, `date: string` (ISO date), `doneAt: string` (ISO timestamp)

Derived (not stored): the calendar grid — for any date, each rule answers "due today?"; hide anything already in completions for that date.

## File Structure

```
flock-calendar/
├── devpost/                  # Devpost learning workspace (learner profile, scope, PRD, spec, checklist)
├── src/
│   ├── app/                  # Expo Router screens (route = screen)
│   │   ├── _layout.tsx       # app shell: native providers, navigation container, theme wrapper
│   │   ├── index.tsx         # calendar screen (main); first-run gate → setup if empty
│   │   ├── setup.tsx         # setup questionnaire screen
│   │   └── day/
│   │       └── [date].tsx    # day list screen (selected day + upcoming days)
│   ├── components/           # shared UI
│   │   ├── TaskRow.tsx
│   │   ├── CalendarCell.tsx
│   │   ├── BatchAdder.tsx
│   │   └── CustomTaskAdder.tsx
│   ├── schedule/             # schedule logic (no UI)
│   │   ├── rules.ts          # rule types + "due on this date?" logic
│   │   ├── poultry.ts        # standard layer schedule data (age-based)
│   │   └── build.ts          # setup answers + schedule → rules
│   ├── storage/              # persistence
│   │   └── store.ts          # AsyncStorage load/save for batches, rules, completions
│   ├── theme/                # styling tokens
│   │   └── index.ts          # nativewind theme extension (optional; tailwind.config.js holds the palette)
│   └── global.css            # tailwind directives + eco CSS variables
├── app.json                  # Expo config (name, slug, icon, orientation, plugins)
├── babel.config.js           # nativewind babel preset
├── metro.config.js           # withNativeWind wrapping expo metro config
├── tailwind.config.js        # tailwind config with nativewind/preset + eco palette
├── nativewind-env.d.ts       # nativewind type declarations
├── tsconfig.json             # TypeScript config (extends expo/tsconfig.base, @/* paths)
├── package.json              # dependencies incl. nativewind, @react-native-async-storage/async-storage
└── README.md                 # how to start + what to record for the demo
```

## External Services and Dependencies

- `@react-native-async-storage/async-storage` — to be added; local key-value persistence on the phone. https://react-native-async-storage.github.io/async-storage/
- No other external services. No AI model, no backend, no accounts, no API keys, no hosting required for the PoC.

## Important Failure Modes

- **AsyncStorage write fails** (rare, device storage full) → show a plain message "Couldn't save — try again" and keep the task unchecked so it still shows on the list.
- **No data on first open** → show the setup questionnaire (by design, not an error).
- **Empty day (nothing due)** → show an empty list with an "add task" affordance (by design).
- **Bad date tapped** → the day list renders empty; no crash.

## What Was Simplified and Why

- **AsyncStorage single JSON file** instead of a hosted database — same data shape, same queries, no infrastructure; the PoC is single-user and offline. The fuller version would need a backend, auth, and sync.
- **No AI model for schedule generation** instead of an LLM-driven planner — the built-in standard poultry schedule is reliable and works offline; a wrong vaccine date is worse than no app. The fuller version could add an AI tweak behind a flag.
- **No notifications/reminders** instead of push notifications — the PoC proves the schedule, not delivery. Later.
- **Month view calendar** instead of a full date-picker library — proves the kernel with fewer dependencies. Later versions could enrich it.
- **Single caretaker, no accounts** instead of multi-user sync — one phone, one farm; accounts add substantial complexity rarely needed to prove the idea.

## Decisions and Open Issues

Decisions made here:
- **Stack: Expo + Expo Router + nativewind** — chosen by Monday; phone-first, records cleanly from emulator for the demo video. Tradeoff: one more dependency to configure; worth it for the farm-vibe styling speed.
- **AsyncStorage single-key JSON** — recommended by me, accepted by Monday. Tradeoff: no queries beyond load/save; fine for this scale.
- **Built-in standard poultry schedule** — recommended by me, accepted by Monday. Tradeoff: less "AI-flavored," but reliable and offline; never fakes the kernel.
- **Month calendar + next 7 days upcoming** — locked at PRD review. Tradeoff: simpler than week view; demo-able.

One genuine uncertainty carried from PRD review:
- **Runs on a phone as a mobile-friendly web app, or native?** — web is the likely default (Expo Router handles both); to be confirmed at build start. This is a `4-spec` tech decision and doesn't block the spec.

Still unresolved:
- **History** — included as a simple record of completed tasks (locked at PRD review). Its UI surface is not yet designed; build-time detail.
