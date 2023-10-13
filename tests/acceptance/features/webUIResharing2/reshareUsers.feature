# Reshare permission is not available now in the oCIS webUI
Feature: Resharing shared files with different permissions
  As a user
  I want to reshare received files and folders with other users with different permissions
  So that I can control the access on those files/folders by other collaborators

  Background:
    Given the administrator has set the default folder for received shares to "Shares" in the server
    And these users have been created with default attributes and without skeleton files in the server:
      | username |
      | Alice    |
      | Brian    |
      | Carol    |
    And user "Brian" has created folder "simple-folder" in the server

  @issue-ocis-1922
  Scenario: Reshare a folder without share permissions using API and check if it is listed on the collaborators list for original owner
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "read, share" permissions in the server
    And user "Alice" has shared folder "Shares/simple-folder" with user "Carol" with "read" permissions in the server
    And user "Brian" has logged in using the webUI
    When the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "Carol King" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And no custom permissions should be set for collaborator "Carol King" for folder "simple-folder" on the webUI

  # this scenario is skipped on ocis because it opens share folder which in not possible in OCIS
  # but it works for OC10 see issue https://github.com/owncloud/web/issues/6896 for more detail
  @skipOnOCIS
  Scenario: Reshare a folder without share permissions using API and check if it is listed on the collaborators list for resharer
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "read, share" permissions in the server
    And user "Alice" has logged in using the webUI
    And the user opens folder "Shares" using the webUI
    When the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "Carol King" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And no custom permissions should be set for collaborator "Carol King" for folder "simple-folder" on the webUI

   # this scenario is skipped on ocis because it opens share folder which in not possible in OCIS
  # but it works for OC10 see issue https://github.com/owncloud/web/issues/6896 for more detail
  @skipOnOCIS
  Scenario Outline: share a received folder with another user with same permissions(including share permissions) and check if the user is displayed in collaborators list for resharer
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "<permissions>" permissions in the server
    And user "Alice" has logged in using the webUI
    And the user opens folder "Shares" using the webUI
    When the user shares folder "simple-folder" with user "Carol King" as "<role>" with permissions "<collaborators-permissions>" using the webUI
    Then user "Carol King" should be listed as "<displayed-role>" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "Carol King" for folder "simple-folder" on the webUI
    And user "Carol" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Alice                 |
      | share_with  | Carol                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | <permissions>         |
    Examples:
      | role                 | displayed-role         | collaborators-permissions     | displayed-permissions         | permissions                         |
      | Viewer               | Can view               | ,                             | share                         | read, share                         |
      | Editor               | Can edit               | ,                             | share, delete, update, create | all                                 |
      | Custom permissions   | Custom permissions     | update, share                 | share, update                 | read, update, share                 |
      | Custom permissions   | Custom permissions     | share, create                 | share, create                 | read, share, create                 |
      | Custom permissions   | Can edit               | delete, share, create, update | share, delete, update, create | read, share, delete, update, create |

   # this scenario is skipped on ocis because it opens share folder which in not possible in OCIS
  # but it works for OC10 see issue https://github.com/owncloud/web/issues/6896 for more detail
  @skipOnOCIS
  Scenario Outline: share a received folder with another user with same permissions(including share permissions) and check if the user is displayed in collaborators list for original owner
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "<permissions>" permissions in the server
    And user "Alice" has logged in using the webUI
    And the user opens folder "Shares" using the webUI
    When the user shares folder "simple-folder" with user "Carol King" as "<role>" with permissions "<collaborators-permissions>" using the webUI
    And the user re-logs in as "Brian" using the webUI
    Then user "Carol King" should be listed as "<displayed-role>" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "Carol King" for folder "simple-folder" on the webUI
    And user "Alice Hansen" should be listed as "<displayed-role>" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Carol" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Alice                 |
      | share_with  | Carol                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | <permissions>         |
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | <permissions>         |
    Examples:
      | role                 | displayed-role         | collaborators-permissions         | displayed-permissions         | permissions                     |
      | Viewer               | Can view               | ,                             | share                         | read, share                         |
      | Editor               | Can edit               | ,                             | share, delete, update, create | all                                 |
      | Custom permissions   | Custom permissions     | share, create                 | share, create                 | read, share, create                 |
      | Custom permissions   | Custom permissions     | update, share                 | share, update                 | read, update, share                 |
      | Custom permissions   | Can edit               | delete, share, create, update | share, delete, update, create | read, share, delete, update, create |
