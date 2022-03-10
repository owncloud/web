Feature: create folders
  As a user
  I want to create folders
  So that I can organise my data structure

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI

  @smokeTest @ocisSmokeTest
  Scenario: Create a folder inside another folder
    When the user creates a folder with the name "top-folder" using the webUI
    And the user opens folder "top-folder" using the webUI
    Then there should be no resources listed on the webUI
    When the user creates a folder with the name "sub-folder" using the webUI
    Then folder "sub-folder" should be listed on the webUI
    When the user reloads the current page of the webUI
    Then folder "sub-folder" should be listed on the webUI


  Scenario: Create a folder with default name
    When the user creates a folder with default name using the webUI
    Then folder "New folder" should be listed on the webUI


  Scenario: Try to create a folder without name
    When the user tries to create a folder with the invalid name "" using the webUI
    Then the error message 'Folder name cannot be empty' should be displayed on the webUI dialog prompt
    And the create folder button should be disabled


  Scenario: Try to create a folder with existing name
    Given user "Alice" has created folder "simple-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user tries to create a folder with the invalid name "simple-folder" using the webUI
    Then the error message 'simple-folder already exists' should be displayed on the webUI dialog prompt
    And the create folder button should be disabled

  Scenario: Try to create a folder with invalid name
    When the user tries to create a folder with the invalid name "../folder" using the webUI
    Then the error message 'Folder name cannot contain "/"' should be displayed on the webUI dialog prompt
    And the create folder button should be disabled

  Scenario: Try to create a folder with another invalid name
    When the user tries to create a folder with the invalid name "folder/subfolder" using the webUI
    Then the error message 'Folder name cannot contain "/"' should be displayed on the webUI dialog prompt
    And the create folder button should be disabled

  @issue-2467
  Scenario: Create folder with special characters in its name and browse to that folder
    When the user creates a folder with the name "?&%0" using the webUI
    And the user opens folder "?&%0" using the webUI
    And the user reloads the current page of the webUI
    Then the page should be empty
  # Then the files table should be displayed


  Scenario: Create a folder in a public share
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has shared folder "simple-empty-folder" with link with "read,create" permissions in the server
    When the public uses the webUI to access the last public link created by user "Alice" in a new session
    And the user creates a folder with the name "top-folder" using the webUI
    And the user opens folder "top-folder" using the webUI
    Then there should be no resources listed on the webUI
    When the user creates a folder with the name "sub-folder" using the webUI
    Then folder "sub-folder" should be listed on the webUI
    When the user reloads the current page of the webUI
    Then folder "sub-folder" should be listed on the webUI


  Scenario: Create folders with dot in the name
    When the user creates the following folders using the webUI
      | folders  |
      | fo.      |
      | fo.1     |
      | fo...1.. |
      | fo.xyz   |
    Then the following folders should be listed on the webUI
      | folders  |
      | fo.      |
      | fo.1     |
      | fo...1.. |
      | fo.xyz   |


  @skipOnOC10 @issue-5518
  Scenario: User creates a folder with .part in the name
    When the user creates a folder with the name "fo.part" using the webUI
    Then folder "fo.part" should be listed on the webUI
