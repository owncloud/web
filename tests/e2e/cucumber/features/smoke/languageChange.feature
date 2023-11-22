Feature: language settings
  As a user
  I want to be able to use the system with my preferred language

  Background:
    Given "Admin" creates following users using API
      | id    |
      | Alice |
      | Brian |

  Scenario: system language change
    And "Brian" logs in
    And "Brian" creates the following folder in personal space using API
      | name          |
      | check_message |
    And "Brian" opens the "files" app
    And "Brian" shares the following resource using API
      | resource      | recipient | type | role     |
      | check_message | Alice     | user | Can edit |
    And "Brian" logs out

    And "Alice" logs in
    And "Alice" opens the user menu
    And "Alice" changes the language to "Deutsch - German"
    When "Alice" logs out
    And "Alice" logs in
    Then "Alice" should see the following notifications
      | message                                          |
      | Brian Murphy hat check_message mit Ihnen geteilt |
    And "Alice" logs out


