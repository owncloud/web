Feature: rename files
  As a user
  I want to rename files
  So that I can organise my data structure

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt"
    And user "Alice" has uploaded file "data.zip" to "data.zip"
    And user "Alice" has uploaded file "lorem-big.txt" to "lorem-big.txt"
    And user "Alice" has logged in using the webUI
    And the user has browsed to the files page

  @smokeTest @ocisSmokeTest @disablePreviews
  Scenario Outline: Rename a file
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
    Given user "Alice" has created file <from_name>
    And the user has reloaded the current page of the webUI
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
    Given user "Alice" has created file "zzzz-must-be-last-file-in-folder.txt"
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

  @notToImplementOnOCIS
  # these are valid file names for ocis
  Scenario Outline: Rename a file using forbidden characters (on oc10)
    When the user tries to rename file "data.zip" to "<filename>" using the webUI
    Then the error message with header 'Error while renaming "data.zip" to "<filename>"' should be displayed on the webUI
    And file "data.zip" should be listed on the webUI
    And file "<filename>" should not be listed on the webUI
    Examples:
      | filename  |
      | lorem\txt |
      | \\.txt    |
      | .htaccess |

  @skipOnOC10
  Scenario Outline: Rename a file using forbidden characters (on ocis)
    When the user tries to rename file "data.zip" to "<filename>" using the webUI
    Then file "data.zip" should not be listed on the webUI
    And file "<filename>" should be listed on the webUI
    Examples:
      | filename  |
      | lorem\txt |
      | \\.txt    |
      | .htaccess |

  Scenario Outline: Rename a file/folder using forward slash in its name
    When the user tries to rename file "<from_file_name>" to "<to_file_name>" using the webUI
    Then the error message 'The name cannot contain "/"' should be displayed on the webUI dialog prompt
    And file "<from_file_name>" should be listed on the webUI
    Examples:
      | from_file_name | to_file_name                      |
      | lorem.txt      | simple-folder/lorem.txt           |
      | lorem.txt      | lorem/txt                         |



  Scenario: Rename the last file in a folder
    Given user "Alice" has created file "zzzz-must-be-last-file-in-folder.txt"
    And the user has reloaded the current page of the webUI
    When the user renames file "zzzz-must-be-last-file-in-folder.txt" to "a-file.txt" using the webUI
    And the user reloads the current page of the webUI
    Then file "a-file.txt" should be listed on the webUI


  Scenario: Rename a file to become the last file in a folder
    When the user renames file "lorem.txt" to "zzzz-z-this-is-now-the-last-file.txt" using the webUI
    And the user reloads the current page of the webUI
    Then file "zzzz-z-this-is-now-the-last-file.txt" should be listed on the webUI


  Scenario: Rename a file putting a name of a file which already exists
    When the user tries to rename file "data.zip" to "lorem.txt" using the webUI
    Then the error message 'The name "lorem.txt" is already taken' should be displayed on the webUI dialog prompt
    And file 'data.zip' should be listed on the webUI


  Scenario: Rename a file to ..
    When the user tries to rename file "data.zip" to ".." using the webUI
    Then the error message 'The name cannot be equal to ".."' should be displayed on the webUI dialog prompt
    And file 'data.zip' should be listed on the webUI


  Scenario: Rename a file to .
    When the user tries to rename file "data.zip" to "." using the webUI
    Then the error message 'The name cannot be equal to "."' should be displayed on the webUI dialog prompt
    And file 'data.zip' should be listed on the webUI

  @notToImplementOnOCIS
  # This is valid file name for ocis
  Scenario: Rename a file to .part (on oc10)
    When the user tries to rename file "data.zip" to "data.part" using the webUI
    Then the error message with header 'Error while renaming "data.zip" to "data.part"' should be displayed on the webUI

  @skipOnOC10
  Scenario: Rename a file to .part
    When the user tries to rename file "data.zip" to "data.part" using the webUI
    Then file 'data.part' should be listed on the webUI

  @ocis-reva-issue-64
  Scenario: rename a file on a public share (on ocis)
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has uploaded file "lorem.txt" to "simple-folder/lorem.txt"
    And the user has reloaded the current page of the webUI
    And user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions
    When the public uses the webUI to access the last public link created by user "Alice"
    And the user renames file "lorem.txt" to "a-renamed-file.txt" using the webUI
    Then file "a-renamed-file.txt" should be listed on the webUI
    But file "lorem.txt" should not be listed on the webUI
    When the user reloads the current page of the webUI
    Then file "a-renamed-file.txt" should be listed on the webUI
    But file "lorem.txt" should not be listed on the webUI
    And as "Alice" file "simple-folder/a-renamed-file.txt" should exist
    And as "Alice" file "simple-folder/lorem.txt" should not exist

  @ocis-reva-issue-64
  Scenario: Rename a file and folder in shared with me page
    Given user "Brian" has been created with default attributes and without skeleton files
    And user "Brian" has created folder "simple-folder"
    And user "Brian" has uploaded file "lorem.txt" to "simple-folder/lorem.txt"
    And user "Brian" has uploaded file "lorem.txt" to "lorem.txt"
    And the user has reloaded the current page of the webUI
    And user "Brian" has shared file "lorem.txt" with user "Alice"
    And user "Brian" has shared folder "simple-folder" with user "Alice"
    When the user browses to the shared-with-me page
    And the user renames file "lorem (2).txt" to "renamed-file.txt" using the webUI
    And the user renames folder "simple-folder" to "renamed-folder" using the webUI
    Then file "renamed-file.txt" should be listed on the webUI
    And folder "renamed-folder" should be listed on the webUI
    When the user reloads the current page of the webUI
    Then file "renamed-file.txt" should be listed on the webUI
    And folder "renamed-folder" should be listed on the webUI
    When the user browses to the files page
    Then file "renamed-file.txt" should be listed on the webUI
    And folder "renamed-folder" should be listed on the webUI
    And as "Alice" file "renamed-file.txt" should exist
    And as "Alice" folder "renamed-folder" should exist
    And as "Brian" file "lorem.txt" should exist
    And as "Brian" folder "simple-folder" should exist

  @ocis-reva-issue-64
  Scenario: Rename a file and folder in shared with others page
    Given user "Brian" has been created with default attributes and without skeleton files
    And user "Alice" has created folder "simple-folder"
    And user "Alice" has shared file "lorem.txt" with user "Brian"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    When the user browses to the shared-with-others page
    And the user renames file "lorem.txt" to "renamed-file.txt" using the webUI
    And the user renames folder "simple-folder" to "renamed-folder" using the webUI
    Then file "renamed-file.txt" should be listed on the webUI
    And folder "renamed-folder" should be listed on the webUI
    When the user reloads the current page of the webUI
    Then file "renamed-file.txt" should be listed on the webUI
    And folder "renamed-folder" should be listed on the webUI
    When the user browses to the files page
    Then file "renamed-file.txt" should be listed on the webUI
    And folder "renamed-folder" should be listed on the webUI
    And as "Alice" file "renamed-file.txt" should exist
    And as "Alice" folder "renamed-folder" should exist
    And as "Brian" file "lorem.txt" should exist
    And as "Brian" folder "simple-folder" should exist

  @ocis-reva-issue-39
  Scenario: Rename a file and folder in favorites page
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has favorited element "lorem.txt"
    And user "Alice" has favorited element "simple-folder"
    When the user browses to the favorites page
    And the user renames file "lorem.txt" to "renamed-file.txt" using the webUI
    And the user renames folder "simple-folder" to "renamed-folder" using the webUI
    Then file "renamed-file.txt" should be listed on the webUI
    And folder "renamed-folder" should be listed on the webUI


  Scenario: User tries to rename a file that used to exist but does not anymore
    Given the user has browsed to the files page
    And the following files have been deleted by user "Alice"
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Error while renaming "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist
    And as "Alice" file "new-lorem.txt" should not exist
