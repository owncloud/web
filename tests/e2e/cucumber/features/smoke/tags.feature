@predefined-users
Feature: Users can use web to organize tags

  Background:
    Given "Admin" creates following users using API
      | id    |
      | Alice |
      | Brian |

  Scenario: Tag management
    When "Alice" creates the following files into personal space using API
      | pathToFile | content     |
      | lorem.txt  | lorem ipsum |
    And "Alice" logs in
    And "Alice" adds the following tags for the following resources using the sidebar panel
      | resource  | tags         |
      | lorem.txt | tag 1, tag 2 |
    Then the following resources should contain the following tags in the files list for user "Alice"
      | resource  | tags         |
      | lorem.txt | tag 1, tag 2 |
    Then the following resources should contain the following tags in the details panel for user "Alice"
      | resource  | tags         |
      | lorem.txt | tag 1, tag 2 |
    When "Alice" removes the following tags for the following resources using the sidebar panel
      | resource  | tags  |
      | lorem.txt | tag 1 |
    Then the following resources should contain the following tags in the files list for user "Alice"
      | resource  | tags  |
      | lorem.txt | tag 2 |
    Then the following resources should contain the following tags in the details panel for user "Alice"
      | resource  | tags  |
      | lorem.txt | tag 2 |
    When "Alice" tries to add the following tag for the following resources using the sidebar panel
      | resource  | tags                                                                                                       |
      | lorem.txt | Loremipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore |
    Then "Alice" should see the following tag validation message:
      """
      Tags must not be longer than 100 characters
      """
    And "Alice" logs out


  Scenario: Tag search
    When "Alice" creates the following files into personal space using API
      | pathToFile   | content     |
      | lorem.txt    | lorem ipsum |
      | textfile.txt | test file   |
    And "Alice" logs in
    And "Alice" adds the following tags for the following resources using the sidebar panel
      | resource  | tags       |
      | lorem.txt | tag1, tag2 |
    And "Alice" clicks the tag "tag1" on the resource "lorem.txt"
    Then the following resources should contain the following tags in the files list for user "Alice"
      | resource  | tags |
      | lorem.txt | tag1 |
    Then following resources should not be displayed in the files list for user "Alice"
      | resource     |
      | textfile.txt |
    And "Alice" logs out


  Scenario: Tag sharing
    Given "Alice" creates the following folders in personal space using API
      | name             |
      | folder_to_shared |
    And "Alice" creates the following files into personal space using API
      | pathToFile                 | content     |
      | folder_to_shared/lorem.txt | lorem ipsum |
    And "Alice" logs in
    And "Alice" adds the following tags for the following resources using the sidebar panel
      | resource                   | tags         |
      | folder_to_shared/lorem.txt | tag 1, tag 2 |
    When "Alice" shares the following resource using the sidebar panel
      | resource         | recipient | type | role                      | resourceType |
      | folder_to_shared | Brian     | user | Can edit without versions | folder       |
    And "Alice" logs out

    And "Brian" logs in
    And "Brian" navigates to the shared with me page
    Then the following resources should contain the following tags in the files list for user "Brian"
      | resource                   | tags         |
      | folder_to_shared/lorem.txt | tag 1, tag 2 |
    And "Brian" logs out
