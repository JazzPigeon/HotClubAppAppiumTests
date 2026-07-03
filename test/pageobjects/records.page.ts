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

  /** The tappable button inside the first record row. */
  get firstRecord() {
    return $(
      '-ios class chain:**/XCUIElementTypeButton[`name == "RecordListCell"`][1]'
    );
  }

  async waitForDisplayed(timeout = 15000): Promise<void> {
    await this.navBar.waitForDisplayed({ timeout });
  }
}

export default new RecordsScreen();
