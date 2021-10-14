@notToImplementOnOCIS
Feature: Sharing folders with multiple internal users with different permissions
  As a user
  I want to set different permissions on shared folders with other users
  So that I can control the access on those folders by other collaborators

  Background:
    Given these users have been created with default attributes and without skeleton files:
      | username |
      | Alice    |
      | Brian    |
    And user "Alice" has created folder "simple-folder"
    And user "Alice" has uploaded file "lorem.txt" to "simple-folder/lorem.txt"


  Scenario Outline: share a folder with multiple users with different roles and permissions
    Given these users have been created with default attributes and without skeleton files:
      | username |
      | user0    |
      | Carol    |
      | David    |
    And user "Alice" has logged in using the webUI
    When the user opens the share dialog for folder "simple-folder" using the webUI
    And the user opens the share creation dialog on the webUI
    And the user selects the following collaborators for the share as "<role>" with "<extra-permissions>" permissions:
      | collaborator | type |
      | Regular User | user |
      | Brian Murphy | user |
      | Carol King   | user |
      | David Lopez  | user |
    And the user removes "David Lopez" as a collaborator from the share
    And the user removes "Regular User" as a collaborator from the share
    Then user "David Lopez" should not be visible in the collaborators selected options in the webUI
    And user "Regular User" should not be visible in the collaborators selected options in the webUI
    When the user shares with the selected collaborators
    Then custom permissions "<displayed-permissions>" should be set for user "Brian Murphy" for folder "simple-folder" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "Carol King" for folder "simple-folder" on the webUI
    And user "Brian Murphy" should be listed as "<displayed-role>" in the collaborators list for folder "simple-folder" on the webUI
    And user "Carol King" should be listed as "<displayed-role>" in the collaborators list for folder "simple-folder" on the webUI
    And user "Brian" should have received a share with these details:
      | field       | value                |
      | uid_owner   | Alice                |
      | share_with  | Brian                |
      | file_target | /simple-folder       |
      | item_type   | folder               |
      | permissions | <actual-permissions> |
    And user "Carol" should have received a share with these details:
      | field       | value                |
      | uid_owner   | Alice                |
      | share_with  | Carol                |
      | file_target | /simple-folder       |
      | item_type   | folder               |
      | permissions | <actual-permissions> |
    But user "Regular User" should not be listed in the collaborators list on the webUI
    And as "user0" folder "simple-folder" should not exist
    And user "David Lopez" should not be listed in the collaborators list on the webUI
    And as "David" folder "simple-folder" should not exist
    Examples:
      | role                 | displayed-role | extra-permissions             | displayed-permissions | actual-permissions |
      # | Viewer               | Viewer                  | share                         | share                 | read, share                  |
      # | Viewer               | Viewer                  | ,                             | ,                     | read                         |
      # | Editor               | Editor                  | share                         | share                 | all                          |
      # | Editor               | Editor                  | ,                             | ,                     | read, update, delete, create |
      # | Custom permissions | Viewer                  | ,                             | ,                     | read                         |
      # | Custom permissions | Viewer                  | share                         | share                 | read, share                  |
      # | Custom permissions | Editor                  | delete, update, create        | ,                     | read, delete, update, create |
      | Custom permissions | Editor         | share, delete, update, create | ,                     | all                |
