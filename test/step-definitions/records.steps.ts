import { Given, Then, When } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import RecordsScreen from '../pageobjects/records.page.js';

Given('I am on the Records screen', async () => {
  await RecordsScreen.waitForDisplayed();
});

Then('I should see the Records screen title and navigation', async () => {
  await expect(RecordsScreen.navBar).toBeDisplayed();
  await expect(RecordsScreen.recordsTab).toBeDisplayed();
  await expect(RecordsScreen.addTab).toBeDisplayed();
  await expect(RecordsScreen.settingsTab).toBeDisplayed();
});

Then('I should see at least {int} record list items', async (recordCount) => {
  await expect(RecordsScreen.recordCells).toBeElementsArrayOfSize({ gte: recordCount });
});

Then('I should see the Records navigation bar', async () => {
  await expect(RecordsScreen.navBar).toBeDisplayed();
});

When('I open the record {string}', async (songTitle) => {
  while(!(await RecordsScreen.isScrolledToTop())) {
    await RecordsScreen.swipeDownOnScreen();
  }
  await RecordsScreen.tapRecordContainingTitleText(songTitle)
  console.log(`Tapped on the record ${songTitle}`);
});

When('I navigate back from the record detail', async () => {
  await RecordsScreen.navBackButton.waitForDisplayed();
  await RecordsScreen.navBackButton.tap();
});

When('I switch to the Settings tab', async () => {
  await RecordsScreen.settingsTab.tap();
  await RecordsScreen.navBar.waitForDisplayed({ reverse: true, timeout: 10000 });
});

When('I switch to the Records tab', async () => {
  await RecordsScreen.recordsTab.tap();
});

When('I scroll to the end of the list', async () => {
  await RecordsScreen.scrollToEndOfList();
});

Then('I should see the End of List text', async () => {
  await expect(RecordsScreen.endOfListText).toBeDisplayed();
});
