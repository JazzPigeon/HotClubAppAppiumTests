import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Project root, one level up from this config/ folder. All project-relative
// paths are anchored here so the config can live anywhere.
const ROOT = path.join(__dirname, '..');

// Path to your iOS build. A .app (Simulator build) or .ipa goes in ./apps.
// Override at runtime with:  IOS_APP=/abs/path/to/MyApp.app npm test
const APP_PATH =
  process.env.IOS_APP || path.join(ROOT, 'apps', 'HotClubApp.app');

export const config: WebdriverIO.Config = {
  runner: 'local',
  tsConfigPath: path.join(ROOT, 'tsconfig.json'),

  // ---- Test files -------------------------------------------------------
  specs: [path.join(ROOT, 'test', 'specs', '**', '*.e2e.ts')],
  maxInstances: 1,

  // ---- Capabilities -----------------------------------------------------
  capabilities: [
    {
      platformName: 'iOS',
      'appium:automationName': 'XCUITest',
      'appium:deviceName': process.env.IOS_DEVICE || 'iPhone 17 Pro',
      'appium:platformVersion': process.env.IOS_VERSION || '26.5',
      'appium:app': APP_PATH,
      // Speeds up repeat runs by reusing the booted simulator.
      'appium:noReset': false,
      'appium:newCommandTimeout': 240,
      // First run compiles WebDriverAgent via xcodebuild, which can take
      // several minutes. These are generous so the initial build can finish.
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
        // Uses the locally installed appium in node_modules/.bin
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
      const name = test.title.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
      await browser.saveScreenshot(
        path.join(ROOT, 'results', 'screenshots', `${name}_${Date.now()}.png`)
      );
    }
  },

  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
  },
};
