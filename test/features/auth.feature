@skip
Feature: Authentication

  Scenario: Show the authentication screen
    Then I should see the authentication screen

  Scenario: Sign in to the app
    Given I am on the authentication screen
    When I sign in with valid credentials
    Then I should see the Records screen
