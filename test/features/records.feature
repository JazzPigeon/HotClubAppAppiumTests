Feature: Records screen

  Background:
    Given I am on the Records screen

  Scenario: Launch on the Records screen
    Then I should see the Records navigation bar

  Scenario: Show the bottom tab bar
    Then I should see the Records, Add, and Settings tabs

  Scenario: List records
    Then I should see at least one record

  Scenario: Open the seventh item in the list and navigate back from Detail View
    When I open the seventh record
    And I navigate back from the record detail
    Then I should see the Records navigation bar

  Scenario: Switch to Settings and back to Records
    When I switch to the Settings tab
    And I switch to the Records tab
    Then I should see the Records navigation bar

Scenario: Scroll to end of list
    When I scroll to the end of the list
    Then I should see the End of List text