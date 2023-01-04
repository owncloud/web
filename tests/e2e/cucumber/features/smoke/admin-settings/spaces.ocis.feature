Feature: spaces management

  Scenario: spaces can be listed in the admin settings
    Given "Admin" creates following users
      | id    |
      | Alice |
      | Brian |
    And "Admin" assigns following roles to the users
      | id    | role       |
      | Alice | SpaceAdmin |
      | Brian | SpaceAdmin |
    When "Alice" logs in
    And "Alice" opens the "files" app
    And "Alice" navigates to the projects space page
    And "Alice" creates the following project spaces
      | name | id     |
      | team | team.1 |
    And "Alice" logs out
    Then "Brian" logs in
    And "Brian" opens the "admin-settings" app
    And "Brian" navigates to the project spaces management page
    Then "Brian" should see the following spaces
      | name |
      | team |
    And "Brian" logs out
