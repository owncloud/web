Feature: rename files
  As a user
  I want to rename files
  So that I can organise my data structure

  Background:
    Given user "user1" has been created with default attributes
    And user "user1" has logged in using the webUI
    And the user has browsed to the files page

  @smokeTest
  Scenario Outline: Rename a file
    When the user renames file "lorem.txt" to <to_file_name> using the webUI
    Then file <to_file_name> should be listed on the webUI
    When the user reloads the current page of the webUI
    Then file <to_file_name> should be listed on the webUI
    Examples:
      | to_file_name           |
      | "simple-name.txt"      |
      | "लोरेम।तयक्स्त? $%#&@" |
      | '"quotes1"'            |
      | "\"quote\"d-folders'"  |
      | "'quotes2'"            |

  Scenario Outline: Rename a file that has special characters in its name
    When the user renames file <from_name> to <to_name> using the webUI
    Then file <to_name> should be listed on the webUI
    When the user reloads the current page of the webUI
    Then file <to_name> should be listed on the webUI
    Examples:
      | from_name                               | to_name                               |
      | "strängé filename (duplicate #2 &).txt" | "strängé filename (duplicate #3).txt" |
      | "'single'quotes.txt"                    | "single-quotes.txt"                   |

  @smokeTest
  Scenario: Rename a file using special characters and check its existence after page reload
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
    When the user renames file "lorem.txt" to an invalid name "space at end " using the webUI
    Then the error message 'The name cannot end with whitespace' should be displayed on the webUI dialog prompt
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should be listed on the webUI
    And file "space at end " should not be listed on the webUI
    When the user renames file "lorem.txt" to an invalid name "  multiple   space    all     over   .  dat  " using the webUI
    Then the error message 'The name cannot end with whitespace' should be displayed on the webUI dialog prompt
    And the user reloads the current page of the webUI
    Then file "lorem.txt" should be listed on the webUI
    And file "  multiple   space    all     over   .  dat  " should not be listed on the webUI

  Scenario: Rename a file using both double and single quotes
    When the user renames the following file using the webUI
      | fromName          | toName                         |
      | lorem.txt         | '"First 'single" quotes" '.txt |
      | lorem-big.txt     | Test" 'me o'ut".txt            |
    And the user reloads the current page of the webUI
    Then these files should be listed on the webUI
      | files                          |
      | '"First 'single" quotes" '.txt |
      | Test" 'me o'ut".txt            |
    When the user renames the following file using the webUI
      | fromName                       | toName        |
      | '"First 'single" quotes" '.txt | loremz.dat    |
      | Test" 'me o'ut".txt            | loremy.tad    |
    And the user reloads the current page of the webUI
    Then file "loremz.dat" should be listed on the webUI
    Then file "loremy.tad" should be listed on the webUI

  Scenario Outline: Rename a file using forbidden characters
    When the user renames file "data.zip" to "<filename>" using the webUI
    Then the error message 'Error while renaming "data.zip" to "<filename>"' should be displayed on the webUI
    And file "data.zip" should be listed on the webUI
    And file "<filename>" should not be listed on the webUI
    Examples:
      | filename  |
      | lorem\txt |
      | \\.txt    |
      | .htaccess |

  Scenario Outline: Rename a file/folder using forward slash in its name
    When the user renames file "<from_file_name>" to an invalid name "<to_file_name>" using the webUI
    Then the error message 'The name cannot contain "/"' should be displayed on the webUI dialog prompt
    And file "<from_file_name>" should be listed on the webUI
    Examples:
      | from_file_name | to_file_name                      |
      | lorem.txt      | simple-folder/lorem.txt           |
      | lorem.txt      | lorem/txt                         |
      | simple-folder  | simple-empty-folder/simple-folder |

  Scenario: Rename the last file in a folder
    When the user renames file "zzzz-must-be-last-file-in-folder.txt" to "a-file.txt" using the webUI
    And the user reloads the current page of the webUI
    Then file "a-file.txt" should be listed on the webUI

  Scenario: Rename a file to become the last file in a folder
    When the user renames file "lorem.txt" to "zzzz-z-this-is-now-the-last-file.txt" using the webUI
    And the user reloads the current page of the webUI
    Then file "zzzz-z-this-is-now-the-last-file.txt" should be listed on the webUI

  Scenario: Rename a file putting a name of a file which already exists
    When the user renames file "data.zip" to an invalid name "lorem.txt" using the webUI
    Then the error message 'The name "lorem.txt" is already taken' should be displayed on the webUI dialog prompt
    And file 'data.zip' should be listed on the webUI

  Scenario: Rename a file to ..
    When the user renames file "data.zip" to an invalid name ".." using the webUI
    Then the error message 'The name cannot be equal to ".."' should be displayed on the webUI dialog prompt
    And file 'data.zip' should be listed on the webUI

  Scenario: Rename a file to .
    When the user renames file "data.zip" to an invalid name "." using the webUI
    Then the error message 'The name cannot be equal to "."' should be displayed on the webUI dialog prompt
    And file 'data.zip' should be listed on the webUI

  Scenario: Rename a file to .part
    When the user renames file "data.zip" to "data.part" using the webUI
    Then the error message 'Error while renaming "data.zip" to "data.part"' should be displayed on the webUI

  Scenario: rename a file on a public share
    Given user "user1" has shared folder "simple-folder" with link with "read, change, create, delete" permissions
    When the public uses the webUI to access the last public link created by user "user1"
    And the user renames file "lorem.txt" to "a-renamed-file.txt" using the webUI
    Then file "a-renamed-file.txt" should be listed on the webUI
    But file "lorem.txt" should not be listed on the webUI
    When the user reloads the current page of the webUI
    Then file "a-renamed-file.txt" should be listed on the webUI
    But file "lorem.txt" should not be listed on the webUI
    And as "user1" file "simple-folder/a-renamed-file.txt" should exist
    And as "user1" file "simple-folder/lorem.txt" should not exist
