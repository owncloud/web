Feature: share

  Background:
    And "Admin" disables share auto accepting

  Scenario: folder
    Given "Admin" creates following users
      | id    |
      | Alice |
      | Brian |
    When "Alice" logs in
    And "Alice" opens the "files" app
    And "Alice" navigates to the personal space page
    And "Alice" creates the following resources
      | resource         | type   |
      | folder_to_shared | folder |
    And "Alice" uploads the following resource
      | resource  | to               |
      | lorem.txt | folder_to_shared |
    #Then "Alice" should see the following resource
    #  | folder_to_shared/lorem.txt |
    When "Alice" shares the following resource using the sidebar panel
      | resource         | recipient | type | role   |
      | folder_to_shared | Brian     | user | editor |
    And "Brian" logs in
    And "Brian" opens the "files" app
    And "Brian" navigates to the shared with me page
    And "Brian" accepts the following share
      | name             |
      | folder_to_shared |
    And "Brian" renames the following resource
      | resource                   | as            |
      | folder_to_shared/lorem.txt | lorem_new.txt |
    And "Brian" uploads the following resource
      | resource   | to               |
      | simple.pdf | folder_to_shared |
    When "Alice" opens the "files" app
    #Then "Alice" should see the following resources
    #  | folder_to_shared/lorem_new.txt |
    #  | folder_to_shared/simple.pdf    |
    And "Alice" uploads the following resource
      | resource          | to               | create_version |
      | PARENT/simple.pdf | folder_to_shared | true           |
    #Then "Alice" should see that the resource "folder_to_shared/simple.pdf" has 1 version
    And "Brian" downloads old version of the following resource
      | resource   | to               |
      | simple.pdf | folder_to_shared |
    When "Brian" restores following resources
      | resource   | to               | version |
      | simple.pdf | folder_to_shared | 1       |
    #Then "Brian" should see that the version of resource "simple.pdf" has been restored
    When "Alice" deletes the following resources
      | resource                       |
      | folder_to_shared/lorem_new.txt |
      | folder_to_shared               |
    And "Alice" logs out
    And "Brian" opens the "files" app
    #Then "Brian" should not see the following resource
    #  | Shares/folder_to_shared |
    And "Brian" logs out
