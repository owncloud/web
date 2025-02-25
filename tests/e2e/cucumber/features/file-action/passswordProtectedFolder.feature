Feature: create folder with password
  As a user
  I want to create password protected folder
  So that I can control folder access


  Scenario: create a password-protected folder
    Given "Admin" creates following user using API
      | id    |
      | Alice |
    And "Alice" has logged in
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
