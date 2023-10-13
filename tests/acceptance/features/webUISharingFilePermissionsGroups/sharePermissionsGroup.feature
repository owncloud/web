@issue-ocis-1277 @issue-ocis-1922
Feature: Sharing files with internal groups with permissions
  As a user
  I want to set different permissions on shared files with groups
  So that I can control the access on those files by other users on the group

  Background:
    Given the administrator has set the default folder for received shares to "Shares" in the server
    And these users have been created with default attributes and without skeleton files in the server:
      | username |
      | Alice    |
      | Brian    |
      | Carol    |
    And these groups have been created in the server:
      | groupname |
      | grp1      |
      | grp2      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Carol" has been added to group "grp2" in the server


  Scenario Outline: share a file with multiple groups with different roles and permissions
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has logged in using the webUI
    When the user opens the share dialog for file "lorem.txt" using the webUI
    And the user selects the following collaborators for the share as "<role>" with "<extra-permissions>" permissions:
      | collaborator | type  |
      | grp1         | group |
      | grp2         | group |
    And the user shares with the selected collaborators
    Then custom permissions "<displayed-permissions>" should be set for group "grp2" for file "lorem.txt" on the webUI
    And custom permissions "<displayed-permissions>" should be set for group "grp1" for file "lorem.txt" on the webUI
    And group "grp2" should be listed as "<displayed-role>" in the collaborators list for file "lorem.txt" on the webUI
    And group "grp1" should be listed as "<displayed-role>" in the collaborators list for file "lorem.txt" on the webUI
    And user "Brian" should have received a share with these details in the server:
      | field       | value                |
      | uid_owner   | Alice                |
      | share_with  | grp1                 |
      | file_target | /Shares/lorem.txt    |
      | item_type   | file                 |
      | permissions | <actual-permissions> |
    And user "Carol" should have received a share with these details in the server:
      | field       | value                |
      | uid_owner   | Alice                |
      | share_with  | grp2                 |
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
