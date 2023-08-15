@skipOnOC10 @issue-ocis-6378 @issue-ocis-1330
Feature: Search

  As a user
  I would like to be able to search for files
  So that I can find needed files quickly

  Background:
    Given these users have been created with default attributes and without skeleton files in the server:
      | username |
      | Alice    |
      | user0    |
    And user "Alice" has created the following folders in the server
      | entry_name            |
      | simple-folder         |
      | simple-empty-folder   |
      | strängé नेपाली folder |
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "lorem.txt" to "simple-folder/lorem.txt" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI


  Scenario: Search for a newly uploaded file
    When the user uploads file "simple.pdf" using the webUI
    And the user opens folder "simple-folder" directly on the webUI
    And the user uploads file "simple.odt" using the webUI
    And the user browses to the files page
    And the user searches for "simple" using the webUI
    Then file "simple.pdf" should be listed on the webUI
    And file "simple-folder/simple.odt" should be listed on the webUI


  Scenario: Search for files with difficult names
    Given user "Alice" has uploaded file with content "does-not-matter" to "/strängéनेपालीloremfile.txt" in the server
    And the user has reloaded the current page of the webUI
    When the user searches for "lorem" using the webUI
    Then file "strängéनेपालीloremfile.txt" should be listed on the webUI


  Scenario: Search for files with difficult names and difficult search phrase
    Given user "Alice" has uploaded file with content "does-not-matter" to "/strängéनेपालीloremfile.txt" in the server
    And the user has reloaded the current page of the webUI
    When the user searches for "strängéनेपाली" using the webUI
    Then file "strängéनेपालीloremfile.txt" should be listed on the webUI


  Scenario: Search for deleted folder in the trashbin
    Given user "Alice" has created folder "deleted folder" in the server
    And user "Alice" has created folder "not deleted folder" in the server
    And the following files have been deleted by user "Alice" in the server
      | name           |
      | deleted folder |
    When the user browses to the trashbin page
    And the user searches for "folder" using the webUI
    Then folder "not deleted folder" should be listed on the webUI
    And folder "deleted folder" should not be listed on the webUI


  Scenario: Delete file from search list
    Given user "Alice" has uploaded file with content "uploaded content" to "file-to-delete.txt" in the server
    When the user reloads the current page of the webUI
    When the user searches for "file-to" using the webUI
    And the user deletes file "file-to-delete.txt" using the webUI
    Then file "file-to-delete.txt" should not be listed on the webUI
    And as "Alice" file "file-to-delete.txt" should not exist in the server
    And as "Alice" the file with original path "file-to-delete.txt" should exist in the trashbin in the server
