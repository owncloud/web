@skipOnOCIS
Feature: Resharing shared files with different permissions
  As a user
  I want to reshare received files and folders with other users with different permissions
  So that I can control the access on those files/folders by other collaborators

  Background:
    Given these users have been created with default attributes:
      | username |
      | user1    |
      | user2    |
      | user3    |

  Scenario: Reshare a folder without share permissions using API and check if it is listed on the collaborators list for original owner
      Given user "user2" has shared folder "simple-folder" with user "user1" with "read, share" permissions
      And user "user1" has shared folder "simple-folder (2)" with user "user3" with "read" permissions
      And user "user2" has logged in using the webUI
      When the user opens the share dialog for folder "simple-folder" using the webUI
      Then user "User Three" should be listed as "Viewer" in the collaborators list for folder "simple-folder" on the webUI
      And no custom permissions should be set for collaborator "User Three" for folder "simple-folder" on the webUI

  Scenario: Reshare a folder without share permissions using API and check if it is listed on the collaborators list for resharer
      Given user "user2" has shared folder "simple-folder" with user "user1" with "read, share" permissions
      And user "user1" has shared folder "simple-folder (2)" with user "user3" with "read" permissions
      And user "user1" has logged in using the webUI
      When the user opens the share dialog for folder "simple-folder (2)" using the webUI
      Then user "User Three" should be listed as "Viewer" in the collaborators list for folder "simple-folder (2)" on the webUI
      And no custom permissions should be set for collaborator "User Three" for folder "simple-folder (2)" on the webUI

  Scenario: Reshare a folder without share permissions using API and check if the receiver can reshare
    Given user "user2" has shared folder "simple-folder" with user "user1" with "read, share" permissions
    And user "user1" has shared folder "simple-folder (2)" with user "user3" with "read" permissions
    When user "user3" logs in using the webUI
    Then the user should not be able to share folder "simple-folder (2)" using the webUI

  Scenario Outline: share a received folder with another user with same permissions(including share permissions) and check if the user is displayed in collaborators list for resharer
    Given user "user2" has shared folder "simple-folder" with user "user1" with "<permissions>" permissions
    And user "user1" has logged in using the webUI
    When the user shares folder "simple-folder (2)" with user "User Three" as "<role>" with permissions "<collaborators-permissions>" using the webUI
    Then user "User Three" should be listed as "<displayed-role>" in the collaborators list for folder "simple-folder (2)" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "User Three" for folder "simple-folder (2)" on the webUI
    And user "user3" should have received a share with these details:
    | field       | value              |
    | uid_owner   | user1              |
    | share_with  | user3              |
    | file_target | /simple-folder (2) |
    | item_type   | folder             |
    | permissions | <permissions>      |
    Examples:
    | role                 | displayed-role          | collaborators-permissions     | displayed-permissions | permissions                         |
    | Viewer               | Viewer                  | share                         | share                 | read, share                         |
    | Editor               | Editor                  | share                         | share                 | all                                 |
    | Advanced permissions | Advanced permissions    | share, create                 | share, create         | read, share, create                 |
    | Advanced permissions | Advanced permissions    | update, share                 | share, update         | read, update, share                 |
    | Advanced permissions | Editor                  | delete, share, create, update | share                 | read, share, delete, update, create |

  Scenario Outline: share a received folder with another user with same permissions(including share permissions) and check if the user is displayed in collaborators list for original owner
    Given user "user2" has shared folder "simple-folder" with user "user1" with "<permissions>" permissions
    And user "user1" has logged in using the webUI
    When the user shares folder "simple-folder (2)" with user "User Three" as "<role>" with permissions "<collaborators-permissions>" using the webUI
    And the user re-logs in as "user2" using the webUI
    Then user "User Three" should be listed as "<displayed-role>" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "User Three" for folder "simple-folder" on the webUI
    And user "User One" should be listed as "<displayed-role>" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "User One" for folder "simple-folder" on the webUI
    And user "user3" should have received a share with these details:
    | field       | value              |
    | uid_owner   | user1              |
    | share_with  | user3              |
    | file_target | /simple-folder (2) |
    | item_type   | folder             |
    | permissions | <permissions>      |
    And user "user1" should have received a share with these details:
    | field       | value              |
    | uid_owner   | user2              |
    | share_with  | user1              |
    | file_target | /simple-folder (2) |
    | item_type   | folder             |
    | permissions | <permissions>      |
    Examples:
    | role                 | displayed-role          | collaborators-permissions     | displayed-permissions | permissions                         |
    | Viewer               | Viewer                  | share                         | share                 | read, share                         |
    | Editor               | Editor                  | share                         | share                 | all                                 |
    | Advanced permissions | Advanced permissions    | share, create                 | share, create         | read, share, create                 |
    | Advanced permissions | Advanced permissions    | update, share                 | share, update         | read, update, share                 |
    | Advanced permissions | Editor                  | delete, share, create, update | share                 | read, share, delete, update, create |

  Scenario: share a folder with another user with share permissions and reshare without share permissions to different user, and check if user is displayed for original sharer
    Given user "user2" has shared folder "simple-folder" with user "user1" with "read, share" permissions
    And user "user1" has logged in using the webUI
    When the user shares folder "simple-folder (2)" with user "User Three" as "Viewer" with permissions "," using the webUI
    And the user re-logs in as "user2" using the webUI
    Then user "User Three" should be listed as "Viewer" in the collaborators list for folder "simple-folder" on the webUI
    And no custom permissions should be set for collaborator "User Three" for folder "simple-folder" on the webUI
    And user "User One" should be listed as "Viewer" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share" should be set for user "User One" for folder "simple-folder" on the webUI
    And user "user1" should have received a share with these details:
    | field       | value              |
    | uid_owner   | user2              |
    | share_with  | user1              |
    | file_target | /simple-folder (2) |
    | item_type   | folder             |
    | permissions | read, share        |
    And user "user3" should have received a share with these details:
    | field       | value              |
    | uid_owner   | user1              |
    | share_with  | user3              |
    | file_target | /simple-folder (2) |
    | item_type   | folder             |
    | permissions | read               |

  Scenario: share a folder with another user with share permissions and reshare without share permissions to different user, and check if user is displayed for the receiver
    Given user "user2" has shared folder "simple-folder" with user "user1" with "read, share" permissions
    And user "user1" has logged in using the webUI
    When the user shares folder "simple-folder (2)" with user "User Three" as "Viewer" with permissions "," using the webUI
    And user "user3" should have received a share with these details:
    | field       | value              |
    | uid_owner   | user1              |
    | share_with  | user3              |
    | file_target | /simple-folder (2) |
    | item_type   | folder             |
    | permissions | read               |

  Scenario Outline: share a file/folder without share permissions and check if another user can reshare
    Given user "user2" has shared folder "<shared-entry-name>" with user "user1" with "read" permissions
    When user "user1" logs in using the webUI
    Then the user should not be able to share resource "<received-entry-name>" using the webUI
    Examples:
    | shared-entry-name | received-entry-name |
    | simple-folder     | simple-folder (2)   |
    | lorem.txt         | lorem (2).txt       |
    | simple-folder     | simple-folder (2)   |
    | lorem.txt         | lorem (2).txt       |

  Scenario Outline: share a received file/folder without share permissions and check if another user can reshare
    Given user "user2" has shared folder "<shared-entry-name>" with user "user1" with "all" permissions
    And user "user1" has shared folder "<received-entry-name>" with user "user3" with "read" permissions
    When user "user3" logs in using the webUI
    Then the user should not be able to share resource "<received-entry-name>" using the webUI
    Examples:
    | shared-entry-name | received-entry-name |
    | simple-folder     | simple-folder (2)   |
    | lorem.txt         | lorem (2).txt       |

  Scenario: User is allowed to reshare a file/folder with the equivalent received permissions, and collaborators should not be listed for the receiver
    Given user "user2" has shared folder "simple-folder" with user "user1" with "read, share, delete" permissions
    And user "user1" has logged in using the webUI
    When the user shares folder "simple-folder (2)" with user "User Three" as "Advanced permissions" with permissions "share, delete" using the webUI
    And the user re-logs in as "user3" using the webUI
    And the user opens the share dialog for folder "simple-folder (2)" using the webUI
    Then the current collaborators list should have order "User Two,User Three"
    And user "User Two" should be listed as "Owner" reshared through "User One" in the collaborators list on the webUI
    And user "user3" should have received a share with these details:
    | field       | value               |
    | uid_owner   | user1               |
    | share_with  | user3               |
    | file_target | /simple-folder (2)  |
    | item_type   | folder              |
    | permissions | share, delete, read |

  Scenario: User is allowed to reshare a file/folder with the lesser permissions, and check if it is listed for original owner
    Given user "user2" has shared folder "simple-folder" with user "user1" with "read, share, delete" permissions
    And user "user1" has logged in using the webUI
    When the user shares folder "simple-folder (2)" with user "User Three" as "Advanced permissions" with permissions "delete" using the webUI
    And the user re-logs in as "user2" using the webUI
    Then user "User One" should be listed as "Advanced permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, delete" should be set for user "User One" for folder "simple-folder" on the webUI
    And user "User Three" should be listed as "Advanced permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "delete" should be set for user "User Three" for folder "simple-folder" on the webUI
    And user "user3" should have received a share with these details:
    | field       | value              |
    | uid_owner   | user1              |
    | share_with  | user3              |
    | file_target | /simple-folder (2) |
    | item_type   | folder             |
    | permissions | delete, read       |

  Scenario: User is not allowed to reshare a file/folder with the higher permissions
    Given user "user2" has shared folder "simple-folder" with user "user1" with "read, share, delete" permissions
    And user "user1" has logged in using the webUI
    When the user shares folder "simple-folder (2)" with user "User Three" as "Advanced permissions" with permissions "share, delete, update" using the webUI
    Then the error message with header "Error while sharing." should be displayed on the webUI
    And as "user3" folder "simple-folder (2)" should not exist

  Scenario: Reshare a file and folder from shared with me page
    Given user "user1" has shared folder "simple-folder" with user "user2"
    And user "user1" has shared file "lorem.txt" with user "user2"
    And user "user2" has logged in using the webUI
    And the user has browsed to the shared-with-me page
    When the user shares folder "simple-folder (2)" with user "User Three" as "Editor" using the webUI
    And the user shares file "lorem (2).txt" with user "User Three" as "Editor" using the webUI
    Then as "user3" folder "simple-folder (2)" should exist
    And as "user3" file "lorem (2).txt" should exist

  Scenario: Reshare a file and folder from shared with others page
    Given user "user1" has shared folder "simple-folder" with user "user2"
    And user "user1" has shared file "lorem.txt" with user "user2"
    And user "user1" has logged in using the webUI
    And the user has browsed to the shared-with-others page
    When the user shares folder "simple-folder" with user "User Three" as "Editor" using the webUI
    And the user shares file "lorem.txt" with user "User Three" as "Editor" using the webUI
    Then as "user3" folder "simple-folder (2)" should exist
    And as "user3" file "lorem (2).txt" should exist

  Scenario: Reshare a file and folder from favorites page
    Given user "user1" has shared folder "simple-folder" with user "user2"
    And user "user1" has shared file "lorem.txt" with user "user2"
    And user "user2" has favorited element "simple-folder (2)"
    And user "user2" has favorited element "lorem (2).txt"
    And user "user2" has logged in using the webUI
    When the user browses to the favorites page using the webUI
    And the user shares folder "simple-folder (2)" with user "User Three" as "Editor" using the webUI
    And the user shares file "lorem (2).txt" with user "User Three" as "Editor" using the webUI
    Then as "user3" folder "simple-folder (2)" should exist
    And as "user3" file "lorem (2).txt" should exist

  Scenario: Resource owner sees resharer in collaborators list
    Given user "user3" has been created with default attributes
    And user "user1" has shared folder "simple-folder" with user "user2"
    And user "user2" has shared folder "simple-folder (2)" with user "user3"
    When user "user1" has logged in using the webUI
    And the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "User Two" should be listed as "Editor" in the collaborators list on the webUI
    And user "User Three" should be listed as "Editor" reshared through "User Two" in the collaborators list on the webUI

  Scenario: Share recipient sees resharer in collaborators list
    Given user "user3" has been created with default attributes
    And user "user4" has been created with default attributes
    And group "user4grp" has been created
    And user "user4" has been added to group "user4grp"
    And user "user1" has shared folder "simple-folder" with user "user2"
    And user "user1" has shared folder "simple-folder" with user "user3"
    And user "user2" has shared folder "simple-folder (2)" with user "user4"
    And user "user3" has shared folder "simple-folder (2)" with group "user4grp"
    When user "user4" has logged in using the webUI
    And the user opens the share dialog for folder "simple-folder (2)" using the webUI
    Then user "User One" should be listed as "Owner" reshared through "User Three, User Two" in the collaborators list on the webUI

