Feature: Records screen

  Background:
    Given I am on the Records screen

  Scenario: Launch on the Records screen
    Then I should see the Records screen title and navigation
    And I should see at least 5 record list items

  Scenario: Open the record featuring Jack Hits the Road then navigate back from Detail View
    When I select "Jack Hits the Road" from the Records list
    And I navigate back from the record detail
    Then I should be on the Records screen

  Scenario: Switch to Settings and back to Records
    When I switch to the Settings tab
    And I switch to the Records tab
    Then I should be on the Records screen

# Test Cases for tomorrow
# - Review the cases above; edit as necessary
# - Detail View tests
# - Settings tests
# - Maybe screenshot theming test?
# - Don't forget to spend time on CI and Allure!