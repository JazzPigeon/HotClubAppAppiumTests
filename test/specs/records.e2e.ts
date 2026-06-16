import { $, expect } from '@wdio/globals';
import RecordsScreen from '../pageobjects/records.page.js';

describe('HotClub - Records', () => {
  beforeEach(async () => {
    await RecordsScreen.waitForDisplayed();
  });

  it('launches on the Records screen', async () => {
    await expect(RecordsScreen.navBar).toBeDisplayed();
  });

  it('shows the bottom tab bar with Records, Add, and Settings', async () => {
    await expect(RecordsScreen.recordsTab).toBeDisplayed();
    await expect(RecordsScreen.addTab).toBeDisplayed();
    await expect(RecordsScreen.settingsTab).toBeDisplayed();
  });

  it('lists at least one record', async () => {
    await expect(RecordsScreen.recordCells).toBeElementsArrayOfSize({ gte: 1 });
  });

  it('opens a record detail when tapped and navigates back', async () => {
    const firstRecord = RecordsScreen.firstRecord;
    await expect(firstRecord).toBeDisplayed();

    await firstRecord.click();

    // Tapping a row pushes a detail screen; the list is no longer on top and a
    // back button appears in the navigation bar.
    await RecordsScreen.navBackButton.waitForDisplayed({ timeout: 10000 });
    await RecordsScreen.navBackButton.click();

    // Returning lands us back on the Records list.
    await expect(RecordsScreen.navBar).toBeDisplayed();
  });

  it('switches to the Settings tab and back to Records', async () => {
    await RecordsScreen.settingsTab.click();
    // Leaving Records hides its navigation bar.
    await RecordsScreen.navBar.waitForDisplayed({ reverse: true, timeout: 10000 });

    // Adding the two lines below to force a test failure 
    const firstRecord = RecordsScreen.firstRecord;
    await expect(firstRecord).toBeDisplayed();

    await RecordsScreen.recordsTab.click();
    await expect(RecordsScreen.navBar).toBeDisplayed();
  });
});
