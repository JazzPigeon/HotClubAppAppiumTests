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
      if (await targetElement.isDisplayed().catch(() => false)) {
        await targetElement.waitForDisplayed({ timeout: 2000 });
        return;
      }

      await this.swipeUpOnList();
      await driver.pause(500);
    }

    throw new Error(`${label} was not visible after ${maxSwipes} swipes.`);
  }

  /** Window-level swipe — more reliable on real devices than element-relative coords. */
  async swipeUpOnScreen(): Promise<void> {
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

  async swipeUpOnList(): Promise<void> {
    const list = this.recordListContainer;
    await list.waitForDisplayed({ timeout: 10000 });

    try {
      await driver.execute('mobile: scroll', {
        elementId: list.elementId,
        direction: 'down',
      });
    } catch {
      await this.swipeUpOnScreen();
    }
  }
}

export default new RecordsScreen();
