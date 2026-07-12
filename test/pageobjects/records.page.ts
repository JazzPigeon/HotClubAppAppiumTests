import { $, $$ } from '@wdio/globals';

/**
 * Page object for the Records screen (the app's launch screen) and the
 * persistent bottom tab bar.
 *
 * The app does not assign custom accessibility identifiers, so selectors are
 * scoped by element type (via predicate / class-chain) to stay unambiguous —
 * e.g. "Records" is both a tab and the nav-bar title.
 */
class RecordsScreen {
  /** The "Records" navigation bar shown at the top of the list. */
  get navBar() {
    return $(
      '-ios predicate string:type == "XCUIElementTypeNavigationBar" AND name == "Records"'
    );
  }

  /** Back button in the navigation bar (present on pushed detail screens). */
  get navBackButton() {
    return $('~BackButton');
  }

  get tabBar() {
    return $('-ios predicate string:type == "XCUIElementTypeTabBar"');
  }

  // Tab buttons expose their human-readable text via `label`; the `name`
  // attribute holds the SF Symbol id (e.g. "gearshape"), so match on `label`.
  get recordsTab() {
    return $(
      '-ios predicate string:type == "XCUIElementTypeButton" AND label == "Records"'
    );
  }

  get addTab() {
    return $(
      '-ios predicate string:type == "XCUIElementTypeButton" AND label == "Add"'
    );
  }

  get settingsTab() {
    return $(
      '-ios predicate string:type == "XCUIElementTypeButton" AND label == "Settings"'
    );
  }

  /** All record rows in the list. */
  get recordCells() {
    return $$('-ios class chain:**/XCUIElementTypeCollectionView/XCUIElementTypeCell');
  }

  /**
   * SwiftUI list wrapper — useful for locating cells, but not for scrolling.
   * On real devices XCUITest may expose this as "CollectionView (Identity Binding)":
   * the container exists in the tree (SwiftUI tracks row identity here) yet fails
   * isDisplayed(), so scroll via swipeUpOnScreen() and target leaf elements instead.
   */
  get recordListContainer() {
    return $('-ios predicate string:type == "XCUIElementTypeCollectionView"');
  }

  get endOfListText() {
    return $('~EndOfList');
  }

  /** The tappable button inside the first record row. */
  get firstRecord() {
    return $(
      '-ios class chain:**/XCUIElementTypeButton[`name == "RecordListCell"`][1]'
    );
  }

  /** The tappable button inside the seventh record row. */
  get seventhRecord() {
    return $(
      '-ios class chain:**/XCUIElementTypeButton[`name == "RecordListCell"`][7]'
    );
  }

  /** The tappable button inside the fifteenth record row. */
  get fifteenthRecord() {
    return $(
      '-ios predicate string:type == "XCUIElementTypeButton" AND name == "RecordListCell" AND label CONTAINS "Wench"'
    );
  }

  async waitForDisplayed(timeout = 15000): Promise<void> {
    await this.navBar.waitForDisplayed({ timeout });
  }

  async scrollToEndOfList(): Promise<void> {
    await this.swipeUntilDisplayed(this.endOfListText, 15, 'End of List');
  }

  async openSeventhRecord(): Promise<void> {
    await this.swipeUntilDisplayed(this.seventhRecord, 15, 'seventh record');
    await this.seventhRecord.tap();
    await this.navBackButton.waitForDisplayed({ timeout: 10000 });
  }

  async openFifteenthRecord(): Promise<void> {
    await this.swipeUntilDisplayed(this.fifteenthRecord, 15, 'fifteenth record');
    await this.fifteenthRecord.tap();
    await this.navBackButton.waitForDisplayed({ timeout: 10000 });
  }

  async swipeUntilDisplayed(
    targetElement: ReturnType<typeof $>,
    maxSwipes = 15,
    label = 'element'
  ): Promise<void> {
    for (let i = 0; i < maxSwipes; i++) {
      if (await this.isElementVisible(targetElement)) {
        return;
      }

      await this.swipeUpOnScreen();
      await driver.pause(500);
    }

    throw new Error(`${label} was not visible after ${maxSwipes} swipes.`);
  }

  /** True when the element exists and is visible within the viewport. */
  async isElementVisible(element: ReturnType<typeof $>): Promise<boolean> {
    if (!(await element.isExisting())) {
      return false;
    }

    if (!(await element.isDisplayed().catch(() => false))) {
      return false;
    }

    const location = await element.getLocation();
    const size = await element.getSize();
    const { height: windowHeight } = await driver.getWindowRect();

    return location.y >= 0 && location.y + size.height <= windowHeight;
  }

  /**
   * Window-level swipe using WDA's native XCTest gesture.
   * Avoids targeting the CollectionView directly — on real devices SwiftUI
   * collection views often exist in the tree but fail isDisplayed(), which
   * previously blocked scrolling entirely.
   */
  async swipeUpOnScreen(): Promise<void> {
    try {
      await driver.execute('mobile: swipe', { direction: 'up', velocity: 500 });
    } catch {
      const { width, height } = await driver.getWindowRect();
      const x = Math.round(width / 2);
      const fromY = Math.round(height * 0.75);
      const toY = Math.round(height * 0.25);

      await driver.execute('mobile: dragFromToForDuration', {
        duration: 1.0,
        fromX: x,
        fromY,
        toX: x,
        toY,
      });
    }
  }
}

export default new RecordsScreen();
