Feature: Token renewal using refresh token

  As a user
  I want the web application to automatically refresh its access token using a refresh token,
  So that I can be confident the application will not encounter issues related to expired access tokens.


  Scenario: access token renewal via refresh token
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
    When "Alice" waits for token renewal via refresh token
    And "Alice" navigates to the project space "team.1"
    And "Alice" creates the following resources
      | resource     | type   |
      | space-folder | folder |
    Then following resources should be displayed in the files list for user "Alice"
      | resource     |
      | space-folder |
    When "Alice" navigates to new tab
    And "Alice" waits for token to expire
    And "Alice" closes the current tab
    And "Alice" opens the "files" app
    And "Alice" creates the following resources
      | resource          | type    | content   |
      | PARENT/parent.txt | txtFile | some text |
    And "Alice" logs out
