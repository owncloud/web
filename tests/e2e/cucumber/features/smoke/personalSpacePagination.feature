Feature: check files pagination in personal space
  As a user
  I want to check the pagination of files
  So that I can ensure files are displayed with proper page numbers

  Scenario: pagination
    Given "Admin" creates following user using API
      | id    |
      | Alice |
    And "Alice" creates 55 folders in personal space using API
    And "Alice" creates 55 files in personal space using API
    And "Alice" creates the following files into personal space using API
      | pathToFile           | content                |
      | .hidden-testFile.txt | This is a hidden file. |
    And "Alice" logs in
    And "Alice" opens the "files" app
    When "Alice" navigates to the page "2" of personal space files view
    Then "Alice" should see the text "111 items with 1 kB in total (56 files, 55 folders)" at the footer of the page
    And "Alice" should see 10 resources in the personal space files view
    When "Alice" enables the option to display the hidden file
    Then "Alice" should see 11 resources in the personal space files view
    When "Alice" changes the items per page to "500"
    Then "Alice" should not see page numbers at the footer of the personal space page
