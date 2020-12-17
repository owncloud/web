Feature: Sharing files with multiple internal users with different permissions
  As a user
  I want to set different permissions on shared files with other users
  So that I can control the access on those files by other collaborators

  Background:
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares"
    And these users have been created with default attributes:
      | username |
      | user1    |
      | user2    |

  @issue-ocis-717
  Scenario Outline: share a file with multiple users with different roles and permissions
    Given these users have been created with default attributes:
      | username |
      | user0    |
      | user3    |
      | user4    |
    And user "user1" has logged in using the webUI
    When the user opens the share dialog for file "lorem.txt" using the webUI
    And the user opens the share creation dialog in the webUI
    And the user selects the following collaborators for the share as "<role>" with "<extra-permissions>" permissions:
      | collaborator | type |
      | Regular User | user |
      | User Two     | user |
      | User Three   | user |
      | User Four    | user |
    And the user removes "User Four" as a collaborator from the share
    And the user removes "Regular User" as a collaborator from the share
    And the user shares with the selected collaborators
    And user "user2" accepts the share "lorem.txt" offered by user "user1" using the sharing API
    And user "user3" accepts the share "lorem.txt" offered by user "user1" using the sharing API
    Then custom permissions "<displayed-permissions>" should be set for user "User Two" for file "lorem.txt" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "User Three" for file "lorem.txt" on the webUI
    And user "User Two" should be listed as "<displayed-role>" in the collaborators list for file "lorem.txt" on the webUI
    And user "User Three" should be listed as "<displayed-role>" in the collaborators list for file "lorem.txt" on the webUI
    And user "user2" should have received a share with these details:
      | field       | value                |
      | uid_owner   | user1                |
      | share_with  | user2                |
      | file_target | /Shares/lorem.txt    |
      | item_type   | file                 |
      | permissions | <actual-permissions> |
    And user "user3" should have received a share with these details:
      | field       | value                |
      | uid_owner   | user1                |
      | share_with  | user3                |
      | file_target | /Shares/lorem.txt    |
      | item_type   | file                 |
      | permissions | <actual-permissions> |
    But user "Regular User" should not be listed in the collaborators list on the webUI
    And as "user0" file "/Shares/lorem.txt" should not exist
    And user "User Four" should not be listed in the collaborators list on the webUI
    And as "user4" file "/Shares/lorem.txt" should not exist
    Examples:
      | role                 | displayed-role               | extra-permissions | displayed-permissions | actual-permissions         |
      | Viewer               | Viewer                       | ,                 | ,                     | read, share                |
      | Editor               | Editor                       | ,                 | ,                     | read, update, share        |
      | Advanced permissions | Advanced permissions         | ,                 | ,                     | read                       |
      | Advanced permissions | Viewer                       | share             | ,                     | read, share                |
      | Advanced permissions | Advanced permissions         | update            | update                | read, update               |
      | Advanced permissions | Editor                       | share, update     | ,                     | read, update, share        |

  @skipOnOC10 @issue-ocis-717
  #after fixing the issue delete this scenario and use the one above by deleting the @skipOnOCIS tag there
  Scenario Outline: share a file with multiple users with different roles and permissions
    Given these users have been created with default attributes:
      | username |
      | user0    |
      | user3    |
      | user4    |
    And user "user1" has logged in using the webUI
    When the user opens the share dialog for file "lorem.txt" using the webUI
    And the user opens the share creation dialog in the webUI
    And the user selects the following collaborators for the share as "<role>" with "<extra-permissions>" permissions:
      | collaborator | type |
      | Regular User | user |
      | User Two     | user |
      | User Three   | user |
      | User Four    | user |
    And the user removes "User Four" as a collaborator from the share
    And the user removes "Regular User" as a collaborator from the share
    And the user shares with the selected collaborators
    And user "user2" accepts the share "lorem.txt" offered by user "user1" using the sharing API
    And user "user3" accepts the share "lorem.txt" offered by user "user1" using the sharing API
    Then custom permissions "<displayed-permissions>" should be set for user "User Two" for file "lorem.txt" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "User Three" for file "lorem.txt" on the webUI
    And user "User Two" should be listed as "<displayed-role>" in the collaborators list for file "lorem.txt" on the webUI
    And user "User Three" should be listed as "<displayed-role>" in the collaborators list for file "lorem.txt" on the webUI
    And user "user2" should have received a share with these details:
      | field       | value                |
      | uid_owner   | user1                |
      | share_with  | user2                |
      | file_target | /Shares/lorem.txt    |
      | item_type   | file                 |
      | permissions | <actual-permissions> |
    And user "user3" should have received a share with these details:
      | field       | value                |
      | uid_owner   | user1                |
      | share_with  | user3                |
      | file_target | /Shares/lorem.txt    |
      | item_type   | file                 |
      | permissions | <actual-permissions> |
    But user "Regular User" should not be listed in the collaborators list on the webUI
    And as "user0" file "/Shares/lorem.txt" should not exist
    And user "User Four" should not be listed in the collaborators list on the webUI
    And as "user4" file "/Shares/lorem.txt" should not exist
    Examples:
      | role                 | displayed-role | extra-permissions | displayed-permissions | actual-permissions  |
      | Viewer               | Viewer         | ,                 | ,                     | read                |
      | Editor               | Editor         | ,                 | ,                     | read, update        |
      | Advanced permissions | Viewer         | ,                 | ,                     | read                |
      | Advanced permissions | Editor         | update            | ,                     | read, update        |
