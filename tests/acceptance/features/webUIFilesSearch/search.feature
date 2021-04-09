@issue-ocis-1330
Feature: Search

  As a user
  I would like to be able to search for files
  So that I can find needed files quickly

  Background:
    Given these users have been created with default attributes and without skeleton files:
      | username |
      | Alice    |
      | user0    |
    And user "Alice" has created the following folders
      | entry_name            |
      | simple-folder         |
      | simple-empty-folder   |
      | strängé नेपाली folder |
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt"
    And user "Alice" has uploaded file "zzzz-must-be-last-file-in-folder.txt" to "zzzz-must-be-last-file-in-folder.txt"
    And user "Alice" has uploaded file "lorem.txt" to "simple-folder/lorem.txt"
    And user "Alice" has uploaded file "lorem-big.txt" to "lorem-big.txt"
    And user "Alice" has uploaded file "data.zip" to "data.zip"
    And user "Alice" has logged in using the webUI
    And the user has browsed to the files page

  @smokeTest @issue-980
  Scenario: Simple search
    When the user searches for "lorem" using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And file "lorem-big.txt" should be listed on the webUI
    #And file "lorem.txt" with path "/simple-folder" should be listed in the search results in the other folders section on the webUI
    #And file "lorem-big.txt" with path "/simple-folder" should be listed in the search results in the other folders section on the webUI
    #And file "lorem.txt" with path "/0" should be listed in the search results in the other folders section on the webUI
    #And file "lorem.txt" with path "/strängé नेपाली folder" should be listed in the search results in the other folders section on the webUI
    #And file "lorem-big.txt" with path "/strängé नेपाली folder" should be listed in the search results in the other folders section on the webUI

  @issue-980
  Scenario: search for folders
    When the user searches for "folder" using the webUI
    Then folder "simple-folder" should be listed on the webUI
    And folder "strängé नेपाली folder" should be listed on the webUI
    And file "zzzz-must-be-last-file-in-folder.txt" should be listed on the webUI
    #And folder "simple-empty-folder" with path "/'single'quotes" should be listed in the search results in the other folders section on the webUI
    #And file "zzzz-must-be-last-file-in-folder.txt" with path "/simple-folder" should be listed in the search results in the other folders section on the webUI
    #And file "zzzz-must-be-last-file-in-folder.txt" with path "/strängé नेपाली folder" should be listed in the search results in the other folders section on the webUI
    But file "lorem.txt" should not be listed on the webUI
    #And file "lorem.txt" should not be listed in the search results in the other folders section on the webUI

  @issue-980
  Scenario: search in sub folder
    When the user opens folder "simple-folder" using the webUI
    And the user searches for "lorem" using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And file "lorem-big.txt" should be listed on the webUI
    #And file "lorem.txt" with path "/" should be listed in the search results in the other folders section on the webUI
    #And file "lorem-big.txt" with path "/" should be listed in the search results in the other folders section on the webUI
    #And file "lorem.txt" with path "/0" should be listed in the search results in the other folders section on the webUI
    #And file "lorem.txt" with path "/strängé नेपाली folder" should be listed in the search results in the other folders section on the webUI
    #And file "lorem-big.txt" with path "/strängé नेपाली folder" should be listed in the search results in the other folders section on the webUI
    #But file "lorem.txt" with path "/simple-folder" should not be listed in the search results in the other folders section on the webUI

  @systemtags-app-required @skip @yetToImplement
  Scenario: search for a file using a tag
    Given user "Alice" has created a "normal" tag with name "ipsum"
    And user "Alice" has added tag "ipsum" to file "/lorem.txt"
    When the user browses to the tags page
    And the user searches for tag "ipsum" using the webUI
    Then file "lorem.txt" should be listed on the webUI

  @systemtags-app-required @skip @yetToImplement
  Scenario: search for a file with multiple tags
    Given user "Alice" has created a "normal" tag with name "lorem"
    And user "Alice" has created a "normal" tag with name "ipsum"
    And user "Alice" has added tag "lorem" to file "/lorem.txt"
    And user "Alice" has added tag "lorem" to file "/testimage.jpg"
    And user "Alice" has added tag "ipsum" to file "/lorem.txt"
    When the user browses to the tags page
    And the user searches for tag "lorem" using the webUI
    And the user searches for tag "ipsum" using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI

  @systemtags-app-required @skip @yetToImplement
  Scenario: search for a file with tags
    Given user "Alice" has created a "normal" tag with name "lorem"
    And user "Alice" has added tag "lorem" to file "/lorem.txt"
    And user "Alice" has added tag "lorem" to file "/simple-folder/lorem.txt"
    When the user browses to the tags page
    And the user searches for tag "lorem" using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And file "lorem.txt" with path "" should be listed in the tags page on the webUI
    And file "lorem.txt" with path "/simple-folder" should be listed in the tags page on the webUI


  Scenario: Search for a shared file
    Given user "user0" has uploaded file "lorem.txt" to "lorem.txt"
    And user "user0" has shared file "/lorem.txt" with user "Alice"
    When the user reloads the current page of the webUI
    And the user searches for "lorem" using the webUI
    Then file "lorem.txt" should be listed on the webUI


  Scenario: Search for a re-shared file
    Given user "Brian" has been created with default attributes and without skeleton files
    And user "Brian" has uploaded file "lorem.txt" to "lorem.txt"
    And user "Brian" has shared file "/lorem.txt" with user "user0"
    And user "user0" has shared file "/lorem.txt" with user "Alice"
    When the user reloads the current page of the webUI
    And the user searches for "lorem" using the webUI
    Then file "lorem.txt" should be listed on the webUI


  Scenario: Search for a shared folder
    Given user "user0" has created folder "simple-folder"
    And user "user0" has uploaded file "lorem.txt" to "simple-folder/lorem.txt"
    And user "user0" has shared folder "simple-folder" with user "Alice"
    When the user reloads the current page of the webUI
    And the user searches for "simple" using the webUI
    Then folder "simple-folder" should be listed on the webUI


  Scenario: Search for a file after name is changed
    When the user renames file "lorem.txt" to "torem.txt" using the webUI
    And the user searches for "torem" using the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "torem.txt" should be listed on the webUI

  @skip
  Scenario: Search for a newly uploaded file
    Given user "Alice" has uploaded file with content "does-not-matter" to "torem.txt"
    And user "Alice" has uploaded file with content "does-not-matter" to "simple-folder/another-torem.txt"
    When the user searches for "torem" using the webUI
    Then file "torem.txt" with path "/" should be listed in the search results in the other folders section on the webUI
    And file "another-torem.txt" with path "/simple-folder" should be listed in the search results in the other folders section on the webUI

  @skip
  Scenario: Search for files with difficult names
    Given user "Alice" has uploaded file with content "does-not-matter" to "/strängéनेपालीloremfile.txt"
    And user "Alice" has uploaded file with content "does-not-matter" to "/strängé नेपाली folder/strängéनेपालीloremfile.txt"
    When the user searches for "lorem" using the webUI
    Then file "strängéनेपालीloremfile.txt" with path "/" should be listed in the search results in the other folders section on the webUI
    And file "strängéनेपालीloremfile.txt" with path "/strängé नेपाली folder" should be listed in the search results in the other folders section on the webUI

  @skip
  Scenario: Search for files with difficult names and difficult search phrase
    Given user "Alice" has uploaded file with content "does-not-matter" to "/strängéनेपालीloremfile.txt"
    And user "Alice" has uploaded file with content "does-not-matter" to "/strängé नेपाली folder/strängéनेपालीloremfile.txt"
    When the user searches for "strängéनेपाली" using the webUI
    Then file "strängéनेपालीloremfile.txt" with path "/" should be listed in the search results in the other folders section on the webUI
    And file "strängéनेपालीloremfile.txt" with path "/strängé नेपाली folder" should be listed in the search results in the other folders section on the webUI

  @issue-1726
  Scenario: Search for deleted folder in the trashbin
    Given user "Alice" has created folder "deleted folder"
    And user "Alice" has created folder "not deleted folder"
    And the following files have been deleted by user "Alice"
      | name           |
      | deleted folder |
    When the user browses to the trashbin page
    And the user searches for "folder" using the webUI
    Then folder "not deleted folder" should be listed on the webUI
    And folder "deleted folder" should not be listed on the webUI

  @issue-1726
  Scenario: Search for favorited folder in favorites page
    Given user "Alice" has created folder "favorite folder"
    And user "Alice" has created folder "not favorite folder"
    And user "Alice" has favorited element "favorite folder"
    When the user browses to the favorites page
    And the user searches for "favorite" using the webUI
    Then folder "favorite folder" should be listed on the webUI
    And folder "not favorite folder" should be listed on the webUI


  Scenario: Delete file from search list
    Given user "Alice" has uploaded file with content "uploaded content" to "file-to-delete.txt"
    When the user searches for "file-to" using the webUI
    And the user deletes file "file-to-delete.txt" using the webUI
    Then file "file-to-delete.txt" should not be listed on the webUI
    And as "Alice" file "file-to-delete.txt" should not exist
    And as "Alice" the file with original path "file-to-delete.txt" should exist in the trashbin


  Scenario: Search for files/folders with comma in their name
    Given user "Alice" has uploaded file with content "A file with comma" to "file,with,comma.txt"
    And user "Alice" has created folder "C,O,M,M,A"
    When the user reloads the current page of the webUI
    And the user searches for "," using the webUI
    Then file "file,with,comma.txt" should be listed on the webUI
    And folder "C,O,M,M,A" should be listed on the webUI
