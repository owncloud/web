Feature: Sharing files and folders with internal users with different permissions
  As a user
  I want to set different permissions on shared files and folders with other users
  So that I can control the access on those files/folders by other collaborators

  Background:
    Given these users have been created with default attributes:
      | username |
      | user1    |
      | user2    |

  Scenario: Change permissions of the previously shared folder
    Given user "user2" has shared folder "simple-folder" with user "user1" with "read" permissions
    And user "user2" has logged in using the webUI
    Then no custom permissions should be set for collaborator "User One" for folder "simple-folder" on the webUI
    When the user sets custom permission for current role of collaborator "User One" for folder "simple-folder" to "share" using the webUI
    Then custom permission "share" should be set for user "User One" for folder "simple-folder" on the webUI
    And user "user1" should have received a share with these details:
      | field       | value              |
      | uid_owner   | user2              |
      | share_with  | user1              |
      | file_target | /simple-folder (2) |
      | item_type   | folder             |
      | permissions | read, share        |

  @issue-1853 @issue-1837
  Scenario: Change permissions of the previously shared folder
    Given user "user2" has shared folder "simple-folder" with user "user1" with "read, share, create, delete" permissions
    And user "user2" has logged in using the webUI
    Then no custom permissions should be set for collaborator "User One" for folder "simple-folder" on the webUI
    #    Then custom permissions "share, create, delete" should be set for user "User One" for folder "simple-folder" on the webUI
    When the user sets custom permission for current role of collaborator "User One" for folder "simple-folder" to "create, delete, share" using the webUI
    Then no custom permissions should be set for collaborator "User One" for folder "simple-folder" on the webUI
    #    Then custom permission "share, create, delete" should be set for user "User One" for folder "simple-folder" on the webUI
    And user "user1" should have received a share with these details:
      | field       | value                       |
      | uid_owner   | user2                       |
      | share_with  | user1                       |
      | file_target | /simple-folder (2)          |
      | item_type   | folder                      |
      | permissions | read, share, create, delete |

  @issue-1853 @issue-1837
  Scenario: Change permissions of the previously shared folder
    Given user "user2" has shared folder "simple-folder" with user "user1" with "read, share, create" permissions
    And user "user2" has logged in using the webUI
    Then custom permissions "share, create" should be set for user "User One" for folder "simple-folder" on the webUI
    When the user sets custom permission for current role of collaborator "User One" for folder "simple-folder" to "delete, change" using the webUI
    Then no custom permissions should be set for collaborator "User One" for folder "simple-folder" on the webUI
    #    Then custom permission "delete, change" should be set for user "User One" for folder "simple-folder" on the webUI
    And user "user1" should have received a share with these details:
      | field       | value                |
      | uid_owner   | user2                |
      | share_with  | user1                |
      | file_target | /simple-folder (2)   |
      | item_type   | folder               |
      | permissions | read, change, delete |

  Scenario: Change permissions of the previously shared folder
    Given user "user2" has shared folder "simple-folder" with user "user1" with "read, delete" permissions
    And user "user2" has logged in using the webUI
    Then custom permissions "delete" should be set for user "User One" for folder "simple-folder" on the webUI
    When the user sets custom permission for current role of collaborator "User One" for folder "simple-folder" to "create, share" using the webUI
    Then custom permission "create, share" should be set for user "User One" for folder "simple-folder" on the webUI
    And user "user1" should have received a share with these details:
      | field       | value               |
      | uid_owner   | user2               |
      | share_with  | user1               |
      | file_target | /simple-folder (2)  |
      | item_type   | folder              |
      | permissions | read, create, share |

  Scenario Outline: share a folder with another internal user assigning a role and the permissions
    Given user "user2" has logged in using the webUI
    When the user shares folder "simple-folder" with user "User One" as "<role>" with permissions "<extra-permissions>" using the webUI
    Then user "User One" should be listed as "<displayed-role>" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "User One" for folder "simple-folder" on the webUI
    And user "user1" should have received a share with these details:
      | field       | value              |
      | uid_owner   | user2              |
      | share_with  | user1              |
      | file_target | /simple-folder (2) |
      | item_type   | folder             |
      | permissions | <permissions>      |
    Examples:
      | role        | displayed-role | extra-permissions             | displayed-permissions | permissions                         |
      | Viewer      | Viewer         | share                         | share                 | read, share                         |
      | Editor      | Editor         | share                         | share                 | all                                 |
      | Custom Role | Custom role    | share, create                 | share, create         | read, share, create                 |
      | Custom Role | Editor         | change, share                 | share                 | read, change, share                 |
      | Custom Role | Editor         | delete, share, create, change | share                 | read, share, delete, change, create |

  Scenario Outline: Change permissions of the previously shared file
    Given user "user2" has shared file "lorem.txt" with user "user1" with "<initial-permissions>" permissions
    And user "user2" has logged in using the webUI
    Then no custom permissions should be set for collaborator "User One" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "User One" for file "lorem.txt" to "share" using the webUI
    Then custom permission "share" should be set for user "User One" for file "lorem.txt" on the webUI
    And user "user1" should have received a share with these details:
      | field       | value          |
      | uid_owner   | user2          |
      | share_with  | user1          |
      | file_target | /lorem (2).txt |
      | item_type   | file           |
      | permissions | <permissions>  |
    Examples:
      | initial-permissions | permissions         |
      | read, change        | read, share, change |
      | read                | read, share         |

  Scenario: Delete all custom permissions of the previously shared file
    Given user "user2" has shared file "lorem.txt" with user "user1" with "read, share" permissions
    And user "user2" has logged in using the webUI
    Then custom permissions "share" should be set for user "User One" for file "lorem.txt" on the webUI
    When the user disables all the custom permissions of collaborator "User One" for file "lorem.txt" using the webUI
    Then no custom permissions should be set for collaborator "User One" for file "lorem.txt" on the webUI
    And user "user1" should have received a share with these details:
      | field       | value          |
      | uid_owner   | user2          |
      | share_with  | user1          |
      | file_target | /lorem (2).txt |
      | item_type   | file           |
      | permissions | read           |

  Scenario Outline: share a file with another internal user assigning a role and the permissions
    Given user "user2" has logged in using the webUI
    When the user shares file "lorem.txt" with user "User One" as "<role>" with permissions "<collaborators-permissions>" using the webUI
    Then user "User One" should be listed as "<displayed-role>" in the collaborators list for file "lorem.txt" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "User One" for file "lorem.txt" on the webUI
    And user "user1" should have received a share with these details:
      | field       | value          |
      | uid_owner   | user2          |
      | share_with  | user1          |
      | file_target | /lorem (2).txt |
      | item_type   | file           |
      | permissions | <permissions>  |
    Examples:
      | role        | displayed-role | collaborators-permissions | displayed-permissions | permissions         |
      | Viewer      | Viewer         | share                     | share                 | read, share         |
      | Editor      | Editor         | share                     | share                 | read, share, change |
      | Custom Role | Editor         | share, change             | share                 | read, share, change |

  Scenario: Share a folder without share permissions using API and check if it is listed on the collaborators list for original owner
    Given user "user2" has shared folder "simple-folder" with user "user1" with "read" permissions
    And user "user2" has logged in using the webUI
    When the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "User One" should be listed as "Viewer" in the collaborators list for folder "simple-folder" on the webUI
    And no custom permissions should be set for collaborator "User One" for folder "simple-folder" on the webUI
