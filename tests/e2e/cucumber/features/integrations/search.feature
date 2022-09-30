Feature: Search
  As a user
  I want to search for resources
  So that I can find them quickly

  Background:
    Given "Admin" sets the default folder for received shares to "Shares"
    And "Admin" disables share auto accepting

  Scenario: Search in personal spaces
    Given "Admin" creates following users
      | id    |
      | Alice |
      | Brian |
    When "Brian" logs in
    And "Brian" opens the "files" app
    And "Brian" creates the following resources
      | resource          | type   |
      | folder_from_brian | folder |
    And "Brian" uploads the following resources
      | resource          |
      | new-lorem-big.txt |
    And "Brian" shares the following resource using the sidebar panel
      | resource          | recipient | type | role   |
      | folder_from_brian | Alice     | user | viewer |
      | new-lorem-big.txt | Alice     | user | viewer |
    And "Brian" logs out
    When "Alice" logs in
    And "Alice" navigates to the shared with me page
    And "Alice" accepts the following share
      | name              |
      | folder_from_brian |
      | new-lorem-big.txt |
    And "Alice" opens the "files" app
    And "Alice" creates the following resources
      | resource                   | type   |
      | folder                     | folder |
      | FolDer                     | folder |
      | PARENT/child               | folder |
      | PARENT/child-one           | folder |
      | PARENT/child-one/child-two | folder |
    And "Alice" enables the option to display the hidden file
    And "Alice" uploads the following resources
      | resource         |
      | new-lorem.txt    |
      | .hidden-file.txt |
    And "Alice" searches "new" using the global search
    Then following resources should be displayed in the search list for user "Alice"
      | resource          |
      | new-lorem.txt     |
      | new-lorem-big.txt |
    But following resources should not be displayed in the search list for user "Alice"
      | resource          |
      | PARENT            |
      | folder_from_brian |
      | .hidden-file.txt  |
    When "Alice" searches "foldeR" using the global search
    Then following resources should be displayed in the search list for user "Alice"
      | resource          |
      | folder            |
      | FolDer            |
      | folder_from_brian |
    But following resources should not be displayed in the search list for user "Alice"
      | resource          |
      | new-lorem.txt     |
      | new-lorem-big.txt |
      | .hidden-file.txt  |
    When "Alice" searches "hidden" using the global search
    Then following resources should be displayed in the search list for user "Alice"
      | resource         |
      | .hidden-file.txt |
    But following resources should not be displayed in the search list for user "Alice"
      | resource          |
      | folder            |
      | FolDer            |
      | PARENT            |
      | folder_from_brian |
      | new-lorem.txt     |
      | new-lorem-big.txt |
    When "Alice" opens folder "PARENT"
    And "Alice" searches "child" using the global search
    Then following resources should be displayed in the search list for user "Alice"
      | resource  |
      | child     |
      | child-one |
    When "Alice" opens folder "child-one"
    And "Alice" searches "child" using the global search
    Then following resources should be displayed in the search list for user "Alice"
      | resource  |
      | child-two |
    And "Alice" logs out
