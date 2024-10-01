Feature: federation management

  Scenario: user create federated share
    Given "Admin" logs in
    And "Admin" creates following user using API
      | id    |
      | Alice |
    And "Admin" opens the "admin-settings" app
    And "Admin" navigates to the users management page
