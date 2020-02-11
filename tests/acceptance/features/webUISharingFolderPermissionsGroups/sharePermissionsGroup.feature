Feature: Sharing folders with internal groups with different roles and permissions
  As a user
  I want to set different permissions on shared folders with groups
  So that I can control the access on those folders by other users on the group

  Background:
    Given these users have been created with default attributes:
      | username |
      | user1    |
      | user2    |
      | user3    |
    And these groups have been created:
      | groupname |
      | grp1      |
    And user "user1" has been added to group "grp1"
    And user "user2" has been added to group "grp1"

  @issue-1837
  Scenario Outline: share a folder with multiple users with different roles and permissions
    Given group "grp2" has been created
    And user "user2" has been added to group "grp2"
    And user "user1" has logged in using the webUI
    When the user opens the share dialog for folder "simple-folder" using the webUI
    And the user opens the share creation dialog in the webUI
    And the user selects the following collaborators for the share as "<role>" with "<extra-permissions>" permissions:
    | collaborator | type  |
    | grp1         | group |
    | User Three   | user  |
    | grp2         | group |
    And the user removes "grp1" as a collaborator from the share
    And the user removes "User One" as a collaborator from the share
    And the user shares with the selected collaborators
    Then custom permissions "<displayed-permissions>" should be set for user "grp2" for folder "simple-folder" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "User Three" for folder "simple-folder" on the webUI
    And group "grp2" should be listed as "<displayed-role>" in the collaborators list for folder "simple-folder" on the webUI
    And user "User Three" should be listed as "<displayed-role>" in the collaborators list for folder "simple-folder" on the webUI
    And user "user2" should have received a share with these details:
    | field       | value                |
    | uid_owner   | user1                |
    | share_with  | grp2                 |
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
    But user "User One" should not be listed in the collaborators list on the webUI
    And group "grp1" should not be listed in the collaborators list on the webUI
    And as "user1" folder "simple-folder (2)" should not exist
    Examples:
    | role                 | displayed-role          | extra-permissions             | displayed-permissions | actual-permissions           |
    | Viewer               | Viewer                  | share                         | share                 | read, share                  |
    | Viewer               | Viewer                  | ,                             | ,                     | read                         |
    | Editor               | Editor                  | share                         | share                 | all                          |
    | Editor               | Editor                  | ,                             | ,                     | read, update, delete, create |
    | Advanced permissions | Viewer                  | ,                             | ,                     | read                         |
    | Advanced permissions | Viewer                  | share                         | share                 | read, share                  |
    | Advanced permissions | Editor                  | delete, update, create        | ,                     | read, delete, update, create |
    | Advanced permissions | Editor                  | share, delete, update, create | share                 | all                          |
