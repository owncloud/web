@ocis-reva-issue-64
Feature: Sharing files and folders with internal users with different permissions
  As a user
  I want to set different permissions on shared files and folders with other users
  So that I can control the access on those files/folders by other collaborators

  Background:
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares"
    And these users have been created with default attributes:
      | username |
      | user1    |
      | user2    |

  @issue-ocis-717
  Scenario: Change permissions of the previously shared folder
    Given user "user2" has shared folder "simple-folder" with user "user1" with "read" permissions
    And user "user1" has accepted the share "simple-folder" offered by user "user2"
    And user "user2" has logged in using the webUI
    Then no custom permissions should be set for collaborator "User One" for folder "simple-folder" on the webUI
    When the user sets custom permission for current role of collaborator "User One" for folder "simple-folder" to "share" using the webUI
    Then user "user1" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | user2                 |
      | share_with  | user1                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read, share           |

  @skipOnOC10 @issue-ocis-717
  #after fixing the issue delete this scenario and use the one above by deleting the @skipOnOCIS tag there
  Scenario: Change permissions of the previously shared folder
    Given user "user2" has shared folder "simple-folder" with user "user1" with "read, update" permissions
    And user "user1" has accepted the share "simple-folder" offered by user "user2"
    And user "user2" has logged in using the webUI
    Then custom permission "update" should be set for user "User One" for folder "simple-folder" on the webUI
    When the user sets custom permission for current role of collaborator "User One" for folder "simple-folder" to "create" using the webUI
    Then custom permissions "create, update" should be set for user "User One" for folder "simple-folder" on the webUI
    And user "user1" should have received a share with these details:
      | field       | value                |
      | uid_owner   | user2                |
      | share_with  | user1                |
      | file_target | /Shares/simple-folder|
      | item_type   | folder               |
      | permissions | read, update, create |

  @issue-1853 @issue-product-270
  Scenario: Change permissions of the previously shared folder
    Given user "user2" has shared folder "simple-folder" with user "user1" with "read, share, create, delete" permissions
    And user "user1" has accepted the share "simple-folder" offered by user "user2"
    And user "user2" has logged in using the webUI
    Then custom permissions "share, create, delete" should be set for user "User One" for folder "simple-folder" on the webUI
    When the user sets custom permission for current role of collaborator "User One" for folder "simple-folder" to "create, delete, share" using the webUI
    Then custom permission "share, create, delete" should be set for user "User One" for folder "simple-folder" on the webUI
    And user "user1" should have received a share with these details:
      | field       | value                       |
      | uid_owner   | user2                       |
      | share_with  | user1                       |
      | file_target | /Shares/simple-folder       |
      | item_type   | folder                      |
      | permissions | read, share, create, delete |

  @issue-1853 @issue-product-270
  Scenario: Change permissions of the previously shared folder
    Given user "user2" has shared folder "simple-folder" with user "user1" with "read, share, create" permissions
    And user "user1" has accepted the share "simple-folder" offered by user "user2"
    And user "user2" has logged in using the webUI
    Then custom permissions "share, create" should be set for user "User One" for folder "simple-folder" on the webUI
    When the user sets custom permission for current role of collaborator "User One" for folder "simple-folder" to "delete, update" using the webUI
    Then custom permission "delete, update" should be set for user "User One" for folder "simple-folder" on the webUI
    And user "user1" should have received a share with these details:
      | field       | value                |
      | uid_owner   | user2                |
      | share_with  | user1                |
      | file_target | /Shares/simple-folder |
      | item_type   | folder               |
      | permissions | read, update, delete |

  @issue-product-270
  Scenario: Change permissions of the previously shared folder
    Given user "user2" has shared folder "simple-folder" with user "user1" with "read, delete" permissions
    And user "user1" has accepted the share "simple-folder" offered by user "user2"
    And user "user2" has logged in using the webUI
    Then custom permissions "delete" should be set for user "User One" for folder "simple-folder" on the webUI
    When the user sets custom permission for current role of collaborator "User One" for folder "simple-folder" to "create, share" using the webUI
    Then custom permission "create, share" should be set for user "User One" for folder "simple-folder" on the webUI
    And user "user1" should have received a share with these details:
      | field       | value               |
      | uid_owner   | user2               |
      | share_with  | user1               |
      | file_target | /Shares/simple-folder |
      | item_type   | folder              |
      | permissions | read, create, share |

  @issue-ocis-717
  Scenario Outline: share a folder with another internal user assigning a role and the permissions
    Given user "user2" has logged in using the webUI
    When the user shares folder "simple-folder" with user "User One" as "<role>" with permissions "<extra-permissions>" using the webUI
    And user "user1" accepts the share "simple-folder" offered by user "user2" using the sharing API
    Then user "User One" should be listed as "<displayed-role>" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "User One" for folder "simple-folder" on the webUI
    Then user "user1" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | user2                 |
      | share_with  | user1                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | <permissions>         |
    Examples:
      | role                 | displayed-role          | extra-permissions             | displayed-permissions | permissions                         |
      | Viewer               | Viewer                  | ,                             | ,                     | read, share                         |
      | Editor               | Editor                  | ,                             | ,                     | all                                 |
      | Advanced permissions | Advanced permissions    | share, create                 | share, create         | read, share, create                 |
      | Advanced permissions | Advanced permissions    | update, share                 | share, update         | read, update, share                 |
      | Advanced permissions | Editor                  | delete, share, create, update | ,                     | read, share, delete, update, create |

  @skipOnOC10 @issue-ocis-717
  #after fixing the issue delete this scenario and use the one above by deleting the @skipOnOCIS tag there
  Scenario Outline: share a folder with another internal user assigning a role and the permissions
    Given user "user2" has logged in using the webUI
    When the user shares folder "simple-folder" with user "User One" as "<role>" with permissions "<extra-permissions>" using the webUI
    And user "user1" accepts the share "simple-folder" offered by user "user2" using the sharing API
    Then user "User One" should be listed as "<displayed-role>" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "User One" for folder "simple-folder" on the webUI
    Then user "user1" should have received a share with these details:
      | field       | value          |
      | uid_owner   | user2          |
      | share_with  | user1          |
      | file_target | /Shares/simple-folder |
      | item_type   | folder         |
      | permissions | <permissions>  |
    Examples:
      | role                 | displayed-role       | extra-permissions             | displayed-permissions | permissions                  |
      | Viewer               | Viewer               | ,                             | ,                     | read                         |
      | Editor               | Editor               | ,                             | ,                     | read, create, update, delete |
      | Advanced permissions | Advanced permissions | create                        | create, update        | read, create, update         |
      | Advanced permissions | Advanced permissions | update                        | update                | read, update                 |
      | Advanced permissions | Editor               | delete, create, update        | ,                     | read, delete, update, create |

  @issue-ocis-717
  Scenario Outline: Change permissions of the previously shared file
    Given user "user2" has shared file "lorem.txt" with user "user1" with "<initial-permissions>" permissions
    And user "user1" has accepted the share "lorem.txt" offered by user "user2"
    And user "user2" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "User One" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "User One" for file "lorem.txt" to "share" using the webUI
    Then user "user1" should have received a share with these details:
      | field       | value             |
      | uid_owner   | user2             |
      | share_with  | user1             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions         | displayed-permissions |
      | read, update        | read, share         | update                |
      | read                | read, share         | ,                     |

  #  As the reshare permission has been hidden in oCIS there's no use for this scenario at the moment
  # @skipOnOC10 @issue-ocis-717
  # #after fixing the issue delete this scenario and use the one above by deleting the @skipOnOCIS tag there
  # Scenario Outline: Change permissions of the previously shared file
  #   Given user "user2" has shared file "lorem.txt" with user "user1" with "<initial-permissions>" permissions
  #   And user "user1" has accepted the share "lorem.txt" offered by user "user2"
  #   And user "user2" has logged in using the webUI
  #   Then no custom permissions should be set for collaborator "User One" for file "lorem.txt" on the webUI
  #   When the user sets custom permission for current role of collaborator "User One" for file "lorem.txt" to "share" using the webUI
  #   Then custom permission "share" should be set for user "User One" for file "lorem.txt" on the webUI
  #   And user "user1" should have received a share with these details:
  #     | field       | value         |
  #     | uid_owner   | user2         |
  #     | share_with  | user1         |
  #     | file_target | /lorem.txt    |
  #     | item_type   | file          |
  #     | permissions | <permissions> |
  #   Examples:
  #     | initial-permissions | permissions         |
  #     | read, update        | read, share, update |
  #     | read                | read, share         |

  @issue-ocis-717
  Scenario: Delete all custom permissions of the previously shared folder
    Given user "user2" has shared folder "simple-folder" with user "user1" with "read, update" permissions
    And user "user1" has accepted the share "simple-folder" offered by user "user2"
    And user "user2" has logged in using the webUI
    When the user disables all the custom permissions of collaborator "User One" for folder "simple-folder" using the webUI
    Then no custom permissions should be set for collaborator "User One" for folder "simple-folder" on the webUI
    And user "user1" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | user2                 |
      | share_with  | user1                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read                  |

  #  As the reshare permission has been hidden in oCIS there's no use for this scenario at the moment
  # @skipOnOC10 @issue-ocis-717
  # #after fixing the issue delete this scenario and use the one above by deleting the @skipOnOCIS tag there
  # Scenario: Delete all custom permissions of the previously shared file
  #   Given user "user2" has shared file "lorem.txt" with user "user1" with "read, share" permissions
  #   And user "user1" has accepted the share "lorem.txt" offered by user "user2"
  #   And user "user2" has logged in using the webUI
  #   Then custom permissions "share" should be set for user "User One" for file "lorem.txt" on the webUI
  #   When the user disables all the custom permissions of collaborator "User One" for file "lorem.txt" using the webUI
  #   Then no custom permissions should be set for collaborator "User One" for file "lorem.txt" on the webUI
  #   And user "user1" should have received a share with these details:
  #     | field       | value      |
  #     | uid_owner   | user2      |
  #     | share_with  | user1      |
  #     | file_target | /lorem.txt |
  #     | item_type   | file       |
  #     | permissions | read       |

  @issue-ocis-717
  Scenario Outline: share a file with another internal user assigning a role and the permissions
    Given user "user2" has logged in using the webUI
    When the user shares file "lorem.txt" with user "User One" as "<role>" with permissions "<collaborators-permissions>" using the webUI
    And user "user1" accepts the share "lorem.txt" offered by user "user2" using the sharing API
    Then user "User One" should be listed as "<displayed-role>" in the collaborators list for file "lorem.txt" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "User One" for file "lorem.txt" on the webUI
    Then user "user1" should have received a share with these details:
      | field       | value             |
      | uid_owner   | user2             |
      | share_with  | user1             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | role                 | displayed-role | collaborators-permissions | displayed-permissions | permissions         |
      | Viewer               | Viewer         | ,                         | ,                     | read, share         |
      | Editor               | Editor         | ,                         | ,                     | read, share, update |
      | Advanced permissions | Editor         | share, update             | ,                     | read, share, update |

  @skipOnOC10 @issue-ocis-717
  #after fixing the issue delete this scenario and use the one above by deleting the @skipOnOCIS tag there
  Scenario Outline: share a file with another internal user assigning a role and the permissions
    Given user "user2" has logged in using the webUI
    When the user shares file "lorem.txt" with user "User One" as "<role>" with permissions "<collaborators-permissions>" using the webUI
    And user "user1" accepts the share "lorem.txt" offered by user "user2" using the sharing API
    Then user "User One" should be listed as "<displayed-role>" in the collaborators list for file "lorem.txt" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "User One" for file "lorem.txt" on the webUI
    Then user "user1" should have received a share with these details:
      | field       | value         |
      | uid_owner   | user2         |
      | share_with  | user1         |
      | file_target | /Shares/lorem.txt    |
      | item_type   | file          |
      | permissions | <permissions> |
    Examples:
      | role                 | displayed-role | collaborators-permissions | displayed-permissions | permissions  |
      | Viewer               | Viewer         | ,                         | ,                     | read         |
      | Editor               | Editor         | ,                         | ,                     | read, update |
      | Advanced permissions | Editor         | update                    | ,                     | read, update |


  Scenario: Share a folder without share permissions using API and check if it is listed on the collaborators list for original owner
    Given user "user2" has shared folder "simple-folder" with user "user1" with "read" permissions
    And user "user1" has accepted the share "simple-folder" offered by user "user2"
    And user "user2" has logged in using the webUI
    When the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "User One" should be listed as "Advanced permissions" in the collaborators list for folder "simple-folder" on the webUI
    And no custom permissions should be set for collaborator "User One" for folder "simple-folder" on the webUI

  @skipOnOC10
  Scenario: Share a folder without share permissions using API and check if it is listed on the collaborators list for original owner
    Given user "user2" has shared folder "simple-folder" with user "user1" with "read" permissions
    And user "user1" has accepted the share "simple-folder" offered by user "user2"
    And user "user2" has logged in using the webUI
    When the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "User One" should be listed as "Viewer" in the collaborators list for folder "simple-folder" on the webUI
    And no custom permissions should be set for collaborator "User One" for folder "simple-folder" on the webUI

  @issue-product-270
  Scenario: Resource owner upgrades share permissions of a re-share
    Given user "user3" has been created with default attributes
    And user "user2" has shared folder "simple-folder" with user "user1" with "read, share, delete" permissions
    And user "user1" has accepted the share "simple-folder" offered by user "user2"
    And user "user1" has shared folder "/Shares/simple-folder" with user "user3" with "read, delete" permissions
    And user "user3" has accepted the share "simple-folder" offered by user "user1"
    And user "user2" has logged in using the webUI
    When the user sets custom permission for current role of collaborator "User Three" for folder "simple-folder" to "delete, update" using the webUI
    Then custom permissions "delete, update" should be set for user "User Three" for folder "simple-folder" on the webUI
    And user "user3" should have received a share with these details:
      | field       | value                |
      | uid_owner   | user1                |
      | share_with  | user3                |
      | file_target | /Shares/simple-folder |
      | item_type   | folder               |
      | permissions | delete, read, update |

  @issue-product-270
  Scenario: User is not allowed to reshare sub-folder with more permissions
    Given user "user3" has been created with default attributes
    And user "user2" has shared folder "simple-folder" with user "user1" with "read, share, delete" permissions
    And user "user1" has accepted the share "simple-folder" offered by user "user2"
    And user "user1" has logged in using the webUI
    When the user opens folder "Shares" using the webUI
    And the user opens folder "simple-folder" using the webUI
    And the user shares folder "simple-empty-folder" with user "User Three" as "Advanced permissions" with permissions "share, delete, update" using the webUI
    Then the error message with header "Error while sharing." should be displayed on the webUI
    And user "user3" should not have received any shares
    And as "user3" folder "/Shares/simple-empty-folder" should not exist

  @issue-product-270
  Scenario: User is not allowed to update permissions of a reshared sub-folder to higher permissions than what user has received
    Given user "user3" has been created with default attributes
    And user "user2" has shared folder "simple-folder" with user "user1" with "read, share, delete, update" permissions
    And user "user1" has accepted the share "simple-folder" offered by user "user2"
    And user "user1" has shared folder "/Shares/simple-folder" with user "user3" with "share, delete" permissions
    And user "user1" has logged in using the webUI
    When the user opens folder "Shares" using the webUI
    And the user opens folder "simple-folder" using the webUI
    And the user shares folder "simple-empty-folder" with user "User Three" as "Advanced permissions" with permissions "share, delete, update, create" using the webUI
    Then the error message with header "Error while sharing." should be displayed on the webUI
    And user "user3" should not have received any shares
    And as "user3" folder "/Shares/simple-empty-folder" should not exist

  @issue-ocis-717
  Scenario: User is allowed to update permissions of a reshared sub-folder within the permissions that the user has received
    Given user "user3" has been created with default attributes
    And user "user2" has shared folder "simple-folder" with user "user1" with "all" permissions
    And user "user1" has accepted the share "simple-folder" offered by user "user2"
    And user "user1" has shared folder "/Shares/simple-folder" with user "user3" with "share, delete" permissions
    And user "user1" has logged in using the webUI
    When the user opens folder "Shares" using the webUI
    And the user browses to the folder "simple-folder" on the files page
    And the user shares folder "simple-empty-folder" with user "User Three" as "Advanced permissions" with permissions "share, delete, create, update" using the webUI
    And user "user3" accepts the share "simple-folder/simple-empty-folder" offered by user "user1" using the sharing API
    Then user "user3" should have received a share with these details:
      | field       | value                       |
      | uid_owner   | user1                       |
      | share_with  | user3                       |
      | file_target | /Shares/simple-empty-folder |
      | item_type   | folder                      |
      | permissions | all                         |

  @skipOnOC10 @issue-ocis-reva-372 @issue-ocis-717
  #after fixing the issue delete this scenario and use the one above by deleting the @skipOnOCIS tag there
  Scenario: User is allowed to update permissions of a reshared sub-folder within the permissions that the user has received
    Given user "user3" has been created with default attributes
    And user "user2" has shared folder "simple-folder" with user "user1" with "all" permissions
    And user "user1" has accepted the share "simple-folder" offered by user "user2"
    And user "user1" has shared folder "/Shares/simple-folder" with user "user3" with "share, delete" permissions
    And user "user1" has logged in using the webUI
    When the user opens folder "Shares" using the webUI
    And the user browses to the folder "simple-folder" on the files page
    And the user shares folder "simple-empty-folder" with user "User Three" as "Advanced permissions" with permissions "delete, create, update" using the webUI
    And user "user3" accepts the share "simple-empty-folder" offered by user "user1" using the sharing API
    Then user "user3" should have received a share with these details:
      | field       | value                        |
      | uid_owner   | user1                        |
      | share_with  | user3                        |
      | file_target | /Shares/simple-empty-folder         |
      | item_type   | folder                       |
      | permissions | read, delete, create, update |
