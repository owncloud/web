Feature: Notifications
  As a user
  I want to be notified
  About new things that concern me

  Background:
    Given "Admin" creates following users using API
      | id    |
      | Alice |
      | Brian |
    And "Admin" sets the default folder for received shares to "Shares"
    And "Admin" disables share auto accepting

  Scenario: User should be able to read and dismiss notifications
    Given "Alice" creates the following folder in personal space using API
      | name             |
      | folder_to_shared |
    And "Alice" logs in
    And "Alice" opens the "files" app
    And "Alice" shares the following resource using the sidebar panel
      | resource         | recipient | type | role   | resourceType |
      | folder_to_shared | Brian     | user | editor | folder       |
    When "Brian" logs in
    Then "Brian" should see the following notifications
      | message                                               |
      | "Alice Hansen" invited you to view "folder_to_shared" |
    And "Brian" marks all notifications as read
    Then "Brian" should see no notifications
    And "Alice" logs out
    And "Brian" logs out
