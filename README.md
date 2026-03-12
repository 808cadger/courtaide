https://www.youtube.com/shorts/7VNHmQlBuHY

# CourtAide ⚖️

[![GitHub last commit](https://img.shields.io/github/last-commit/808cadger/courtaide)](https://github.com/808cadger/courtaide/commits/main)
[![GitHub repo size](https://img.shields.io/github/repo-size/808cadger/courtaide)](https://github.com/808cadger/courtaide)
[![Capacitor](https://img.shields.io/badge/Capacitor-119EFF?logo=capacitor&logoColor=white)](https://capacitorjs.com/)
[![Claude AI](https://img.shields.io/badge/Claude_AI-Anthropic-D97706?logo=anthropic&logoColor=white)](https://anthropic.com/)
[![Android](https://img.shields.io/badge/Android-SDK_34-3DDC84?logo=android&logoColor=white)](https://developer.android.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> **Your AI-powered legal assistant for court procedures, documents, and pro se representation.**

CourtAide is a fully agentic mobile app that puts a team of AI legal tools in your pocket. It automatically analyzes your case the moment you start it, identifies required court forms, calculates deadlines, assesses your case strength, and generates full document drafts — all before you type a single word.

---

## About the Developer

Prompt Engineer with hands-on experience shipping production AI apps using Anthropic Claude API, including LLM agents for fraud detection, facial recognition (YOLOv8, 95% acc), and RAG workflows.
Skilled in prompt engineering best practices: chain-of-thought, XML structuring, self-correction, and tool-calling for reliable outputs.

IBM AI Engineering Cert (Coursera) | Python, PyTorch, Android Studio | GitHub: [github.com/808cadger](https://github.com/808cadger) (3 live Claude-powered prototypes).
Hawaii-based (Pearl City), available for remote/full-time/contract (20–40 hrs/wk). Eager to optimize prompts for evals, safety, or product features at innovative teams.

Let's connect — happy to demo Claude agents or refine your prompts.

---

## Features

### Agentic AI Core
- **Auto-intake pipeline** — the moment you start a case, Claude runs 5 tools in sequence before you type anything: case strength assessment, legal strategy, required forms, deadlines, and relevant laws
- **10 legal tools** chained automatically — Claude proactively uses 3–5 tools per response without being asked
- **Animated agent task bar** — a real-time progress bar (○ → ⟳ → ✓) shows every tool firing in sequence
- **⚡ Run Full Analysis** — one-tap button re-triggers the full intake pipeline at any point mid-conversation

### Legal Tools (10 Total)

| Tool | What It Does |
|------|-------------|
| `assess_case_strength` | Scores your legal position 0–100 with strengths & weaknesses |
| `recommend_legal_strategy` | Concrete next steps, timeline, and cost estimates |
| `identify_required_forms` | Lists exact court forms needed, adds them to Documents tab |
| `calculate_legal_deadlines` | Statutes of limitation and filing deadlines with urgency flags |
| `cite_relevant_laws` | State-specific statutes and key provisions |
| `generate_legal_document` | Full draft documents (demand letters, motions, answers) |
| `build_case_timeline` | Chronological event timeline with significance flags |
| `find_legal_resources` | Legal aid, self-help centers, bar referrals for your state |
| `analyze_legal_situation` | Key facts, parties, and urgency assessment |
| `draft_document_section` | Step-by-step form filling with sample language |

### Case Management
- **10 legal issue types**: Family Law, Criminal Defense, Civil Dispute, Landlord/Tenant, Employment, Small Claims, Traffic, Immigration, Bankruptcy, Estate/Probate
- **All 50 US states** supported
- **Case strength meter** on the home screen active case card — color-coded fill bar (green/amber/red)
- **Documents tab** with three sections: Deadlines (🔴/🟡/🟢 urgency), Court Forms, Generated Documents
- **View Draft modal** — read full AI-generated documents in-app
- Persistent case history with localStorage — no backend required

### Security & UX
- Biometric Face ID / Fingerprint authentication with animated face-scan UI
- Dark navy/gold design system optimized for mobile
- Safe area support for notched devices
- Smooth screen transitions and micro-animations throughout
- **Demo mode** — full agentic simulation with realistic tool cards and timing, no API key required

---

## How It Works

```
User selects state + issue type → taps "Start with AI Advisor"
        ↓
CourtAide auto-runs 5-tool intake pipeline:
  ⚖️ Case Strength Assessment  → score shown on home card
  🎯 Legal Strategy            → next steps + timeline
  📄 Required Forms            → saved to Documents tab
  ⏰ Legal Deadlines           → urgency-coded in Documents tab
  📚 Relevant Laws             → state-specific statutes
        ↓
Claude greets user with a full case summary
        ↓
User describes their situation → Claude chains 3–5 more tools
        ↓
User requests a document → generate_legal_document → View Draft in Documents tab
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| AI | Claude Sonnet 4.6 (Anthropic) — agentic tool-use loop |
| Mobile | Capacitor 5 (Android) |
| Frontend | Vanilla JS / HTML / CSS — single-file SPA |
| Storage | localStorage (no backend, no server) |
| Build | Gradle + Android SDK 34 |

---

## Prerequisites

- [Node.js](https://nodejs.org/) v16+
- [Android Studio](https://developer.android.com/studio) with Android SDK 34
- Java Development Kit (JDK) 17
- An [Anthropic API key](https://console.anthropic.com/) *(optional — demo mode works without one)*

---

## Quick Start

```bash
# Clone the repo
git clone https://github.com/808cadger/courtaide.git
cd courtaide

# Install dependencies
npm install

# Sync web assets to Android
npx cap sync android

# Build the debug APK
cd android
./gradlew assembleDebug

# Install on a connected device
adb install app/build/outputs/apk/debug/app-debug.apk
```

---

## Project Structure

```
courtaide/
├── www/
│   └── index.html              # Entire app — HTML + CSS + JS (single file, ~2300 lines)
├── android/
│   ├── app/
│   │   ├── build.gradle        # applicationId, SDK versions
│   │   └── src/main/
│   │       ├── java/com/courtaide/app/MainActivity.java
│   │       └── res/values/strings.xml
│   └── variables.gradle        # compileSdkVersion = 34, targetSdkVersion = 34
├── capacitor.config.json       # appId: com.courtaide.app
└── package.json
```

---

## Configuration

### API Key
Enter your Anthropic API key in **Profile → AI Configuration**. The key is stored in `localStorage` on-device only — never sent anywhere except directly to the Anthropic API.

### Capacitor Config
```json
{
  "appId": "com.courtaide.app",
  "appName": "CourtAide",
  "webDir": "www",
  "server": { "androidScheme": "https" }
}
```

---

## Building for Release

```bash
cd android
./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

> Keep your keystore file and credentials out of version control.

---

## Demo Mode

No API key? No problem. CourtAide's demo mode fully simulates the agentic pipeline:

- The animated agent task bar fires through all 5 intake tools with realistic delays
- Tool cards populate with state-specific sample data (forms, deadlines, statutes, strength scores)
- Case strength score updates the home card with a color-coded bar
- All 10 issue types and all 50 states work in demo mode

---

## Legal Disclaimer

CourtAide provides **legal information**, not legal advice. It is not a substitute for a licensed attorney. AI-generated content may contain errors — always verify information before filing any court documents. Laws vary by jurisdiction and change frequently.

---

## License

MIT

