Feature: share file
  Alice shares file with Brian
  I want to check that Brian can copy, download the file.
  I also want to check that Alice can change the role to the share and can delete share

  Background:
    Given the following users have been created
      | Alice |
      | Brian |
    And the default folder for received shares has been set to "Shares"
    And auto-accept shares has been disabled

  Scenario: Alice shares file to Brian
    When "Alice" logs in
    And "Alice" opens the "files" app
    And "Alice" creates the following folder
      | folder_to_shared |
    And "Alice" uploads the following resource
      | resource        | to               |
      | testavatar.jpeg | folder_to_shared |
    And "Alice" shares the following resource via the quick action
      | resource                         | user  | role   |
      | folder_to_shared/testavatar.jpeg | Brian | viewer |
    And "Brian" logs in
    And "Brian" opens the "files" app
    And "Brian" accepts the following resource
      | testavatar.jpeg |
    And "Brian" copies the following resource
      | resource               | to        |
      | Shares/testavatar.jpeg | All files |
    And "Brian" downloads the following file
      | resource        | from   |
      | testavatar.jpeg | Shares |
    And "Alice" changes the shared resource recipient role for the following resources
      | resource                         | user  | role   |
      | folder_to_shared/testavatar.jpeg | Brian | editor |
    When "Brian" opens the "files" app
    And "Brian" renames the following resource
      | resource               | as                  |
      | Shares/testavatar.jpeg | testavatar_new.jpeg |
    And "Alice" removes the following collaborator from the share
      | resource                         | user  |
      | folder_to_shared/testavatar.jpeg | Brian |
    And "Alice" logs out
    When "Brian" opens the "files" app
    Then "Brian" should not see the following resource
      | Shares/testavatar_new.jpeg |
    But "Brian" should see the following resource
      | testavatar.jpeg |
    And "Brian" logs out
