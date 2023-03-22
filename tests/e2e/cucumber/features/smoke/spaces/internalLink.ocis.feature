Feature: internal link share in project space

  Scenario: share a link with internal role
    Given "Admin" creates following users using API
      | id    |
      | Alice |
      | Brian |
    And "Admin" assigns following roles to the users using API
      | id    | role        |
      | Alice | Space Admin |
    And "Alice" creates the following project space using API
      | name      | id          |
      | Marketing | marketing.1 |
    And "Alice" creates the following folder in space "Marketing" using API
      | name     |
      | myfolder |
    And "Alice" creates the following file in space "Marketing" using API
      | name              | content     |
      | myfolder/plan.txt | secret plan |
    And "Alice" logs in
    And "Alice" navigates to the projects space page
    And "Alice" navigates to the project space "marketing.1"
    And "Alice" adds following users to the project space
      | user  | role   | kind |
      | Brian | editor | user |
    And "Alice" creates a public link for the resource "myfolder" using the sidebar panel
    When "Alice" edits the public link named "Link" of resource "myfolder" changing role to "internal"
    And "Brian" opens the public link "Link"
    And "Brian" logs in from the internal link
    And "Brian" uploads the following resource in internal link named "Link"
      | resource   |
      | simple.pdf |
    When "Alice" changes the roles of the following users in the project space
      | user  | role   |
      | Brian | viewer |
    And "Alice" logs out
    And "Brian" reloads the spaces page
    Then "Brian" should see file "plan.txt" but should not be able to edit
    And "Brian" logs out
