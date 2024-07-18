Feature: check files pagination in personal space
  As a user
  I want to navigate a large number of files using pagination
  So that I do not have to scroll deep down

  # please enable test again after fixing https://github.com/owncloud/ocis/issues/9648
  # and delete personalSpacePagination.feature:29 test
  # Scenario: pagination
  #   Given "Admin" creates following user using API
  #     | id    |
  #     | Alice |
  #   And "Alice" logs in
  #   And "Alice" creates 55 folders in personal space using API
  #   And "Alice" creates 55 files in personal space using API
  #   And "Alice" creates the following files into personal space using API
  #     | pathToFile           | content                |
  #     | .hidden-testFile.txt | This is a hidden file. |
  #   And "Alice" opens the "files" app
  #   When "Alice" navigates to page "2" of the personal space files view
  #   Then "Alice" should see the text "111 items with 1 kB in total (56 files including 1 hidden, 55 folders)" at the footer of the page
  #   And "Alice" should see 10 resources in the personal space files view
  #   When "Alice" enables the option to display the hidden file
  #   Then "Alice" should see 11 resources in the personal space files view
  #   When "Alice" changes the items per page to "500"
  #   Then "Alice" should not see the pagination in the personal space files view
  #   And "Alice" logs out


  Scenario: pagination
    Given "Admin" creates following user using API
      | id    |
      | Alice |
    And "Alice" logs in
    And "Alice" creates 100 folders in personal space using API
    And "Alice" creates the following files into personal space using API
      | pathToFile           | content                |
      | .hidden-testFile.txt | This is a hidden file. |
      | test.txt             | content                |
    And "Alice" opens the "files" app
    When "Alice" navigates to page "2" of the personal space files view
    Then "Alice" should see the text "102 items with 29 B in total (2 files including 1 hidden, 100 folders)" at the footer of the page
    And "Alice" should see 1 resources in the personal space files view
    When "Alice" enables the option to display the hidden file
    Then "Alice" should see 2 resources in the personal space files view
    When "Alice" changes the items per page to "500"
    Then "Alice" should not see the pagination in the personal space files view
    And "Alice" logs out
