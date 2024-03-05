Feature: Sharing files and folders with internal users
  As a user
  I want to share files and folders with other users
  So that those users can access the files and folders

  Background:
    Given the administrator has set the default folder for received shares to "Shares" in the server
    And these users have been created with default attributes and without skeleton files in the server:
      | username |
      | Alice    |
      | Brian    |
    And user "Brian" has created folder "simple-folder" in the server

  @issue-2897 @issue-ocis-2260 @disablePreviews
  Scenario: sharing details of items inside a shared folder ("via" info)
    Given user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created folder "simple-folder/simple-empty-folder" in the server
    And user "Carol" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file with content "test" to "/simple-folder/lorem.txt" in the server
    And user "Alice" has shared folder "simple-folder" with user "Brian" in the server
    And user "Alice" has logged in using the webUI
    And the user opens folder "simple-folder" using the webUI
    When the user opens the details dialog for folder "simple-empty-folder" using the webUI
    Then the shared-via path in the details dialog should be "/simple-folder"
    When the user opens the details dialog for file "lorem.txt" using the webUI
    Then the shared-via path in the details dialog should be "/simple-folder"

