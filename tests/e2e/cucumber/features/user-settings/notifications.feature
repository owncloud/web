Feature: Notifications
  As a user
  I want to be notified
  So that I can stay updated about the information

  Scenario: User should be able to read and dismiss notifications
    Given "Admin" creates following users using API
      | id    |
      | Alice |
      | Brian |
      | Carol |
    And "Admin" assigns following roles to the users using API
      | id    | role        |
      | Alice | Space Admin |
    And "Admin" creates following groups using API
      | id    |
      | sales |
    And "Admin" adds user to the group using API
      | user  | group |
      | Alice | sales |
      | Brian | sales |
    And "Alice" creates the following folder in personal space using API
      | name             |
      | folder_to_shared |
      | share_to_group   |
    And "Alice" creates the following project space using API
      | name | id     |
      | team | team.1 |
      | team2 | team.2 |
    And "Alice" logs in
    When "Alice" shares the following resource using the sidebar panel
      | resource         | recipient | type  | role     | resourceType |
      | folder_to_shared | Brian     | user  | Can edit | folder       |
      | share_to_group   | sales     | group | Can edit | folder       |
    And "Brian" logs in
    Then "Brian" should see the following notifications
      | message                                       |
      | Alice Hansen shared folder_to_shared with you |
      | Alice Hansen shared share_to_group with you   |
    And "Brian" marks all notifications as read
    When "Alice" removes following sharee
      | resource         | recipient |
      | folder_to_shared | Brian     |
    And "Alice" navigates to the project space "team.1"
    And "Alice" adds following users to the project space
      | user  | role     | kind |
      | Brian | Can edit | user |
      | Carol | Can edit | user |
    Then "Alice" should see no notifications
    And "Brian" should see the following notifications
      | message                                         |
      | Alice Hansen unshared folder_to_shared with you |
      | Alice Hansen added you to Space team            |
    And "Brian" marks all notifications as read
    When "Alice" removes access to following users from the project space
      | user  | role     | kind |
      | Carol | Can edit | user |
    And "Carol" logs in
    Then "Carol" should see the following notifications
      | message                                  |
      | Alice Hansen added you to Space team     |
      | Alice Hansen removed you from Space team |
    And "Carol" logs out
    When "Alice" opens the "admin-settings" app
    And "Alice" navigates to the project spaces management page
    And "Alice" disables the space "team.1" using the context-menu
    Then "Brian" should see the following notifications
      | message                          |
      | Alice Hansen disabled Space team |
    When "Alice" deletes the space "team.1" using the context-menu
    Then "Brian" should see the following notifications
      | message                         |
      | Alice Hansen deleted Space team |

    # test for disabling notification
    And "Brian" marks all notifications as read
    And "Brian" opens the user menu
#    When user "Brian" disables notification for the following event
#      | event                   |
#      | Share Received          |
#      | Share Removed           |
##      | Share Expired           |
#      | Added as space member   |
#      | Removed as space member |
#      | Space disabled          |
#      | Space deleted           |
    And "Alice" opens the "files" app
    And "Alice" shares the following resource using the sidebar panel
      | resource         | recipient | type  | role     | resourceType |
      | folder_to_shared | Brian     | user  | Can edit | folder       |
#    And "Alice" sets the expiration date of share "folder_to_shared" of user "Brian" to "+5 days"
    And "Alice" removes following sharee
      | resource         | recipient |
      | folder_to_shared | Brian     |
    # space
    And "Alice" navigates to the project space "team.2"
    And "Alice" adds following users to the project space
      | user  | role     | kind |
      | Brian | Can edit | user |
    And "Alice" removes access to following users from the project space
      | user  | role     | kind |
      | Brian | Can edit | user |
#    And "Alice" opens the "admin-settings" app
#    And "Alice" navigates to the project spaces management page
#    And "Alice" disables the space "team.2" using the context-menu
#    And "Alice" deletes the space "team.2" using the context-menu
    Then "Brian" should see no notification
    And "Brian" logs out
    And "Alice" logs out
