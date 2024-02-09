Feature: Trashbin delete
  As a user
  I want to delete files and folders from the trashbin
  So that I can control my trashbin space and which files are kept in that space


  Scenario: delete files and folders from trashbin
    Given "Admin" logs in
    And "Admin" creates following user using API
      | id    |
      | Alice |
    And "Alice" logs in
    And "Alice" creates the following resources
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
