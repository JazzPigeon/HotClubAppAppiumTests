import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Project root, one level up from this config/ folder.
const ROOT = path.join(__dirname, '..');

/**
 * WebdriverIO config for running the suite on a REAL iOS device from GitHub
 * Actions (self-hosted macOS runner with the device cabled in).
 *
 * Unlike the simulator config, a physical device requires:
 *   - a device-signed build (.ipa or device .app), not a Simulator build
 *   - the device UDID (or "auto" to pick the single connected device)
 *   - code-signing details (Apple Team id) so WebDriverAgent can be installed
 *
 * All device/signing values come from environment variables so nothing
 * sensitive is committed. In CI these are wired from GitHub repo secrets in
 * .github/workflows/ios-tests.yml.
 */

// Device-signed app build. Point IOS_APP at a .ipa or device .app.
const APP_PATH =
  process.env.IOS_APP || path.join(ROOT, 'apps', 'HotClubApp.ipa');

export const config: WebdriverIO.Config = {
  runner: 'local',
  tsConfigPath: path.join(ROOT, 'tsconfig.json'),

  // ---- Test files -------------------------------------------------------
  specs: [path.join(ROOT, 'test', 'specs', '**', '*.e2e.ts')],
  maxInstances: 1,

  // ---- Capabilities (real device) --------------------------------------
  capabilities: [
    {
      platformName: 'iOS',
      'appium:automationName': 'XCUITest',
      // "auto" lets XCUITest pick the only connected real device. Set
      // IOS_UDID to target a specific one (e.g. when several are attached).
      'appium:udid': process.env.IOS_UDID || 'auto',
      'appium:deviceName': process.env.IOS_DEVICE || 'iPhone',
      // Must match the iOS version installed on the physical device.
      'appium:platformVersion': process.env.IOS_VERSION,
      'appium:app': APP_PATH,

      // ---- Code signing (required to build/install WDA on a device) -----
      // Apple Developer Team id, e.g. "ABCDE12345".
      'appium:xcodeOrgId': process.env.XCODE_ORG_ID,
      'appium:xcodeSigningId': process.env.XCODE_SIGNING_ID || 'Apple Development',
      // Helps with free/personal provisioning profiles; optional otherwise.
      ...(process.env.WDA_BUNDLE_ID
        ? { 'appium:updatedWDABundleId': process.env.WDA_BUNDLE_ID }
        : {}),

      'appium:noReset': false,
      'appium:newCommandTimeout': 240,
      // First run compiles + signs WebDriverAgent via xcodebuild, which can
      // take several minutes on a device. These are intentionally generous.
      'appium:wdaLaunchTimeout': 300000,
      'appium:wdaConnectionTimeout': 300000,
    },
  ],

  // ---- Appium server (auto-started by @wdio/appium-service) -------------
  services: [
    [
      'appium',
      {
        args: {
          address: '127.0.0.1',
          port: 4723,
          relaxedSecurity: true,
        },
        logPath: path.join(ROOT, 'logs'),
      },
    ],
  ],
  port: 4723,

  // ---- Test runner ------------------------------------------------------
  logLevel: 'info',
  bail: 0,
  waitforTimeout: 10000,
  // Must exceed wdaLaunchTimeout so the client doesn't give up while the
  // first-run WebDriverAgent build is still in progress.
  connectionRetryTimeout: 360000,
  connectionRetryCount: 1,

  framework: 'mocha',
  reporters: [
    'spec',
    // JUnit XML for CI: GitHub Actions publishes these as a PR test report.
    [
      'junit',
      {
        outputDir: path.join(ROOT, 'results'),
        outputFileFormat(options: { cid: string }) {
          return `results-${options.cid}.xml`;
        },
      },
    ],
  ],
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
  },
};
