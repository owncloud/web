Feature: spaces participant management

  Scenario: participant management
    Given "Admin" creates following users
      | id    |
      | Alice |
      | Brian |
      | Carol |
      | Marie |
    And "Admin" creates following group
      | id     |
      | sales   |
    And "Admin" adds user to the group
      | user  | group |
      | Marie | sales |
    And "Admin" assigns following roles to the users
      | id    | role       |
      | Alice | SpaceAdmin |
    When "Alice" logs in
    And "Alice" opens the "files" app
    And "Alice" navigates to the projects space page
    And "Alice" creates the following project spaces
      | name | id     |
      | team | team.1 |
    And "Alice" navigates to the project space "team.1"
    And "Alice" adds following members to the project space
      | user  | role   | kind  |
      | Brian | editor | user  |
      | Carol | viewer | user  |
      | sales | viewer | group |
    When "Marie" logs in
    Then "Marie" should not be able to see space "team.1"
    When "Brian" logs in
    And "Brian" navigates to the projects space page
    And "Brian" navigates to the project space "team.1"
    And "Brian" creates the following resources
      | resource | type   |
      | parent   | folder |
    And "Brian" uploads the following resources
      | resource  | to     |
      | lorem.txt | parent |
    When "Carol" logs in
    And "Carol" navigates to the projects space page
    And "Carol" navigates to the project space "team.1"
    Then "Carol" should see folder "parent" but should not be able to edit
    # page reload is necessary to fetch all the changes made by user Brian
    When "Alice" reloads the spaces page
    And "Alice" creates a public link for the resource "parent" using the sidebar panel
    And "Alice" edits the public link named "Link" of resource "parent" changing role to "editor"
    And "Anonymous" opens the public link "Link"
    And "Anonymous" uploads the following resources in public link page
      | resource     |
      | textfile.txt |
    And "Anonymous" deletes the following resources from public link
      | resource  |
      | lorem.txt |
    And "Brian" deletes the following resources
      | resource            |
      | parent/textfile.txt |
    And "Anonymous" logs out
    When "Carol" navigates to the trashbin of the project space "team.1"
    Then "Carol" should not be able to delete following resources from the trashbin
      | resource            |
      | parent/lorem.txt    |
      | parent/textfile.txt |
    And "Carol" should not be able to restore following resources from the trashbin
      | resource            |
      | parent/lorem.txt    |
      | parent/textfile.txt |
    And "Carol" logs out
    When "Brian" navigates to the trashbin of the project space "team.1"
    Then "Brian" should be able to restore following resources from the trashbin
      | resource            |
      | parent/lorem.txt    |
      | parent/textfile.txt |
    When "Alice" navigates to the projects space page
    And "Alice" navigates to the project space "team.1"
    And "Alice" removes access to following users from the project space
      | user  |
      | Brian |
    When "Brian" navigates to the projects space page
    Then "Brian" should not be able to see space "team.1"
    And "Brian" logs out
    When "Alice" changes the roles of the following users in the project space
      | user  | role    |
      | Carol | manager |
    And "Alice" as project manager removes their own access to the project space
    Then "Alice" should not be able to see space "team.1"
    And "Alice" logs out
