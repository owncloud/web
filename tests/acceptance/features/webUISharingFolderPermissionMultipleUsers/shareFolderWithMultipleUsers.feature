
Feature: Sharing folders with multiple internal users with different permissions
  As a user
  I want to set different permissions on shared folders with other users
  So that I can control the access on those folders by other collaborators

  Background:
    Given the administrator has set the default folder for received shares to "Shares" in the server
    And these users have been created with default attributes and without skeleton files in the server:
      | username |
      | Alice    |
      | Brian    |
      | Carol    |

  @issue-ocis-1743 @issue-ocis-1227
  Scenario Outline: share a folder with multiple users with different roles and permissions
    Given user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has logged in using the webUI
    When the user opens the share dialog for folder "simple-folder" using the webUI
    And the user selects the following collaborators for the share as "<role>" with "<extra-permissions>" permissions:
      | collaborator | type |
      | Brian Murphy | user |
      | Carol King   | user |
    And the user shares with the selected collaborators
    Then custom permissions "<displayed-permissions>" should be set for user "Brian Murphy" for folder "simple-folder" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "Carol King" for folder "simple-folder" on the webUI
    And user "Brian Murphy" should be listed as "<displayed-role>" in the collaborators list for folder "simple-folder" on the webUI
    And user "Carol King" should be listed as "<displayed-role>" in the collaborators list for folder "simple-folder" on the webUI
    And user "Brian" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Alice                 |
      | share_with  | Brian                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | <actual-permissions>  |
    And user "Carol" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Alice                 |
      | share_with  | Carol                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | <actual-permissions>  |
    Examples:
      | role               | displayed-role       | extra-permissions             | displayed-permissions         | actual-permissions           |
      | Viewer             | Can view             | ,                             | share                         | read, share                  |
      | Editor             | Can edit             | ,                             | delete, update, create, share | all                          |
      | Custom permissions | Custom permissions   | ,                             | ,                             | read                         |
      | Custom permissions | Can view             | share                         | share                         | read, share                  |
      | Custom permissions | Custom permissions   | delete, update, create        | delete, update, create        | read, delete, update, create |
      | Custom permissions | Can edit             | share, delete, update, create | delete, update, create, share | all                          |
