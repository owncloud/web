Feature: User can view files inside a folder
  As a user
  I want to be able to view folder contents
  So that I can work with files and folders inside it

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files
    And user "Alice" has created folder "simple-folder"
    And user "Alice" has created folder "simple-empty-folder"
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt"
    And user "Alice" has uploaded file "lorem.txt" to "textfile0.txt"
    And user "Alice" has uploaded file "data.zip" to "data.zip"
    And user "Alice" has logged in using the webUI

  Scenario: Resources are listed
    When the user browses to the files page
    Then folder "simple-folder" should be listed on the webUI
    And file "textfile0.txt" should be listed on the webUI
    And the top bar should match the default baseline

  @issue-1910
  Scenario: Empty folders display no resources in the list
    When the user creates a folder with the name "empty-thing" using the webUI
    And the user opens folder "empty-thing" directly on the webUI
    Then there should be no resources listed on the webUI

  @issue-276 @issue-3264
  Scenario: Thumbnails are loaded for known file types
    When the user uploads file "new-lorem.txt" using the webUI
    Then the file "new-lorem.txt" should have a thumbnail displayed on the webUI

  @issue-276 @issue-3264
  Scenario: Thumbnails are loaded for paths containing special characters
    Given user "Alice" has uploaded file "lorem.txt" to "simple-folder/strängé filename (duplicate #2 &).txt"
    And user "Alice" has renamed folder "simple-folder" to "strängé folder name (duplicate #2 &)"
    When the user browses to the files page
    And the user opens folder "strängé folder name (duplicate #2 &)" directly on the webUI
    Then the file "strängé filename (duplicate #2 &).txt" should have a thumbnail displayed on the webUI

  @issue-276 @issue-3264
  Scenario: Thumbnails are not loaded for known file types
    When the user uploads file "new-data.zip" using the webUI
    Then the file "new-data.zip" should have a file type icon displayed on the webUI


  Scenario: All files list displays public link quick action
    When the user browses to the files page
    Then quick action "public link" should be displayed on the webUI
    And the sidebar should match the default baseline

  Scenario: files are not selected when the user logs in
    When the user browses to the files page
    Then these files should not be selected on the webUI
      | name                |
      | lorem.txt           |
      | simple-empty-folder |
      | data.zip            |

  @disablePreviews
  Scenario: select files
    When the user marks these files for batch action using the webUI
      | name                |
      | lorem.txt           |
      | simple-empty-folder |
      | data.zip            |
    Then these files should be selected on the webUI
      | name                |
      | lorem.txt           |
      | simple-empty-folder |
      | data.zip            |

  @disablePreviews
  Scenario: select files and clear the selection
    When the user marks these files for batch action using the webUI
      | name                |
      | lorem.txt           |
      | simple-empty-folder |
      | data.zip            |
    And the user clears the selection of files
    Then these files should not be selected on the webUI
      | name                |
      | lorem.txt           |
      | simple-empty-folder |
      | data.zip            |
