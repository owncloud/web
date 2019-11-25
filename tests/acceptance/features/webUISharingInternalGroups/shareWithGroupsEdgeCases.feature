Feature: Sharing files and folders with internal groups
  As a user
  I want to share files and folders with groups
  So that those groups can access the files and folders

  @skip @yetToImplement
  Scenario Outline: sharing  files and folder with an internal problematic group name
    Given these users have been created with default attributes:
      | username |
      | user1    |
      | user2    |
      | user3    |
    And these groups have been created:
      | groupname |
      | <group>   |
    And user "user1" has been added to group "<group>"
    And user "user2" has been added to group "<group>"
    And user "user3" has logged in using the webUI
    When the user shares folder "simple-folder" with group "<group>" using the webUI
    And the user shares file "testimage.jpg" with group "<group>" using the webUI
    And the user re-logs in as "user1" using the webUI
    Then folder "simple-folder (2)" should be listed on the webUI
    And folder "simple-folder (2)" should be marked as shared with "<group>" by "User Three" on the webUI
    And file "testimage (2).jpg" should be listed on the webUI
    And file "testimage (2).jpg" should be marked as shared with "<group>" by "User Three" on the webUI
    When the user re-logs in as "user2" using the webUI
    Then folder "simple-folder (2)" should be listed on the webUI
    And folder "simple-folder (2)" should be marked as shared with "<group>" by "User Three" on the webUI
    And file "testimage (2).jpg" should be listed on the webUI
    And file "testimage (2).jpg" should be marked as shared with "<group>" by "User Three" on the webUI
    Examples:
      | group     |
      | ?\?@#%@,; |
      | नेपाली    |

  @issue-2419
  Scenario: Share file with a user and a group with same name
    Given these users have been created with default attributes:
      | username |
      | user1    |
      | user2    |
      | user3    |
      | user11   |
    And these groups have been created:
      | groupname |
      | user1     |
    And user "user2" has been added to group "user1"
    And user "user3" has uploaded file with content "user3 file" to "/randomfile.txt"
    And user "user3" has logged in using the webUI
    When the user shares file "randomfile.txt" with user "User One" as "Editor" using the webUI
#    And the user shares file "randomfile.txt" with group "user1" as "Editor" using the webUI
    And the user opens the share creation dialog in the webUI
    And the user types "user1" in the share-with-field
    Then "group" "user1" should not be listed in the autocomplete list on the webUI
    And the content of file "randomfile.txt" for user "user1" should be "user3 file"
#    And the content of file "randmfile.txt" for user "user2" should be "user3 file"

  @issue-2419
  Scenario: Share file with a group and a user with same name
    Given these users have been created with default attributes:
      | username |
      | user1    |
      | user2    |
      | user3    |
    And these groups have been created:
      | groupname |
      | user1     |
    And user "user2" has been added to group "user1"
    And user "user3" has uploaded file with content "user3 file" to "/randomfile.txt"
    And user "user3" has logged in using the webUI
    When the user shares file "randomfile.txt" with group "user1" as "Editor" using the webUI
#    And the user shares file "randomfile.txt" with user "User One" as "Editor" using the webUI
    And the user opens the share creation dialog in the webUI
    And the user types "user" in the share-with-field
    Then "user" "User One" should not be listed in the autocomplete list on the webUI
    And the content of file "randomfile.txt" for user "user2" should be "user3 file"
#    And the content of file "randmfile.txt" for user "user1" should be "user3 file"

  @yetToImplement
  Scenario: Share file with a user and again with a group with same name but different case
    Given these users have been created with default attributes:
      | username |
      | user1    |
      | user2    |
      | user3    |
    And these groups have been created:
      | groupname |
      | User1     |
    And user "user2" has been added to group "User1"
    And user "user3" has logged in using the webUI
    When the user shares folder "simple-folder" with user "User One" as "Editor" using the webUI
    And the user shares folder "simple-folder" with group "User1" as "Editor" using the webUI
    And the user re-logs in as "user1" using the webUI
    Then folder "simple-folder (2)" should be listed on the webUI
#    And folder "simple-folder (2)" should be marked as shared by "User Three" on the webUI
    When the user re-logs in as "user2" using the webUI
    Then folder "simple-folder (2)" should be listed on the webUI
#    And folder "simple-folder (2)" should be marked as shared with "User1" by "User Three" on the webUI

  @yetToImplement
  Scenario: Share file with a group and again with a user with same name but different case
    Given these users have been created with default attributes:
      | username |
      | user1    |
      | user2    |
      | user3    |
    And these groups have been created:
      | groupname |
      | User1     |
    And user "user2" has been added to group "User1"
    And user "user3" has logged in using the webUI
    When the user shares folder "simple-folder" with group "User1" as "Editor" using the webUI
    And the user shares folder "simple-folder" with user "User One" as "Editor" using the webUI
    And the user re-logs in as "user1" using the webUI
    Then folder "simple-folder (2)" should be listed on the webUI
#    And folder "simple-folder (2)" should be marked as shared by "User Three" on the webUI
    When the user re-logs in as "user2" using the webUI
    Then folder "simple-folder (2)" should be listed on the webUI
#    Then folder "simple-folder (2)" should be marked as shared with "User1" by "User Three" on the webUI
