# CourtAide

> AI legal assistant for pro se court filings — case analysis, document drafts, deadlines, and legal strategy, all before you type a word.

[**PWA →**](https://cadger808.codeberg.page/courtaide) · [**Download APK / Desktop →**](https://codeberg.org/cadger808/courtaide/releases) · [Codeberg](https://codeberg.org/cadger808/courtaide)

---

## Easiest way to get it — Zephyr

**[Zephyr](https://cadger808.codeberg.page/zephyr)** is the open PWA network that distributes every app in this suite. Open Zephyr, tap CourtAide, install. Done.

- No account. No sign-up. No data saved anywhere.
- Zephyr doesn't store your case details, documents, or API key — everything stays on your device.
- The app ships fresh every time via PWA — nothing cached on the distribution side.

---

## Can anyone use this?

**Yes — install in 10 seconds, no account needed.**

1. Open [Zephyr](https://cadger808.codeberg.page/zephyr) → find CourtAide → tap Install
2. Or open [cadger808.codeberg.page/courtaide](https://cadger808.codeberg.page/courtaide) directly on any device
3. Tap "Add to Home Screen" (or download APK for Android / AppImage for Linux)
4. Open the app → tap ⚙️ Settings → paste your [Anthropic API key](https://console.anthropic.com)

The key is stored only on your device. Nothing leaves without you asking it to.

---

## What it does

| Feature | Description |
|---------|-------------|
| ⚖️ **Auto intake** | On case start, Claude runs 5 tools — strength, strategy, forms, deadlines, laws |
| 📄 **Document drafts** | Full court document generation from your case details |
| 📅 **Deadline tracker** | Jurisdiction-aware court deadline calculation |
| 🔍 **Legal research** | Relevant case law and statutes surfaced automatically |
| 🤖 **AI avatar** | Floating legal assistant on every screen |
| 📤 **Share / install** | One-tap PWA install + Download APK button in the share widget |
| 🖥️ **Desktop app** | Electron build (AppImage + RPM) for Linux |

**10 legal tools:** `assess_case_strength` · `develop_legal_strategy` · `identify_required_forms` · `calculate_deadlines` · `research_relevant_laws` · `draft_legal_document` · `find_legal_aid` · `explain_legal_term` · `generate_court_timeline` · `summarize_case`

---

## Install options

| Method | Steps |
|--------|-------|
| **Zephyr** | [cadger808.codeberg.page/zephyr](https://cadger808.codeberg.page/zephyr) → CourtAide → Install — zero data saved |
| **PWA** | Open link → "Add to Home Screen" — works on Android, iOS, desktop |
| **Android APK** | [Download](https://codeberg.org/cadger808/courtaide/releases) → open file on device |
| **ADB install** | `adb install -r app-debug.apk` |
| **Linux desktop** | Download `.AppImage` or `.rpm` from [Releases](https://codeberg.org/cadger808/courtaide/releases) |

---

## Dev quick start

```bash
git clone https://codeberg.org/cadger808/courtaide.git
cd courtaide && npm install

npx serve .                                            # browser dev
npx cap sync android && cd android && ./gradlew assembleDebug  # APK
npm run electron:dist                                  # Electron
```

---

## Tech stack

| Layer | Tech |
|-------|------|
| UI | Vanilla HTML/CSS/JS |
| AI | Claude Sonnet 4.6 with 10 legal tools |
| Mobile | Capacitor → Android APK |
| Desktop | Electron (AppImage / RPM) |
| Distribution | Zephyr PWA network |
| CI | Forgejo Actions (APK + Pages + Electron) |

---

**Developer:** [codeberg.org/cadger808](https://codeberg.org/cadger808)
