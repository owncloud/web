Feature: Page not found
  As a user
  I want to see a not found page
  So that I know when I've navigated to a page that doesn't exist

  Scenario: not found page
    Given "Admin" creates following user using API
      | id    |
      | Alice |
    And "Alice" logs in
    When "Alice" navigates to a non-existing page
    Then "Alice" should see the not found page
    And "Alice" logs out
