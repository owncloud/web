Feature: Sharing files and folders with internal users with different permissions
  As a user
  I want to set different permissions on shared files and folders with other users
  So that I can control the access on those files/folders by other collaborators

  Background:
    Given the administrator has set the default folder for received shares to "Shares" in the server
    And these users have been created with default attributes and without skeleton files in the server:
      | username |
      | Alice    |
      | Brian    |
    And user "Brian" has created folder "simple-folder" in the server
    And user "Brian" has created folder "simple-empty-folder" in the server
    And user "Brian" has created folder "simple-folder/simple-empty-folder" in the server
    And user "Brian" has uploaded file "data.zip" to "data.zip" in the server
    And user "Brian" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Brian" has uploaded file "lorem.txt" to "simple-folder/lorem.txt" in the server

  @issue-ocis-2260
  Scenario: Change permissions of the previously shared folder to read, share
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "read" permissions in the server
    And user "Brian" has logged in using the webUI
    Then no custom permissions should be set for collaborator "Alice Hansen" for folder "simple-folder" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for folder "simple-folder" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, share           |

  @issue-1853 @issue-ocis-2260
  Scenario: Change permissions of the previously shared folder to all permissions
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "read, share, create, delete" permissions in the server
    And user "Brian" has logged in using the webUI
    Then custom permissions "share, create, delete" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for folder "simple-folder" to "create, delete, share" using the webUI
    Then custom permission "share, create, delete" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                       |
      | uid_owner   | Brian                       |
      | share_with  | Alice                       |
      | file_target | /Shares/simple-folder       |
      | item_type   | folder                      |
      | permissions | read, share, create, delete |

  @issue-1853 @issue-ocis-2260
  Scenario: Change permissions of the previously shared folder to update, delete
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "read, share, create" permissions in the server
    And user "Brian" has logged in using the webUI
    Then custom permissions "share, create" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for folder "simple-folder" to "delete, update" using the webUI
    Then custom permission "delete, update" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, update, delete  |

  @issue-ocis-2260
  Scenario: Change permissions of the previously shared folder to read, create, share
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "read, delete" permissions in the server
    And user "Brian" has logged in using the webUI
    Then custom permissions "delete" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for folder "simple-folder" to "create, share" using the webUI
    Then custom permission "create, share" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
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
    Then user "Alice Hansen" should be listed as "<displayed-role>" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | <permissions>         |
    Examples:
      | role                 | displayed-role         | extra-permissions             | displayed-permissions         | permissions                         |
      | Viewer               | Can view               | ,                             | share                         | read, share                         |
      | Editor               | Can edit               | ,                             | delete, share, create, update | all                                 |
      | Custom permissions   | Custom permissions     | share, create                 | share, create                 | read, share, create                 |
      | Custom permissions   | Custom permissions     | update, share                 | share, update                 | read, update, share                 |
      | Custom permissions   | Can edit               | delete, share, create, update | delete, share, create, update | read, share, delete, update, create |

  @issue-ocis-2260
  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then custom permission "<permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    And user "Alice" should have received a share with these details in the server:
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
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "read, update" permissions in the server
    And user "Brian" has logged in using the webUI
    When the user disables all the custom permissions of collaborator "Alice Hansen" for folder "simple-folder" using the webUI
    Then no custom permissions should be set for collaborator "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
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
    Then user "Alice Hansen" should be listed as "<displayed-role>" in the collaborators list for file "lorem.txt" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | role                 | displayed-role   | collaborators-permissions | displayed-permissions | permissions         |
      | Viewer               | Can view         | ,                         | share                 | read, share         |
      | Editor               | Can edit         | ,                         | share, update         | read, share, update |
      | Custom permissions   | Can edit         | share, update             | share, update         | read, share, update |

  @issue-ocis-2260
  Scenario: Share a folder without share permissions using API and check if it is listed on the collaborators list for original owner
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "read" permissions in the server
    And user "Brian" has logged in using the webUI
    When the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And no custom permissions should be set for collaborator "Alice Hansen" for folder "simple-folder" on the webUI


  Scenario: Resource owner upgrades share permissions of a re-share
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "Brian" has shared folder "simple-folder" with user "Alice" with "read, share, delete" permissions in the server
    And user "Alice" has shared folder "/Shares/simple-folder" with user "Carol" with "read, delete" permissions in the server
    And user "Brian" has logged in using the webUI
    When the user sets custom permission for current role of collaborator "Carol King" for folder "simple-folder" to "delete, update" using the webUI
    Then custom permissions "delete, update" should be set for user "Carol King" for folder "simple-folder" on the webUI
    And user "Carol" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Alice                 |
      | share_with  | Carol                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | delete, read, update  |
