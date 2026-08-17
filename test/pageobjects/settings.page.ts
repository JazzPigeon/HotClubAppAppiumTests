import { $ } from '@wdio/globals';
import RecordsScreen from './records.page.js';

/**
 * Page object for the Settings tab (appearance + Sign out).
 *
 * The Sign out control is a SwiftUI Form button titled "Sign out" with no
 * confirmation alert — tapping it calls the app's auth sign-out immediately.
 */
class SettingsScreen {
  get navBar() {
    return $(
      '-ios predicate string:type == "XCUIElementTypeNavigationBar" AND name == "Settings"'
    );
  }

  get signOutButton() {
    return $(
      '-ios predicate string:type == "XCUIElementTypeButton" AND (name == "Sign out" OR label == "Sign out")'
    );
  }

  async waitForDisplayed(timeout = 10000): Promise<void> {
    await this.navBar.waitForDisplayed({ timeout });
  }

  async isDisplayedNow(timeout = 500): Promise<boolean> {
    return this.navBar
      .waitForDisplayed({ timeout })
      .then(() => true)
      .catch(() => false);
  }

  async openFromTabBar(): Promise<void> {
    const tab = RecordsScreen.settingsTab;
    await tab.waitForDisplayed({
      timeout: 10000,
      timeoutMsg: 'Settings tab was not visible; cannot sign out.',
    });

    try {
      await RecordsScreen.tapHittablePoint(tab);
    } catch {
      await RecordsScreen.tapElementCenter(tab);
    }

    await this.waitForDisplayed();
  }

  async tapSignOut(): Promise<void> {
    await this.scrollToSignOut();
    const button = this.signOutButton;
    await button.waitForDisplayed({
      timeout: 10000,
      timeoutMsg: 'Sign out button was not visible on the Settings screen.',
    });

    try {
      await RecordsScreen.tapHittablePoint(button);
    } catch {
      await RecordsScreen.tapElementCenter(button);
    }
  }

  async scrollToSignOut(maxSwipes = 8): Promise<void> {
    for (let i = 0; i < maxSwipes; i++) {
      if (await RecordsScreen.isDisplayedNow(this.signOutButton, 800)) {
        return;
      }
      await RecordsScreen.swipeUpOnScreen();
      await driver.pause(400);
    }
  }
}

export default new SettingsScreen();
