Feature: download space
  As a user
  I want to download the space
  So that I can store it locally

  Scenario: download space
    Given "Admin" creates following users using API
      | id    |
      | Alice |
      | Brian |
    And "Admin" assigns following roles to the users using API
      | id    | role        |
      | Alice | Space Admin |
    And "Alice" logs in
    And "Alice" opens the "files" app
    And "Alice" navigates to the projects space page
    And "Alice" creates the following project spaces
      | name | id     |
      | team | team.1 |
    And "Alice" navigates to the project space "team.1"
    And "Alice" creates the following resources
      | resource    | type   |
      | spaceFolder | folder |
    And "Alice" uploads the following resources
      | resource  | to          |
      | lorem.txt | spaceFolder |
    When "Alice" downloads the space "team.1"
    And "Alice" adds following users to the project space
      | user     | role     | kind  |
      | Brian    | Can edit | user  |
    And "Alice" logs out
    And "Brian" logs in
    And "Brian" opens the "files" app
    And "Brian" navigates to the projects space page
    And "Brian" navigates to the project space "team.1"
    When "Brian" downloads the space "team.1"
    And "Brian" logs out
