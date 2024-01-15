Feature: rename files
  As a user
  I want to rename files
  So that I can organise my data structure

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem-big.txt" to "lorem-big.txt" in the server

  @smokeTest @ocisSmokeTest @disablePreviews
  Scenario Outline: Rename a file
    Given user "Alice" has logged in using the webUI
    When the user renames file "lorem.txt" to <to_file_name> using the webUI
    Then file <to_file_name> should be listed on the webUI
    When the user reloads the current page of the webUI
    Then file <to_file_name> should be listed on the webUI
    Examples:
      | to_file_name           |
      | "simple-name.txt"      |
      | '"quotes1"'            |
      | "\"quote\"d-folders'"  |
      | "'quotes2'"            |
      | "लोरेम।तयक्स्त? $%#&@" |


  Scenario Outline: Rename a file that has special characters in its name
    Given user "Alice" has created file <from_name> in the server
    And user "Alice" has logged in using the webUI
    When the user renames file <from_name> to <to_name> using the webUI
    Then file <to_name> should be listed on the webUI
    When the user reloads the current page of the webUI
    Then file <to_name> should be listed on the webUI
    Examples:
      | from_name                               | to_name                               |
      | "'single'quotes.txt"                    | "single-quotes.txt"                   |
      | "strängé filename (duplicate #2 &).txt" | "strängé filename (duplicate #3).txt" |
      | "sämple,1.txt"                          | "file,with,commä,.txt"                |

  @smokeTest
  Scenario: Rename a file using special characters and check its existence after page reload
    Given user "Alice" has created file "zzzz-must-be-last-file-in-folder.txt" in the server
    And user "Alice" has logged in using the webUI
    When the user renames file "lorem.txt" to "लोरेम।तयक्स्त $%&" using the webUI
    And the user reloads the current page of the webUI
    Then file "लोरेम।तयक्स्त $%&" should be listed on the webUI
    When the user renames file "लोरेम।तयक्स्त $%&" to '"double"quotes.txt' using the webUI
    And the user reloads the current page of the webUI
    Then file '"double"quotes.txt' should be listed on the webUI
    When the user renames file '"double"quotes.txt' to "no-double-quotes.txt" using the webUI
    And the user reloads the current page of the webUI
    Then file "no-double-quotes.txt" should be listed on the webUI
    When the user renames file 'no-double-quotes.txt' to "hash#And&QuestionMark?At@Filename.txt" using the webUI
    And the user reloads the current page of the webUI
    Then file "hash#And&QuestionMark?At@Filename.txt" should be listed on the webUI
    When the user renames file 'zzzz-must-be-last-file-in-folder.txt' to "aaaaaa.txt" using the webUI
    And the user reloads the current page of the webUI
    Then file "aaaaaa.txt" should be listed on the webUI

  @issue-964
  Scenario: Rename a file using spaces at front and/or back of file name and type
    Given user "Alice" has logged in using the webUI
    When the user renames file "lorem.txt" to " space at start" using the webUI
    And the user reloads the current page of the webUI
    Then file " space at start" should be listed on the webUI
    When the user renames file " space at start" to "space at end .txt" using the webUI
    And the user reloads the current page of the webUI
    Then file "space at end .txt" should be listed on the webUI
    When the user renames file "space at end .txt" to "space at end. lis" using the webUI
    And the user reloads the current page of the webUI
    Then file "space at end. lis" should be listed on the webUI
    When the user renames file "space at end. lis" to "  multiple   space    all     over   .  dat" using the webUI
    And the user reloads the current page of the webUI
    Then file "  multiple   space    all     over   .  dat" should be listed on the webUI


  Scenario: Rename a file using spaces at end is prohibited
    Given user "Alice" has logged in using the webUI
    When the user tries to rename file "lorem.txt" to "space at end " using the webUI
    Then the error message 'The name cannot end with whitespace' should be displayed on the webUI dialog prompt
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should be listed on the webUI
    And file "space at end " should not be listed on the webUI
    When the user tries to rename file "lorem.txt" to "  multiple   space    all     over   .  dat  " using the webUI
    Then the error message 'The name cannot end with whitespace' should be displayed on the webUI dialog prompt
    And the user reloads the current page of the webUI
    And file "lorem.txt" should be listed on the webUI
    And file "  multiple   space    all     over   .  dat  " should not be listed on the webUI

  @issue-4859 @disablePreviews
  Scenario: Rename a file using both double and single quotes
    Given user "Alice" has logged in using the webUI
    When the user renames the following file using the webUI
      | fromName      | toName                         |
      | lorem.txt     | '"First 'single" quotes" '.txt |
      | lorem-big.txt | Test" 'me o'ut".txt            |
    And the user reloads the current page of the webUI
    Then these files should be listed on the webUI
      | files                          |
      | '"First 'single" quotes" '.txt |
      | Test" 'me o'ut".txt            |
    When the user renames the following file using the webUI
      | fromName                       | toName     |
      | '"First 'single" quotes" '.txt | loremz.dat |
      | Test" 'me o'ut".txt            | loremy.tad |
    And the user reloads the current page of the webUI
    Then file "loremz.dat" should be listed on the webUI
    And file "loremy.tad" should be listed on the webUI


  Scenario Outline: Rename a file/folder using forward slash in its name
    Given user "Alice" has logged in using the webUI
    When the user tries to rename file "<from_file_name>" to "<to_file_name>" using the webUI
    Then the error message 'The name cannot contain "/"' should be displayed on the webUI dialog prompt
    And file "<from_file_name>" should be listed on the webUI
    Examples:
      | from_file_name | to_file_name            |
      | lorem.txt      | simple-folder/lorem.txt |
      | lorem.txt      | lorem/txt               |


  Scenario: Rename the last file in a folder
    Given user "Alice" has created file "zzzz-must-be-last-file-in-folder.txt" in the server
    And user "Alice" has logged in using the webUI
    When the user renames file "zzzz-must-be-last-file-in-folder.txt" to "a-file.txt" using the webUI
    And the user reloads the current page of the webUI
    Then file "a-file.txt" should be listed on the webUI


  Scenario: Rename a file to become the last file in a folder
    Given user "Alice" has logged in using the webUI
    When the user renames file "lorem.txt" to "zzzz-z-this-is-now-the-last-file.txt" using the webUI
    And the user reloads the current page of the webUI
    Then file "zzzz-z-this-is-now-the-last-file.txt" should be listed on the webUI


  Scenario: Rename a file putting a name of a file which already exists
    Given user "Alice" has logged in using the webUI
    When the user tries to rename file "data.zip" to "lorem.txt" using the webUI
    Then the error message 'The name "lorem.txt" is already taken' should be displayed on the webUI dialog prompt
    And file 'data.zip' should be listed on the webUI


  Scenario: Rename a file to ..
    Given user "Alice" has logged in using the webUI
    When the user tries to rename file "data.zip" to ".." using the webUI
    Then the error message 'The name cannot be equal to ".."' should be displayed on the webUI dialog prompt
    And file 'data.zip' should be listed on the webUI


  Scenario: Rename a file to .
    Given user "Alice" has logged in using the webUI
    When the user tries to rename file "data.zip" to "." using the webUI
    Then the error message 'The name cannot be equal to "."' should be displayed on the webUI dialog prompt
    And file 'data.zip' should be listed on the webUI


  Scenario: Rename a file to .part
    Given user "Alice" has logged in using the webUI
    When the user renames file "data.zip" to "data.part" using the webUI
    Then file 'data.part' should be listed on the webUI


  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the "error" message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server


  Scenario: Rename file extension through context-menu without reload
    Given user "Alice" has logged in using the webUI
    When the user renames file "lorem.txt" to "lorem.md" through context-menu using the webUI
    Then file "lorem.md" should be listed on the webUI
    And file "lorem.md" should be listed on the sidebar
