@loggedOut
Feature: Authentication

  Background:
    Given I am on the Login screen

  Scenario: Sign in to the app
    When I sign in with valid credentials
    Then I should see the Records screen

  Scenario: I enter an invalid email during login
    When I enter an invalid email address
    And I enter a valid password
    And I tap the Sign In button
    Then an "Invalid login credentials" error is displayed on screen

  Scenario: I enter an invalid password during login
    When I enter a valid email address
    And I enter an invalid password
    And I tap the Sign In button
    Then an "Invalid login credentials" error is displayed on screen

  #Scenario: I do not enter any credentials on login screen
