Feature: internal link share in project space

  Scenario: share a link with internal role
    Given "Admin" creates following users using API
      | id    |
      | Alice |
      | Brian |
      | Carol |
    And "Admin" assigns following roles to the users using API
      | id    | role        |
      | Alice | Space Admin |
    And "Alice" logs in
    And "Alice" creates the following project space using API
      | name      | id          |
      | Marketing | marketing.1 |
    And "Alice" creates the following folder in space "Marketing" using API
      | name     |
      | myfolder |
    And "Alice" creates the following file in space "Marketing" using API
      | name              | content     |
      | myfolder/plan.txt | secret plan |
    And "Alice" adds the following members to the space "Marketing" using API
      | user  | role     | shareType |
      | Brian | Can edit | user      |
      | Carol | Can view | user      |
    And "Alice" navigates to the project space "marketing.1"
    # internal link to space

    And "Alice" creates a public link for the space with password "%public%" using the sidebar panel
    And "Alice" renames the most recently created public link of space to "spaceLink"
    And "Alice" edits the public link named "spaceLink" of the space changing role to "Invited people"
    # internal link to folder
    And "Alice" creates a public link of following resource using the sidebar panel
      | resource | role           | password |
      | myfolder | Invited people | %public% |
    And "Alice" logs out

    And "Brian" opens the public link "Link"
    And "Brian" logs in from the internal link
    And "Brian" uploads the following resource in internal link named "Link"
      | resource   |
      | simple.pdf |
    And "Brian" logs out

    When "Carol" opens the public link "spaceLink"
    And "Carol" logs in from the internal link
    And "Carol" opens folder "myfolder"
    Then "Carol" should not be able to edit file "simple.pdf"
    And "Carol" logs out
