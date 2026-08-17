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

  get endOfListText() {
    return $('~EndOfList');
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

  /** The tappable button inside the first record row. */
  get firstRecord() {
    return $(
      '-ios class chain:**/XCUIElementTypeButton[`name == "RecordListCell"`][1]'
    );
  }

  recordWithTitle(titleText: string) {
    return $(
      `-ios predicate string:type == "XCUIElementTypeButton" AND name == "RecordListCell" AND label CONTAINS "${titleText}"`
    );
  }

  async tapRecordContainingTitleText(titleText: string): Promise<void> {
    const record = this.recordWithTitle(titleText);
    await this.swipeUntilTappable(record, 15, `Record containing "${titleText}"`);
    await this.waitForStableLocation(record);

    const label = await record.getAttribute('label');
    if (!label?.includes(titleText)) {
      throw new Error(
        `Refusing to tap: expected label containing "${titleText}", got "${label}"`
      );
    }

    await record.tap();
  }

  async waitForDisplayed(timeout = 15000): Promise<void> {
    await this.navBar.waitForDisplayed({ timeout });
    await this.recordsTab.waitForDisplayed({ timeout });
    await this.addTab.waitForDisplayed({ timeout });
    await this.settingsTab.waitForDisplayed({ timeout });
    await driver.waitUntil(
      async () => (await this.recordCells.length) >= 5,
      { timeout, timeoutMsg: 'Expected at least five record cells' }
    );
  }

  async scrollToEndOfList(): Promise<void> {
    await this.swipeUntilDisplayed(this.endOfListText, 15, 'End of List');
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

  async swipeUntilTappable(
    targetElement: ReturnType<typeof $>,
    maxSwipes = 15,
    label = 'element'
  ): Promise<void> {
    for (let i = 0; i < maxSwipes; i++) {
      if (await this.isElementTappable(targetElement)) {
        return;
      }

      await this.swipeUpOnScreen();
      await driver.pause(500);
    }

    throw new Error(`${label} was not tappable after ${maxSwipes} swipes.`);
  }

  /** Scrollable list area between the nav bar and tab bar. */
  async getListViewportBounds(): Promise<{ top: number; bottom: number }> {
    const { height: windowHeight } = await driver.getWindowRect();
    let top = 0;
    let bottom = windowHeight;

    if (await this.navBar.isExisting()) {
      const navLocation = await this.navBar.getLocation();
      const navSize = await this.navBar.getSize();
      top = navLocation.y + navSize.height;
    }

    if (await this.tabBar.isExisting()) {
      const tabLocation = await this.tabBar.getLocation();
      bottom = tabLocation.y;
    }

    return { top, bottom };
  }

  /** True when a meaningful slice of the element overlaps the list viewport. */
  async isElementVisible(
    element: {
      isExisting(): Promise<boolean>;
      isDisplayed(): Promise<boolean>;
      getLocation(): Promise<{ x: number; y: number }>;
      getSize(): Promise<{ width: number; height: number }>;
    },
    minVisibleRatio = 0.25
  ): Promise<boolean> {
    if (!(await element.isExisting())) {
      return false;
    }

    if (!(await element.isDisplayed().catch(() => false))) {
      return false;
    }

    const location = await element.getLocation();
    const size = await element.getSize();
    const { top, bottom } = await this.getListViewportBounds();

    const elementTop = location.y;
    const elementBottom = location.y + size.height;
    const overlapTop = Math.max(elementTop, top);
    const overlapBottom = Math.min(elementBottom, bottom);
    const visibleHeight = Math.max(0, overlapBottom - overlapTop);

    if (visibleHeight === 0) {
      return false;
    }

    return visibleHeight / size.height >= minVisibleRatio;
  }

  /** True when the element is visible and its center sits in the list viewport. */
  async isElementTappable(
    element: {
      isExisting(): Promise<boolean>;
      isDisplayed(): Promise<boolean>;
      getLocation(): Promise<{ x: number; y: number }>;
      getSize(): Promise<{ width: number; height: number }>;
    }
  ): Promise<boolean> {
    if (!(await this.isElementVisible(element))) {
      return false;
    }

    const location = await element.getLocation();
    const size = await element.getSize();
    const centerY = location.y + size.height / 2;
    const { top, bottom } = await this.getListViewportBounds();

    return centerY >= top && centerY <= bottom;
  }

  /** Wait until an element's vertical position stops changing after a scroll. */
  async waitForStableLocation(
    element: {
      getLocation(): Promise<{ x: number; y: number }>;
    },
    timeoutMs = 3000,
    intervalMs = 200,
    maxDelta = 2
  ): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    let previousY: number | null = null;

    while (Date.now() < deadline) {
      const { y } = await element.getLocation();

      if (previousY !== null && Math.abs(y - previousY) <= maxDelta) {
        return;
      }

      previousY = y;
      await driver.pause(intervalMs);
    }

    throw new Error('Element location did not stabilize after scrolling.');
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
      const fromY = Math.round(height * 0.65);
      const toY = Math.round(height * 0.35);

      await driver.execute('mobile: dragFromToForDuration', {
        duration: 1.0,
        fromX: x,
        fromY,
        toX: x,
        toY,
      });
    }
  }

  async swipeDownOnScreen(): Promise<void> {
    try {
      await driver.execute('mobile: swipe', { direction: 'down', velocity: 500 });
    } catch {
      const { width, height } = await driver.getWindowRect();
      const x = Math.round(width / 2);
      const fromY = Math.round(height * 0.35);
      const toY = Math.round(height * 0.65);

      await driver.execute('mobile: dragFromToForDuration', {
        duration: 1.0,
        fromX: x,
        fromY,
        toX: x,
        toY,
      });
    }
  }

  async getTopVisibleRecord(): Promise<WebdriverIO.Element | null> {
    const cells = await $$(
      '-ios predicate string:type == "XCUIElementTypeButton" AND name == "RecordListCell"'
    );

    let topmost: WebdriverIO.Element | null = null;
    let minY = Infinity;

    for (const cell of cells) {
      if (!(await this.isElementVisible(cell))) continue;

      const { y } = await cell.getLocation();
      if (y < minY) {
        minY = y;
        topmost = cell;
      }
    }

    return topmost;
  }

  async isScrolledToTop(): Promise<boolean> {
    if (!(await this.isElementVisible(this.firstRecord))) {
      return false;
    }

    const topVisible = await this.getTopVisibleRecord();
    if (!topVisible) {
      return false;
    }

    const [firstRect, topRect] = await Promise.all([
      this.firstRecord.getLocation(),
      topVisible.getLocation(),
    ]);

    return firstRect.y === topRect.y;
  }
}

export default new RecordsScreen();
