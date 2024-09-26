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
    When "Alice" creates the following project space using API
      | name | id     |
      | team | team.1 |
    And "Alice" creates the following folder in personal space using API
      | name                   |
      | sharedFolder/subFolder |
    And "Alice" shares the following resource using API
      | resource     | recipient | type | role     |
      | sharedFolder | Brian     | user | Can edit |
    And "Alice" logs in
    Then "Alice" should see activity of the following resource
      | resource     | activity                                    |
      | sharedFolder | Alice Hansen shared sharedFolder with brian |

    # see activity in the project space
    And "Alice" navigates to the project space "team.1"
    Then "Alice" should see activity of the space
      | activity                               |
      | Alice Hansen added readme.md to .space |
    And "Alice" logs out

    # see activity in the shared resources
    When "Brian" logs in
    And "Brian" navigates to the shared with me page
    Then "Brian" should not see any activity of the following resource
      | resource               |
      | sharedFolder/subFolder |
    And "Brian" logs out
