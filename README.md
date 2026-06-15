# appium-ios-tests

End-to-end UI tests for an iOS app, built with **Appium** (XCUITest driver) and
**WebdriverIO** (TypeScript).

## Prerequisites (already installed on this machine)

- macOS with **Xcode** + Command Line Tools
- **Node.js** and npm
- iOS **Simulators** (run `xcrun simctl list devices available` to see them)

## Setup

```bash
cd appium-ios-tests
npm install
npm run appium:install-driver   # installs the XCUITest driver (if not present)
```

Verify your environment is ready for iOS automation:

```bash
npm run appium:doctor
```

## Add your app

Drop your Simulator build into `apps/` (see `apps/README.md`). The config defaults
to `apps/MyApp.app`. To use a different path:

```bash
IOS_APP=/absolute/path/to/YourApp.app npm test
```

## Run the tests

```bash
npm test
```

WebdriverIO automatically starts and stops the Appium server for you, boots the
simulator, installs the app, and runs the specs in `test/specs/`. TypeScript is
compiled on the fly via `tsx` — no build step needed.

Type-check without running tests:

```bash
npm run typecheck
```

## Configuration

Defaults live in `config/wdio.conf.ts` and can be overridden with env vars:

| Variable      | Default       | Description                          |
| ------------- | ------------- | ------------------------------------ |
| `IOS_APP`     | `apps/HotClubApp.app` | Path to the `.app` / `.ipa` build |
| `IOS_DEVICE`  | `iPhone 17 Pro` | Simulator device name              |
| `IOS_VERSION` | `26.5`        | iOS platform version (app requires 26.0+) |

Example:

```bash
IOS_DEVICE="iPhone 16 Pro" IOS_VERSION=18.4 npm test
```

## Finding selectors

Use **[Appium Inspector](https://github.com/appium/appium-inspector)** to explore
your app's UI tree and copy reliable selectors (prefer accessibility ids).

## Project structure

```
appium-ios-tests/
├── apps/                       # your .app / .ipa builds (git-ignored)
├── config/
│   └── wdio.conf.ts            # WebdriverIO + Appium configuration
├── test/
│   ├── pageobjects/
│   │   └── records.page.ts     # selectors for the Records screen + tab bar
│   └── specs/
│       └── records.e2e.ts      # e2e tests for the HotClub app
├── tsconfig.json               # TypeScript configuration
├── package.json
└── README.md
```
