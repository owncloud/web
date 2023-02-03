Feature: internal link share in project space

  Scenario: share a link with internal role
    Given "Admin" creates following users
      | id    |
      | Alice |
      | Brian |
    And "Admin" assigns following roles to the users
        | id    | role       |
        | Alice | SpaceAdmin |
    And "Alice" creates the following project space using API
      | name | id        |
      | team | marketing |
    And "Alice" creates the following folder in space "marketing" using API
      | name     |
      | Strategy |
    And "Alice" creates the following file in space "marketing" using API
      | name              | content     |
      | Strategy/plan.txt | secret plan |
    And "Alice" shares the following resource using API
      | resource | recipient | type | role   |
      | myfolder | Brian     | user | editor |
    And "Alice" logs in
    And "Alice" opens the "files" app
    And "Alice" creates a public link for the resource "myfolder" using the sidebar panel
    When "Alice" edits the public link named "Link" of resource "myfolder" changing role to "internal"
    And "Brian" opens the public link "Link"
    And "Brian" logs in from the internal link
    And "Brian" opens shared-with-me page from the internal link
    And "Brian" accepts the following share
      | name     |
      | myfolder |
    And "Brian" uploads the following resource
      | resource   | to       |
      | simple.pdf | myfolder |
    And "Alice" updates following sharee role
      | resource | recipient | type | role                    |
      | myfolder | Brian     | user | custom_permissions:read |
    And "Alice" logs out
    Then "Brian" should see folder "myfolder" but should not be able to edit
    And "Brian" logs out
