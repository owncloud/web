Feature: create folder with password
  As a user
  I want to create password protected folder
  So that I can control folder access

  Background:
    Given "Admin" creates following user using API
      | id    |
      | Alice |


  Scenario: user can create a password-protected folder in personal space
    Given "Alice" has logged in
    When "Alice" creates the following resources
      | resource     | type                      | password |
      | sampleFolder | Password Protected Folder | %public% |
    And "Alice" enables the option to display the hidden file
    Then following resources should be displayed in the files list for user "Alice"
      | resource                  |
      | .PasswordProtectedFolders |
      | sampleFolder.psec         |
    When "Alice" opens folder ".PasswordProtectedFolders/projects/Personal"
    Then following resources should be displayed in the files list for user "Alice"
      | resource     |
      | sampleFolder |
    And "Alice" logs out


  Scenario: user can create a password-protected folder in project space
    Given "Admin" assigns following roles to the users using API
      | id    | role        |
      | Alice | Space Admin |
    And "Alice" has logged in
    And "Alice" enables the option to display the hidden file
    And "Alice" navigates to the projects space page
    And "Alice" creates the following project spaces
      | name | id     |
      | team | team.1 |
    And "Alice" navigates to the project space "team.1"
    When "Alice" creates the following resources
      | resource     | type                      | password |
      | space-folder | Password Protected Folder | %public% |
    Then following resources should be displayed in the files list for user "Alice"
      | resource          |
      | space-folder.psec |
    And "Alice" navigates to the personal space page
    When "Alice" opens folder ".PasswordProtectedFolders/projects/team"
    Then following resources should be displayed in the files list for user "Alice"
      | resource     |
      | space-folder |
    And "Alice" logs out
