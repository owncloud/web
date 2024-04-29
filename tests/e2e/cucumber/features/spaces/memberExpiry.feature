Feature: spaces member expiry

  Scenario: space members can be invited with an expiration date
    Given "Admin" creates following users using API
      | id    |
      | Alice |
      | Brian |
    And "Admin" assigns following roles to the users using API
      | id    | role        |
      | Alice | Space Admin |
    And "Alice" logs in
    And "Alice" creates the following project space using API
      | name | id     |
      | team | team.1 |
    And "Alice" navigates to the project space "team.1"
    And "Alice" adds following users to the project space
      | user  | role     | kind |
      | Brian | Can edit | user |
    And "Alice" sets the expiration date of the member "Brian" of the project space to "+5 days"
    When "Brian" logs in
    And "Brian" navigates to the project space "team.1"
    And "Brian" logs out
    And "Alice" navigates to the project space "team.1"
    And "Alice" removes the expiration date of the member "Brian" of the project space
    And "Alice" logs out
