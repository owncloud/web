Feature: language settings
  As a user
  I want to be able to use the system with my preferred language

  Background:
    Given "Admin" creates following users using API
      | id    |
      | Alice |
      | Brian |

  Scenario: system language change
    And "Brian" creates the following folder in personal space using API
      | name          |
      | check_message |
    And "Brian" shares the following resource using API
      | resource      | recipient | type | role     |
      | check_message | Alice     | user | Can edit |
    And "Alice" logs in
    And "Alice" opens the user menu
    And "Alice" changes the language to "Deutsch - German"
    Then "Alice" should see the following account page title "Mein Konto"
    When "Alice" logs out
    And "Alice" logs in
    Then "Alice" should see the following notifications
      | message                                          |
      | Brian Murphy hat check_message mit Ihnen geteilt |
    And "Alice" logs out


  Scenario: anonymous user language change
    When "Alice" creates the following folder in personal space using API
      | name         |
      | folderPublic |
    And "Alice" uploads the following local file into personal space using API
      | localFile                | to        |
      | filesForUpload/lorem.txt | lorem.txt |

    And "Alice" creates a public link of following resource using API
      | resource     | password |
      | folderPublic | %public% |
    When "Anonymous" opens the public link "Link"
    And "Anonymous" unlocks the public link with password "%public%"
    And "Anonymous" opens the user menu
    And "Anonymous" changes the language to "Deutsch - German"
    Then "Anonymous" should see the following account page title "Mein Konto"
