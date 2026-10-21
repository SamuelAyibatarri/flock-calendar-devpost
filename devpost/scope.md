---
doc: scope
status: approved
---

# Flock Calendar

One line: a care schedule for layer farms that tells you what each batch of birds needs and when — so you never hold the whole routine in your head.

## The Unique Kernel
A schedule *generator* for recurring flock care. Instead of Monday entering reminders, the app lays out every recurring task — vaccines, deworming, cage cleaning, water changes — per batch, driven by bird age and interval, and shows what's due this week. The pain is "not knowing when," not "forgetting," so the app *generates* the schedule rather than just reminding. Coops and livestock health schedulers are an underserved niche; farm finance tools are not.

## Who It's For
Monday Samuel Chidera, who runs a layer farm of 80+ birds in multiple batches at different ages (some around one year, some around two). Today he tracks care in memory and on calendar marks, and his pain is "not knowing when to clean up" — he has other things going on in life. Also other small poultry farmers managing more than one batch.

## The Core Loop
Open the app, see what's due across all batches this week, and check each task off as he does it. He comes back whenever he needs to know what's next, or after finishing a task. Why he returns: the app holds the routine so his head doesn't have to.

## The Numbers (as described)
- 80+ layers, in multiple batches at different ages (some ~1 year, some ~2 years)
- Recurring care: vaccines, deworming, cage cleaning, water changes
- Currency: not needed for this kernel

## Inspiration & Identity
No design direction volunteered. Keep it plain, trustworthy, and notebook-like — a calendar that knows your flock. `3-prd` will fill this in.

## Why This Matters to the Learner
Sam knows a real farmer with a real, recurring problem in an underserved niche — building for one specific person is the strongest position for this hackathon. It also gives him a concrete build to practice the plan-first workflow on.

## What "Working" Looks Like
Monday opens the app and sees, per batch, what's due this week — e.g. "Batch A: deworming due · Batch B: cage cleaning due · water change daily" — and checks each off as he does it. The "oh, that's cool" beat: he doesn't have to remember anything; the app tells him what the flock needs.

## The POC Boundary
In: layers only; multiple batches at different ages; a recurring care schedule (vaccines, deworming, cage cleaning, water changes) generated per batch; a "due this week" view; check-off; a simple history.

## Later
- Other poultry (broilers) and other livestock
- Notifications / reminders
- Treatment records and notes per batch
- Reports and trends
- Mobile app

## Explicitly Cut
- **Money / profit tracking** — real and important, but it's a second kernel; deferred so the care kernel stays sharp.
- **Other animal types** — kept out so the demo stays sharp and buildable; the schedule should be data so this is cheap later.
- **Notifications** — later; the PoC proves the schedule, not delivery.
- **Deployment** — optional; a demo video and public repo are what's required.
