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
    And "Alice" disables the space "team.a"
    And "Alice" deletes the space "team.a"
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
