@issue-ocis-1277 @issue-ocis-1922
Feature: Sharing files with internal groups with permissions
  As a user
  I want to set different permissions on shared files with groups
  So that I can control the access on those files by other users on the group

  Background:
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no" in the server
    And the administrator has set the default folder for received shares to "Shares" in the server
    And these users have been created with default attributes and without skeleton files in the server:
      | username |
      | Alice    |
      | Brian    |
      | Carol    |
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Alice" has been added to group "grp1" in the server
    And user "Brian" has been added to group "grp1" in the server


  Scenario Outline: share a file with multiple users with different roles and permissions
    Given user "user0" has been created with default attributes and without skeleton files in the server
    And group "grp2" has been created in the server
    And user "Brian" has been added to group "grp2" in the server
    And user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has logged in using the webUI
    When the user opens the share dialog for file "lorem.txt" using the webUI

    And the user selects the following collaborators for the share as "<role>" with "<extra-permissions>" permissions:
      | collaborator | type  |
      | grp1         | group |
      | Carol King   | user  |
      | grp2         | group |
    And the user removes "grp1" as a collaborator from the share
    Then group "grp1" should not be visible in the collaborators selected options in the webUI
    When the user shares with the selected collaborators
    And user "Brian" accepts the share "Shares/lorem.txt" offered by user "Alice" using the sharing API in the server
    And user "Carol" accepts the share "Shares/lorem.txt" offered by user "Alice" using the sharing API in the server
    Then custom permissions "<displayed-permissions>" should be set for user "grp2" for file "lorem.txt" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "Carol King" for file "lorem.txt" on the webUI
    And group "grp2" should be listed as "<displayed-role>" in the collaborators list for file "lorem.txt" on the webUI
    And user "Carol King" should be listed as "<displayed-role>" in the collaborators list for file "lorem.txt" on the webUI
    And user "Brian" should have received a share with these details in the server:
      | field       | value                |
      | uid_owner   | Alice                |
      | share_with  | grp2                 |
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
    But group "grp1" should not be listed in the collaborators list on the webUI
    And as "Alice" file "/Shares/lorem.txt" should not exist in the server
    Examples:
      | role                 | displayed-role       | extra-permissions | displayed-permissions | actual-permissions  |
      | Viewer               | Viewer               | ,                 | ,                     | read, share         |
      | Editor               | Editor               | ,                 | ,                     | share, read, update |
      | Custom permissions   | Custom permissions   | ,                 | ,                     | read                |
      | Custom permissions   | Viewer               | share             | ,                     | read, share         |
      | Custom permissions   | Editor               | share, update     | ,                     | read, update, share |
