Feature: groups management

  Scenario: admin creates group
    When "Admin" logs in
    And "Admin" opens the "admin-settings" app
    And "Admin" navigates to the groups management page
    When "Admin" creates the following groups
      | id       |
      | sales    |
      | security |
    Then "Admin" should see the following group
      | group    |
      | sales    |
      | security |
    And "Admin" logs out


  Scenario: admin deletes group
    Given "Admin" creates following groups using API
      | id       |
      | sales    |
      | security |
      | finance  |
    And "Admin" logs in
    And "Admin" opens the "admin-settings" app
    And "Admin" navigates to the groups management page
    And "Admin" deletes the following group using the context menu
      | group |
      | sales |
    Then "Admin" should not see the following group
      | group |
      | sales |
    When "Admin" deletes the following groups using the batch actions
      | group    |
      | security |
      | finance  |
    Then "Admin" should not see the following groups
      | group    |
      | security |
      | finance  |
    And "Admin" logs out

  Scenario: edit groups
    Given "Admin" creates following user using API
      | id    |
      | Alice |
    And "Admin" creates following groups using API
      | id    |
      | sales |
    And "Admin" logs in
    And "Admin" opens the "admin-settings" app
    And "Admin" navigates to the groups management page
    When "Admin" changes displayName to "a renamed group" for group "sales" using the sidebar panel
    And "Admin" logs out

