Feature: share file
  Alice shares file with Brian
  I want to check that Brian can copy, download the file.
  I also want to check that Alice can change the role to the share and can delete share

  Background:
    Given following users have been created
      | Alice |
      | Brian |
    And admin set the default folder for received shares to "Shares"
    And admin disables auto accepting of the shares

  Scenario: Alice shares file to Brian
    Given "Alice" has logged in
    When "Alice" opens the "files" app
    And "Alice" creates the following folder
      | folder_to_shared |
    And "Alice" uploads the following resource
      | resource        | to               |
      | testavatar.jpeg | folder_to_shared |
    And "Alice" shares the following resource via the quick action
      | resource                         | user  | role   |
      | folder_to_shared/testavatar1.jpeg | Brian | viewer |
    Given "Brian" has logged in
    When "Brian" opens the "files" app
    And "Brian" accepts the following resource
      | testavatar.jpeg |
    And "Brian" copies the following resource
      | resource               | to       |
      | Shares/testavatar.jpeg | All files |
    And "Brian" downloads the following file
      | resource        | from   |
      | testavatar.jpeg | Shares |
    When "Alice" opens the "files" app
    And "Alice" changes the shared resource recipient role for the following resources
      | resource                         | user  | role   |
      | folder_to_shared/testavatar.jpeg | Brian | editor |
    When "Brian" opens the "files" app
    And "Brian" renames the following resource
      | resource               | as                  |
      | Shares/testavatar.jpeg | testavatar_new.jpeg |
    When "Alice" opens the "files" app
    And "Alice" removes following collaborator from the share
      | resource                         | user  |
      | folder_to_shared/testavatar.jpeg | Brian |
    And "Alice" has logged out
    When "Brian" opens the "files" app
    Then "Brian" ensures that the following resource does not exist
      | Shares/testavatar_new.jpeg |
    And "Brian" ensures that the following resource exist
      | testavatar.jpeg |
    And "Brian" has logged out
