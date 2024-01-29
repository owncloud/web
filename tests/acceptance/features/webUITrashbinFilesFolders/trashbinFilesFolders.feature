@files_trashbin-app-required
Feature: files and folders exist in the trashbin after being deleted
  As a user
  I want deleted files and folders to be available in the trashbin
  So that I can recover data easily

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "lorem-big.txt" to "lorem-big.txt" in the server
    And user "Alice" has uploaded file "new-lorem.txt" to "textfile0.txt" in the server
    And user "Alice" has uploaded file "testavatar.png" to "testimage.png" in the server
    And user "Alice" has created file "sample,1.txt" in the server
    And user "Alice" has created file "strängé filename (duplicate #2 &).txt" in the server
    And user "Alice" has created folder "Folder,With,Comma" in the server
    And user "Alice" has created folder "strängé नेपाली folder" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has uploaded file "lorem.txt" to "simple-folder/lorem.txt" in the server
    And user "Alice" has uploaded file "lorem.txt" to "strängé नेपाली folder/lorem.txt" in the server
    And user "Alice" has logged in using the webUI

  @issue-1910
  Scenario: trashbin list appears empty when no deleted files exist
    When the user browses to the trashbin page
    Then there should be no resources listed on the webUI


  Scenario: Delete folders with dot in the name and check they are in the trashbin
    Given user "Alice" has created the following folders in the server
      | folders  |
      | fo.      |
      | fo.1     |
      | fo...1.. |
      | ...      |
      | ..fo     |
      | fo.xyz   |
    And the following folders have been deleted by user "Alice" in the server
      | name     |
      | fo.      |
      | fo.1     |
      | fo...1.. |
      | ...      |
      | ..fo     |
      | fo.xyz   |
    When the user browses to the trashbin page
    Then the deleted elements should be listed on the webUI
