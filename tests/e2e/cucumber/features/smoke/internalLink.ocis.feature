Feature: internal link share

  Scenario: link share as an internal role
    Given "Admin" creates following users
      | id    |
      | Alice |
      | Brian |
    And "Alice" creates the following folder in personal space using API
      | name         |
      | folderPublic |
    And "Alice" logs in
    And "Alice" opens the "files" app
    And "Alice" uploads the following resources
      | resource  | to           |
      | lorem.txt | folderPublic |
    And "Alice" shares the following resource using the sidebar panel
      | resource     | recipient | type | role   |
      | folderPublic | Brian     | user | editor |
    And "Alice" creates a public link for the resource "folderPublic" using the sidebar panel
    When "Alice" edits the public link named "Link" of resource "folderPublic" changing role to "internal"
    And "Brian" opens the public link "Link"
    And "Brian" logs in from the internal link
    And "Brian" opens shared-with-me page from the internal link
    And "Brian" accepts the following share
      | name         |
      | folderPublic |
    And "Brian" uploads the following resource
      | resource   | to           |
      | simple.pdf | folderPublic |
    And "Alice" updates following sharee role
      | resource     | recipient | type | role                    |
      | folderPublic | Brian     | user | custom_permissions:read |
    And "Alice" logs out
#    Then "Brian" should not able to edit the following resources
#      | resource     |
#      | folderPublic |
    And "Brian" logs out
