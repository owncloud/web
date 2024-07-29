Feature: Refresh Access Token

  As a user
  I want the web application to automatically refresh its access token using a refresh token,
  So that I can be confident the application will not encounter issues related to expired access tokens.

#  reset access token to  5 min
  Scenario: validate access token
    Given "Admin" creates following users using API
      | id    |
      | Alice |
    And "Admin" assigns following roles to the users using API
      | id    | role        |
      | Alice | Space Admin |
    And "Alice" logs in
    When "Alice" access token expires, refresh token request for new access token
    And "Alice" creates the following project space using API
      | name | id     |
      | team | team.1 |
    And "Alice" navigates to the project space "team.1"
    And "Alice" creates the following folder in space "team" using API
      | name         |
      | space-folder |
    Then "Alice" should get "folder-created" SSE event
    And following resources should be displayed in the files list for user "Alice"
      | resource     |
      | space-folder |
