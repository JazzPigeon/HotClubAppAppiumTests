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

  async scrollToEndOfList() {
    const maxSwipes = 10;

    for (let i = 0; i < maxSwipes; i++) {
      if (await this.endOfListText.isDisplayed().catch(() => false)) {
        await this.endOfListText.waitForDisplayed({ timeout: 2000 });
        return;
      }
      
      await this.swipeUpOnList();
      await driver.pause(500);
    }
  }

  // Helper methods
  async swipeUpOnList() {
    const list = await this.recordListContainer;
    await list.waitForDisplayed({ timeout: 10000 });

    const location = await list.getLocation();
    const size = await list.getSize();

    const x = Math.round(location.x + size.width / 2);
    const fromY = Math.round(location.y + size.height * 0.8);
    const toY = Math.round(location.y + size.height * 0.2);

    await driver.execute('mobile: dragFromToForDuration', {
      duration: 0.5,
      fromX: x,
      fromY,
      toX: x,
      toY,
    });
  }
}

export default new RecordsScreen();
