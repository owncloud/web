Feature: Sharing files and folders with multiple internal users with different permissions
  As a user
  I want to set different permissions on shared files and folders with other users
  So that I can control the access on those files/folders by other collaborators

  Background:
    Given these users have been created with default attributes:
      | username |
      | user1    |
      | user2    |

  @issue-1837 @issue-1897
  Scenario Outline: share a folder with multiple users with different roles and permissions
    Given these users have been created with default attributes:
      | username |
      | user0    |
      | user3    |
      | user4    |
    And user "user1" has logged in using the webUI
    When the user opens the share dialog for folder "simple-folder" using the webUI
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
      | role        | displayed-role | extra-permissions             | displayed-permissions | actual-permissions           |
      | Viewer      | Viewer         | share                         | share                 | read, share                  |
      | Viewer      | Viewer         | ,                             | ,                     | read                         |
      | Editor      | Editor         | share                         | share                 | all                          |
      | Editor      | Editor         | ,                             | ,                     | read, change, delete, create |
      | Custom Role | Viewer         | ,                             | ,                     | read                         |
      | Custom Role | Viewer         | share                         | share                 | read, share                  |
      | Custom Role | Custom role    | delete                        | delete                | read, delete                 |
      # issue-1897: Displayed role below should have been 'Custom role'
      | Custom Role | Editor         | change                        | ,                     | read, change                 |
      | Custom Role | Custom role    | create                        | create                | read, create                 |
      | Custom Role | Custom role    | share, delete                 | share, delete         | read, share, delete          |
      # issue-1897: Displayed role below should have been 'Custom role'
      | Custom Role | Editor         | share, change                 | share                 | read, change, share          |
      | Custom Role | Custom role    | share, create                 | share, create         | read, share, create          |
      | Custom Role | Custom role    | delete, change                | delete, change        | read, delete, change         |
      | Custom Role | Custom role    | delete, create                | delete, create        | read, delete, create         |
      | Custom Role | Custom role    | change, create                | change, create        | read, change, create         |
      # issue-1837: Displayed Permissions below should have been 'share, delete, change'
      | Custom Role | Custom role    | share, delete, change         | ,                     | read, share, delete, change  |
      # issue-1837: Displayed Permissions below should have been 'share, create, delete'.
      | Custom Role | Custom role    | share, create, delete         | ,                     | read, share, delete, create  |
      # issue-1837: Displayed Permissions below should have been 'share, change, create'.
      | Custom Role | Custom role    | share, change, create         | ,                     | read, share, change, create  |
      | Custom Role | Editor         | delete, change, create        | ,                     | read, delete, change, create |
      | Custom Role | Editor         | share, delete, change, create | share                 | all                          |

  Scenario Outline: share a file with multiple users with different roles and permissions
    Given these users have been created with default attributes:
      | username |
      | user0    |
      | user3    |
      | user4    |
    And user "user1" has logged in using the webUI
    When the user opens the share dialog for file "lorem.txt" using the webUI
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
      | role        | displayed-role | extra-permissions | displayed-permissions | actual-permissions  |
      | Viewer      | Viewer         | share             | share                 | read, share         |
      | Viewer      | Viewer         | ,                 | ,                     | read                |
      | Editor      | Editor         | share             | share                 | share, read, change |
      | Editor      | Editor         | ,                 | ,                     | read, change        |
      | Custom Role | Viewer         | ,                 | ,                     | read                |
      | Custom Role | Viewer         | share             | share                 | read, share         |
      | Custom Role | Editor         | change            | ,                     | read, change        |
      | Custom Role | Editor         | share, change     | share                 | read, change, share |
