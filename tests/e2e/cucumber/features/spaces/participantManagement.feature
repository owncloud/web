Feature: spaces participant management

  Scenario: participant management
    Given "Admin" creates following users using API
      | id    |
      | Alice |
      | Brian |
      | Carol |
      | David |
      | Edith |
    And "Admin" creates following group using API
      | id       |
      | sales    |
      | security |
    And "Admin" adds user to the group using API
      | user  | group    |
      | David | sales    |
      | Edith | security |
    And "Admin" assigns following roles to the users using API
      | id    | role        |
      | Alice | Space Admin |
    And "Alice" logs in
    And "Alice" creates the following project space using API
      | name | id     |
      | team | team.1 |
    And "Alice" navigates to the project space "team.1"
    And "Alice" adds following users to the project space
      | user     | role     | kind  |
      | Brian    | Can edit | user  |
      | Carol    | Can view | user  |
      | sales    | Can view | group |
      | security | Can edit | group |
    When "Brian" logs in
    And "Brian" navigates to the project space "team.1"
    And "Brian" creates the following resources
      | resource | type   |
      | parent   | folder |
    And "Brian" uploads the following resources
      | resource  | to     |
      | lorem.txt | parent |
    When "David" logs in
    And "David" navigates to the project space "team.1"
    Then "David" should not be able to edit folder "parent"
    And "David" logs out
    When "Edith" logs in
    And "Edith" navigates to the project space "team.1"
    And "Edith" creates the following resources
      | resource | type   |
      | edith    | folder |
    And "Edith" uploads the following resources
      | resource  | to    |
      | lorem.txt | edith |
    And "Edith" logs out
    When "Carol" logs in
    And "Carol" navigates to the project space "team.1"
    Then "Carol" should not be able to edit folder "parent"
    And "Alice" creates a public link of following resource using the sidebar panel
      | resource | role     | password |
      | parent   | Can edit | %public% |
    And "Anonymous" opens the public link "Link"
    And "Anonymous" unlocks the public link with password "%public%"
    And "Anonymous" uploads the following resources in public link page
      | resource     |
      | textfile.txt |
    And "Anonymous" deletes the following resources from public link using sidebar panel
      | resource  | from |
      | lorem.txt |      |
    When "Brian" deletes the following resources using the sidebar panel
      | resource     | from   |
      | textfile.txt | parent |
    When "Carol" navigates to the trashbin of the project space "team.1"
    Then "Carol" should not be able to delete following resources from the trashbin
      | resource            |
      | parent/lorem.txt    |
      | parent/textfile.txt |
    And "Carol" should not be able to restore following resources from the trashbin
      | resource            |
      | parent/lorem.txt    |
      | parent/textfile.txt |
    When "Brian" navigates to the trashbin of the project space "team.1"
    Then "Brian" should be able to restore following resource from the trashbin
      | resource         |
      | parent/lorem.txt |
    And "Brian" should not be able to delete following resource from the trashbin
      | resource            |
      | parent/textfile.txt |
    And "Alice" navigates to the project space "team.1"
    And "Alice" removes access to following users from the project space
      | user  |
      | Brian |
    Then "Brian" should not see space "team.1"
    And "Brian" logs out
    When "Alice" changes the roles of the following users in the project space
      | user  | role       |
      | Carol | Can manage |
    And "Carol" navigates to the trashbin of the project space "team.1"
    Then "Carol" should be able to delete following resource from the trashbin
      | resource            |
      | parent/textfile.txt |
    And "Carol" logs out
    And "Alice" as project manager removes their own access to the project space
    Then "Alice" should not see space "team.1"
    And "Alice" logs out
