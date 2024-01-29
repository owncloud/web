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

  @issue-ocis-2260 @disablePreviews
  Scenario: user shares the file/folder with multiple internal users and delete the share with one user
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has logged in using the webUI
    And user "Alice" has shared file "lorem.txt" with user "Brian" in the server
    And user "Alice" has shared file "lorem.txt" with user "Carol" in the server
    When the user opens the share dialog for file "lorem.txt" using the webUI
    Then user "Brian Murphy" should be listed as "Can edit" in the collaborators list on the webUI
    And user "Carol King" should be listed as "Can edit" in the collaborators list on the webUI
    And as "Brian" file "Shares/lorem.txt" should exist in the server
    And as "Carol" file "Shares/lorem.txt" should exist in the server
    When the user deletes "Brian Murphy" as collaborator for the current file using the webUI
    Then user "Brian Murphy" should not be listed in the collaborators list on the webUI
    And user "Carol King" should be listed as "Can edit" in the collaborators list on the webUI
    And file "lorem.txt" should be listed in shared-with-others page on the webUI
    And as "Brian" file "Shares/lorem.txt" should not exist in the server
    But as "Carol" file "Shares/lorem.txt" should exist in the server

  @disablePreviews
  Scenario: Try to share file and folder that used to exist but does not anymore
    Given user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name          |
      | lorem.txt     |
      | simple-folder |
    When the user shares file "lorem.txt" with user "Brian Murphy" as "Editor" using the webUI
    Then the "error" message with header 'Failed to add share for "Brian Murphy"' should be displayed on the webUI
    And the user clears all error message from the webUI
    And user "Brian Murphy" should not be listed in the collaborators list on the webUI
    When the user clears all error message from the webUI
    And the user shares folder "simple-folder" with user "Brian Murphy" as "Editor" using the webUI
    Then the "error" message with header 'Failed to add share for "Brian Murphy"' should be displayed on the webUI
    And the user clears all error message from the webUI
    And user "Brian Murphy" should not be listed in the collaborators list on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And folder "simple-folder" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" folder "simple-folder" should not exist in the server

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

  @issue-4192 @disablePreviews
  Scenario: sharing file after renaming it is possible
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has logged in using the webUI
    And user "Alice" has uploaded file with content "test" to "lorem.txt" in the server
    And the user has renamed file "lorem.txt" to "new-lorem.txt"
    When the user shares resource "new-lorem.txt" with user "Brian Murphy" using the quick action on the webUI
    Then user "Brian Murphy" should be listed as "Can view" in the collaborators list for file "new-lorem.txt" on the webUI


  Scenario: user shares the file/folder with another internal user and delete the share with user
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has logged in using the webUI
    And user "Alice" has shared file "lorem.txt" with user "Brian" in the server
    When the user opens the share dialog for file "lorem.txt" using the webUI
    Then user "Brian Murphy" should be listed as "Can edit" in the collaborators list on the webUI
    And as "Brian" file "Shares/lorem.txt" should exist in the server
    When the user deletes "Brian Murphy" as collaborator for the current file using the webUI
    Then user "Brian Murphy" should not be listed in the collaborators list on the webUI
    And file "lorem.txt" should not be listed in shared-with-others page on the webUI
    And as "Brian" file "Shares/lorem.txt" should not exist in the server
