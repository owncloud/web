Feature: rename folders
  As a user
  I want to rename folders
  So that I can organise my data structure

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files
    And user "Alice" has created folder "simple-folder"
    And user "Alice" has created folder "simple-empty-folder"
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt"
    And user "Alice" has logged in using the webUI
    And the user has browsed to the files page

  @ocisSmokeTest
  Scenario Outline: Rename a folder
    When the user renames folder "simple-folder" to <to_folder_name> using the webUI
    Then folder <to_folder_name> should be listed on the webUI
    When the user reloads the current page of the webUI
    Then folder <to_folder_name> should be listed on the webUI
    Examples:
      | to_folder_name          |
      | 'an other simple name'  |
      | '"quotes1"'             |
      | "'quotes2'"             |
      | "home"                  |
      | 'सिमप्ले फोल्देर$%#?&@' |


  Scenario Outline: Rename a folder that has special characters in its name
    Given user "Alice" has created folder <from_name>
    And the user has reloaded the current page of the webUI
    When the user renames folder <from_name> to <to_name> using the webUI
    Then folder <to_name> should be listed on the webUI
    When the user reloads the current page of the webUI
    Then folder <to_name> should be listed on the webUI
    Examples:
      | from_name                  | to_name                     |
      | "'single'quotes"           | "single-quotes"             |
      | "strängé नेपाली folder"    | "strängé नेपाली folder-#?2" |
      | "Sample,Folder,With,Comma" | "Simple,Folder,With,Commä"  |


  Scenario: Rename a folder using special characters and check its existence after page reload
    When the user renames folder "simple-folder" to "लोरेम।तयक्स्त $%&" using the webUI
    And the user reloads the current page of the webUI
    Then folder "लोरेम।तयक्स्त $%&" should be listed on the webUI
    When the user renames folder "लोरेम।तयक्स्त $%&" to '"double"quotes' using the webUI
    And the user reloads the current page of the webUI
    Then folder '"double"quotes' should be listed on the webUI
    When the user renames folder '"double"quotes' to "no-double-quotes" using the webUI
    And the user reloads the current page of the webUI
    Then folder "no-double-quotes" should be listed on the webUI
    When the user renames folder 'no-double-quotes' to "hash#And&QuestionMark?At@FolderName" using the webUI
    And the user reloads the current page of the webUI
    Then folder "hash#And&QuestionMark?At@FolderName" should be listed on the webUI

  @issue-964
  Scenario: Rename a folder using spaces at front and/or back of the name
    When the user renames folder "simple-folder" to " space at start" using the webUI
    And the user reloads the current page of the webUI
    Then folder " space at start" should be listed on the webUI
    When the user renames folder " space at start" to "  multiple   spaces    all     over" using the webUI
    And the user reloads the current page of the webUI
    Then folder "  multiple   spaces    all     over" should be listed on the webUI


  Scenario: Rename a file using spaces at end is prohibited
    When the user tries to rename folder "simple-folder" to "space at end " using the webUI
    Then the error message 'The name cannot end with whitespace' should be displayed on the webUI dialog prompt
    When the user reloads the current page of the webUI
    And folder "space at end " should not be listed on the webUI
    And the user tries to rename folder "simple-folder" to "  multiple   space    all     over   " using the webUI
    Then the error message 'The name cannot end with whitespace' should be displayed on the webUI dialog prompt
    And the user reloads the current page of the webUI
    And folder "simple-folder" should be listed on the webUI
    And folder "  multiple   space    all     over   " should not be listed on the webUI


  Scenario: Rename a folder using both double and single quotes
    When the user renames the following folder using the webUI
      | fromName            | toName                     |
      | simple-folder       | '"First 'single" quotes" ' |
      | simple-empty-folder | Test" 'me o'ut"            |
    And the user reloads the current page of the webUI
    Then these folders should be listed on the webUI
      | folders                    |
      | '"First 'single" quotes" ' |
      | Test" 'me o'ut"            |
    When the user renames the following folder using the webUI
      | fromName                   | toName                |
      | '"First 'single" quotes" ' | a normal folder       |
      | Test" 'me o'ut"            | another normal folder |
    And the user reloads the current page of the webUI
    Then these folders should be listed on the webUI
      | folders               |
      | a normal folder       |
      | another normal folder |

  @notToImplementOnOCIS
  # These are valid file names for ocis
  Scenario Outline: Rename a folder using forbidden characters
    When the user tries to rename folder <from_name> to <to_name> using the webUI
    Then the error message with header '<alert_message>' should be displayed on the webUI
    And folder "simple-folder" should be listed on the webUI
    Examples:
      | from_name       | to_name           | alert_message                                             |
      | "simple-folder" | "simple\folder"   | Error while renaming "simple-folder" to "simple\folder"   |
      | "simple-folder" | "\\simple-folder" | Error while renaming "simple-folder" to "\\simple-folder" |
      | "simple-folder" | ".htaccess"       | Error while renaming "simple-folder" to ".htaccess"       |

  @skipOnOC10
  Scenario Outline: Rename a folder using forbidden characters
    When the user renames folder <from_name> to <to_name> using the webUI
    Then folder <to_name> should be listed on the webUI
    Examples:
      | from_name       | to_name           |
      | "simple-folder" | "simple\folder"   |
      | "simple-folder" | "\\simple-folder" |
      | "simple-folder" | ".htaccess"       |


  Scenario: Rename a folder putting a name of a file which already exists
    When the user tries to rename folder "simple-folder" to "lorem.txt" using the webUI
    Then the error message 'The name "lorem.txt" is already taken' should be displayed on the webUI dialog prompt


  Scenario: Rename a folder to ..
    When the user tries to rename folder "simple-folder" to ".." using the webUI
    Then the error message 'The name cannot be equal to ".."' should be displayed on the webUI dialog prompt


  Scenario: Rename a folder to .
    When the user tries to rename folder "simple-folder" to "." using the webUI
    Then the error message 'The name cannot be equal to "."' should be displayed on the webUI dialog prompt

  @notToImplementOnOCIS
  # This is valid file name for ocis
  Scenario: Rename a folder to .part (on oc10)
    When the user tries to rename folder "simple-folder" to "simple.part" using the webUI
    Then the error message with header 'Error while renaming "simple-folder" to "simple.part"' should be displayed on the webUI

  @skipOnOC10
  Scenario: Rename a folder to .part (on ocis)
    When the user renames folder "simple-folder" to "simple.part" using the webUI
    Then folder "simple.part" should be listed on the webUI

  Scenario: User tries to rename a folder that used to exist but does not anymore
    Given the user has browsed to the files page
    And the following files have been deleted by user "Alice"
      | name          |
      | simple-folder |
    When the user tries to rename folder "simple-folder" to "new-simple-folder" using the webUI
    Then the error message with header 'Error while renaming "simple-folder" to "new-simple-folder"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then folder "simple-folder" should not be listed on the webUI
    And folder "new-simple-folder" should not be listed on the webUI
    And as "Alice" folder "simple-folder" should not exist
    And as "Alice" folder "new-simple-folder" should not exist
