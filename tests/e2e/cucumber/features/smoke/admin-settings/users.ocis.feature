Feature: spaces management

  Scenario: user login can be managed in the admin settings
    Given "Admin" creates following users
      | id    |
      | Alice |
    When "Admin" logs in
    And "Admin" opens the "admin-settings" app
    And "Admin" navigates to the users management page
    And "Admin" forbids the login for the following user "Alice" using the sidebar panel
    And "Admin" logs out
    Then "Alice" fails to log in
    When "Admin" logs in
    And "Admin" opens the "admin-settings" app
    And "Admin" navigates to the users management page
    And "Admin" allows the login for the following user "Alice" using the sidebar panel
    And "Admin" logs out
    Then "Alice" logs in
    And "Alice" logs out
