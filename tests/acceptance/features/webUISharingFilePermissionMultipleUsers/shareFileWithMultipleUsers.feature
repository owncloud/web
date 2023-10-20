Feature: Sharing files with multiple internal users with different permissions
  As a user
  I want to set different permissions on shared files with other users
  So that I can control the access on those files by other collaborators

  Background:
    Given the administrator has set the default folder for received shares to "Shares" in the server
    And these users have been created with default attributes and without skeleton files in the server:
      | username |
      | Alice    |
      | Brian    |
      | Carol    |

  @issue-ocis-1743 @ocisSmokeTest
  Scenario Outline: share a file with multiple users with different roles and permissions
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has logged in using the webUI
    When the user opens the share dialog for file "lorem.txt" using the webUI
    And the user selects the following collaborators for the share as "<role>" with "<extra-permissions>" permissions:
      | collaborator | type |
      | Brian Murphy | user |
      | Carol King   | user |
    And the user shares with the selected collaborators
    Then custom permissions "<displayed-permissions>" should be set for user "Brian Murphy" for file "lorem.txt" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "Carol King" for file "lorem.txt" on the webUI
    And user "Brian Murphy" should be listed as "<displayed-role>" in the collaborators list for file "lorem.txt" on the webUI
    And user "Carol King" should be listed as "<displayed-role>" in the collaborators list for file "lorem.txt" on the webUI
    And user "Brian" should have received a share with these details in the server:
      | field       | value                |
      | uid_owner   | Alice                |
      | share_with  | Brian                |
      | file_target | /Shares/lorem.txt    |
      | item_type   | file                 |
      | permissions | <actual-permissions> |
    And user "Carol" should have received a share with these details in the server:
      | field       | value                |
      | uid_owner   | Alice                |
      | share_with  | Carol                |
      | file_target | /Shares/lorem.txt    |
      | item_type   | file                 |
      | permissions | <actual-permissions> |
    Examples:
      | role               | displayed-role       | extra-permissions | displayed-permissions | actual-permissions  |
      | Viewer             | Can view             | ,                 | read, share           | read, share         |
      | Editor             | Can edit             | ,                 | read, update, share   | read, update, share |
      | Custom permissions | Custom permissions   | ,                 | ,                     | read                |
      | Custom permissions | Can view             | share             | share                 | read, share         |
      | Custom permissions | Custom permissions   | update            | update                | read, update        |
      | Custom permissions | Can edit             | share, update     | read, update, share   | read, update, share |
