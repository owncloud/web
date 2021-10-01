# Reshare permission is not available now in the oCIS webUI
Feature: Resharing shared files with different permissions
  As a user
  I want to reshare received files and folders with other users with different permissions
  So that I can control the access on those files/folders by other collaborators

  Background:
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares"
    And these users have been created with default attributes and without skeleton files:
      | username |
      | Alice    |
      | Brian    |
      | Carol    |
    And user "Brian" has created folder "simple-folder"

  @issue-ocis-1922
  Scenario: Reshare a folder without share permissions using API and check if it is listed on the collaborators list for original owner
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "read, share" permissions
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian"
    And user "Alice" has shared folder "Shares/simple-folder" with user "Carol" with "read" permissions
    And user "Carol" has accepted the share "Shares/simple-folder" offered by user "Alice"
    And user "Brian" has logged in using the webUI
    When the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "Carol King" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And no custom permissions should be set for collaborator "Carol King" for folder "simple-folder" on the webUI

  @issue-ocis-1922
  Scenario: Reshare a folder without share permissions using API and check if it is listed on the collaborators list for resharer
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "read, share" permissions
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian"
    And user "Alice" has shared folder "Shares/simple-folder" with user "Carol" with "read" permissions
    And user "Carol" has accepted the share "Shares/simple-folder" offered by user "Alice"
    And user "Alice" has logged in using the webUI
    And the user opens folder "Shares" using the webUI
    When the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "Carol King" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And no custom permissions should be set for collaborator "Carol King" for folder "simple-folder" on the webUI


  Scenario: Reshare a folder without share permissions using API and check if the receiver can reshare
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "read, share" permissions
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian"
    And user "Alice" has shared folder "/Shares/simple-folder" with user "Carol" with "read" permissions
    And user "Carol" has accepted the share "Shares/simple-folder" offered by user "Alice"
    When user "Carol" logs in using the webUI
    And the user opens folder "Shares" using the webUI
    Then the user should not be able to share folder "simple-folder" using the webUI

  @issue-ocis-2260 @issue-ocis-1922
  Scenario Outline: share a received folder with another user with same permissions(including share permissions) and check if the user is displayed in collaborators list for resharer
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "<permissions>" permissions
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian"
    And user "Alice" has logged in using the webUI
    And the user opens folder "Shares" using the webUI
    When the user shares folder "simple-folder" with user "Carol King" as "<role>" with permissions "<collaborators-permissions>" using the webUI
    And user "Carol" accepts the share "Shares/simple-folder" offered by user "Alice" using the sharing API
    Then user "Carol King" should be listed as "<displayed-role>" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "Carol King" for folder "simple-folder" on the webUI
    And user "Carol" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | Alice                 |
      | share_with  | Carol                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | <permissions>         |
    Examples:
      | role                 | displayed-role       | collaborators-permissions     | displayed-permissions | permissions                         |
      | Viewer               | Viewer               | ,                             | ,                     | read, share                         |
      | Editor               | Editor               | ,                             | ,                     | all                                 |
      | Custom permissions   | Custom permissions   | share, create                 | share, create         | read, share, create                 |
      | Custom permissions   | Custom permissions   | update, share                 | share, update         | read, update, share                 |
      | Custom permissions   | Editor               | delete, share, create, update |                       | read, share, delete, update, create |

  @skipOnOC10 @issue-ocis-2260 @issue-ocis-1922
  #after fixing the issue delete this scenario and use the one above by deleting the @skipOnOCIS tag there
  Scenario Outline: share a received folder with another user with same permissions(including share permissions) and check if the user is displayed in collaborators list for resharer (ocis bug demonstration)
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "<permissions>" permissions
    And user "Alice" has accepted the share "simple-folder" offered by user "Brian"
    And user "Alice" has logged in using the webUI
    And the user opens folder "Shares" using the webUI
    When the user shares folder "simple-folder" with user "Carol King" as "<role>" with permissions "<collaborators-permissions>" using the webUI
    And user "Carol" accepts the share "Shares/simple-folder" offered by user "Alice" using the sharing API
    Then user "Carol King" should be listed as "<displayed-role>" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "Carol King" for folder "simple-folder" on the webUI
    And user "Carol" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | Alice                 |
      | share_with  | Carol                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | <permissions>         |
    Examples:
      | role                 | displayed-role       | collaborators-permissions | displayed-permissions | permissions                  |
      | Viewer               | Viewer               | ,                         | ,                     | read                         |
      | Editor               | Editor               | ,                         | ,                     | all                          |
      | Custom permissions   | Custom permissions   | create                    | create                | read, create                 |
      | Custom permissions   | Custom permissions   | update                    | update                | read, update                 |
      | Custom permissions   | Editor               | delete, create, update    |                       | read, delete, update, create |

  @issue-ocis-1743
  Scenario Outline: share a received folder with another user with same permissions(including share permissions) and check if the user is displayed in collaborators list for original owner
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "<permissions>" permissions
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian"
    And user "Alice" has logged in using the webUI
    And the user opens folder "Shares" using the webUI
    When the user shares folder "simple-folder" with user "Carol King" as "<role>" with permissions "<collaborators-permissions>" using the webUI
    And user "Carol" accepts the share "Shares/simple-folder" offered by user "Alice" using the sharing API
    And the user re-logs in as "Brian" using the webUI
    Then user "Carol King" should be listed as "<displayed-role>" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "Carol King" for folder "simple-folder" on the webUI
    And user "Alice Hansen" should be listed as "<displayed-role>" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Carol" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | Alice                 |
      | share_with  | Carol                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | <permissions>         |
    And user "Alice" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | <permissions>         |
    Examples:
      | role                 | displayed-role       | collaborators-permissions     | displayed-permissions | permissions                         |
      | Viewer               | Viewer               | ,                             | ,                     | read, share                         |
      | Editor               | Editor               | ,                             | ,                     | all                                 |
      | Custom permissions   | Custom permissions   | share, create                 | share, create         | read, share, create                 |
      | Custom permissions   | Custom permissions   | update, share                 | share, update         | read, update, share                 |
      | Custom permissions   | Editor               | delete, share, create, update | ,                     | read, share, delete, update, create |
