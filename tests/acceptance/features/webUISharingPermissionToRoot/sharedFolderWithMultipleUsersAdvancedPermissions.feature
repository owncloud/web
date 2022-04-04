@notToImplementOnOCIS
Feature: Sharing folders with multiple internal users using advanced permissions
  As a user
  I want to set advanced permissions on shared folders with other users
  So that I can control the access on those folders by other collaborators

  Background:
    Given these users have been created with default attributes and without skeleton files in the server:
      | username |
      | Alice    |
      | Brian    |
      | Carol    |
    And user "Alice" has created folder "simple-folder" in the server


  Scenario Outline: share a folder with multiple users using role as advanced permissions role and different extra permissions
    Given user "Alice" has logged in using the webUI
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
      | field       | value                |
      | uid_owner   | Alice                |
      | share_with  | Brian                |
      | file_target | /simple-folder       |
      | item_type   | folder               |
      | permissions | <actual-permissions> |
    And user "Carol" should have received a share with these details in the server:
      | field       | value                |
      | uid_owner   | Alice                |
      | share_with  | Carol                |
      | file_target | /simple-folder       |
      | item_type   | folder               |
      | permissions | <actual-permissions> |
    Examples:
      | role               | displayed-role     | extra-permissions     | displayed-permissions | actual-permissions          |
      | Custom permissions | Custom permissions | share, update, create | share, update, create | read, share, update, create |
