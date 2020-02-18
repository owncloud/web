Feature: Sharing folders with internal groups with role as advanced permissions
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
  Scenario Outline: share a folder with multiple users with role as advanced permissions and different extra permissions
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
    But group "grp1" should not be listed in the collaborators list on the webUI
    And as "user1" folder "simple-folder (2)" should not exist
    Examples:
      | role                 | displayed-role          | extra-permissions             | displayed-permissions | actual-permissions           |
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
