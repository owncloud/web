Feature: download space
  As a user
  I want to download the project space
  So that I can store the project's resources locally

  Scenario: download space
    Given "Admin" creates following users using API
      | id    |
      | Alice |
      | Brian |
    And "Admin" assigns following roles to the users using API
      | id    | role        |
      | Alice | Space Admin |
    And "Alice" logs in
    And "Alice" creates the following project spaces using API
      | name | id     |
      | team | team.1 |
    And "Alice" creates the following folder in space "team" using API
      | name        |
      | spaceFolder |
    And "Alice" creates the following file in space "team" using API
      | name                  | content    |
      | spaceFolder/lorem.txt | space team |
    And "Alice" navigates to the project space "team.1"
    When "Alice" downloads the space "team.1"
    And "Alice" adds following users to the project space
      | user     | role     | kind  |
      | Brian    | Can edit | user  |
    And "Alice" logs out
    And "Brian" logs in
    And "Brian" navigates to the project space "team.1"
    When "Brian" downloads the space "team.1"
    And "Brian" logs out
