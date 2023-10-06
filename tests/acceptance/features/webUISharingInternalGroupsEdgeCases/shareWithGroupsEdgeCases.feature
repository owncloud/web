@ocis-reva-issue-194
Feature: Sharing files and folders with internal groups
  As a user
  I want to share files and folders with groups
  So that those groups can access the files and folders

  Background:
    Given the administrator has set the default folder for received shares to "Shares" in the server
    And these users have been created with default attributes and without skeleton files in the server:
      | username |
      | Alice    |
      | Brian    |
      | Carol    |

  @issue-5216
  Scenario Outline: sharing files and folder with an internal problematic group name
    Given these groups have been created in the server:
      | groupname |
      | <group>   |
    And user "Carol" has created folder "simple-folder" in the server
    And user "Carol" has created file "testimage.jpg" in the server
    And user "Alice" has been added to group "<group>" in the server
    And user "Carol" has logged in using the webUI
    When the user shares folder "simple-folder" with group "<group>" as "Viewer" using the webUI
    And the user shares file "testimage.jpg" with group "<group>" as "Viewer" using the webUI
    Then group "<group>" should be listed as "Can view" in the collaborators list for folder "simple-folder" on the webUI
    And group "<group>" should be listed as "Can view" in the collaborators list for file "testimage.jpg" on the webUI
    Examples:
      | group     |
      | ?\?@#%@,; |
      | नेपाली      |


  Scenario: Share file with a user and a group with same name
    Given these groups have been created in the server:
      | groupname |
      | Alice     |
    And user "Brian" has been added to group "Alice" in the server
    And user "Carol" has uploaded file with content "Carol file" to "/randomfile.txt" in the server
    And user "Carol" has logged in using the webUI
    When the user shares file "randomfile.txt" with user "Alice Hansen" as "Editor" using the webUI
    And the user shares file "randomfile.txt" with group "Alice" as "Editor" using the webUI
    And the user types "Alice" in the share-with-field
    Then "group" "Alice" should not be listed in the autocomplete list on the webUI
    And the content of file "Shares/randomfile.txt" for user "Alice" should be "Carol file" in the server
    And the content of file "Shares/randomfile.txt" for user "Brian" should be "Carol file" in the server


  Scenario: Share file with a group and a user with same name
    Given these groups have been created in the server:
      | groupname |
      | Alice     |
    And user "Brian" has been added to group "Alice" in the server
    And user "Carol" has uploaded file with content "Carol file" to "/randomfile.txt" in the server
    And user "Carol" has logged in using the webUI
    When the user shares file "randomfile.txt" with group "Alice" as "Editor" using the webUI
    And the user shares file "randomfile.txt" with user "Alice Hansen" as "Editor" using the webUI
    And the user types "Alice" in the share-with-field
    Then "user" "Alice Hansen" should not be listed in the autocomplete list on the webUI
    And the content of file "Shares/randomfile.txt" for user "Brian" should be "Carol file" in the server
    And the content of file "Shares/randomfile.txt" for user "Alice" should be "Carol file" in the server


  Scenario: Share file with a user and again with a group with same name but different case
    Given these groups have been created in the server:
      | groupname |
      | ALICE     |
    And user "Brian" has been added to group "ALICE" in the server
    And user "Carol" has uploaded file with content "Carol file" to "/randomfile.txt" in the server
    And user "Carol" has logged in using the webUI
    When the user shares file "randomfile.txt" with user "Alice Hansen" as "Editor" using the webUI
    And the user shares file "randomfile.txt" with group "ALICE" as "Editor" using the webUI
    And the user types "ALICE" in the share-with-field
    Then "group" "ALICE" should not be listed in the autocomplete list on the webUI
    And the content of file "Shares/randomfile.txt" for user "Brian" should be "Carol file" in the server
    And the content of file "Shares/randomfile.txt" for user "Alice" should be "Carol file" in the server


  Scenario: Share file with a group and again with a user with same name but different case
    Given these groups have been created in the server:
      | groupname |
      | ALICE     |
    And user "Brian" has been added to group "ALICE" in the server
    And user "Carol" has uploaded file with content "Carol file" to "/randomfile.txt" in the server
    And user "Carol" has logged in using the webUI
    When the user shares file "randomfile.txt" with group "ALICE" as "Editor" using the webUI
    And the user shares file "randomfile.txt" with user "Alice Hansen" as "Editor" using the webUI
    And the user types "Alice" in the share-with-field
    Then "user" "Alice Hansen" should not be listed in the autocomplete list on the webUI
    And the content of file "Shares/randomfile.txt" for user "Brian" should be "Carol file" in the server
    And the content of file "Shares/randomfile.txt" for user "Alice" should be "Carol file" in the server
