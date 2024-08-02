Feature: Users can see all activities of the resources and spaces

  Background:
    Given "Admin" creates following users using API
      | id    |
      | Alice |
      | Brian |
    And "Admin" assigns following roles to the users using API
      | id    | role        |
      | Alice | Space Admin |

  Scenario: activity
    When "Alice" logs in
    And "Alice" creates the following project space using API
      | name | id     |
      | team | team.1 |
    And "Alice" creates the following folder in personal space using API
      | name                   |
      | sharedFolder/subFolder |
    And "Alice" shares the following resource using API
      | resource     | recipient | type | role     |
      | sharedFolder | Brian     | user | Can edit |
    And "Alice" opens the "files" app
    Then "Alice" should see activity of the following resource
      | resource     | activity                             |
      | sharedFolder | alice shared sharedFolder with brian |

    # see activity in the project space
    And "Alice" navigates to the project space "team.1"
    Then "Alice" should see activity of the space
      | activity                      |
      | alice added readme.md to team |
    And "Alice" logs out

    # see activity in the shared resources
    When "Brian" logs in
    And "Brian" navigates to the shared with me page
    Then "Brian" should see activity of the following resource
      | resource               | activity                              |
      | sharedFolder/subFolder | alice added subFolder to Alice Hansen |
    And "Brian" logs out
