Feature: Folder Creation with Password and Permissions
  As a user
  I want to create a password protected folder with password
  So that I can manage access to resources


  Scenario: create a password protected folder (Project Space)
    Given "Admin" creates following user using API
      | id    |
      | Alice |
    And "Admin" assigns following roles to the users using API
      | id    | role        |
      | Alice | Space Admin |
    And "Alice" has logged in
    And "Alice" opens the "files" app
    And "Alice" navigates to the projects space page
    And "Alice" creates the following project spaces
      | name | id     |
      | team | team.1 |
    And "Alice" navigates to the project space "team.1"
    When "Alice" creates the following resources
      | resource       | type                      | password |
      | space-folder   | Password Protected Folder | %public% |
    And "Alice" enables the option to display the hidden file
    Then following resources should be displayed in the files list for user "Alice"
      | resource          |
      | .space            |
      | space-folder.psec |
    And "Alice" logs out
