Feature: share folder with file, share file
  Alice shares the folder with file to Brian with the "editor" role.
  I want to check that Brian can accept folder, download, move, copy and rename the shared file
  Alice shares file with Brian
  I want to check that Brian can open file in Mediaviewer, copy, download the file.
  I also want to check that Alice can change the role to the share and can delete share

  Background:
    Given following users have been created
      | Alice |
      | Brian |
    And admin set the default folder for received shares to "Shares"
    And admin disables auto accepting of the shares

  Scenario: Alice shares folder with file to Brian
    Given "Alice" has logged in
    When "Alice" opens the "files" app
    And "Alice" navigates to the files page
    And "Alice" creates the following folder
      | folder_to_shared |
    And "Alice" uploads the following resource
      | resource  | to               |
      | lorem.txt | folder_to_shared |
    Then "Alice" ensures that the following resource exist
      | folder_to_shared/lorem.txt |
    And "Alice" shares the following resource using sidebar panel
      | resource         | user  | role   |
      | folder_to_shared | Brian | editor |
    Given "Brian" has logged in
    When "Brian" opens the "files" app
    And "Brian" accepts the following resource
      | folder_to_shared |
    And "Brian" renames the following resource
      | resource                          | as            |
      | Shares/folder_to_shared/lorem.txt | lorem_new.txt |
    And "Brian" uploads the following resource
      | resource   | to                      |
      | simple.pdf | Shares/folder_to_shared |
    And "Brian" copies the following resource
      | resource                | to       |
      | Shares/folder_to_shared | All files |
    When "Alice" opens the "files" app
    Then "Alice" ensures that the following resources exist
      | folder_to_shared/lorem_new.txt |
      | folder_to_shared/simple.pdf    |
    When "Alice" creates new version of the following files
      | resource   | to               |
      | simple.pdf | folder_to_shared |
    Then "Alice" ensures that the resource "folder_to_shared/simple.pdf" has 1 version
    When "Alice" deletes the following resources
      | folder_to_shared/lorem_new.txt |
      | folder_to_shared               |
    And "Alice" has logged out
    When "Brian" opens the "files" app
    Then "Brian" ensures that the following resource does not exist
      | Shares/folder_to_shared |
    And "Brian" has logged out

  Scenario: Alice shares file to Brian
    Given "Alice" has logged in
    When "Alice" opens the "files" app
    And "Alice" creates the following folder
      | folder_to_shared |
    And "Alice" uploads the following resource
      | resource        | to               |
      | testavatar.jpeg | folder_to_shared |
    And "Alice" shares the following resource using quick action
      | resource                         | user  | role   |
      | folder_to_shared/testavatar.jpeg | Brian | viewer |
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
    And "Alice" deletes shared access to the following resource with user
      | resource                         | user  |
      | folder_to_shared/testavatar.jpeg | Brian |
    And "Alice" has logged out
    When "Brian" opens the "files" app
    Then "Brian" ensures that the following resource does not exist
      | Shares/testavatar_new.jpeg |
    And "Brian" ensures that the following resource exist
      | testavatar.jpeg |
    And "Brian" has logged out
