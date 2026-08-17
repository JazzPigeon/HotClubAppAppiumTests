import { After } from '@wdio/cucumber-framework';
import RecordsScreen from '../pageobjects/records.page.js';

/**
 * Reset to the Records list after every scenario so a failure (or a missed
 * back navigation) cannot poison the next one. Errors are swallowed so a
 * cleanup problem does not mask the original scenario failure.
 */
After(async function () {
  try {
    await RecordsScreen.recoverToRecordsScreen();
  } catch (error) {
    console.warn('Could not reset to the Records screen after scenario:', error);
  }
});
