Feature: Filter files/folders
  As a user
  I would like to filter files/folders
  So that I can make the file/folder list more clear

  Background:
    Given these users have been created with default attributes:
      | username |
      | user1    |
      | user2    |
    And user "user1" has created file ".simpleHiddenFile"
    And user "user1" has created file ".hiddenTestFile"
    And user "user1" has created file "simpleFile"
    And user "user1" has created folder ".simpleHiddenFolder"
    And user "user1" has created folder ".hiddenTestFolder"
    And user "user1" has shared file ".simpleHiddenFile" with user "user2"
    And user "user1" has shared file "lorem.txt" with user "user2"
    And user "user1" has shared file ".hiddenTestFile" with user "user2"
    And user "user1" has shared file "simpleFile" with user "user2"
    And user "user1" has shared folder ".simpleHiddenFolder" with user "user2"
    And user "user1" has shared folder "simple-folder" with user "user2"
    And user "user1" has shared folder "folder with space" with user "user2"
    And user "user1" has shared folder ".hiddenTestFolder" with user "user2"
    And user "user2" has logged in using the webUI
    And the user has browsed to the shared-with-me page

  Scenario: user filters files and folders using keyword when the files filter, folders filter, and hidden filter are enabled
    When the user enables file filter using the webUI
    And the user enables folder filter using the webUI
    And the user enables the setting to view hidden files on the webUI
    And the user filters the file list by "simple" on the webUI
    Then all files and folders containing pattern "simple" in their name should be listed in the shared-with-me page on the webUI



