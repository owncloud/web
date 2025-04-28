@predefined-users
Feature: check files pagination in personal space
  As a user
  I want to navigate a large number of files using pagination
  So that I do not have to scroll deep down


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
     When "Alice" navigates to page "2" of the personal space files view
     Then "Alice" should see the text "111 items with 1 kB in total (56 files including 1 hidden, 55 folders)" at the footer of the page
     And "Alice" should see 10 resources in the personal space files view
     When "Alice" enables the option to display the hidden file
     Then "Alice" should see 11 resources in the personal space files view
     When "Alice" changes the items per page to "500"
     Then "Alice" should not see the pagination in the personal space files view
     And "Alice" logs out
