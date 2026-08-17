import { execFileSync } from 'node:child_process';
import '../../config/load-env.js';
import AuthScreen from '../pageobjects/auth.page.js';
import RecordsScreen from '../pageobjects/records.page.js';

const FALLBACK_BUNDLE_ID = 'tech.cindymichalowski.HotClubApp.HotClubApp';
const SPRINGBOARD_BUNDLE_ID = 'com.apple.springboard';

type AppGate = 'auth' | 'loggedIn';

let cachedBundleId: string | undefined;

/**
 * Force a logged-out cold launch. Used by @loggedOut / Login-screen Background.
 *
 * If the Login screen is already showing, the app is only terminated and
 * relaunched so the scenario still starts from process start. Otherwise the
 * app is uninstalled (and Simulator keychains are cleared) so a persisted
 * session cannot leak in.
 */
export async function ensureLoggedOut(): Promise<void> {
  const screen = await waitForAuthOrRecords(15000).catch(() => null);

  if (screen === 'auth') {
    await relaunchHotClubApp();
  } else {
    await resetAppAndLaunch();
  }

  await AuthScreen.waitForDisplayed();
}

/**
 * Force a logged-in cold launch. Used by @loggedIn / Records Background.
 *
 * Signs in when the Login screen is showing, then terminates and relaunches
 * so Records scenarios start from a real app launch with a persisted session.
 */
export async function ensureLoggedIn(): Promise<void> {
  let screen = await waitForAuthOrRecords(15000).catch(() => null);

  if (screen !== 'loggedIn') {
    if (screen !== 'auth') {
      await relaunchHotClubApp();
      screen = await waitForAuthOrRecords();
    }

    if (screen === 'auth') {
      await signInWithTestCredentials();
      await RecordsScreen.navBar.waitForDisplayed({ timeout: 20000 });
    }
  }

  await relaunchHotClubApp();
  screen = await waitForAuthOrRecords();

  if (screen === 'auth') {
    throw new Error(
      'App launched on the Login screen after sign-in; the session did not persist.'
    );
  }

  await RecordsScreen.recoverToRecordsScreen();
  await RecordsScreen.waitForDisplayed();
}

export async function enterValidEmailAddress(): Promise<void> {
  const { email } = getTestCredentials();
  await AuthScreen.enterUsername(email);
}

export async function enterValidPassword(): Promise<void> {
  const { password } = getTestCredentials();
  await AuthScreen.enterPassword(password);
}

export async function signInWithTestCredentials(): Promise<void> {
  const { email, password } = getTestCredentials();
  await AuthScreen.enterUsername(email);
  await AuthScreen.enterPassword(password);
  await AuthScreen.tapSignIn();
}

export function getTestCredentials(): { email: string; password: string } {
  const email = process.env.HOTCLUB_TEST_EMAIL?.trim();
  const password = process.env.HOTCLUB_TEST_PASSWORD?.trim();

  if (!email || !password) {
    throw new Error(
      'HOTCLUB_TEST_EMAIL and HOTCLUB_TEST_PASSWORD are not set in this process. ' +
        'GitHub Secrets are only available inside Actions jobs — they are not read by local npm test. ' +
        'For local runs, copy .env.example to .env and fill in both values.'
    );
  }

  return { email, password };
}

async function resetAppAndLaunch(): Promise<void> {
  const bundleId = await getBundleId();
  const appPath = getAppPath();

  try {
    await driver.execute('mobile: terminateApp', { bundleId });
  } catch {
    // App may already be stopped.
  }

  try {
    await driver.execute('mobile: clearKeychains');
  } catch {
    // Real devices do not support this; uninstall below clears the app keychain.
  }

  await driver.execute('mobile: removeApp', { bundleId });
  await driver.execute('mobile: installApp', { app: appPath });
  await driver.execute('mobile: launchApp', { bundleId });
}

async function relaunchHotClubApp(): Promise<void> {
  const bundleId = await getBundleId();
  await driver.execute('mobile: terminateApp', { bundleId });
  await driver.execute('mobile: launchApp', { bundleId });
}

async function waitForAuthOrRecords(timeout = 20000): Promise<AppGate> {
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    if (await AuthScreen.isDisplayedNow(800)) {
      return 'auth';
    }

    if (
      (await RecordsScreen.isOnRecordsScreen()) ||
      (await RecordsScreen.isDisplayedNow(RecordsScreen.tabBar, 800))
    ) {
      return 'loggedIn';
    }

    await driver.pause(250);
  }

  throw new Error(
    `Neither the Login screen nor a logged-in screen appeared within ${timeout}ms.`
  );
}

async function getBundleId(): Promise<string> {
  if (cachedBundleId) {
    return cachedBundleId;
  }

  try {
    const info = (await driver.execute('mobile: activeAppInfo')) as {
      bundleId?: string;
    };
    if (info.bundleId && info.bundleId !== SPRINGBOARD_BUNDLE_ID) {
      cachedBundleId = info.bundleId;
      return cachedBundleId;
    }
  } catch {
    // App is not in the foreground; fall through to the .app Info.plist.
  }

  try {
    cachedBundleId = execFileSync(
      'defaults',
      ['read', `${getAppPath()}/Info`, 'CFBundleIdentifier'],
      { encoding: 'utf8' }
    ).trim();
    if (cachedBundleId) {
      return cachedBundleId;
    }
  } catch {
    // .ipa builds (and missing local apps) cannot be read with defaults.
  }

  cachedBundleId = FALLBACK_BUNDLE_ID;
  return cachedBundleId;
}

function getAppPath(): string {
  const caps = driver.capabilities as Record<string, unknown>;
  const app = caps['appium:app'] ?? caps.app;

  if (typeof app !== 'string' || !app) {
    throw new Error('Could not determine the iOS app path from Appium capabilities.');
  }

  return app;
}
