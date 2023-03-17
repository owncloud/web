Feature: spaces public link

  Scenario: public link for space
    Given "Admin" creates following users
      | id    |
      | Alice |
      | Brian |
      | Carol |
      | Marie |
    And "Admin" assigns following roles to the users using API
      | id    | role        |
      | Alice | Space Admin |
    And "Alice" creates the following project space using API
      | name | id     |
      | team | team.1 |
    When "Alice" logs in
    And "Alice" navigates to the projects space page
    And "Alice" navigates to the project space "team.1"
    And "Alice" creates a public link for the space using the sidebar panel
    And "Alice" renames the most recently created public link of space to "spaceLink"
    And "Alice" creates the following resources
      | resource    | type   |
      | spaceFolder | folder |
    And "Alice" creates a public link for the resource "spaceFolder" using the sidebar panel
    And "Alice" renames the most recently created public link of resource "spaceFolder" to "folderLink"
    And "Alice" adds following users to the project space
      | user  | role    | kind |
      | Brian | editor  | user |
      | Carol | viewer  | user |
      | Marie | manager | user |
    And "Alice" logs out
    When "Brian" logs in
    And "Brian" navigates to the projects space page
    And "Brian" navigates to the project space "team.1"
    Then public link named "spaceLink" should be visible to "Brian"
    But "Brian" should not be able to edit the public link named "spaceLink"
    And "Brian" logs out
    When "Marie" logs in
    And "Marie" navigates to the projects space page
    And "Marie" navigates to the project space "team.1"
    And "Marie" edits the public link named "spaceLink" of the space changing role to "editor"
    And "Marie" edits the public link named "folderLink" of resource "spaceFolder" changing role to "editor"
    And "Marie" logs out
    When "Carol" logs in
    And "Carol" navigates to the projects space page
    And "Carol" navigates to the project space "team.1"
    And public link named "spaceLink" should be visible to "Carol"
    But "Carol" should not be able to edit the public link named "spaceLink"
    And public link named "folderLink" of the resource "spaceFolder" should be visible to "Carol"
    And "Carol" logs out
