import { Given, Then, When } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import RecordsScreen from '../pageobjects/records.page.js';

Given('I am on the Records screen', async () => {
  await RecordsScreen.recoverToRecordsScreen();
  await RecordsScreen.waitForDisplayed();
});

Then('I should be on the Records screen', async () => {
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

When('I scroll to the record containing title text {string}', async (songTitle) => {
  await RecordsScreen.scrollToRecordContainingTitleText(songTitle);
});

When('I tap the record containing title text {string}', async (songTitle) => {
  await RecordsScreen.tapRecordContainingTitleText(songTitle);
});

When('I select {string} from the Records list', async (songTitle) => {
  await RecordsScreen.scrollToAndTapRecordContainingTitleText(songTitle);
  await RecordsScreen.navBackButton.waitForDisplayed();
});

When('I navigate back from the record detail', async () => {
  await RecordsScreen.navigateBackFromDetail();
});

When('I switch to the Settings tab', async () => {
  await RecordsScreen.settingsTab.tap();
  await RecordsScreen.navBar.waitForDisplayed({ reverse: true, timeout: 10000 });
});

When('I switch to the Records tab', async () => {
  await RecordsScreen.recordsTab.tap();
});

Then('I should see the record entry for {string}', async (songTitle) => {
  await expect(RecordsScreen.recordWithTitle(songTitle)).toBeDisplayed();
});
