import { Given, Then, When } from '@wdio/cucumber-framework';
import AuthScreen from '../pageobjects/auth.page.js';
import RecordsScreen from '../pageobjects/records.page.js';
import {
  ensureLoggedOut,
  enterValidEmailAddress,
  enterValidPassword,
  signInWithTestCredentials,
} from '../helpers/app-session.js';

Given('I am on the Login screen', async () => {
  await ensureLoggedOut();
});

Given('I am on the authentication screen', async () => {
  await AuthScreen.waitForDisplayed();
});

Then('I should see the authentication screen', async () => {
  await AuthScreen.waitForDisplayed();
});

Then('I should see the Records screen', async () => {
  await RecordsScreen.waitForLoggedInShell();
});

When('I sign in with valid credentials', async () => {
  await signInWithTestCredentials();
});

When('I enter a valid email address', async () => {
  await enterValidEmailAddress()
});

When('I enter an invalid email address', async () => {
  await AuthScreen.enterUsername('incorrect@example.com');
});

When('I enter a valid password', async () => {
  await enterValidPassword();
});

When('I enter an invalid password', async () => {
  await AuthScreen.enterPassword('incorrectpassword');
});

When('I do not enter any credentials on login screen', async () => {
  await AuthScreen.enterUsername('');
  await AuthScreen.enterPassword('');
});

When('I tap the Sign In button', async () => {
  await AuthScreen.tapSignIn();
});

Then('an {string} error is displayed on screen', async (errorMessage: string) => {
  await expect(AuthScreen.errorMessage).toBeDisplayed();
  await expect(AuthScreen.errorMessage).toHaveText(errorMessage);
});