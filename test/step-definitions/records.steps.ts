import { Given, Then, When } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import RecordsScreen from '../pageobjects/records.page.js';

Given('I am on the Records screen', async () => {
  await RecordsScreen.waitForDisplayed();
});

Then('I should see the Records screen', async () => {
  await RecordsScreen.waitForDisplayed();
});

Then('I should see the Records navigation bar', async () => {
  await expect(RecordsScreen.navBar).toBeDisplayed();
});

Then('I should see the Records, Add, and Settings tabs', async () => {
  await expect(RecordsScreen.recordsTab).toBeDisplayed();
  await expect(RecordsScreen.addTab).toBeDisplayed();
  await expect(RecordsScreen.settingsTab).toBeDisplayed();
});

Then('I should see at least one record', async () => {
  await expect(RecordsScreen.recordCells).toBeElementsArrayOfSize({ gte: 1 });
});

When('I open the first record', async () => {
  const firstRecord = RecordsScreen.firstRecord;
  await expect(firstRecord).toBeDisplayed();
  await firstRecord.click();
  await RecordsScreen.navBackButton.waitForDisplayed({ timeout: 10000 });
});

When('I navigate back from the record detail', async () => {
  await RecordsScreen.navBackButton.click();
});

When('I switch to the Settings tab', async () => {
  await RecordsScreen.settingsTab.click();
  await RecordsScreen.navBar.waitForDisplayed({ reverse: true, timeout: 10000 });
});

When('I switch to the Records tab', async () => {
  await RecordsScreen.recordsTab.click();
});
