# CLAUDE.md — CourtAide

AI legal assistant / pro se court help app.
Stack: HTML + Capacitor + Electron | Deploy: APK + PWA + Electron AppImage/RPM

## Repo Identity
- Codeberg: https://codeberg.org/cadger808/courtaide
- PWA: https://cadger808.codeberg.page/courtaide
- Releases: https://codeberg.org/cadger808/courtaide/releases

## Key Files
- `index.html` — single-page app entry point
- `api-client.js` — Claude API calls (load FIRST before other widgets)
- `avatar-widget.js` / `share-widget.js` — floating UI widgets
- `electron/main.js` — Electron desktop entry
- `capacitor.config.json` — Capacitor/Android config
- `.github/workflows/build-apk.yml` — APK CI
- `.github/workflows/deploy-pages.yml` — PWA CI
- `.gitea/workflows/build-electron.yml` — Electron CI

## Commands
```bash
npm install
npx cap sync android
cd android && ./gradlew assembleDebug
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
npm run electron:dist
```

## Assumption-Driven Coding

When generating or editing code:
1. Add a comment for each non-trivial assumption using `// #ASSUMPTION: ...` (or language equivalent).
2. Ask: "What test or edge case would break this assumption?"
3. Add minimal defensive checks or `// TODO: validate ...` comments where needed.
4. Before finishing, do a mental review pass on all `#ASSUMPTION` lines.
