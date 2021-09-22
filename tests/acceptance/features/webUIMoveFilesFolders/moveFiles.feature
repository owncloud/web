Feature: move files
  As a user
  I want to move files
  So that I can organise my data structure

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files
    And user "Alice" has created folder "simple-folder"
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt"


  Scenario: An attempt to move a file into a sub-folder using rename is not allowed
    Given user "Alice" has logged in using the webUI
    And the user has browsed to the files page
    When the user tries to rename file "lorem.txt" to "simple-folder/lorem.txt" using the webUI
    Then the error message 'The name cannot contain "/"' should be displayed on the webUI dialog prompt
    And file "lorem.txt" should be listed on the webUI

  @smokeTest @ocisSmokeTest
  Scenario: move a file into a folder
    Given user "Alice" has logged in using the webUI
    And user "Alice" has uploaded file "data.tar.gz" to "data.tar.gz"
    And user "Alice" has uploaded file "strängé filename (duplicate #2 &).txt" to "strängé filename (duplicate #2 &).txt"
    And user "Alice" has created folder "strängé नेपाली folder empty"
    And the user has reloaded the current page of the webUI
    When the user moves file "lorem.txt" into folder "simple-folder" using the webUI
    Then breadcrumb for folder "simple-folder" should be displayed on the webUI
    And file "lorem.txt" should be listed on the webUI
    When the user browses to the files page
    And the user moves file "data.tar.gz" into folder "strängé नेपाली folder empty" using the webUI
    Then breadcrumb for folder "strängé नेपाली folder empty" should be displayed on the webUI
    And file "data.tar.gz" should be listed on the webUI
    When the user browses to the files page
    And the user moves file "strängé filename (duplicate #2 &).txt" into folder "strängé नेपाली folder empty" using the webUI
    Then breadcrumb for folder "strängé नेपाली folder empty" should be displayed on the webUI
    And file "strängé filename (duplicate #2 &).txt" should be listed on the webUI
    When the user browses to the files page
    Then file "lorem.txt" should not be listed on the webUI
    And file "data.tar.gz" should not be listed on the webUI
    And file "strängé filename (duplicate #2 &).txt" should not be listed on the webUI


  Scenario: move a file into a folder where a file with the same name already exists
    Given user "Alice" has logged in using the webUI
    And user "Alice" has uploaded file "lorem.txt" to "simple-folder/lorem.txt"
    And the user has browsed to the files page
    When the user tries to move file "lorem.txt" into folder "simple-folder" using the webUI
    Then the error message with header 'An error occurred while moving lorem.txt' should be displayed on the webUI

   @smokeTest @ocisSmokeTest  @disablePreviews
  Scenario: Move multiple files at once
    Given user "Alice" has logged in using the webUI
    And user "Alice" has uploaded file "data.zip" to "data.zip"
    And user "Alice" has uploaded file "data.zip" to "testapp.zip"
    And the user has reloaded the current page of the webUI
    When the user batch moves these files into folder "simple-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |


  Scenario Outline: move a file into a folder (problematic characters)
    Given user "Alice" has logged in using the webUI
    And the user has browsed to the files page
    When the user renames file "lorem.txt" to <file_name> using the webUI
    And the user renames folder "simple-folder" to <folder_name> using the webUI
    And the user moves file <file_name> into folder <folder_name> using the webUI
    Then breadcrumb for folder <folder_name> should be displayed on the webUI
    And file <file_name> should be listed on the webUI
    Examples:
      | file_name   | folder_name             |
      | "'single'"  | "folder-with-'single'"  |
      # | "\"double\" quotes" | "folder-with\"double\" quotes" | FIXME: Needs a way to access breadcrumbs with double quotes issue-3734
      | "question?" | "folder-with-question?" |
      | "&and#hash" | "folder-with-&and#hash" |


  Scenario: move files on a public share
    Given user "Alice" has uploaded file "data.zip" to "simple-folder/data.zip"
    And user "Alice" has created folder "simple-folder/simple-empty-folder"
    And user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions
    And the public uses the webUI to access the last public link created by user "Alice"
    And the user moves file "data.zip" into folder "simple-empty-folder" using the webUI
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And file "data.zip" should be listed on the webUI
    And as "Alice" file "simple-folder/simple-empty-folder/data.zip" should exist
    But as "Alice" file "simple-folder/data.zip" should not exist

  @issue-ocis-1328
  Scenario: move a file into another folder with no change permission
    Given user "Brian" has been created with default attributes and without skeleton files
    And user "Brian" has created folder "simple-folder"
    And user "Brian" has shared folder "simple-folder" with user "Alice" with "read" permissions
    And user "Alice" has logged in using the webUI
    When the user tries to move file "lorem.txt" into folder "simple-folder (2)" using the webUI
    Then as "Alice" file "simple-folder (2)/lorem.txt" should not exist

  Scenario: cancel moving a file
    Given user "Alice" has logged in using the webUI
    And the user has browsed to the files page
    And the user selects move action for file "lorem.txt" using the webUI
    And the user selects the folder "simple-folder" as a place to move the file using the webUI
    And the user cancels the attempt to move resources using the webUI
    Then file "lorem.txt" should be listed on the webUI
    But  file "lorem.txt" should not be listed in the folder "simple-folder" on the webUI

  Scenario: cancel moving of multiple files at once
    Given user "Alice" has logged in using the webUI
    And user "Alice" has uploaded file "data.zip" to "data.zip"
    And user "Alice" has uploaded file "data.zip" to "testapp.zip"
    And the user has browsed to the files page
    When the user marks these files for batch action using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    And the user selects the move button to move files using the webUI
    And the user selects the folder "simple-folder" as a place to move the files using the webUI
    And the user cancels the attempt to move resources using the webUI
    Then the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    But these resources should not be listed in the folder "simple-folder" on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |

  @issue-ocis-873
  Scenario: sharee moves a file shared by sharer into another folder
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares"
    And user "Brian" has been created with default attributes and without skeleton files
    And user "Alice" has uploaded file with content "test content" to "simple-folder/testFile.txt"
    And user "Alice" has shared folder "/simple-folder" with user "Brian"
    And user "Brian" has accepted the share "Shares/simple-folder" offered by user "Alice"
    And user "Brian" has logged in using the webUI
    And user "Brian" has created folder "/Shares/testFolder"
    And the user has opened folder "Shares"
    And the user has opened folder "simple-folder"
    When the user batch moves these files into folder "/Shares/testFolder" using the webUI
      | file_name    |
      | testFile.txt |
    Then breadcrumb for folder "Shares" should be displayed on the webUI
    And as "Brian" file "/Shares/testFolder/testFile.txt" should exist
