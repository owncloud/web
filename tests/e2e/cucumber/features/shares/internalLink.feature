Feature: internal link share


  Scenario: share a link with internal role
    Given "Admin" creates following users using API
      | id    |
      | Alice |
      | Brian |
    And "Alice" logs in
    And "Alice" creates the following folder in personal space using API
      | name     |
      | myfolder |
    And "Alice" shares the following resource using API
      | resource | recipient | type | role     |
      | myfolder | Brian     | user | Can edit |
    And "Alice" opens the "files" app
    And "Alice" creates a public link of following resource using the sidebar panel
      | resource | password |
      | myfolder | %public% |
    When "Alice" edits the public link named "Link" of resource "myfolder" changing role to "Invited people"
    And "Brian" opens the public link "Link"
    And "Brian" logs in from the internal link
    And "Brian" navigates to the shared with me page
    And "Brian" uploads the following resource
      | resource   | to       |
      | simple.pdf | myfolder |
    And "Alice" updates following sharee role
      | resource | recipient | type | role                    |
      | myfolder | Brian     | user | custom_permissions:read |
    And "Alice" logs out
    Then "Brian" should see folder "myfolder" but should not be able to edit
    And "Brian" logs out
