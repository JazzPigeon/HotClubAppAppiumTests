import path from 'node:path';
import fs from 'node:fs';
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

// Device-signed app build (a `Debug-iphoneos` .app or a .ipa) — NOT the
// Simulator build used by ios-wdio.conf.ts. Override with IOS_APP.
const APP_PATH =
  process.env.IOS_APP || path.join(ROOT, 'apps', 'HotClubApp-device.app');

// On a free/personal team, Appium can't generate a WebDriverAgent provisioning
// profile itself (it doesn't pass -allowProvisioningUpdates). So WDA is built &
// signed once in Xcode, and Appium is pointed at that prebuilt output instead
// of rebuilding it. Override these to match your own Xcode WDA build.
const WDA_BUNDLE_ID =
  process.env.WDA_BUNDLE_ID || 'com.cindymichalowski.WebDriverAgentRunner-';
const WDA_DERIVED_DATA_PATH =
  process.env.WDA_DERIVED_DATA_PATH ||
  path.join(
    process.env.HOME || '',
    'Library/Developer/Xcode/DerivedData/WebDriverAgent-ejeswgciqlszoieyzjfjvuihnsbp'
  );

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

      // ---- Prebuilt WebDriverAgent (free/personal team) -----------------
      // Reuse the WDA that was built & signed in Xcode instead of letting
      // Appium rebuild it (which can't provision on a free team).
      'appium:updatedWDABundleId': WDA_BUNDLE_ID,
      'appium:derivedDataPath': WDA_DERIVED_DATA_PATH,
      'appium:useNewWDA': false,
      'appium:usePrebuiltWDA': true,

      'appium:noReset': true,
      'appium:newCommandTimeout': 240,
      // Surface the raw xcodebuild output in the Appium log so WebDriverAgent
      // build/signing failures (e.g. code 65) show the underlying error.
      'appium:showXcodeLog': true,
      // WDA install/launch on a device can still take a while; keep generous.
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

  // ---- Hooks ------------------------------------------------------------
  afterTest: async function (test, _context, { error }) {
    if (error) {
      const screenshotDir = path.join(ROOT, 'results', 'screenshots');
      fs.mkdirSync(screenshotDir, { recursive: true });
      const name = test.title.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
      await browser.saveScreenshot(
        path.join(screenshotDir, `${name}_${Date.now()}.png`)
      );
    }
  },

  framework: 'mocha',
  reporters: [
    'spec',
    // JUnit XML for CI: GitHub Actions publishes these as a PR check.
    [
      'junit',
      {
        outputDir: path.join(ROOT, 'results'),
        outputFileFormat(options: { cid: string }) {
          return `results-${options.cid}.xml`;
        },
      },
    ],
    // Allure: raw results written here; the workflow generates the HTML report
    // and publishes it to GitHub Pages after the tests finish.
    [
      'allure',
      {
        outputDir: path.join(ROOT, 'allure-results'),
        disableWebdriverStepsReporting: false,
        disableWebdriverScreenshotsReporting: false,
      },
    ],
  ],
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
  },
};
