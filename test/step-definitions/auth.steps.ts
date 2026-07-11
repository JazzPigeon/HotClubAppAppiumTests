import { Given, Then, When } from '@wdio/cucumber-framework';
import AuthScreen from '../pageobjects/auth.page.js';

Given('I am on the authentication screen', async () => {
  await AuthScreen.waitForDisplayed();
});

Then('I should see the authentication screen', async () => {
  await AuthScreen.waitForDisplayed();
});

When('I sign in with valid credentials', async () => {
  const username = process.env.HOTCLUB_TEST_EMAIL;
  const password = process.env.HOTCLUB_TEST_PASSWORD;

  if (!username || !password) {
    throw new Error(
      'Set HOTCLUB_TEST_EMAIL and HOTCLUB_TEST_PASSWORD before running auth scenarios.'
    );
  }

  await AuthScreen.enterUsername(username);
  await AuthScreen.enterPassword(password);
  await AuthScreen.clickSignIn();
});
