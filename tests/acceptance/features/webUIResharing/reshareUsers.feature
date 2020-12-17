# Reshare permission is not available now in the oCIS webUI
Feature: Resharing shared files with different permissions
  As a user
  I want to reshare received files and folders with other users with different permissions
  So that I can control the access on those files/folders by other collaborators

  Background:
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares"
    And these users have been created with default attributes:
      | username |
      | user1    |
      | user2    |
      | user3    |

  Scenario: Reshare a folder without share permissions using API and check if it is listed on the collaborators list for original owner
    Given user "user2" has shared folder "simple-folder" with user "user1" with "read, share" permissions
    And user "user1" has accepted the share "simple-folder" offered by user "user2"
    And user "user1" has shared folder "Shares/simple-folder" with user "user3" with "read" permissions
    And user "user3" has accepted the share "simple-folder" offered by user "user1"
    And user "user2" has logged in using the webUI
    When the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "User Three" should be listed as "Advanced permissions" in the collaborators list for folder "simple-folder" on the webUI
    And no custom permissions should be set for collaborator "User Three" for folder "simple-folder" on the webUI

  Scenario: Reshare a folder without share permissions using API and check if it is listed on the collaborators list for resharer
    Given user "user2" has shared folder "simple-folder" with user "user1" with "read, share" permissions
    And user "user1" has accepted the share "simple-folder" offered by user "user2"
    And user "user1" has shared folder "Shares/simple-folder" with user "user3" with "read" permissions
    And user "user3" has accepted the share "simple-folder" offered by user "user1"
    And user "user1" has logged in using the webUI
    And the user opens folder "Shares" using the webUI
    When the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "User Three" should be listed as "Advanced permissions" in the collaborators list for folder "simple-folder" on the webUI
    And no custom permissions should be set for collaborator "User Three" for folder "simple-folder" on the webUI

  @issue-product-270
  Scenario: Reshare a folder without share permissions using API and check if the receiver can reshare
    Given user "user2" has shared folder "simple-folder" with user "user1" with "read, share" permissions
    And user "user1" has accepted the share "simple-folder" offered by user "user2"
    And user "user1" has shared folder "/Shares/simple-folder" with user "user3" with "read" permissions
    And user "user3" has accepted the share "simple-folder" offered by user "user1"
    When user "user3" logs in using the webUI
    And the user opens folder "Shares" using the webUI
    Then the user should not be able to share folder "simple-folder" using the webUI


  Scenario Outline: share a received folder with another user with same permissions(including share permissions) and check if the user is displayed in collaborators list for resharer
    Given user "user2" has shared folder "simple-folder" with user "user1" with "<permissions>" permissions
    And user "user1" has accepted the share "simple-folder" offered by user "user2"
    And user "user1" has logged in using the webUI
    And the user opens folder "Shares" using the webUI
    When the user shares folder "simple-folder" with user "User Three" as "<role>" with permissions "<collaborators-permissions>" using the webUI
    And user "user3" accepts the share "simple-folder" offered by user "user1" using the sharing API
    Then user "User Three" should be listed as "<displayed-role>" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "User Three" for folder "simple-folder" on the webUI
    Then user "user3" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | user1                 |
      | share_with  | user3                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | <permissions>         |
    Examples:
    | role                 | displayed-role          | collaborators-permissions     | displayed-permissions | permissions                         |
    | Viewer               | Viewer                  | ,                             | ,                     | read, share                         |
    | Editor               | Editor                  | ,                             | ,                     | all                                 |
    | Advanced permissions | Advanced permissions    | share, create                 | share, create         | read, share, create                 |
    | Advanced permissions | Advanced permissions    | update, share                 | share, update         | read, update, share                 |
    | Advanced permissions | Editor                  | delete, share, create, update |                       | read, share, delete, update, create |

  @skipOnOC10
  #after fixing the issue delete this scenario and use the one above by deleting the @skipOnOCIS tag there
  Scenario Outline: share a received folder with another user with same permissions(including share permissions) and check if the user is displayed in collaborators list for resharer
    Given user "user2" has shared folder "simple-folder" with user "user1" with "<permissions>" permissions
    And user "user1" has accepted the share "simple-folder" offered by user "user2"
    And user "user1" has logged in using the webUI
    And the user opens folder "Shares" using the webUI
    When the user shares folder "simple-folder" with user "User Three" as "<role>" with permissions "<collaborators-permissions>" using the webUI
    And user "user3" accepts the share "simple-folder" offered by user "user1" using the sharing API
    Then user "User Three" should be listed as "<displayed-role>" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "User Three" for folder "simple-folder" on the webUI
    Then user "user3" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | user1                 |
      | share_with  | user3                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | <permissions>         |
    Examples:
      | role                 | displayed-role       | collaborators-permissions | displayed-permissions | permissions                  |
      | Viewer               | Viewer               | ,                         | ,                     | read                         |
      | Editor               | Editor               | ,                         | ,                     | all                          |
      | Advanced permissions | Advanced permissions | create                    | create                | read, create                 |
      | Advanced permissions | Advanced permissions | update                    | update                | read, update                 |
      | Advanced permissions | Editor               | delete, create, update    |                       | read, delete, update, create |

  @issue-4193
  Scenario Outline: share a received folder with another user with same permissions(including share permissions) and check if the user is displayed in collaborators list for original owner
    Given user "user2" has shared folder "simple-folder" with user "user1" with "<permissions>" permissions
    And user "user1" has accepted the share "simple-folder" offered by user "user2"
    And user "user1" has logged in using the webUI
    And the user opens folder "Shares" using the webUI
    When the user shares folder "simple-folder" with user "User Three" as "<role>" with permissions "<collaborators-permissions>" using the webUI
    And user "user3" accepts the share "simple-folder" offered by user "user1" using the sharing API
    And the user re-logs in as "user2" using the webUI
    Then user "User Three" should be listed as "<displayed-role>" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "User Three" for folder "simple-folder" on the webUI
    And user "User One" should be listed as "<displayed-role>" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "User One" for folder "simple-folder" on the webUI
    And user "user3" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | user1                 |
      | share_with  | user3                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | <permissions>         |
    And user "user1" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | user2                 |
      | share_with  | user1                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | <permissions>         |
    Examples:
    | role                 | displayed-role          | collaborators-permissions     | displayed-permissions | permissions                         |
    | Viewer               | Viewer                  | ,                             | ,                     | read, share                         |
    | Editor               | Editor                  | ,                             | ,                     | all                                 |
    | Advanced permissions | Advanced permissions    | share, create                 | share, create         | read, share, create                 |
    | Advanced permissions | Advanced permissions    | update, share                 | share, update         | read, update, share                 |
    | Advanced permissions | Editor                  | delete, share, create, update | ,                     | read, share, delete, update, create |

  @skipOnOC10 @issue-ocis-717
  #after fixing the issue delete this scenario and use the one above by deleting the @skipOnOCIS tag there
  Scenario Outline: share a received folder with another user with same permissions(including share permissions) and check if the user is displayed in collaborators list for original owner
    Given user "user2" has shared folder "simple-folder" with user "user1" with "<permissions>" permissions
    And user "user1" has accepted the share "simple-folder" offered by user "user2"
    And user "user1" has logged in using the webUI
    And the user opens folder "Shares" using the webUI
    When the user shares folder "simple-folder" with user "User Three" as "<role>" with permissions "<collaborators-permissions>" using the webUI
    And user "user3" accepts the share "simple-folder" offered by user "user1" using the sharing API
    And the user re-logs in as "user2" using the webUI
    Then user "User Three" should be listed as "<displayed-role>" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "User Three" for folder "simple-folder" on the webUI
    And user "User One" should be listed as "<displayed-role>" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "User One" for folder "simple-folder" on the webUI
    And user "user3" should have received a share with these details:
      | field       | value          |
      | uid_owner   | user1          |
      | share_with  | user3          |
      | file_target | /simple-folder |
      | item_type   | folder         |
      | permissions | <permissions>  |
    And user "user1" should have received a share with these details:
      | field       | value          |
      | uid_owner   | user2          |
      | share_with  | user1          |
      | file_target | /simple-folder |
      | item_type   | folder         |
      | permissions | <permissions>  |
    Examples:
      | role                 | displayed-role       | collaborators-permissions | displayed-permissions | permissions                  |
      | Viewer               | Viewer               | ,                         | ,                     | read                         |
      | Editor               | Editor               | ,                         | ,                     | all                          |
      | Advanced permissions | Advanced permissions | create                    | create                | read, create                 |
      | Advanced permissions | Advanced permissions | update                    | update                | read, update                 |
      | Advanced permissions | Editor               | delete, create, update    | ,                     | read, delete, update, create |

  @issue-4193
  Scenario: share a folder with another user with share permissions and reshare without share permissions to different user, and check if user is displayed for original sharer
    Given user "user2" has shared folder "simple-folder" with user "user1" with "read, share" permissions
    And user "user1" has accepted the share "simple-folder" offered by user "user2"
    And user "user1" has logged in using the webUI
    And the user opens folder "Shares" using the webUI
    When the user shares folder "simple-folder" with user "User Three" as "Viewer" with permissions "," using the webUI
    And user "user3" accepts the share "simple-folder" offered by user "user1" using the sharing API
    And the user re-logs in as "user2" using the webUI
    Then user "User Three" should be listed as "Viewer" in the collaborators list for folder "simple-folder" on the webUI
    And no custom permissions should be set for collaborator "User Three" for folder "simple-folder" on the webUI
    And user "User One" should be listed as "Viewer" in the collaborators list for folder "simple-folder" on the webUI
    And user "user1" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | user2                 |
      | share_with  | user1                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, share           |
    And user "user3" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | user1                 |
      | share_with  | user3                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, share           |

  @skipOnOC10
  #after fixing the issue delete this scenario and use the one above by deleting the @skipOnOCIS tag there
  Scenario: share a folder with another user with share permissions and reshare without share permissions to different user, and check if user is displayed for original sharer
    Given user "user2" has shared folder "simple-folder" with user "user1" with "read, share" permissions
    And user "user1" has accepted the share "simple-folder" offered by user "user2"
    And user "user1" has logged in using the webUI
    And the user opens folder "Shares" using the webUI
    When the user shares folder "simple-folder" with user "User Three" as "Viewer" with permissions "," using the webUI
    And user "user3" accepts the share "simple-folder" offered by user "user1" using the sharing API
    And the user re-logs in as "user2" using the webUI
    Then user "User Three" should be listed as "Viewer" in the collaborators list for folder "simple-folder" on the webUI
    And no custom permissions should be set for collaborator "User Three" for folder "simple-folder" on the webUI
    And user "User One" should be listed as "Viewer" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share" should be set for user "User One" for folder "simple-folder" on the webUI
    And user "user1" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | user2                 |
      | share_with  | user1                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, share           |
    And user "user3" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | user1                 |
      | share_with  | user3                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read                  |

  @issue-4193
  Scenario: share a folder with another user with share permissions and reshare without share permissions to different user, and check if user is displayed for the receiver
    Given user "user2" has shared folder "simple-folder" with user "user1" with "read, share" permissions
    And user "user1" has accepted the share "simple-folder" offered by user "user2"
    And user "user1" has logged in using the webUI
    And the user opens folder "Shares" using the webUI
    When the user shares folder "simple-folder" with user "User Three" as "Viewer" with permissions "," using the webUI
    And user "user3" accepts the share "simple-folder" offered by user "user1" using the sharing API
    And user "user3" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | user1                 |
      | share_with  | user3                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, share           |

  @skipOnOC10
  #after fixing the issue delete this scenario and use the one above by deleting the @skipOnOCIS tag there
  Scenario: share a folder with another user with share permissions and reshare without share permissions to different user, and check if user is displayed for the receiver
    Given user "user2" has shared folder "simple-folder" with user "user1" with "read, share" permissions
    And user "user1" has accepted the share "simple-folder" offered by user "user2"
    And user "user1" has logged in using the webUI
    And the user opens folder "Shares" using the webUI
    When the user shares folder "simple-folder" with user "User Three" as "Viewer" with permissions "," using the webUI
    And user "user3" accepts the share "simple-folder" offered by user "user1" using the sharing API
    And user "user3" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | user1                 |
      | share_with  | user3                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read                  |

  @issue-product-270
  Scenario Outline: share a file/folder without share permissions and check if another user can reshare
    Given user "user2" has shared folder "<shared-entry-name>" with user "user1" with "read" permissions
    And user "user1" has accepted the share "<shared-entry-name>" offered by user "user2"
    When user "user1" logs in using the webUI
    And the user opens folder "Shares" using the webUI
    Then the user should not be able to share resource "<shared-entry-name>" using the webUI
    Examples:
    | shared-entry-name |
    | simple-folder     |
    | lorem.txt         |
    | simple-folder     |
    | lorem.txt         |

  @issue-product-270
  Scenario Outline: share a received file/folder without share permissions and check if another user can reshare
    Given user "user2" has shared folder "<shared-entry-name>" with user "user1" with "all" permissions
    And user "user1" has accepted the share "<shared-entry-name>" offered by user "user2"
    And user "user1" has shared folder "/Shares/<shared-entry-name>" with user "user3" with "read" permissions
    And user "user3" has accepted the share "<shared-entry-name>" offered by user "user1"
    When user "user3" logs in using the webUI
    And the user opens folder "Shares" using the webUI
    Then the user should not be able to share resource "<shared-entry-name>" using the webUI
    Examples:
    | shared-entry-name |
    | simple-folder     |
    | lorem.txt         |


  Scenario: User is allowed to reshare a file/folder with the equivalent received permissions, and collaborators should not be listed for the receiver
    Given user "user2" has shared folder "simple-folder" with user "user1" with "read, share, delete" permissions
    And user "user1" has accepted the share "simple-folder" offered by user "user2"
    And user "user1" has logged in using the webUI
    And the user opens folder "Shares" using the webUI
    When the user shares folder "simple-folder" with user "User Three" as "Advanced permissions" with permissions "share, delete" using the webUI
    And user "user3" accepts the share "simple-folder" offered by user "user1" using the sharing API
    And the user re-logs in as "user3" using the webUI
    And the user opens folder "Shares" using the webUI
    And the user opens the share dialog for folder "simple-folder" using the webUI
    Then the current collaborators list should have order "User Two,User Three"
    And user "User Two" should be listed as "Owner" reshared through "User One" in the collaborators list on the webUI
    And user "user3" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | user1                 |
      | share_with  | user3                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | share, delete, read   |

  @skipOnOC10 @issue-ocis-717
  #after fixing the issue delete this scenario and use the one above by deleting the @skipOnOCIS tag there
  Scenario: User is allowed to reshare a file/folder with the equivalent received permissions, and collaborators should not be listed for the receiver
    Given user "user2" has shared folder "simple-folder" with user "user1" with "read, share, delete" permissions
    And user "user1" has accepted the share "simple-folder" offered by user "user2"
    And user "user1" has logged in using the webUI
    And the user opens folder "Shares" using the webUI
    When the user shares folder "simple-folder" with user "User Three" as "Advanced permissions" with permissions "share, delete" using the webUI
    And user "user3" accepts the share "simple-folder" offered by user "user1" using the sharing API
    And the user re-logs in as "user3" using the webUI
    And the user opens folder "Shares" using the webUI
    And the user opens the share dialog for folder "simple-folder" using the webUI
    Then the current collaborators list should have order "User Two,User Three"
    And user "User Two" should be listed as "Owner" reshared through "User One" in the collaborators list on the webUI
    And user "user3" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | user1                 |
      | share_with  | user3                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | share, delete, read   |

  @issue-product-270 @issue-4193
  Scenario: User is allowed to reshare a file/folder with the lesser permissions, and check if it is listed for original owner
    Given user "user2" has shared folder "simple-folder" with user "user1" with "read, share, delete" permissions
    And user "user1" has accepted the share "simple-folder" offered by user "user2"
    And user "user1" has logged in using the webUI
    And the user opens folder "Shares" using the webUI
    When the user shares folder "simple-folder" with user "User Three" as "Advanced permissions" with permissions "delete" using the webUI
    And user "user3" accepts the share "simple-folder" offered by user "user1" using the sharing API
    And the user re-logs in as "user2" using the webUI
    Then user "User One" should be listed as "Advanced permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, delete" should be set for user "User One" for folder "simple-folder" on the webUI
    And user "User Three" should be listed as "Advanced permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "delete" should be set for user "User Three" for folder "simple-folder" on the webUI
    And user "user3" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | user1                 |
      | share_with  | user3                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | delete, read          |

  @issue-product-270
  Scenario: User is not allowed to reshare a file/folder with the higher permissions
    Given user "user2" has shared folder "simple-folder" with user "user1" with "read, share, delete" permissions
    And user "user1" has accepted the share "simple-folder" offered by user "user2"
    And user "user1" has logged in using the webUI
    When the user opens folder "Shares" using the webUI
    And the user shares folder "simple-folder" with user "User Three" as "Advanced permissions" with permissions "share, delete, update" using the webUI
    Then the error message with header "Error while sharing." should be displayed on the webUI
    And as "user3" folder "Shares/simple-folder" should not exist
    And user "user3" should not have received any shares

  Scenario: Reshare a file and folder from shared with me page
    Given user "user1" has shared folder "simple-folder" with user "user2"
    And user "user2" has accepted the share "simple-folder" offered by user "user1"
    And user "user1" has shared file "lorem.txt" with user "user2"
    And user "user2" has accepted the share "lorem.txt" offered by user "user1"
    And user "user2" has logged in using the webUI
    And the user has browsed to the shared-with-me page
    When the user shares folder "simple-folder" with user "User Three" as "Editor" using the webUI
    And the user shares file "lorem.txt" with user "User Three" as "Editor" using the webUI
    And user "user3" accepts the share "simple-folder" offered by user "user2" using the sharing API
    And user "user3" accepts the share "lorem.txt" offered by user "user2" using the sharing API
    Then as "user3" folder "/Shares/simple-folder" should exist
    And as "user3" file "/Shares/lorem.txt" should exist

  Scenario: Reshare a file and folder from shared with others page
    Given user "user1" has shared folder "simple-folder" with user "user2"
    And user "user2" has accepted the share "simple-folder" offered by user "user1"
    And user "user1" has shared file "lorem.txt" with user "user2"
    And user "user2" has accepted the share "lorem.txt" offered by user "user1"
    And user "user1" has logged in using the webUI
    And the user has browsed to the shared-with-others page
    When the user shares folder "simple-folder" with user "User Three" as "Editor" using the webUI
    And the user shares file "lorem.txt" with user "User Three" as "Editor" using the webUI
    When user "user3" accepts the share "simple-folder" offered by user "user1" using the sharing API
    And user "user3" accepts the share "lorem.txt" offered by user "user1" using the sharing API
    Then as "user3" folder "/Shares/simple-folder" should exist
    And as "user3" file "/Shares/lorem.txt" should exist

  @ocis-reva-issue-39
  Scenario: Reshare a file and folder from favorites page
    Given user "user1" has shared folder "simple-folder" with user "user2"
    And user "user2" has accepted the share "simple-folder" offered by user "user1"
    And user "user1" has shared file "lorem.txt" with user "user2"
    And user "user2" has accepted the share "lorem.txt" offered by user "user1"
    And user "user2" has favorited element "/Shares/simple-folder"
    And user "user2" has favorited element "/Shares/lorem.txt"
    And user "user2" has logged in using the webUI
    When the user browses to the favorites page using the webUI
    And the user shares folder "Shares/simple-folder" with user "User Three" as "Editor" using the webUI
    And the user shares file "Shares/lorem.txt" with user "User Three" as "Editor" using the webUI
    And user "user3" accepts the share "simple-folder" offered by user "user2" using the sharing API
    And user "user3" accepts the share "lorem.txt" offered by user "user2" using the sharing API
    Then as "user3" folder "/Shares/simple-folder" should exist
    And as "user3" file "/Shares/lorem.txt" should exist


  Scenario: Resource owner sees resharer in collaborators list
    Given user "user3" has been created with default attributes
    And user "user1" has shared folder "simple-folder" with user "user2"
    And user "user2" has accepted the share "simple-folder" offered by user "user1"
    And user "user2" has shared folder "/Shares/simple-folder" with user "user3"
    And user "user3" has accepted the share "simple-folder" offered by user "user2"
    When user "user1" has logged in using the webUI
    And the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "User Two" should be listed as "Editor" in the collaborators list on the webUI
    And user "User Three" should be listed as "Editor" reshared through "User Two" in the collaborators list on the webUI

  @ocis-reva-issue-34
  Scenario: Share recipient sees resharer in collaborators list
    Given user "user3" has been created with default attributes
    And user "user4" has been created with default attributes
    And group "user4grp" has been created
    And user "user4" has been added to group "user4grp"
    And user "user1" has shared folder "simple-folder" with user "user2"
    And user "user2" has accepted the share "simple-folder" offered by user "user1"
    And user "user1" has shared folder "simple-folder" with user "user3"
    And user "user3" has accepted the share "simple-folder" offered by user "user1"
    And user "user2" has shared folder "/Shares/simple-folder" with user "user4"
    And user "user3" has shared folder "/Shares/simple-folder" with group "user4grp"
    And user "user4" has accepted the share "simple-folder" offered by user "user2"
    When user "user4" has logged in using the webUI
    When the user opens folder "Shares" using the webUI
    And the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "User One" should be listed as "Owner" reshared through "User Three, User Two" in the collaborators list on the webUI
