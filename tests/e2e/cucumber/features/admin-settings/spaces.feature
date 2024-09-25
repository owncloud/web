Feature: spaces management

  Scenario: spaces can be managed in the admin settings via the context menu
    Given "Admin" creates following users using API
      | id    |
      | Alice |
      | Brian |
#    And "Admin" assigns following roles to the users using API
#      | id    | role        |
#      | Alice | Space Admin |
#      | Brian | Space Admin |
    When "Alice" logs in
    When "Alice" opens folder "mainFoder"
#    And "Alice" creates the following project spaces using API
#      | name   | id     |
#      | team A | team.a |
#      | team B | team.b |
    When "Alice" opens the "admin-settings" app
#    And "Alice" navigates to the project spaces management page
#    When "Alice" updates the space "team.a" name to "developer team" using the context-menu
#    And "Alice" updates the space "team.a" subtitle to "developer team-subtitle" using the context-menu
#    And "Alice" updates the space "team.a" quota to "50" using the context-menu
#    And "Alice" disables the space "team.a" using the context-menu
#    And "Alice" enables the space "team.a" using the context-menu
#    Then "Alice" should see the following spaces
#      | id     |
#      | team.a |
#    And "Alice" logs out
#    When "Brian" logs in
#    And "Brian" opens the "admin-settings" app
#    And "Brian" navigates to the project spaces management page
#    When "Brian" disables the space "team.b" using the context-menu
#    And "Brian" deletes the space "team.b" using the context-menu
#    Then "Brian" should not see the following spaces
#      | id     |
#      | team.b |
#    And "Brian" logs out

  Scenario: multiple spaces can be managed at once in the admin settings via the batch actions
    Given "Admin" creates following user using API
      | id    |
      | Alice |
    And "Admin" assigns following roles to the users using API
      | id    | role        |
      | Alice | Space Admin |
    And "Alice" logs in
    And "Alice" creates the following project spaces using API
      | name   | id     |
      | team A | team.a |
      | team B | team.b |
      | team C | team.c |
      | team D | team.d |
    When "Alice" opens the "admin-settings" app
#    And "Alice" navigates to the project spaces management page
#    And "Alice" disables the following spaces using the batch-actions
#      | id     |
#      | team.a |
#      | team.b |
#      | team.c |
#      | team.d |
#    And "Alice" enables the following spaces using the batch-actions
#      | id     |
#      | team.a |
#      | team.b |
#      | team.c |
#      | team.d |
#    And "Alice" updates quota of the following spaces to "50" using the batch-actions
#      | id     |
#      | team.a |
#      | team.b |
#      | team.c |
#      | team.d |
#    And "Alice" disables the following spaces using the batch-actions
#      | id     |
#      | team.a |
#      | team.b |
#      | team.c |
#      | team.d |
#    And "Alice" deletes the following spaces using the batch-actions
#      | id     |
#      | team.a |
#      | team.b |
#      | team.c |
#      | team.d |
#    Then "Alice" should not see the following spaces
#      | id     |
#      | team.a |
#      | team.b |
#      | team.c |
#      | team.d |
    And "Alice" logs out


  Scenario: list members via sidebar
    Given "Admin" creates following users using API
      | id    |
      | Alice |
      | Brian |
      | Carol |
      | David |
      | Edith |
    And "Admin" assigns following roles to the users using API
      | id    | role        |
      | Alice | Space Admin |
    And "Admin" creates the following project spaces using API
      | name   | id     |
      | team A | team.a |
    And "Admin" adds the following members to the space "team A" using API
      | user  | role     | shareType |
      | Brian | Can edit | user      |
      | Carol | Can view | user      |
      | David | Can view | user      |
      | Edith | Can view | user      |
    When "Alice" logs in
    And "Alice" opens the "admin-settings" app
    When "Alice" opens folder "mainFoder"
#    And "Alice" navigates to the project spaces management page
#    When "Alice" lists the members of project space "team.a" using a sidebar panel
#    Then "Alice" should see the following users in the sidebar panel of spaces admin settings
#      | user  | role       |
#      | Admin | Can manage |
#      | Brian | Can edit   |
#      | Carol | Can view   |
#      | David | Can view   |
#      | Edith | Can view   |
#    And "Alice" logs out


  Scenario: admin user can manage the spaces created by other space admin user
    Given "Admin" creates following users using API
      | id    |
      | Alice |
      | Brian |
      | Carol |
    And "Admin" assigns following roles to the users using API
      | id    | role        |
      | Alice | Admin       |
      | Brian | Space Admin |
      | Carol | Space Admin |
    When "Brian" logs in
    And "Brian" creates the following project spaces using API
      | name   | id     |
      | team A | team.a |
    And "Brian" logs out
#    When "Carol" logs in
#    And "Carol" creates the following project spaces using API
#      | name   | id     |
#      | team B | team.b |
#    And "Carol" logs out
#    When "Alice" logs in
#    And "Alice" opens the "admin-settings" app
#    And "Alice" navigates to the project spaces management page
#    And "Alice" updates quota of the following spaces to "50" using the batch-actions
#      | id     |
#      | team.a |
#      | team.b |
#    And "Alice" disables the following spaces using the batch-actions
#      | id     |
#      | team.a |
#      | team.b |
#    And "Alice" enables the following spaces using the batch-actions
#      | id     |
#      | team.a |
#      | team.b |
#    And "Alice" disables the following spaces using the batch-actions
#      | id     |
#      | team.a |
#      | team.b |
#    And "Alice" deletes the following spaces using the batch-actions
#      | id     |
#      | team.a |
#      | team.b |
#    Then "Alice" should not see the following spaces
#      | id     |
#      | team.a |
#      | team.b |
#    And "Alice" logs out
