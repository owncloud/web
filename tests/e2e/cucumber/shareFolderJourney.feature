Feature: share folder with file
  Alice shares the folder with file to Brian with the "editor" role.
  I want to check that Brian can accept folder, download, move, copy and rename the shared file

  Background:
    Given the following users have been created
      | Alice |
      | Brian |
    And the default folder for received shares has been set to "Shares"
    And auto-accept shares has been disabled

  Scenario: Alice shares folder with file to Brian
    When "Alice" logs in
    And "Alice" opens the "files" app
    And "Alice" navigates to the files page
    And "Alice" creates the following folder
      | folder_to_shared |
    And "Alice" uploads the following resource
      | resource  | to               |
      | lorem.txt | folder_to_shared |
    Then "Alice" should see the following resource
      | folder_to_shared/lorem.txt |
    When "Alice" shares the following resource via the sidebar panel
      | resource         | user  | role   |
      | folder_to_shared | Brian | editor |
    And "Brian" logs in
    And "Brian" opens the "files" app
    And "Brian" accepts the following resource
      | folder_to_shared |
    And "Brian" renames the following resource
      | resource                          | as            |
      | Shares/folder_to_shared/lorem.txt | lorem_new.txt |
    And "Brian" uploads the following resource
      | resource   | to                      |
      | simple.pdf | Shares/folder_to_shared |
    And "Brian" copies the following resource
      | resource                | to        |
      | Shares/folder_to_shared | All files |
    When "Alice" opens the "files" app
    Then "Alice" should see the following resources
      | folder_to_shared/lorem_new.txt |
      | folder_to_shared/simple.pdf    |
    When "Alice" creates a new version of the following files
      | resource   | to               |
      | simple.pdf | folder_to_shared |
    Then "Alice" should see that the resource "folder_to_shared/simple.pdf" has 1 version
    When "Alice" deletes the following resources
      | folder_to_shared/lorem_new.txt |
      | folder_to_shared               |
    And "Alice" logs out
    And "Brian" opens the "files" app
    Then "Brian" should not see the following resource
      | Shares/folder_to_shared |
    And "Brian" logs out
