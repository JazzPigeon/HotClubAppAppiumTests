# HotClub Appium iOS Tests

📊 **[Latest Allure Test Report](https://jazzpigeon.github.io/HotClubAppAppiumTests/)** — updated automatically on every PR run.

---

End-to-end UI tests for the HotClub iOS app, built with **Appium** (XCUITest
driver), **WebdriverIO**, **Cucumber**, and **TypeScript**.

Tests can run in two modes:
- **Locally** against an iOS Simulator on your Mac.
- **On a real device via GitHub Actions** using a self-hosted runner — an
  alternative to paid cloud device services like BrowserStack.

---

## Prerequisites

- macOS with **Xcode** + Command Line Tools
- **Node.js** and npm
- iOS Simulators (run `xcrun simctl list devices available` to see them)
- A connected iPhone for real-device runs

---

## Setup

```bash
npm install
npm run appium:install-driver   # installs the XCUITest driver (first time only)
```

Verify your environment is ready for iOS automation:

```bash
npm run appium:doctor
```

---

## Running the tests

### Simulator (local development)

Drop a Simulator build of the app into `apps/HotClubApp.app`, then:

```bash
npm test
```

WebdriverIO automatically starts/stops the Appium server, boots the Simulator,
installs the app, and runs the Gherkin feature files. TypeScript step
definitions are compiled on the fly — no build step needed.

Override the target device at runtime:

```bash
IOS_DEVICE="iPhone 17 Pro" IOS_VERSION=26.5 npm test
```

### Real device (local)

Drop a device-signed build into `apps/HotClubApp-device.app`, then:

```bash
XCODE_ORG_ID=<your-10-char-team-id> IOS_VERSION=26.5 npm run wdioIosGHTestRun
```

See [Real-device setup](#real-device-setup) below for signing prerequisites.

Type-check without running tests:

```bash
npm run typecheck
```

---

## Architecture

```
┌──────────────────────────────────────────────────┐
│  npm run <script>                                │
│  (package.json)                                  │
│                                                  │
│  test             → config/ios-wdio.conf.ts      │  Simulator
│  wdioIosGHTestRun → config/ios-gh-test-run-      │  Real device / CI
│                       wdio.conf.ts               │
└──────────────┬───────────────────────────────────┘
               │ wdio run <config>
               ▼
┌──────────────────────────────────────────────────┐
│  WebdriverIO (test runner)                       │
│  • Spawns the Appium server automatically        │
│  • Loads capabilities from the config            │
│  • Runs features in test/features/               │
│  • Binds steps from test/step-definitions/       │
└──────────────┬───────────────────────────────────┘
               │ WebDriver protocol (HTTP)
               ▼
┌──────────────────────────────────────────────────┐
│  Appium server (XCUITest driver)                 │
│  • Installs the app on the device/simulator      │
│  • Builds or reuses WebDriverAgent (WDA)         │
│  • Translates WebDriver commands to XCUITest     │
└──────────────┬───────────────────────────────────┘
               │ XCUITest / libimobiledevice
               ▼
       iOS Simulator  or  Physical iPhone
```

### The two config files

| Config | Used by | Target |
|---|---|---|
| `config/ios-wdio.conf.ts` | `npm test` | iOS Simulator |
| `config/ios-gh-test-run-wdio.conf.ts` | `npm run wdioIosGHTestRun` | Real device (local + CI) |

Both configs share the same structure. The real-device config differs in three
key ways:

1. **Device capabilities** — `appium:udid` (defaults to `auto` for a single
   connected device) and `appium:platformVersion` must match the physical phone.
2. **Code signing** — `appium:xcodeOrgId` (your Apple Team ID) and
   `appium:xcodeSigningId` tell xcodebuild how to sign WebDriverAgent for
   installation on a real device.
3. **Prebuilt WebDriverAgent** — `appium:usePrebuiltWDA: true` +
   `appium:derivedDataPath` points Appium at a WDA build you've already signed
   in Xcode, rather than having Appium rebuild it on every run. This is required
   when using a free/personal Apple Developer account (which can't generate
   provisioning profiles non-interactively).

All sensitive values (`XCODE_ORG_ID`, `IOS_UDID`, `WDA_BUNDLE_ID`) are read
from environment variables so nothing secret is committed to the repository.

---

## Test architecture

Feature files live in `test/features/**/*.feature` and describe behavior in
Gherkin syntax. Step definitions live in `test/step-definitions/**/*.ts` and
translate those steps into WebdriverIO/Appium actions. Page objects live in
`test/pageobjects/**/*.ts` and own selectors plus reusable screen interactions.

Scenarios tagged `@skip` are excluded by the shared Cucumber tag expression in
both WebdriverIO configs. The auth feature is currently skipped; if you enable
it, provide credentials through `HOTCLUB_TEST_EMAIL` and
`HOTCLUB_TEST_PASSWORD`.

---

## Configuration reference

### Simulator (`config/ios-wdio.conf.ts`)

| Variable | Default | Description |
|---|---|---|
| `IOS_APP` | `apps/HotClubApp.app` | Path to Simulator `.app` build |
| `IOS_DEVICE` | `iPhone 17 Pro` | Simulator device name |
| `IOS_VERSION` | `26.5` | iOS platform version (app requires 26.0+) |

### Real device (`config/ios-gh-test-run-wdio.conf.ts`)

| Variable | Default | Description |
|---|---|---|
| `IOS_APP` | `apps/HotClubApp-device.app` | Path to device-signed `.app` or `.ipa` |
| `IOS_DEVICE` | `iPhone` | Device name (cosmetic) |
| `IOS_VERSION` | *(required)* | Must match the iOS version on the phone |
| `IOS_UDID` | `auto` | Device UDID; `auto` picks the only connected device |
| `XCODE_ORG_ID` | *(required)* | 10-character Apple Team ID |
| `XCODE_SIGNING_ID` | `Apple Development` | Code-signing identity |
| `WDA_BUNDLE_ID` | `com.cindymichalowski.WebDriverAgentRunner-` | Bundle ID used when signing WDA in Xcode |
| `WDA_DERIVED_DATA_PATH` | *(hardcoded path)* | DerivedData folder of the Xcode WDA build |

---

## Real-device setup

Running on a physical iPhone requires a one-time manual step to sign
WebDriverAgent (the helper app Appium installs on the device to drive the UI).

### Why this is needed

Appium builds and signs WDA automatically on paid Apple Developer accounts.
With a **free/personal account**, it cannot generate provisioning profiles
non-interactively, so WDA must be signed once manually in Xcode. After that,
Appium reuses the signed build (`appium:usePrebuiltWDA: true`).

### Steps

1. Open the WDA project in Xcode:
   ```bash
   open node_modules/appium-xcuitest-driver/node_modules/appium-webdriveragent/WebDriverAgent.xcodeproj
   ```
2. For both the **WebDriverAgentLib** and **WebDriverAgentRunner** targets:
   - Enable **Automatically manage signing**
   - Set **Team** to your Apple account
3. For the **WebDriverAgentRunner** target, set a unique **Bundle Identifier**
   (e.g. `com.yourname.WebDriverAgentRunner`). The default
   `com.facebook.WebDriverAgentRunner` cannot be registered to a personal team.
4. In **Build Settings** (project level), set **Treat Warnings as Errors → No**
   (newer Xcode versions otherwise fail on private-header naming warnings in
   WDA's vendored headers).
5. Select your iPhone as the destination and run **Product → Test (⌘U)**. Xcode
   builds, signs, and installs WDA onto the device.
6. On the iPhone: **Settings → General → VPN & Device Management** → tap your
   developer profile → **Trust**.
7. Note the **Bundle Identifier** you used and the **DerivedData path** Xcode
   created — set these as `WDA_BUNDLE_ID` and `WDA_DERIVED_DATA_PATH` (or
   update the defaults in the config).

> ⚠️ WDA lives inside `node_modules`. Running `npm ci` will wipe the signing
> and require repeating steps 1–6. Free-account provisioning profiles also
> expire after 7 days.

---

## GitHub Actions CI (self-hosted runner)

Tests run automatically on every pull request via a **self-hosted macOS
runner** — the Mac that has the iPhone cabled to it. This is a cost-effective
alternative to cloud device farms like BrowserStack.

### How it works

```
GitHub PR opened / updated
        │
        ▼
.github/workflows/ios-tests.yml triggers
        │
        ▼
GitHub sends job to self-hosted runner (your Mac)
        │
        ▼
Runner: npm ci → appium driver install → npm run wdioIosGHTestRun
        │
        ▼
Appium launches WDA on the connected iPhone
        │
        ▼
Tests run → JUnit XML + Allure raw results written to disk
        │
        ▼
action-junit-report publishes results as a PR check with inline annotations
        │
        ▼
Allure HTML report generated and deployed to GitHub Pages
```

### Runner setup (one time per machine)

Install the GitHub Actions self-hosted runner **outside** the repository (e.g.
`~/actions-runner`) so it doesn't interfere with repo checkouts:

```bash
# Follow the instructions at:
# GitHub → repo → Settings → Actions → Runners → New self-hosted runner
cd ~/actions-runner
./svc.sh install   # install as a persistent launchd service
./svc.sh start     # start it
./svc.sh status    # verify it's running
```

Once running, the runner appears as **Idle** (green) in GitHub → Settings →
Actions → Runners.

### Repository Variables and Secrets

Configure these in **GitHub → Settings → Secrets and variables → Actions**.

**Variables** (non-sensitive):

| Name | Example value |
|---|---|
| `IOS_DEVICE` | `Cindy's iPhone` |
| `IOS_VERSION` | `26.5` |
| `IOS_APP` | `/Users/cindymichalowski/GitHub/HotClub-appium-ios-tests/apps/HotClubApp-device.app` |
| `WDA_DERIVED_DATA_PATH` | `/Users/cindymichalowski/Library/Developer/Xcode/DerivedData/WebDriverAgent-<hash>` |

**Secrets** (sensitive):

| Name | Description |
|---|---|
| `XCODE_ORG_ID` | Your 10-character Apple Team ID |
| `WDA_BUNDLE_ID` | The bundle ID you set on the WebDriverAgentRunner target in Xcode |
| `IOS_UDID` | *(optional)* Device UDID; omit to use `auto` |

### Test results

Each run produces three layers of reporting:

1. **JUnit PR check** — pass/fail annotations appear directly on the PR under
   "iOS E2E Results". Failed tests show the error message inline.
2. **Allure report** — a full visual report with test history, durations, step
   logs, and **inline screenshots for failures**, deployed to GitHub Pages after
   every run:
   👉 **https://jazzpigeon.github.io/HotClubAppAppiumTests/**
3. **Workflow artifacts** — raw Appium logs, JUnit XML, Allure results, and
   failure screenshots are uploaded and retained for 7 days.

#### One-time GitHub Pages setup

The Allure report requires GitHub Pages to be configured once:

1. Go to your repo → **Settings → Pages**
2. Under **Source**, select **GitHub Actions**
3. Save

#### gnu-tar prerequisite (self-hosted runner only)

`actions/upload-pages-artifact` requires GNU tar (`gtar`). Install it once on
the runner machine:

```bash
brew install gnu-tar
```

---

## Finding selectors

Use **[Appium Inspector](https://github.com/appium/appium-inspector)** to
explore your app's UI tree and identify element selectors. Prefer accessibility
IDs (`~myId`) when available; this project uses predicate strings and class
chains because the HotClub app does not define custom accessibility
identifiers.

---

## Project structure

```
HotClub-appium-ios-tests/
├── .github/
│   └── workflows/
│       └── ios-tests.yml           # CI: runs on PRs via self-hosted runner
├── apps/                           # .app / .ipa builds (git-ignored)
│   ├── HotClubApp.app              # Simulator build (for local npm test)
│   └── HotClubApp-device.app       # Device build (for real-device runs)
├── config/
│   ├── ios-wdio.conf.ts            # Simulator config (npm test)
│   └── ios-gh-test-run-wdio.conf.ts # Real-device config (CI + local device)
├── test/
│   ├── features/
│   │   ├── auth.feature            # Skipped auth scenarios
│   │   └── records.feature         # Gherkin scenarios for Records
│   ├── pageobjects/
│   │   ├── auth.page.ts            # Selectors for the auth screen
│   │   └── records.page.ts         # Selectors for the Records screen + tab bar
│   └── step-definitions/
│       ├── auth.steps.ts           # Cucumber bindings for auth scenarios
│       └── records.steps.ts        # Cucumber bindings for Records scenarios
├── tsconfig.json
├── package.json
└── README.md
```
