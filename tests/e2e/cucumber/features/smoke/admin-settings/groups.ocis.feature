Feature: groups management

  Scenario: admin creates group
    When "Admin" logs in
    And "Admin" opens the "admin-settings" app
    And "Admin" navigates to the groups management page
    When "Admin" creates the following groups:
      | id    |
      | sales |
    And "Admin" logs out