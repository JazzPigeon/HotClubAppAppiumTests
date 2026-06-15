/**
 * Example iOS test.
 *
 * This is intentionally generic. Replace the selectors with ones from YOUR app.
 * The best way to find selectors is Appium Inspector (https://github.com/appium/appium-inspector).
 *
 * Common iOS selector strategies:
 *   - By accessibility id:  $('~my-accessibility-id')
 *   - By name/label:        $('-ios predicate string:label == "Login"')
 *   - By class chain:       see the iOS Class Chain docs for XCUIElementType queries
 */
describe('My iOS App', () => {
  it('should launch and be ready', async () => {
    // Give the app a moment to settle after launch.
    await driver.pause(2000);

    // Sanity check: the session is alive and we can read the page source.
    const source = await driver.getPageSource();
    expect(source).toContain('XCUIElementType');
  });

  it('example: tap an element by accessibility id', async () => {
    // Replace '~login-button' with a real accessibility id from your app.
    const loginButton = await $('~login-button');

    if (await loginButton.isExisting()) {
      await loginButton.click();
    } else {
      console.warn(
        '[example] ~login-button not found — update selectors for your app.'
      );
    }
  });
});
