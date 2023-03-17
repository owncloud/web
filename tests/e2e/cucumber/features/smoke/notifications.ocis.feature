Feature: Notifications
  As a user
  I want to be notified
  About new things that concern me

  Background:
    Given "Admin" creates following users
      | id    |
      | Alice |
      | Brian |
    And "Admin" assigns following roles to the users using API
      | id    | role        |
      | Alice | Space Admin |

  Scenario: User should be able to read and dismiss notifications
    Given "Alice" creates the following folder in personal space using API
      | name             |
      | folder_to_shared |
    And "Alice" creates the following project space using API
      | name | id     |
      | team | team.1 |
    And "Alice" logs in
    And "Alice" opens the "files" app
    And "Alice" shares the following resource using the sidebar panel
      | resource         | recipient | type | role   | resourceType |
      | folder_to_shared | Brian     | user | editor | folder       |
    And "Alice" navigates to the projects space page
    And "Alice" navigates to the project space "team.1"
    And "Alice" adds following users to the project space
      | user  | role   | kind |
      | Brian | editor | user |
    When "Brian" logs in
    Then "Brian" should see the following notifications
      | message                                       |
      | Alice Hansen shared folder_to_shared with you |
      | Alice Hansen added you to Space team          |
    And "Brian" marks all notifications as read
    Then "Brian" should see no notifications
    When "Alice" opens the "files" app
    And "Alice" removes following sharee
      | resource         | recipient |
      | folder_to_shared | Brian     |
    And "Alice" navigates to the projects space page
    And "Alice" navigates to the project space "team.1"
    And "Alice" removes access to following users from the project space
      | user  | role   | kind |
      | Brian | editor | user |
    When "Brian" reloads the page
    Then "Brian" should see the following notifications
      | message                                         |
      | Alice Hansen unshared folder_to_shared with you |
      | Alice Hansen removed you from Space team        |
    And "Brian" marks all notifications as read
    Then "Brian" should see no notifications
    And "Brian" logs out
    When "Alice" opens the "admin-settings" app
    And "Alice" navigates to the project spaces management page
    And "Alice" disables the space "team.1" using the context-menu
    And "Alice" reloads the page
    Then "Alice" should see the following notifications
      | message                          |
      | Alice Hansen disabled Space team |
    And "Alice" deletes the space "team.1" using the context-menu
    And "Alice" reloads the page
    Then "Alice" should see the following notifications
      | message                         |
      | Alice Hansen deleted Space team |
    And "Alice" logs out
