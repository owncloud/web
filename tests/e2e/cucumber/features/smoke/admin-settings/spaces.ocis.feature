Feature: spaces management

  Scenario: spaces can be managed in the admin settings
    Given "Admin" creates following users
      | id    |
      | Alice |
      | Brian |
    And "Admin" assigns following roles to the users
      | id    | role       |
      | Alice | SpaceAdmin |
      | Brian | SpaceAdmin |
    And "Alice" creates the following project spaces using API
      | name   | id     |
      | team A | team.a |
      | team B | team.b |
    When "Alice" logs in
    And "Alice" opens the "admin-settings" app
    And "Alice" navigates to the project spaces management page
    Then "Alice" should see the following spaces
      | id     |
      | team.a |
    And "Alice" updates the quota for space "team.a" to "50"
    And "Alice" disables the space "team.a" using the context-menu
    And "Alice" deletes the space "team.a" using the context-menu
    Then "Alice" should not see the following spaces
      | id     |
      | team.a |
    And "Alice" logs out
    Then "Brian" logs in
    And "Brian" opens the "admin-settings" app
    And "Brian" navigates to the project spaces management page
    Then "Brian" should see the following spaces
      | id     |
      | team.b |
    And "Brian" updates the quota for space "team.b" to "50"
    And "Brian" disables the space "team.b" using the context-menu
    And "Brian" deletes the space "team.b" using the context-menu
    Then "Brian" should not see the following spaces
      | id     |
      | team.b |
    And "Brian" logs out


  Scenario: multiple spaces can be managed at once in the admin settings via the batch actions
    Given "Admin" creates following users
      | id    |
      | Alice |
    And "Admin" assigns following roles to the users
      | id    | role       |
      | Alice | SpaceAdmin |
    And "Alice" creates the following project spaces using API
      | name   | id     |
      | team A | team.a |
      | team B | team.b |
      | team C | team.c |
      | team D | team.d |
    When "Alice" logs in
    And "Alice" opens the "admin-settings" app
    And "Alice" navigates to the project spaces management page
    And "Alice" disables the following spaces using the batch-actions
      | id     |
      | team.a |
      | team.b |
    And "Alice" disables the following spaces using the batch-actions
      | id     |
      | team.a |
      | team.b |
      | team.c |
      | team.d |
    And "Alice" deletes the following spaces using the batch-actions
      | id     |
      | team.a |
      | team.b |
      | team.c |
      | team.d |
    And "Alice" logs out
