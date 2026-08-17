import { $ } from '@wdio/globals';

/**
 * Page object for the authentication screen.
 */
class AuthScreen {
  get usernameField() {
    return $('~EmailTextField');
  }

  get passwordField() {
    return $('~PasswordTextField');
  }

  get signInButton() {
    return $(
      '-ios class chain:**/XCUIElementTypeButton[`name == "Sign in"`][1]'
    );
  }

  get errorMessage() {
    return $('~ErrorMessage');
  }

  async enterUsername(username: string): Promise<void> {
    await this.usernameField.waitForDisplayed();
    await this.usernameField.tap();
    await this.usernameField.clearValue();
    await this.usernameField.setValue(username);
  }

  async enterPassword(password: string): Promise<void> {
    await this.passwordField.waitForDisplayed();
    await this.passwordField.tap();
    await this.passwordField.clearValue();
    await this.passwordField.setValue(password);
  }

  async tapSignIn(): Promise<void> {
    await this.signInButton.waitForDisplayed();
    await this.signInButton.tap();
  }

  async isDisplayedNow(timeout = 500): Promise<boolean> {
    return this.usernameField
      .waitForDisplayed({ timeout })
      .then(() => true)
      .catch(() => false);
  }

  async waitForDisplayed(timeout = 15000): Promise<void> {
    await this.usernameField.waitForDisplayed({ timeout });
    await this.passwordField.waitForDisplayed({ timeout });
    await this.signInButton.waitForDisplayed({ timeout });
  }
}

export default new AuthScreen();
