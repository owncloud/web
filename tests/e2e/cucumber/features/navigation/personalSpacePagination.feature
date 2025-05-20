@predefined-users
Feature: check files pagination in personal space
  As a user
  I want to navigate a large number of files using pagination
  So that I do not have to scroll deep down


  Scenario: pagination
    Given "Admin" creates following user using API
      | id    |
      | Alice |
    And "Alice" logs in
    And "Alice" creates 15 folders in personal space using API
    And "Alice" creates 10 files in personal space using API
    And "Alice" creates the following files into personal space using API
      | pathToFile           | content                |
      | .hidden-testFile.txt | This is a hidden file. |
    When "Alice" opens the "files" app
    And "Alice" changes the items per page to "20"
    Then "Alice" should see the text "26 items with 223 B in total (11 files including 1 hidden, 15 folders)" at the footer of the page
    When "Alice" navigates to page "2" of the personal space files view
    Then "Alice" should see 5 resources in the personal space files view
    When "Alice" enables the option to display the hidden file
    Then "Alice" should see 6 resources in the personal space files view
    When "Alice" changes the items per page to "500"
    Then "Alice" should not see the pagination in the personal space files view
    And "Alice" logs out
