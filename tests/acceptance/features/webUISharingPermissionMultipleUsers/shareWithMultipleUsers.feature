Feature: Sharing files and folders with multiple internal users with different permissions
  As a user
  I want to set different permissions on shared files and folders with other users
  So that I can control the access on those files/folders by other collaborators

  Background:
    Given these users have been created with default attributes:
      | username |
      | user1    |
      | user2    |

  Scenario Outline: share a folder with multiple users with different roles and permissions
    Given these users have been created with default attributes:
      | username |
      | user0    |
      | user3    |
      | user4    |
    And user "user1" has logged in using the webUI
    When the user opens the share dialog for folder "simple-folder" using the webUI
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
    Then custom permissions "<displayed-permissions>" should be set for user "User Two" for folder "simple-folder" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "User Three" for folder "simple-folder" on the webUI
    And user "User Two" should be listed as "<displayed-role>" in the collaborators list for folder "simple-folder" on the webUI
    And user "User Three" should be listed as "<displayed-role>" in the collaborators list for folder "simple-folder" on the webUI
    And user "user2" should have received a share with these details:
      | field       | value                |
      | uid_owner   | user1                |
      | share_with  | user2                |
      | file_target | /simple-folder (2)   |
      | item_type   | folder               |
      | permissions | <actual-permissions> |
    And user "user3" should have received a share with these details:
      | field       | value                |
      | uid_owner   | user1                |
      | share_with  | user3                |
      | file_target | /simple-folder (2)   |
      | item_type   | folder               |
      | permissions | <actual-permissions> |
    But user "Regular User" should not be listed in the collaborators list on the webUI
    And as "user0" folder "simple-folder (2)" should not exist
    And user "User Four" should not be listed in the collaborators list on the webUI
    And as "user4" folder "simple-folder (2)" should not exist
    Examples:
      | role                 | displayed-role          | extra-permissions             | displayed-permissions | actual-permissions           |
      | Viewer               | Viewer                  | share                         | share                 | read, share                  |
      | Viewer               | Viewer                  | ,                             | ,                     | read                         |
      | Editor               | Editor                  | share                         | share                 | all                          |
      | Editor               | Editor                  | ,                             | ,                     | read, update, delete, create |
      | Advanced permissions | Viewer                  | ,                             | ,                     | read                         |
      | Advanced permissions | Viewer                  | share                         | share                 | read, share                  |
      | Advanced permissions | Advanced permissions    | delete                        | delete                | read, delete                 |
      | Advanced permissions | Advanced permissions    | update                        | update                | read, update                 |
      | Advanced permissions | Advanced permissions    | create                        | create                | read, create                 |
      | Advanced permissions | Advanced permissions    | share, delete                 | share, delete         | read, share, delete          |
      | Advanced permissions | Advanced permissions    | share, update                 | share, update         | read, update, share          |
      | Advanced permissions | Advanced permissions    | share, create                 | share, create         | read, share, create          |
      | Advanced permissions | Advanced permissions    | delete, update                | delete, update        | read, delete, update         |
      | Advanced permissions | Advanced permissions    | delete, create                | delete, create        | read, delete, create         |
      | Advanced permissions | Advanced permissions    | update, create                | update, create        | read, update, create         |
      | Advanced permissions | Advanced permissions    | share, delete, update         | share, delete, update | read, share, delete, update  |
      | Advanced permissions | Advanced permissions    | share, create, delete         | share, create, delete | read, share, delete, create  |
      | Advanced permissions | Advanced permissions    | share, update, create         | share, update, create | read, share, update, create  |
      | Advanced permissions | Editor                  | delete, update, create        | ,                     | read, delete, update, create |
      | Advanced permissions | Editor                  | share, delete, update, create | share                 | all                          |

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
    Then custom permissions "<displayed-permissions>" should be set for user "User Two" for file "lorem.txt" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "User Three" for file "lorem.txt" on the webUI
    And user "User Two" should be listed as "<displayed-role>" in the collaborators list for file "lorem.txt" on the webUI
    And user "User Three" should be listed as "<displayed-role>" in the collaborators list for file "lorem.txt" on the webUI
    And user "user2" should have received a share with these details:
      | field       | value                |
      | uid_owner   | user1                |
      | share_with  | user2                |
      | file_target | /lorem (2).txt       |
      | item_type   | file                 |
      | permissions | <actual-permissions> |
    And user "user3" should have received a share with these details:
      | field       | value                |
      | uid_owner   | user1                |
      | share_with  | user3                |
      | file_target | /lorem (2).txt       |
      | item_type   | file                 |
      | permissions | <actual-permissions> |
    But user "Regular User" should not be listed in the collaborators list on the webUI
    And as "user0" file "lorem (2).txt" should not exist
    And user "User Four" should not be listed in the collaborators list on the webUI
    And as "user4" file "lorem(2).txt" should not exist
    Examples:
      | role                 | displayed-role | extra-permissions | displayed-permissions | actual-permissions  |
      | Viewer               | Viewer         | share             | share                 | read, share         |
      | Viewer               | Viewer         | ,                 | ,                     | read                |
      | Editor               | Editor         | share             | share                 | share, read, update |
      | Editor               | Editor         | ,                 | ,                     | read, update        |
      | Advanced permissions | Viewer         | ,                 | ,                     | read                |
      | Advanced permissions | Viewer         | share             | share                 | read, share         |
      | Advanced permissions | Editor         | update            | ,                     | read, update        |
      | Advanced permissions | Editor         | share, update     | share                 | read, update, share |
