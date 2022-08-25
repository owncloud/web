Feature: spaces public link

    Scenario: public link for space
        Given "Admin" creates following users
            | id    |
            | Alice |
            | Brian |
            | Carol |
            | Marie |
        And "Admin" assigns following roles to the users
            | id    | role       |
            | Alice | SpaceAdmin |
        When "Alice" logs in
        And "Alice" navigates to the projects space page
        And "Alice" creates the following project spaces
            | name | id     |
            | team | team.1 |
        And "Alice" navigates to the project space "team.1"
        And "Alice" creates a public link for the space using the sidebar panel
        And "Alice" renames the most recently created public link of space to "spaceLink"
        And "Alice" creates the following resources
            | resource    | type   |
            | spaceFolder | folder |
        And "Alice" creates a public link for the resource "spaceFolder" using the sidebar panel
        And "Alice" renames the most recently created public link of resource "spaceFolder" to "folderLink"
        And "Alice" adds following users to the project space
            | user  | role    |
            | Brian | editor  |
            | Carol | viewer  |
            | Marie | manager |
        When "Brian" logs in
        And "Brian" navigates to the projects space page
        And "Brian" navigates to the project space "team.1"
        Then public link named "spaceLink" should be visible to "Brian"
        But "Brian" 'should not' be able to edit the public link named "spaceLink"
        And "Brian" logs out
        When "Marie" logs in
        And "Marie" navigates to the projects space page
        And "Marie" navigates to the project space "team.1"
        Then public link named "spaceLink" should be visible to "Marie"
        And "Marie" 'should' be able to edit the public link named "spaceLink"
        When "Marie" changes the permission of the public link named "spaceLink" to "editor"
        Then public link named "folderLink" of the resource "spaceFolder" should be visible to "Marie" 
        And "Marie" 'should' be able to edit the public link named "folderLink"
        And "Marie" logs out
        When "Carol" logs in
        And "Carol" navigates to the projects space page
        And "Carol" navigates to the project space "team.1"
        Then public link named "folderLink" of the resource "spaceFolder" should be visible to "Carol"
        And "Carol" logs out
