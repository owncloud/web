@predefined-users
Feature: Trashbin delete
  As a user
  I want to delete files and folders from the trashbin
  So that I can control my trashbin space and which files are kept in that space

  Background:
    Given "Admin" creates following user using API
      | id    |
      | Alice |
      | Brian |
    And "Alice" logs in


  Scenario: delete files and folders from trashbin
    Given "Alice" creates the following resources
      | resource     | type   |
      | FOLDER       | folder |
      | PARENT/CHILD | folder |
    And "Alice" uploads the following resources
      | resource               | to           |
      | new-lorem.txt          | FOLDER       |
      | PARENT/parent.txt      | PARENT       |
      | PARENT/simple.pdf      | PARENT       |
      | PARENT/CHILD/child.txt | PARENT/CHILD |
      | data.tar.gz            |              |
      | lorem.txt              |              |
      | lorem-big.txt          |              |
    And "Alice" opens the "files" app
    And "Alice" deletes the following resources using the batch action
      | resource      |
      | FOLDER        |
      | PARENT        |
      | data.tar.gz   |
      | lorem.txt     |
      | lorem-big.txt |
    And "Alice" navigates to the trashbin
    When "Alice" deletes the following resources from trashbin using the batch action
      | resource  |
      | lorem.txt |
      | PARENT    |
    And "Alice" empties the trashbin
    And "Alice" logs out


  Scenario: delete and restore a file inside a received shared folder
    Given "Brian" logs in
    And "Alice" creates the following folders in personal space using API
      | name          |
      | folderToShare |
      | empty-folder  |
    And "Alice" creates the following files into personal space using API
      | pathToFile              | content     |
      | folderToShare/lorem.txt | lorem ipsum |
      | sample.txt              | sample      |
    And "Alice" shares the following resource using API
      | resource      | recipient | type | role                      | resourceType |
      | folderToShare | Brian     | user | Can edit without versions | folder       |
    When "Brian" navigates to the shared with me page
    And "Brian" opens folder "folderToShare"
    And "Brian" deletes the following resources using the sidebar panel
      | resource  |
      | lorem.txt |
    And "Brian" navigates to the trashbin
    Then following resources should not be displayed in the trashbin for user "Brian"
      | resource                |
      | folderToShare/lorem.txt |
    When "Alice" deletes the following resources using the sidebar panel
      | resource     |
      | sample.txt   |
      | empty-folder |
    And "Alice" navigates to the trashbin
    Then following resources should be displayed in the trashbin for user "Alice"
      | resource                |
      | folderToShare/lorem.txt |
    And "Alice" restores the following resources from trashbin
      | resource                |
      | folderToShare/lorem.txt |
    And "Alice" restores the following resources from trashbin using the batch action
      | resource                |
      | sample.txt              |
      | empty-folder            |
    And "Alice" opens the "files" app
    And "Alice" opens folder "folderToShare"
    And following resources should be displayed in the files list for user "Alice"
      | resource  |
      | lorem.txt |
    And "Brian" navigates to the shared with me page
    And "Brian" opens folder "folderToShare"
    And following resources should be displayed in the files list for user "Brian"
      | resource  |
      | lorem.txt |
    And "Brian" logs out
    And "Alice" logs out
