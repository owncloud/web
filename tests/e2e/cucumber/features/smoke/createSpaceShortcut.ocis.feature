#oc-files-actions-create-space-from-resource-trigger
Feature: create space shortcut

  Scenario: create space from folder
    Given "Admin" creates following users using API
      | id    |
      | Alice |
    And "Admin" creates the following folder in personal space using API
      | name        |
      | spaceFolder |
    When "Admin" logs in
    And "Admin" navigates to the personal space page
    And "Admin" creates the following resources
      | resource                                  | type   |
      | spaceFolder/Kindergarten Koalas/meal plan | folder |
    And "Admin" uploads the following resources
      | resource          | to           |
      | data.zip          | spaceFolder  |
      | lorem.txt         | spaceFolder  |
    And "Admin" navigates to the personal space page
    And "Admin" creates space "folderSpace" from folder "spaceFolder" using the context menu
    And "Admin" navigates to the projects space page
    And "Admin" navigates to the first project space named "folderSpace"
    And "Admin" downloads the following resources using the sidebar panel
      | resource            | from  | type   |
      | data.zip            |       | file   |
      | lorem.txt           |       | file   |
