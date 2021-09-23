Feature: Sharing files and folders with internal users with different permissions
  As a user
  I want to set different permissions on shared files and folders with other users
  So that I can control the access on those files/folders by other collaborators

  Background:
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares"
    And these users have been created with default attributes and without skeleton files:
      | username |
      | Alice    |
      | Brian    |
    And user "Brian" has created folder "simple-folder"
    And user "Brian" has created folder "simple-empty-folder"
    And user "Brian" has created folder "simple-folder/simple-empty-folder"
    And user "Brian" has uploaded file "data.zip" to "data.zip"
    And user "Brian" has uploaded file "lorem.txt" to "lorem.txt"
    And user "Brian" has uploaded file "lorem.txt" to "simple-folder/lorem.txt"

  @issue-ocis-2260
  Scenario: Change permissions of the previously shared folder to read, share
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "read" permissions
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian"
    And user "Brian" has logged in using the webUI
    Then no custom permissions should be set for collaborator "Alice Hansen" for folder "simple-folder" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for folder "simple-folder" to "share" using the webUI
    Then user "Alice" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, share           |

  @issue-1853 @issue-ocis-2260
  Scenario: Change permissions of the previously shared folder to all permissions
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "read, share, create, delete" permissions
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian"
    And user "Brian" has logged in using the webUI
    Then custom permissions "share, create, delete" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for folder "simple-folder" to "create, delete, share" using the webUI
    Then custom permission "share, create, delete" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details:
      | field       | value                       |
      | uid_owner   | Brian                       |
      | share_with  | Alice                       |
      | file_target | /Shares/simple-folder       |
      | item_type   | folder                      |
      | permissions | read, share, create, delete |

  @issue-1853 @issue-ocis-2260
  Scenario: Change permissions of the previously shared folder to update, delete
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "read, share, create" permissions
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian"
    And user "Brian" has logged in using the webUI
    Then custom permissions "share, create" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for folder "simple-folder" to "delete, update" using the webUI
    Then custom permission "delete, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, delete  |

  @issue-ocis-2260
  Scenario: Change permissions of the previously shared folder to read, create, share
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "read, delete" permissions
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian"
    And user "Brian" has logged in using the webUI
    Then custom permissions "delete" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for folder "simple-folder" to "create, share" using the webUI
    Then custom permission "create, share" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, create, share   |

  @issue-ocis-2260
  Scenario Outline: share a folder with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "<role>" with permissions "<extra-permissions>" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API
    Then user "Alice Hansen" should be listed as "<displayed-role>" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | <permissions>         |
    Examples:
      | role                 | displayed-role       | extra-permissions             | displayed-permissions | permissions                         |
      | Viewer               | Viewer               | ,                             | ,                     | read, share                         |
      | Editor               | Editor               | ,                             | ,                     | all                                 |
      | Custom permissions   | Custom permissions   | share, create                 | share, create         | read, share, create                 |
      | Custom permissions   | Custom permissions   | update, share                 | share, update         | read, update, share                 |
      | Custom permissions   | Editor               | delete, share, create, update | ,                     | read, share, delete, update, create |

  @issue-ocis-2260
  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian"
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario: Delete all custom permissions of the previously shared folder
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "read, update" permissions
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian"
    And user "Brian" has logged in using the webUI
    When the user disables all the custom permissions of collaborator "Alice Hansen" for folder "simple-folder" using the webUI
    Then no custom permissions should be set for collaborator "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read                  |

  @issue-ocis-2260
  Scenario Outline: share a file with another internal user assigning a role and the permissions
    Given user "Brian" has logged in using the webUI
    When the user shares file "lorem.txt" with user "Alice Hansen" as "<role>" with permissions "<collaborators-permissions>" using the webUI
    And user "Alice" accepts the share "Shares/lorem.txt" offered by user "Brian" using the sharing API
    Then user "Alice Hansen" should be listed as "<displayed-role>" in the collaborators list for file "lorem.txt" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    And user "Alice" should have received a share with these details:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | role                 | displayed-role | collaborators-permissions | displayed-permissions | permissions         |
      | Viewer               | Viewer         | ,                         | ,                     | read, share         |
      | Editor               | Editor         | ,                         | ,                     | read, share, update |
      | Custom permissions   | Editor         | share, update             | ,                     | read, share, update |

  @issue-ocis-2260
  Scenario: Share a folder without share permissions using API and check if it is listed on the collaborators list for original owner
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "read" permissions
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian"
    And user "Brian" has logged in using the webUI
    When the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And no custom permissions should be set for collaborator "Alice Hansen" for folder "simple-folder" on the webUI

  @skipOnOC10
  Scenario: Share a folder without share permissions using API and check if it is listed on the collaborators list for original owner (ocis bug demonstration)
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "read" permissions
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian"
    And user "Brian" has logged in using the webUI
    When the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "Alice Hansen" should be listed as "Viewer" in the collaborators list for folder "simple-folder" on the webUI
    And no custom permissions should be set for collaborator "Alice Hansen" for folder "simple-folder" on the webUI


  Scenario: Resource owner upgrades share permissions of a re-share
    Given user "Carol" has been created with default attributes and without skeleton files
    And user "Brian" has shared folder "simple-folder" with user "Alice" with "read, share, delete" permissions
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian"
    And user "Alice" has shared folder "/Shares/simple-folder" with user "Carol" with "read, delete" permissions
    And user "Carol" has accepted the share "Shares/simple-folder" offered by user "Alice"
    And user "Brian" has logged in using the webUI
    When the user sets custom permission for current role of collaborator "Carol King" for folder "simple-folder" to "delete, update" using the webUI
    Then custom permissions "delete, update" should be set for user "Carol King" for folder "simple-folder" on the webUI
    And user "Carol" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | Alice                 |
      | share_with  | Carol                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | delete, read, update  |

  @issue-ocis-2260
  Scenario: User is not allowed to reshare sub-folder with more permissions
    Given user "Carol" has been created with default attributes and without skeleton files
    And user "Brian" has shared folder "simple-folder" with user "Alice" with "read, share, delete" permissions
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian"
    And user "Alice" has logged in using the webUI
    When the user opens folder "Shares" using the webUI
    And the user opens folder "simple-folder" using the webUI
    And the user shares folder "simple-empty-folder" with user "Carol King" as "Custom permissions" with permissions "share, delete, update" using the webUI
    Then the error message with header "Error while sharing." should be displayed on the webUI
    And user "Carol" should not have received any shares
    And as "Carol" folder "/Shares/simple-empty-folder" should not exist

  @issue-ocis-2260
  Scenario: User is not allowed to update permissions of a reshared sub-folder to higher permissions than what user has received
    Given user "Carol" has been created with default attributes and without skeleton files
    And user "Brian" has shared folder "simple-folder" with user "Alice" with "read, share, delete, update" permissions
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian"
    And user "Alice" has shared folder "/Shares/simple-folder" with user "Carol" with "share, delete" permissions
    And user "Alice" has logged in using the webUI
    When the user opens folder "Shares" using the webUI
    And the user opens folder "simple-folder" using the webUI
    And the user shares folder "simple-empty-folder" with user "Carol King" as "Custom permissions" with permissions "share, delete, update, create" using the webUI
    Then the error message with header "Error while sharing." should be displayed on the webUI
    And user "Carol" should not have received any shares
    And as "Carol" folder "/Shares/simple-empty-folder" should not exist

  @issue-ocis-2260
  Scenario: User is allowed to update permissions of a reshared sub-folder within the permissions that the user has received
    Given user "Carol" has been created with default attributes and without skeleton files
    And user "Brian" has shared folder "simple-folder" with user "Alice" with "all" permissions
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian"
    And user "Alice" has shared folder "/Shares/simple-folder" with user "Carol" with "share, delete" permissions
    And user "Alice" has logged in using the webUI
    When the user opens folder "Shares" using the webUI
    And the user opens folder "simple-folder" using the webUI
    And the user shares folder "simple-empty-folder" with user "Carol King" as "Custom permissions" with permissions "share, delete, create, update" using the webUI
    And user "Carol" accepts the share "Shares/simple-empty-folder" offered by user "Alice" using the sharing API
    Then user "Carol" should have received a share with these details:
      | field       | value                       |
      | uid_owner   | Alice                       |
      | share_with  | Carol                       |
      | file_target | /Shares/simple-empty-folder |
      | item_type   | folder                      |
      | permissions | all                         |

  @skipOnOC10 @issue-ocis-1231
  #after fixing the issue delete this scenario and use the one above by deleting the @skipOnOCIS tag there
  Scenario: User is allowed to update permissions of a reshared sub-folder within the permissions that the user has received (ocis bug demonstration)
    Given user "Carol" has been created with default attributes and without skeleton files
    And user "Brian" has shared folder "simple-folder" with user "Alice" with "all" permissions
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian"
    And user "Alice" has shared folder "/Shares/simple-folder" with user "Carol" with "share, delete" permissions
    And user "Alice" has logged in using the webUI
    When the user opens folder "Shares" using the webUI
    And the user opens folder "simple-folder" using the webUI
    And the user shares folder "simple-empty-folder" with user "Carol King" as "Custom permissions" with permissions "delete, create, update" using the webUI
    And user "Carol" accepts the share "simple-empty-folder" offered by user "Alice" using the sharing API
    Then user "Carol" should have received a share with these details:
      | field       | value                        |
      | uid_owner   | Alice                        |
      | share_with  | Carol                        |
      | file_target | /Shares/simple-empty-folder  |
      | item_type   | folder                       |
      | permissions | read, delete, create, update |
