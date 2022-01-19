@notToImplementOnOCIS
Feature: Resharing shared files with different permissions
  As a user
  I want to reshare received files and folders with other users with different permissions
  So that I can control the access on those files/folders by other collaborators

  Background:
    Given these users have been created with default attributes and without skeleton files in the server:
      | username |
      | Alice    |
      | Brian    |
      | Carol    |
    And user "Brian" has created folder "simple-folder" in the server


  Scenario: Reshare a folder without share permissions using API and check if it is listed on the collaborators list for original owner
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "read, share" permissions in the server
    And user "Alice" has shared folder "simple-folder" with user "Carol" with "read" permissions in the server
    And user "Brian" has logged in using the webUI
    When the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "Carol King" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And no custom permissions should be set for collaborator "Carol King" for folder "simple-folder" on the webUI


  Scenario: Reshare a folder without share permissions using API and check if it is listed on the collaborators list for resharer
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "read, share" permissions in the server
    And user "Alice" has shared folder "simple-folder" with user "Carol" with "read" permissions in the server
    And user "Alice" has logged in using the webUI
    When the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "Carol King" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And no custom permissions should be set for collaborator "Carol King" for folder "simple-folder" on the webUI


  Scenario: Reshare a folder without share permissions using API and check if the receiver can reshare
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "read, share" permissions in the server
    And user "Alice" has shared folder "simple-folder" with user "Carol" with "read" permissions in the server
    When user "Carol" logs in using the webUI
    Then the user should not be able to share folder "simple-folder" using the webUI


  Scenario Outline: share a received folder with another user with same permissions(including share permissions) and check if the user is displayed in collaborators list for resharer
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "<permissions>" permissions in the server
    And user "Alice" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Carol King" as "<role>" with permissions "<collaborators-permissions>" using the webUI
    Then user "Carol King" should be listed as "<displayed-role>" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "Carol King" for folder "simple-folder" on the webUI
    And user "Carol" should have received a share with these details in the server:
      | field       | value              |
      | uid_owner   | Alice              |
      | share_with  | Carol              |
      | file_target | /simple-folder     |
      | item_type   | folder             |
      | permissions | <permissions>      |
    Examples:
      | role                 | displayed-role       | collaborators-permissions     | displayed-permissions         | permissions                         |
      | Viewer               | Viewer               | ,                             | share                         | read, share                         |
      | Editor               | Editor               | ,                             | share, delete, update, create | all                                 |
      | Custom permissions   | Custom permissions   | share, create                 | share, create                 | read, share, create                 |
      | Custom permissions   | Custom permissions   | update, share                 | share, update                 | read, update, share                 |
      | Custom permissions   | Editor               | delete, share, create, update | share, delete, update, create | read, share, delete, update, create |


  Scenario Outline: share a received folder with another user with same permissions(including share permissions) and check if the user is displayed in collaborators list for original owner
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "<permissions>" permissions in the server
    And user "Alice" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Carol King" as "<role>" with permissions "<collaborators-permissions>" using the webUI
    And the user re-logs in as "Brian" using the webUI
    Then user "Carol King" should be listed as "<displayed-role>" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "Carol King" for folder "simple-folder" on the webUI
    And user "Alice Hansen" should be listed as "<displayed-role>" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "<displayed-permissions>" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Carol" should have received a share with these details in the server:
      | field       | value              |
      | uid_owner   | Alice              |
      | share_with  | Carol              |
      | file_target | /simple-folder     |
      | item_type   | folder             |
      | permissions | <permissions>      |
    And user "Alice" should have received a share with these details in the server:
      | field       | value              |
      | uid_owner   | Brian              |
      | share_with  | Alice              |
      | file_target | /simple-folder     |
      | item_type   | folder             |
      | permissions | <permissions>      |
    Examples:
      | role                 | displayed-role       | collaborators-permissions     | displayed-permissions         | permissions                         |
      | Viewer               | Viewer               | ,                             | share                         | read, share                         |
      | Editor               | Editor               | ,                             | share, delete, update, create | all                                 |
      | Custom permissions   | Custom permissions   | share, create                 | share, create                 | read, share, create                 |
      | Custom permissions   | Custom permissions   | update, share                 | share, update                 | read, update, share                 |
      | Custom permissions   | Editor               | delete, share, create, update | share, delete, update, create | read, share, delete, update, create |


  Scenario: share a folder with another user with share permissions and reshare without share permissions to different user, and check if user is displayed for original sharer
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "read, share" permissions in the server
    And user "Alice" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Carol King" as "Viewer" with permissions "," using the webUI
    And the user re-logs in as "Brian" using the webUI
    Then user "Carol King" should be listed as "Viewer" in the collaborators list for folder "simple-folder" on the webUI
    And custom permission "share" should be set for user "Carol King" for folder "simple-folder" on the webUI
    And user "Alice Hansen" should be listed as "Viewer" in the collaborators list for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value              |
      | uid_owner   | Brian              |
      | share_with  | Alice              |
      | file_target | /simple-folder     |
      | item_type   | folder             |
      | permissions | read, share        |
    And user "Carol" should have received a share with these details in the server:
      | field       | value              |
      | uid_owner   | Alice              |
      | share_with  | Carol              |
      | file_target | /simple-folder     |
      | item_type   | folder             |
      | permissions | read, share        |


  Scenario: share a folder with another user with share permissions and reshare without share permissions to different user, and check if user is displayed for the receiver
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "read, share" permissions in the server
    And user "Alice" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Carol King" as "Viewer" with permissions "," using the webUI
    And user "Carol" should have received a share with these details in the server:
      | field       | value              |
      | uid_owner   | Alice              |
      | share_with  | Carol              |
      | file_target | /simple-folder     |
      | item_type   | folder             |
      | permissions | read, share        |


  Scenario: share a folder without share permissions and check if another user can reshare
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "read" permissions in the server
    When user "Alice" logs in using the webUI
    Then the user should not be able to share resource "simple-folder" using the webUI


  Scenario: share a file without share permissions and check if another user can reshare
    Given user "Brian" has created file "lorem.txt" in the server
    And user "Brian" has shared file "lorem.txt" with user "Alice" with "read" permissions in the server
    When user "Alice" logs in using the webUI
    Then the user should not be able to share resource "lorem.txt" using the webUI


  Scenario: share a received folder without share permissions and check if another user can reshare
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "all" permissions in the server
    And user "Alice" has shared folder "simple-folder" with user "Carol" with "read" permissions in the server
    When user "Carol" logs in using the webUI
    Then the user should not be able to share resource "simple-folder" using the webUI


  Scenario: share a received file without share permissions and check if another user can reshare
    Given user "Brian" has created file "lorem.txt" in the server
    And user "Brian" has shared file "lorem.txt" with user "Alice" with "all" permissions in the server
    And user "Alice" has shared file "lorem.txt" with user "Carol" with "read" permissions in the server
    When user "Carol" logs in using the webUI
    Then the user should not be able to share resource "lorem.txt" using the webUI


  Scenario: User is allowed to reshare a file/folder with the equivalent received permissions, and collaborators should not be listed for the receiver
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "read, share, delete" permissions in the server
    And user "Alice" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Carol King" as "Custom permissions" with permissions "share, delete" using the webUI
    And the user re-logs in as "Carol" using the webUI
    And the user opens the share dialog for folder "simple-folder" using the webUI
    Then the collaborators list for folder "simple-folder" should be empty
    # Then the current collaborators list should have order "Brian Murphy,Carol King"
    # And user "Brian Murphy" should be listed as "Owner" reshared through "Alice Hansen" in the collaborators list on the webUI
    And user "Carol" should have received a share with these details in the server:
      | field       | value               |
      | uid_owner   | Alice               |
      | share_with  | Carol               |
      | file_target | /simple-folder      |
      | item_type   | folder              |
      | permissions | share, delete, read |


  Scenario: User is allowed to reshare a file/folder with the lesser permissions, and check if it is listed for original owner
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "read, share, delete" permissions in the server
    And user "Alice" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Carol King" as "Custom permissions" with permissions "delete" using the webUI
    And the user re-logs in as "Brian" using the webUI
    Then user "Alice Hansen" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "share, delete" should be set for user "Alice Hansen" for folder "simple-folder" on the webUI
    And user "Carol King" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder" on the webUI
    And custom permissions "delete" should be set for user "Carol King" for folder "simple-folder" on the webUI
    And user "Carol" should have received a share with these details in the server:
      | field       | value              |
      | uid_owner   | Alice              |
      | share_with  | Carol              |
      | file_target | /simple-folder     |
      | item_type   | folder             |
      | permissions | delete, read       |


  Scenario: User is not allowed to reshare a file/folder with the higher permissions
    Given user "Brian" has shared folder "simple-folder" with user "Alice" with "read, share, delete" permissions in the server
    And user "Alice" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Carol King" as "Custom permissions" with permissions "share, delete, update" using the webUI
    Then the error message with header "Error while sharing." should be displayed on the webUI
    And as "Carol" folder "simple-folder" should not exist in the server


  Scenario: Reshare a file and folder from shared with me page
    Given user "Brian" has created file "lorem.txt" in the server
    And user "Brian" has shared folder "simple-folder" with user "Alice" in the server
    And user "Brian" has shared file "lorem.txt" with user "Alice" in the server
    And user "Alice" has logged in using the webUI
    And the user has browsed to the shared-with-me page
    When the user shares folder "simple-folder" with user "Carol King" as "Editor" using the webUI
    And the user shares file "lorem.txt" with user "Carol King" as "Editor" using the webUI
    Then as "Carol" folder "simple-folder" should exist in the server
    And as "Carol" file "lorem.txt" should exist in the server


  Scenario: Reshare a file and folder from shared with others page
    Given user "Brian" has created file "lorem.txt" in the server
    And user "Brian" has shared folder "simple-folder" with user "Alice" in the server
    And user "Brian" has shared file "lorem.txt" with user "Alice" in the server
    And user "Brian" has logged in using the webUI
    And the user has browsed to the shared-with-others page
    When the user shares folder "simple-folder" with user "Carol King" as "Editor" using the webUI
    And the user shares file "lorem.txt" with user "Carol King" as "Editor" using the webUI
    Then as "Carol" folder "simple-folder" should exist in the server
    And as "Carol" file "lorem.txt" should exist in the server


  Scenario: Reshare a file and folder from favorites page
    Given user "Brian" has created file "lorem.txt" in the server
    And user "Brian" has shared folder "simple-folder" with user "Alice" in the server
    And user "Brian" has shared file "lorem.txt" with user "Alice" in the server
    And user "Alice" has favorited element "simple-folder" in the server
    And user "Alice" has favorited element "lorem.txt" in the server
    And user "Alice" has logged in using the webUI
    When the user browses to the favorites page using the webUI
    And the user shares folder "simple-folder" with user "Carol King" as "Editor" using the webUI
    And the user shares file "lorem.txt" with user "Carol King" as "Editor" using the webUI
    Then as "Carol" folder "simple-folder" should exist in the server
    And as "Carol" file "lorem.txt" should exist in the server


  Scenario: Resource owner sees resharer in collaborators list
    Given user "Brian" has shared folder "simple-folder" with user "Alice" in the server
    And user "Alice" has shared folder "simple-folder" with user "Carol" in the server
    When user "Brian" has logged in using the webUI
    And the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "Alice Hansen" should be listed as "Editor" in the collaborators list on the webUI
    # And user "Carol King" should be listed as "Editor" reshared through "Alice Hansen" in the collaborators list on the webUI
