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


  Scenario: admin user can change personal quotas for users
    Given "Admin" creates following users
      | id    |
      | Alice |
      | Brian |
    And "Alice" logs in
    And "Brian" logs in
    And "Admin" logs in
    And "Admin" opens the "admin-settings" app
    And "Admin" navigates to the users management page
    When "Admin" changes the quota of the user "Alice" to "500"
    Then "Alice" should have quota "500"
    When "Admin" changes the quota using a batch action to "20" for users: 
      | id    |
      | Alice |
      | Brian |
    Then "Alice" should have quota "20"
    And "Brian" should have quota "20"
    And "Brian" logs out
    And "Alice" logs out
    And "Admin" logs out

