Feature: create Space shortcut

  Scenario: create Space from folder
    Given "Admin" creates following users using API
      | id    |
      | Alice |
    And "Admin" assigns following roles to the users using API
      | id    | role        |
      | Alice | Space Admin |
    And "Alice" logs in
    And "Alice" creates the following folder in personal space using API
      | name             |
      | spaceFolder      |
      | spaceFolder/test |
    And "Alice" navigates to the personal space page
    And "Alice" uploads the following resources
      | resource          | to           |
      | data.zip          | spaceFolder  |
      | lorem.txt         | spaceFolder  |
    And "Alice" navigates to the personal space page
    And "Alice" creates space "folderSpace" from folder "spaceFolder" using the context menu
    And "Alice" navigates to the project space "folderSpace"
    Then following resources should be displayed in the files list for user "Alice"
      | resource  |
      | data.zip  |
      | lorem.txt |
    And "Alice" logs out

  Scenario: create space from resources
    Given "Admin" creates following users using API
      | id    |
      | Alice |
    And "Admin" assigns following roles to the users using API
      | id    | role        |
      | Alice | Space Admin |
    And "Alice" logs in
    And "Alice" creates the following folder in personal space using API
      | name             |
      | resourceFolder   |
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
    And "Alice" navigates to the project space "resourceSpace"
    Then following resources should be displayed in the files list for user "Alice"
      | resource        |
      | resourceFolder  |
      | lorem.txt       |
    And "Alice" logs out
