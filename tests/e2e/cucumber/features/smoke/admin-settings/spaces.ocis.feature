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
    When "Alice" logs in
    And "Alice" opens the "files" app
    And "Alice" navigates to the projects space page
    And "Alice" creates the following project spaces
      | name   | id     |
      | team A | team.a |
      | team B | team.b |
    And "Alice" opens the "admin-settings" app
    And "Alice" navigates to the project spaces management page
    Then "Alice" should see the following spaces
      | id     |
      | team.a |
    And "Alice" updates the quota for space "team.a" to "50"
    And "Alice" disables the space "team.a" using the context-menu
    And "Alice" deletes the space "team.a" using the context-menu
    And "Alice" disables the space "team.b" using the context-menu
    And "Alice" deletes the space "team.b" using the context-menu
    Then "Alice" should not see the following spaces
      | id     |
      | team.a |
    And "Alice" logs out
# TODO: Comment in as soon as https://github.com/owncloud/ocis/issues/5414 is resolved
#    Then "Brian" logs in
#    And "Brian" opens the "admin-settings" app
#    And "Brian" navigates to the project spaces management page
#    Then "Brian" should see the following spaces
#      | id     |
#      | team.b |
#    And "Brian" updates the quota for space "team.b" to "50"
#    And "Brian" disables the space "team.b"
#    And "Brian" deletes the space "team.b"
#    Then "Brian" should not see the following spaces
#      | id     |
#      | team.b |
#    And "Brian" logs out
  Scenario: multiple spaces can be managed at once in the admin settings
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
      | name   | id     |
      | team A | team.a |
      | team B | team.b |
      | team C | team.c |
      | team D | team.d |
      | team E | team.e |
      | team F | team.f |
      | team G | team.g |
      | team H | team.h |
      | team I | team.i |
      | team J | team.j |
    And "Alice" opens the "admin-settings" app
    And "Alice" navigates to the project spaces management page
    And "Alice" disables the following spaces using the batch-actions
      | name   |
      | team.a |
      | team.b |
    And "Alice" disables the following spaces using the batch-actions
      | name   |
      | team.a |
      | team.b |
      | team.c |
      | team.d |
      | team.e |
      | team.f |
      | team.g |
      | team.h |
    Then "Alice" should still have selected the spaces and the batch-action disable gone
    #Cleanup spaces
    And "Alice" disables the following spaces using the batch-actions
      | name   |
      | team.a |
      | team.b |
      | team.c |
      | team.d |
      | team.e |
      | team.f |
      | team.g |
      | team.h |
      | team.i |
      | team.j |
    And "Alice" deletes the following spaces using the batch-actions
      | name   |
      | team.a |
      | team.b |
      | team.c |
      | team.d |
      | team.e |
      | team.f |
      | team.g |
      | team.h |
      | team.i |
      | team.j |
