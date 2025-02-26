Feature: password-protected folder operations
  As a user
  I want to create and manage password-protected folders
  So that I can control folder access

  Background:
    Given "Admin" creates following user using API
      | id    |
      | Alice |


  Scenario: password-protected folder in personal space
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

    # Deletion
    When "Alice" opens the "files" app
    And "Alice" deletes the following resources using the sidebar panel
      | resource          |
      | sampleFolder.psec |
    When "Alice" opens folder ".PasswordProtectedFolders/projects/Personal"
    Then following resources should not be displayed in the files list for user "Alice"
      | resource     |
      | sampleFolder |
    When "Alice" navigates to the trashbin
    Then following resources should be displayed in the trashbin for user "Alice"
      | resource          |
      | sampleFolder.psec |
    And "Alice" logs out


  Scenario: password-protected folder in project space
    Given "Admin" creates following users using API
      | id    |
      | Brian |
    And "Admin" assigns following roles to the users using API
      | id    | role        |
      | Alice | Space Admin |
    And "Alice" has logged in
    And "Alice" enables the option to display the hidden file
    And "Alice" navigates to the projects space page
    And "Alice" creates the following project spaces
      | name | id     |
      | team | team.1 |
    And "Alice" navigates to the project space "team.1"
    And "Alice" adds following users to the project space
      | user  | role     | kind |
      | Brian | Can edit | user |
    When "Alice" creates the following resources
      | resource         | type                      | password |
      | space-folder     | Password Protected Folder | %public% |
      | new-space-folder | Password Protected Folder | %public% |
    Then following resources should be displayed in the files list for user "Alice"
      | resource              |
      | space-folder.psec     |
      | new-space-folder.psec |
    And "Alice" navigates to the personal space page
    When "Alice" opens folder ".PasswordProtectedFolders/projects/team"
    Then following resources should be displayed in the files list for user "Alice"
      | resource         |
      | space-folder     |
      | new-space-folder |

    # Deletion
    When "Alice" navigates to the projects space page
    And "Alice" navigates to the project space "team.1"
    And "Alice" deletes the following resources using the sidebar panel
      | resource          |
      | space-folder.psec |

    # Deletion by space-member
    And "Brian" logs in
    And "Brian" enables the option to display the hidden file
    And "Brian" navigates to the projects space page
    And "Brian" navigates to the project space "team.1"
    When "Brian" deletes the following resources using the sidebar panel
      | resource              |
      | new-space-folder.psec |
    And "Brian" navigates to the trashbin of the project space "team.1"
    Then following resources should be displayed in the trashbin for user "Brian"
      | resource              |
      | space-folder.psec     |
      | new-space-folder.psec |
    And "Alice" navigates to the trashbin of the project space "team.1"
    Then following resources should be displayed in the trashbin for user "Alice"
      | resource              |
      | space-folder.psec     |
      | new-space-folder.psec |
    When "Alice" navigates to the personal space page
    And "Alice" opens folder ".PasswordProtectedFolders/projects/team"
    Then following resources should be displayed in the files list for user "Alice"
      | resource         |
      | new-space-folder |
    And following resources should not be displayed in the files list for user "Alice"
      | resource     |
      | space-folder |
    And "Brian" logs out
    And "Alice" logs out
