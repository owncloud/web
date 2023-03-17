Feature: spaces participant management

  Scenario: participant management
    Given "Admin" creates following users
      | id      |
      | Alice   |
      | Brian   |
      | Carol   |
      | Marie   |
      | Richard |
    And "Admin" creates following group using API
      | id       |
      | sales    |
      | security |
    And "Admin" adds user to the group using API
      | user    | group    |
      | Marie   | sales    |
      | Richard | security |
    And "Admin" assigns following roles to the users using API
      | id    | role        |
      | Alice | Space Admin |
    And "Alice" creates the following project space using API
      | name | id     |
      | team | team.1 |
    When "Alice" logs in
    And "Alice" opens the "files" app
    And "Alice" navigates to the projects space page
    And "Alice" navigates to the project space "team.1"
    And "Alice" adds following users to the project space
      | user     | role   | kind  |
      | Brian    | editor | user  |
      | Carol    | viewer | user  |
      | sales    | viewer | group |
      | security | editor | group |
    When "Brian" logs in
    And "Brian" navigates to the projects space page
    And "Brian" navigates to the project space "team.1"
    And "Brian" creates the following resources
      | resource | type   |
      | parent   | folder |
    And "Brian" uploads the following resources
      | resource  | to     |
      | lorem.txt | parent |
    When "Marie" logs in
    And "Marie" navigates to the projects space page
    And "Marie" navigates to the project space "team.1"
    Then "Marie" should see folder "parent" but should not be able to edit
    And "Marie" logs out
    When "Richard" logs in
    And "Richard" navigates to the projects space page
    And "Richard" navigates to the project space "team.1"
    And "Richard" creates the following resources
      | resource | type   |
      | richard  | folder |
    And "Richard" uploads the following resources
      | resource  | to      |
      | lorem.txt | richard |
    And "Richard" logs out
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
    And "Anonymous" deletes the following resources from public link using sidebar panel
      | resource  | from |
      | lorem.txt |      |
    When "Brian" deletes the following resources using the sidebar panel
      | resource     | from   |
      | textfile.txt | parent |
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
