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
    Then "Alice" should see the following account page title "Konto"
    When "Alice" logs out
    And "Alice" logs in
    Then "Alice" should see the following notifications
      | message                                          |
      | Brian Murphy hat check_message mit Ihnen geteilt |
    And "Alice" logs out

  Scenario: anonymous user language change
    When "Alice" logs in
    And "Alice" opens the "files" app
    And "Alice" creates the following resources
      | resource     | type   |
      | folderPublic | folder |
    And "Alice" uploads the following resources
      | resource  | to           |
      | lorem.txt | folderPublic |
    And "Alice" creates a public link for the resource "folderPublic" with password "%public%" using the sidebar panel
    And "Alice" renames the most recently created public link of resource "folderPublic" to "myPublicLink"
    When "Anonymous" opens the public link "myPublicLink"
    And "Anonymous" unlocks the public link with password "%public%"
    And "Anonymous" opens the user menu
    And "Anonymous" changes the language to "Deutsch - German"
    Then "Anonymous" should see the following account page title "Konto"


