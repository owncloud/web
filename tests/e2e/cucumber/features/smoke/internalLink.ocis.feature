Feature: internal link

  Scenario: link with internal permission
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
    When "Alice" shares the following resource using the sidebar panel
      | resource     | recipient | type | role   |
      | folderPublic | Brian     | user | editor |
    And "Alice" creates a public link using sidebar panel
      | resource     | name         | role     | expireDate |
      | folderPublic | myPublicLink | internal | +5 days    |
    And "Brian" opens the public link "myPublicLink"
    And "Brian" logs in the internal link
    And "Brian" opens shared-with-me page
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
