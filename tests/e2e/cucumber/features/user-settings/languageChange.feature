@predefined-users
Feature: language settings
  As a user
  I want to be able to use the system with my preferred language

  Background:
    Given "Admin" creates following users using API
      | id    |
      | Alice |
      | Brian |

  Scenario: system language change
    Given "Alice" logs in
    And "Brian" logs in
    And "Alice" creates the following folder in personal space using API
      | name          |
      | check_message |
    And "Alice" shares the following resource using API
      | resource      | recipient | type | role     | resourceType |
      | check_message | Brian     | user | Can edit | folder       |
    And "Alice" logs out
    When "Brian" opens the user menu
    And "Brian" changes the language to "Deutsch - German"
    Then "Brian" should see the following account page title "Mein Konto"
    And "Brian" should see the following notifications
      | message                                                      |
      | %user_alice_displayName% hat check_message mit Ihnen geteilt |
    And "Brian" logs out


  Scenario: anonymous user language change
    Given "Alice" logs in
    And "Alice" creates the following folder in personal space using API
      | name         |
      | folderPublic |
    And "Alice" uploads the following local file into personal space using API
      | localFile                | to        |
      | filesForUpload/lorem.txt | lorem.txt |
    And "Alice" creates a public link of following resource using API
      | resource     | password |
      | folderPublic | %public% |
    And "Alice" logs out
    When "Anonymous" opens the public link "Unnamed link"
    And "Anonymous" unlocks the public link with password "%public%"
    And "Anonymous" opens the user menu
    And "Anonymous" changes the language to "Deutsch - German"
    Then "Anonymous" should see the following account page title "Mein Konto"
