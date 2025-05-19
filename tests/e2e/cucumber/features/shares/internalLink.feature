@predefined-users
Feature: internal link share


  Scenario: opening a link with internal role
    Given "Admin" creates following users using API
      | id    |
      | Alice |
      | Brian |
    And "Alice" logs in
    And "Brian" logs in
    And "Alice" creates the following folder in personal space using API
      | name     |
      | myfolder |
    And "Alice" shares the following resource using API
      | resource | recipient | type | role     | resourceType |
      | myfolder | Brian     | user | Can edit | folder       |
    And "Alice" creates a public link of following resource using API
      | resource | role           |
      | myfolder | Invited people |
    When "Brian" opens the public link "Unnamed link"
    And "Brian" navigates to the shared with me page
    And "Brian" uploads the following resource
      | resource   | to       |
      | simple.pdf | myfolder |
    And "Alice" updates following sharee role
      | resource | recipient | type | role     | resourceType |
      | myfolder | Brian     | user | Can view | folder       |
    And "Alice" logs out
    Then "Brian" should not be able to edit folder "myfolder"
    And "Brian" logs out
