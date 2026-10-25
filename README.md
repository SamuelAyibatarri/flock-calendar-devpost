# Flock Calendar 🐓

An intelligent flock care schedule & AI veterinary advisor built for layer poultry farmers managing multiple batches.

Built for **Monday Samuel Chidera** (80+ layers across multiple batches at different ages) and smallholder poultry farmers who need an automated, reliable care routine without having to keep vaccination schedules and withdrawal intervals in their head.

---

## 🌟 Key Features

* **Automated Care Schedule Generator**: Input bird age and daily routines (feed, checkups, egg-picking), and Flock Calendar automatically computes vaccination dates (Newcastle Lasota, Gumboro), multi-day deworming intervals (60-day cycle, 3-day duration), and sanitization routines.
* **Flock AI — Poultry Vet & Schedule Advisor**:
  * Powered by **Google Gemini 3.5 Flash Lite** (with an instant offline veterinary expert fallback).
  * Analyzes symptoms and layer challenges (watery droppings, sudden drops in egg production, heat stress).
  * Calculates exact medication and water intake volumes based on batch bird count.
  * **1-Tap Calendar Injection**: Tap *"Add This Routine to Calendar"* to automatically parse and inject multi-day recovery steps directly into the farm schedule.
* **Flock AI Daily Briefing**: Live status banner on the calendar tracking flock age and layer stage (e.g. *Peak Laying Stage (Week 22): ensure adequate calcium intake*).
* **Multi-Batch Management**: Track multiple flocks hatched at different dates, each with its own customized age-driven schedule.
* **7-Day Upcoming Care View & Checklist**: Day-by-day view showing today's tasks and the next 7 days of scheduled care with progress check-off.
* **Daily Farm Notes**: Add, edit, and maintain dated farm records directly on the calendar.
* **Share Routine with Farmhands**: One-tap sharing via WhatsApp or SMS to send daily task checklists and notes directly to farm attendants.
* **Local Device Notifications**: Schedule daily 7:00 AM care alerts or trigger test reminders without relying on cloud push servers.
* **BYOK (Bring Your Own Key)**: Configure your own Google Gemini API key in Settings, or use the pre-configured key / offline expert mode.
* **Theme & UI**: Full Dark Mode and Light Mode support with native Android edge-to-edge system navigation bar contrast synchronization and smooth keyboard-avoiding views.

---

## 🛠️ Tech Stack

* **Framework**: React Native 0.88 / React 19
* **Toolchain**: Expo SDK 58 (Expo Router, Expo Notifications, Expo System UI)
* **AI Model**: Google Gemini API (`gemini-3.5-flash-lite`)
* **Styling**: NativeWind v4 (Tailwind CSS) with custom eco farm palette
* **Local Persistence**: AsyncStorage (100% offline-first)
* **Icons**: Phosphor React Native (Duotone)
* **Package Manager**: Bun

---

## 🚀 Getting Started

### Prerequisites
* [Bun](https://bun.sh/)
* Android SDK or physical Android device connected via ADB

### Installation & Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/SamuelAyibatarri/flock-calendar-devpost.git
   cd flock-calendar-devpost/flock-calendar
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. (Optional) Set your Gemini API key in `.env.local` or enter it directly in the app's Settings screen (BYOK):
   ```bash
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Run locally on an Android device or emulator:
   ```bash
   bun expo run:android
   ```

### 📦 Building a Standalone APK (EAS Build)

To build a standalone installable Android APK that anyone can test without setting up the dev environment:

```bash
cd flock-calendar
eas build -p android --profile prototype_apk
```
*The resulting `.apk` can be installed directly onto any Android device.*

---

## 📄 License

MIT License. Built for the **Devpost: Build with AI: Basics** Hackathon.
