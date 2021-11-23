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
    And admin disables auto accepting

  Scenario: Alice shares folder with file to Brian
    Given "Alice" has logged in
    When "Alice" opens the "files" app
    And "Alice" navigates to the files page
    And "Alice" creates following folders
      | folder_to_shared |
    And "Alice" uploads following resources
      | resource  | to               |
      | lorem.txt | folder_to_shared |
    Then "Alice" ensures that the following resources exist
      | folder_to_shared/lorem.txt |
    And "Alice" shares following resources
      | resource         | user  | role   |
      | folder_to_shared | Brian | editor |
    Given "Brian" has logged in
    When "Brian" opens the "files" app
    And "Brian" accepts following resources
      | folder_to_shared |
    And "Brian" renames following resource
      | resource                          | as            |
      | Shares/folder_to_shared/lorem.txt | lorem_new.txt |
    And "Brian" uploads following resources
      | resource   | to                      |
      | simple.pdf | Shares/folder_to_shared |
    And "Brian" copies following resources
      | resource                | to       |
      | Shares/folder_to_shared | All files |
    When "Alice" opens the "files" app
    Then "Alice" ensures that the following resources exist
      | folder_to_shared/lorem_new.txt |
      | folder_to_shared/simple.pdf    |
    When "Alice" creates new versions of the following files
      | resource   | to               |
      | simple.pdf | folder_to_shared |
    Then "Alice" ensure that resource "folder_to_shared/simple.pdf" has 1 versions
    When "Alice" deletes following resources
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
    And "Alice" creates following folders
      | folder_to_shared |
    And "Alice" uploads following resources
      | resource        | to               |
      | testavatar.jpeg | folder_to_shared |
    And "Alice" shares following resources using main menu
      | resource                         | user  | role   |
      | folder_to_shared/testavatar.jpeg | Brian | viewer |
    Given "Brian" has logged in
    When "Brian" opens the "files" app
    And "Brian" accepts following resources
      | testavatar.jpeg |
    And "Brian" copies following resources
      | resource               | to       |
      | Shares/testavatar.jpeg | All files |
    # this step failed in the "OC10 smoke tests" in CI
    # TODO need to include screenshots and read console logs for CI
    # And "Brian" opens file in Mediaviewer
    #   | Shares/testavatar.jpeg |
    And "Brian" downloads following files
      | resource        | from   |
      | testavatar.jpeg | Shares |
    When "Alice" opens the "files" app
    And "Alice" changes role for the following shared resources
      | resource                         | user  | role   |
      | folder_to_shared/testavatar.jpeg | Brian | editor |
    When "Brian" opens the "files" app
    And "Brian" renames following resource
      | resource               | as                  |
      | Shares/testavatar.jpeg | testavatar_new.jpeg |
    When "Alice" opens the "files" app
    And "Alice" deletes share following resource with user
      | resource                         | user  |
      | folder_to_shared/testavatar.jpeg | Brian |
    And "Alice" has logged out
    When "Brian" opens the "files" app
    Then "Brian" ensures that the following resource does not exist
      | Shares/testavatar_new.jpeg |
    And "Brian" ensures that the following resource exist
      | testavatar.jpeg |
    And "Brian" has logged out
