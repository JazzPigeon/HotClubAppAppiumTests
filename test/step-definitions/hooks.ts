import { After } from '@wdio/cucumber-framework';
import RecordsScreen from '../pageobjects/records.page.js';

/**
 * Reset to the Records list after @loggedIn scenarios so a failure (or a
 * missed back navigation) cannot poison the next one. Auth (@loggedOut)
 * scenarios must not be forced onto Records — the next Background step
 * puts the app in the right launch state. Errors are swallowed so a
 * cleanup problem does not mask the original scenario failure.
 */
After({ tags: '@loggedIn' }, async function () {
  try {
    await RecordsScreen.recoverToRecordsScreen();
  } catch (error) {
    console.warn('Could not reset to the Records screen after scenario:', error);
  }
});
