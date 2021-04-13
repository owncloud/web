@notToImplementOnOCIS
Feature: Sharing details and preview of files

  Background:
    Given these users have been created with default attributes and without skeleton files:
      | username |
      | Alice    |
      | Brian    |

  @issue-2897
  Scenario: sharing details of items inside a shared folder
    Given user "Carol" has been created with default attributes and without skeleton files
    And user "Alice" has created folder "simple-folder"
    And user "Alice" has created folder "simple-folder/simple-empty-folder"
    And user "Alice" has uploaded file with content "test" to "/simple-folder/lorem.txt"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Alice" has logged in using the webUI
    And the user opens folder "simple-folder" using the webUI
    When the user opens the share dialog for folder "simple-empty-folder" using the webUI
    Then user "Brian Murphy" should be listed as "Editor" via "simple-folder" in the collaborators list on the webUI
    When the user opens the share dialog for file "lorem.txt" using the webUI
    Then user "Brian Murphy" should be listed as "Editor" via "simple-folder" in the collaborators list on the webUI

  @issue-2897
  Scenario: sharing details of items inside a re-shared folder
    Given user "Carol" has been created with default attributes and without skeleton files
    And user "Alice" has created folder "simple-folder"
    And user "Alice" has created folder "simple-folder/simple-empty-folder"
    And user "Alice" has uploaded file with content "test" to "/simple-folder/lorem.txt"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has shared folder "simple-folder" with user "Carol"
    And user "Brian" has logged in using the webUI
    And the user opens folder "simple-folder" using the webUI
    When the user opens the share dialog for folder "simple-empty-folder" using the webUI
    Then user "Carol King" should be listed as "Editor" via "simple-folder" in the collaborators list on the webUI
    When the user opens the share dialog for file "lorem.txt" using the webUI
    Then user "Carol King" should be listed as "Editor" via "simple-folder" in the collaborators list on the webUI

  @issue-2897
  Scenario: sharing details of items inside a shared folder shared with multiple users
    Given user "Carol" has been created with default attributes and without skeleton files
    And user "Alice" has created folder "simple-folder"
    And user "Alice" has created folder "/simple-folder/sub-folder"
    And user "Alice" has uploaded file with content "test" to "/simple-folder/sub-folder/lorem.txt"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Alice" has shared folder "simple-folder/sub-folder" with user "Carol"
    And user "Alice" has logged in using the webUI
    And the user opens folder "simple-folder/sub-folder" directly on the webUI
    When the user opens the share dialog for file "lorem.txt" using the webUI
    Then user "Brian Murphy" should be listed as "Editor" via "simple-folder" in the collaborators list on the webUI
    And user "Carol King" should be listed as "Editor" via "sub-folder" in the collaborators list on the webUI


  Scenario: file list view image preview in file share
    Given user "Alice" has uploaded file "testavatar.jpg" to "testavatar.jpg"
    And user "Alice" has shared file "testavatar.jpg" with user "Brian"
    When user "Brian" logs in using the webUI
    Then the preview image of file "testavatar.jpg" should be displayed in the file list view on the webUI


  Scenario: file list view image preview in file share when previews is disabled
    Given the property "disablePreviews" of "options" has been set to true in web config file
    And user "Alice" has uploaded file "testavatar.jpg" to "testavatar.jpg"
    And user "Alice" has shared file "testavatar.jpg" with user "Brian"
    When user "Brian" logs in using the webUI
    Then the preview image of file "testavatar.jpg" should not be displayed in the file list view on the webUI