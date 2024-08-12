Feature: Refresh Access Token

  As a user
  I want the web application to automatically refresh its access token using a refresh token,
  So that I can be confident the application will not encounter issues related to expired access tokens.


  Scenario: validate access token
    Given "Admin" creates following users using API
      | id    |
      | Alice |
    And "Admin" assigns following roles to the users using API
      | id    | role        |
      | Alice | Space Admin |
    And "Alice" logs in
    And "Alice" opens the "files" app
    And "Alice" navigates to the projects space page
    And "Alice" creates the following project spaces
      | name  | id     |
      | team  | team.1 |
    When "Alice" access token expires, refresh token renews access token
    And "Alice" navigates to the project space "team.1"
    And "Alice" creates the following resources
      | resource     | type   |
      | space-folder | folder |
    Then following resources should be displayed in the files list for user "Alice"
      | resource     |
      | space-folder |
    When "Alice" access token expires, refresh token renews access token
    And "Alice" opens the "admin-settings" app
    And "Alice" navigates to the groups management page
    When "Alice" creates the following groups
      | id       |
      | sales    |
      | security |
    Then "Alice" should see the following group
      | group    |
      | sales    |
      | security |
    And "Alice" logs out
