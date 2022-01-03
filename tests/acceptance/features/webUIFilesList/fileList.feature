Feature: User can view files inside a folder
  As a user
  I want to be able to view folder contents
  So that I can work with files and folders inside it

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "lorem.txt" to "textfile0.txt" in the server
    And user "Alice" has uploaded file "data.zip" to "data.zip" in the server
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
