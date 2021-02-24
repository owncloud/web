@notToImplementOnOCIS
Feature: Sharing files and folders with internal groups
  As a user
  I want to share files and folders with groups
  So that those groups can access the files and folders

  @skip @yetToImplement
  Scenario Outline: sharing  files and folder with an internal problematic group name
    Given these users have been created with default attributes:
      | username |
      | Alice    |
      | Brian    |
      | Carol    |
    And these groups have been created:
      | groupname |
      | <group>   |
    And user "Alice" has been added to group "<group>"
    And user "Brian" has been added to group "<group>"
    And user "Carol" has logged in using the webUI
    When the user shares folder "simple-folder" with group "<group>" using the webUI
    And the user shares file "testimage.jpg" with group "<group>" using the webUI
    And the user re-logs in as "Alice" using the webUI
    Then folder "simple-folder (2)" should be listed on the webUI
    And folder "simple-folder (2)" should be marked as shared with "<group>" by "Carol King" on the webUI
    And file "testimage (2).jpg" should be listed on the webUI
    And file "testimage (2).jpg" should be marked as shared with "<group>" by "Carol King" on the webUI
    When the user re-logs in as "Brian" using the webUI
    Then folder "simple-folder (2)" should be listed on the webUI
    And folder "simple-folder (2)" should be marked as shared with "<group>" by "Carol King" on the webUI
    And file "testimage (2).jpg" should be listed on the webUI
    And file "testimage (2).jpg" should be marked as shared with "<group>" by "Carol King" on the webUI
    Examples:
      | group     |
      | ?\?@#%@,; |
      | नेपाली    |


  Scenario: Share file with a user and a group with same name
    Given these users have been created with default attributes:
      | username |
      | Alice    |
      | Brian    |
      | Carol    |
      | user11   |
    And these groups have been created:
      | groupname |
      | Alice     |
    And user "Brian" has been added to group "Alice"
    And user "Carol" has uploaded file with content "Carol file" to "/randomfile.txt"
    And user "Carol" has logged in using the webUI
    When the user shares file "randomfile.txt" with user "Alice Hansen" as "Editor" using the webUI
    And the user shares file "randomfile.txt" with group "Alice" as "Editor" using the webUI
    And the user opens the share creation dialog in the webUI
    And the user types "Alice" in the share-with-field
    Then "group" "Alice" should not be listed in the autocomplete list on the webUI
    And the content of file "randomfile.txt" for user "Alice" should be "Carol file"
    And the content of file "randomfile.txt" for user "Brian" should be "Carol file"


  Scenario: Share file with a group and a user with same name
    Given these users have been created with default attributes:
      | username |
      | Alice    |
      | Brian    |
      | Carol    |
    And these groups have been created:
      | groupname |
      | Alice     |
    And user "Brian" has been added to group "Alice"
    And user "Carol" has uploaded file with content "Carol file" to "/randomfile.txt"
    And user "Carol" has logged in using the webUI
    When the user shares file "randomfile.txt" with group "Alice" as "Editor" using the webUI
    And the user shares file "randomfile.txt" with user "Alice Hansen" as "Editor" using the webUI
    And the user opens the share creation dialog in the webUI
    And the user types "user" in the share-with-field
    Then "user" "Alice Hansen" should not be listed in the autocomplete list on the webUI
    And the content of file "randomfile.txt" for user "Brian" should be "Carol file"
    And the content of file "randomfile.txt" for user "Alice" should be "Carol file"

  @yetToImplement
  Scenario: Share file with a user and again with a group with same name but different case
    Given these users have been created with default attributes:
      | username |
      | Alice    |
      | Brian    |
      | Carol    |
    And these groups have been created:
      | groupname |
      | User1     |
    And user "Brian" has been added to group "User1"
    And user "Carol" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Editor" using the webUI
    And the user shares folder "simple-folder" with group "User1" as "Editor" using the webUI
    And the user re-logs in as "Alice" using the webUI
    Then folder "simple-folder (2)" should be listed on the webUI
#    And folder "simple-folder (2)" should be marked as shared by "Carol King" on the webUI
    When the user re-logs in as "Brian" using the webUI
    Then folder "simple-folder (2)" should be listed on the webUI
#    And folder "simple-folder (2)" should be marked as shared with "User1" by "Carol King" on the webUI

  @yetToImplement
  Scenario: Share file with a group and again with a user with same name but different case
    Given these users have been created with default attributes:
      | username |
      | Alice    |
      | Brian    |
      | Carol    |
    And these groups have been created:
      | groupname |
      | User1     |
    And user "Brian" has been added to group "User1"
    And user "Carol" has logged in using the webUI
    When the user shares folder "simple-folder" with group "User1" as "Editor" using the webUI
    And the user shares folder "simple-folder" with user "Alice Hansen" as "Editor" using the webUI
    And the user re-logs in as "Alice" using the webUI
    Then folder "simple-folder (2)" should be listed on the webUI
#    And folder "simple-folder (2)" should be marked as shared by "Carol King" on the webUI
    When the user re-logs in as "Brian" using the webUI
    Then folder "simple-folder (2)" should be listed on the webUI
#    Then folder "simple-folder (2)" should be marked as shared with "User1" by "Carol King" on the webUI
