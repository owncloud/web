#oc-files-actions-create-space-from-resource-trigger
Feature: create space shortcut

  Scenario: create space from folder
    Given "Admin" creates following users using API
      | id    |
      | Alice |
    And "Admin" assigns following roles to the users using API
      | id    | role        |
      | Alice | Space Admin |
    And "Alice" creates the following folder in personal space using API
      | name             |
      | spaceFolder      |
      | spaceFolder/test |
    When "Alice" logs in
    And "Alice" navigates to the personal space page
    And "Alice" uploads the following resources
      | resource          | to           |
      | data.zip          | spaceFolder  |
      | lorem.txt         | spaceFolder  |
    And "Alice" navigates to the personal space page
    And "Alice" creates space "folderSpace" from folder "spaceFolder" using the context menu
    And "Alice" navigates to the projects space page
    And "Alice" navigates to the project space "folderSpace"
    And "Alice" downloads the following resources using the sidebar panel
      | resource            | from  | type   |
      | data.zip            |       | file   |
      | lorem.txt           |       | file   |
    And "Alice" logs out

  Scenario: create space from resources
    Given "Admin" creates following users using API
      | id    |
      | Alice |
    And "Admin" assigns following roles to the users using API
      | id    | role        |
      | Alice | Space Admin |
    And "Alice" creates the following folder in personal space using API
      | name             |
      | resourceFolder   |
    When "Alice" logs in
    And "Alice" navigates to the personal space page
    And "Alice" uploads the following resources
      | resource          | to             |
      | data.zip          | resourceFolder |
      | lorem.txt         |                |
    And "Alice" navigates to the personal space page
    And "Alice" creates space "resourceSpace" from resources using the context menu
      | resource                |
      | resourceFolder          |
      | lorem.txt               |
    And "Alice" navigates to the projects space page
    And "Alice" navigates to the project space "resourceSpace"
    And "Alice" downloads the following resources using the sidebar panel
      | resource            | from  | type   |
      | resourceFolder      |       | folder |
      | lorem.txt           |       | file   |
