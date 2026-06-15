import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Path to your iOS build. A .app (Simulator build) or .ipa goes in ./apps.
// Override at runtime with:  IOS_APP=/abs/path/to/MyApp.app npm test
const APP_PATH =
  process.env.IOS_APP || path.join(__dirname, 'apps', 'HotClubApp.app');

export const config: WebdriverIO.Config = {
  runner: 'local',
  tsConfigPath: './tsconfig.json',

  // ---- Test files -------------------------------------------------------
  specs: ['./test/specs/**/*.e2e.ts'],
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
        logPath: './logs',
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
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
  },
};
