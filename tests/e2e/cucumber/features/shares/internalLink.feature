Feature: internal link share


  Scenario: opening a link with internal role
    Given "Admin" creates following users using API
      | id    |
      | Alice |
      | Brian |
    And "Alice" creates the following folder in personal space using API
      | name     |
      | myfolder |
    And "Alice" shares the following resource using API
      | resource | recipient | type | role     |
      | myfolder | Brian     | user | Can edit |
    And "Alice" creates a public link of following resource using API
      | resource | role           |
      | myfolder | Invited people |
    And "Brian" opens the public link "Link"
    And "Brian" logs in from the internal link
    And "Brian" navigates to the shared with me page
    And "Brian" uploads the following resource
      | resource   | to       |
      | simple.pdf | myfolder |
    And "Alice" logs in
    And "Alice" updates following sharee role
      | resource | recipient | type | role     |
      | myfolder | Brian     | user | Can view |
    And "Alice" logs out
    Then "Brian" should not be able to edit folder "myfolder"
    And "Brian" logs out
