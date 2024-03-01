Feature: Shares in share-with pages
  As a user
  I want to check share-with pages
  So that I can know what is shared with me and by me

  Background:
    Given the administrator has set the default folder for received shares to "Shares" in the server
    And these users have been created with default attributes and without skeleton files in the server:
      | username |
      | Brian    |
    And user "Brian" has created folder "simple-folder" in the server


  @issue-2480
  Scenario: check file with same name but different paths are displayed correctly in shared with others page
    Given user "Brian" has created file "lorem.txt" in the server
    And user "Brian" has created file "simple-folder/lorem.txt" in the server
    And user "Brian" has shared file "lorem.txt" with user "Alice" in the server
    And user "Brian" has shared file "simple-folder/lorem.txt" with user "Alice" in the server
    And user "Brian" has logged in using the webUI
    When the user browses to the shared-with-others page
    Then file "lorem.txt" should be listed on the webUI

