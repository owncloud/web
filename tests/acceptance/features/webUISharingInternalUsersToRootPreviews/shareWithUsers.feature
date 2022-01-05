@notToImplementOnOCIS
Feature: Sharing details and preview of files

  Background:
    Given these users have been created with default attributes and without skeleton files in the server:
      | username |
      | Alice    |
      | Brian    |

  @issue-2897
  Scenario: sharing details of items inside a shared folder ("via" info)
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created folder "simple-folder/simple-empty-folder" in the server
    And user "Alice" has uploaded file with content "test" to "/simple-folder/lorem.txt" in the server
    And user "Alice" has shared folder "simple-folder" with user "Brian" in the server
    And user "Alice" has logged in using the webUI
    And the user opens folder "simple-folder" using the webUI
    When the user opens the details dialog for folder "simple-empty-folder" using the webUI
    Then the shared-via path in the details dialog should be "/simple-folder"
    When the user opens the details dialog for file "lorem.txt" using the webUI
    Then the shared-via path in the details dialog should be "/simple-folder"

  @issue-2897
  Scenario: sharing details of items inside a re-shared folder ("via" info)
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created folder "simple-folder/simple-empty-folder" in the server
    And user "Alice" has uploaded file with content "test" to "/simple-folder/lorem.txt" in the server
    And user "Alice" has shared folder "simple-folder" with user "Brian" in the server
    And user "Brian" has shared folder "simple-folder" with user "Carol" in the server
    And user "Brian" has logged in using the webUI
    And the user opens folder "simple-folder" using the webUI
    When the user opens the details dialog for folder "simple-empty-folder" using the webUI
    Then the shared-via path in the details dialog should be "/simple-folder"
    When the user opens the details dialog for file "lorem.txt" using the webUI
    Then the shared-via path in the details dialog should be "/simple-folder"
















  Scenario: file list view image preview in file share
    Given user "Alice" has uploaded file "testavatar.jpg" to "testavatar.jpg" in the server
    And user "Alice" has shared file "testavatar.jpg" with user "Brian" in the server
    When user "Brian" logs in using the webUI
    Then the preview image of file "testavatar.jpg" should be displayed in the file list view on the webUI


  Scenario: file list view image preview in file share when previews is disabled
    Given the property "disablePreviews" of "options" has been set to true in web config file
    And user "Alice" has uploaded file "testavatar.jpg" to "testavatar.jpg" in the server
    And user "Alice" has shared file "testavatar.jpg" with user "Brian" in the server
    When user "Brian" logs in using the webUI
    Then the preview image of file "testavatar.jpg" should not be displayed in the file list view on the webUI
