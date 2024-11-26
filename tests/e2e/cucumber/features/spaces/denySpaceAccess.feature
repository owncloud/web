Feature: deny space access

  Scenario: deny and grant access
    Given "Admin" creates following users using API
      | id    |
      | Alice |
      | Brian |
    And "Admin" assigns following roles to the users using API
      | id    | role        |
      | Alice | Space Admin |
    And "Alice" logs in
    And "Alice" creates the following project space using API
      | name  | id    |
      | sales | sales |
    And "Alice" creates the following folder in space "sales" using API
      | name |
      | f1   |
      | f2   |
    And "Alice" adds the following members to the space "sales" using API
      | user  | role     | shareType |
      | Brian | Can edit | user      |

    When "Alice" navigates to the project space "sales"
    # deny access
    When "Alice" shares the following resource using the sidebar panel
      | resource | recipient | type | role          | resourceType |
      | f1       | Brian     | user | Cannot access | folder       |
    And "Brian" logs in
    And "Brian" navigates to the project space "sales"
    Then following resources should not be displayed in the files list for user "Brian"
      | resource |
      | f1       |
    But following resources should be displayed in the files list for user "Brian"
      | resource |
      | f2       |
    # allow access - deleting "Cannot access" share
    When "Alice" removes following sharee
      | resource | recipient |
      | f1       | Brian     |
    And "Brian" navigates to the project space "sales"
    Then following resources should be displayed in the files list for user "Brian"
      | resource |
      | f1       |
      | f2       |
    And "Brian" logs out
    And "Alice" logs out
