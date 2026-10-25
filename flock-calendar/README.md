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

## 🚀 Getting Started & Testing

There are three ways to try out and build Flock Calendar:

### 1. 📱 Direct APK Download (Fastest — Zero Setup)
Download the standalone Android `.apk` directly from the [GitHub Releases](https://github.com/SamuelAyibatarri/flock-calendar-devpost/releases) page and install it on any physical Android device. No development environment or build steps required.

---

### 2. 💻 Local Development Build (Expo & Native Android)
If you want to run or inspect the code locally:

#### Prerequisites
* [Bun](https://bun.sh/) package manager
* Android Studio, Android SDK (`platform-tools`, `build-tools`), and Java JDK / Gradle configured for your OS (Linux, macOS, or Windows)
* An Android emulator or a physical Android device connected via USB debugging (`adb devices`)

#### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/SamuelAyibatarri/flock-calendar-devpost.git
   cd flock-calendar-devpost/flock-calendar
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. (Optional) Configure Gemini API key:
   Set your key in `.env.local` or enter it directly inside the app under **Settings → Flock AI (BYOK)**:
   ```bash
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(If omitted, Flock AI runs in offline expert rule mode).*

4. Compile and launch on your connected device:
   ```bash
   bun expo run:android
   ```

---

### 3. ☁️ Cloud Build via EAS (Generate your own APK)
If you prefer building a fresh installable APK in the cloud without installing local Android build tools:

1. Install EAS CLI and create a free [Expo account](https://expo.dev/) if you don't already have one:
   ```bash
   npm install -g eas-cli
   eas login
   ```
2. Trigger the cloud APK build:
   ```bash
   cd flock-calendar
   eas build -p android --profile prototype_apk
   ```
   > **Note for cloners**: The `projectId` is intentionally omitted from `app.json` so that anyone can build cleanly under their own Expo account. On the first run, EAS CLI will automatically prompt: *"Would you like to automatically create an EAS project?"* — select **yes**, and EAS will configure your own cloud build pipeline automatically.

---

## 📄 License

MIT License. Built for the **Devpost: Build with AI: Basics** Hackathon.
