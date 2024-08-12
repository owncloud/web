Feature: Token renewal using iframe

  As a user
  I want the web application to automatically renew access token just before access token expires using an iframe in the background,
  So that I can be confident the application will not encounter issues related to expired access tokens.


  Scenario: access token renewal via iframe
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
      | name | id     |
      | team | team.1 |
    When "Alice" waits for token renewal via iframe
    And "Alice" navigates to the project space "team.1"
    And "Alice" creates the following resources
      | resource     | type   |
      | space-folder | folder |
    Then following resources should be displayed in the files list for user "Alice"
      | resource     |
      | space-folder |
    And "Alice" logs out
