Feature: copy files and folders
  As a user
  I want to copy files and folders
  So that I can work safely on a copy without changing the original

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files

  @smokeTest
  Scenario: copy a file and a folder into a folder
    Given user "Alice" has uploaded file "data.zip" to "data.zip"
    And user "Alice" has created folder "simple-empty-folder"
    And user "Alice" has created folder "simple-folder"
    And user "Alice" has created folder "strängé नेपाली folder empty"
    And user "Alice" has logged in using the webUI
    And the user has browsed to the files page
    When the user copies file "data.zip" into folder "simple-empty-folder" using the webUI
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And file "data.zip" should be listed on the webUI
    When the user browses to the files page
    And the user copies folder "simple-folder" into folder "strängé नेपाली folder empty" using the webUI
    Then breadcrumb for folder "strängé नेपाली folder empty" should be displayed on the webUI
    And folder "simple-folder" should be listed on the webUI


  Scenario: copy a file into a folder where a file with the same name already exists
    Given user "Alice" has created file "strängé filename (duplicate #2 &).txt"
    And user "Alice" has created folder "strängé नेपाली folder"
    And user "Alice" has created file "strängé नेपाली folder/strängé filename (duplicate #2 &).txt"
    And user "Alice" has logged in using the webUI
    And the user has browsed to the files page
    When the user tries to copy file "strängé filename (duplicate #2 &).txt" into folder "strängé नेपाली folder" using the webUI
    Then the error message with header 'An error occurred while copying strängé filename (duplicate #2 &).txt' should be displayed on the webUI

  @smokeTest
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip"
    And user "Alice" has created file "lorem.txt"
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip"
    And user "Alice" has created folder "simple-empty-folder"
    And user "Alice" has logged in using the webUI
    And the user has browsed to the files page
    When the user batch copies these files into folder "simple-empty-folder" using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |


  Scenario Outline: copy a file into a folder (problematic characters)
    Given user "Alice" has created file "lorem.txt"
    And user "Alice" has created folder "simple-empty-folder"
    And user "Alice" has logged in using the webUI
    And the user has browsed to the files page
    When the user renames file "lorem.txt" to <file_name> using the webUI
    And the user renames folder "simple-empty-folder" to <folder_name> using the webUI
    And the user copies file <file_name> into folder <folder_name> using the webUI
    Then breadcrumb for folder <folder_name> should be displayed on the webUI
    And file <file_name> should be listed on the webUI
    Examples:
      | file_name           | folder_name                    |
      | "'single'"          | "folder-with-'single'"         |
      | "\"double\" quotes" | "folder-with\"double\" quotes" |
      | "question?"         | "folder-with-question?"        |
      | "&and#hash"         | "folder-with-&and#hash"        |

  @issue-3755
  Scenario: copy files on a public share
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has created folder "simple-folder/simple-empty-folder"
    And user "Alice" has uploaded file "data.zip" to "simple-folder/data.zip"
    And user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions
    And the public uses the webUI to access the last public link created by user "Alice"
    And the user copies file "data.zip" into folder "simple-empty-folder" using the webUI
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And file "data.zip" should be listed on the webUI
    And as "Alice" file "simple-folder/simple-empty-folder/data.zip" should exist
    And as "Alice" file "simple-folder/data.zip" should exist

  @issue-ocis-reva-243
  Scenario: copy a file into another folder with no change permission
    Given user "Alice" has created file "lorem.txt"
    And user "Alice" has created folder "simple-folder"
    And user "Brian" has been created with default attributes and without skeleton files
    And user "Brian" has created folder "simple-folder"
    And user "Brian" has shared folder "simple-folder" with user "Alice" with "read" permissions
    And user "Alice" has logged in using the webUI
    When the user tries to copy file "lorem.txt" into folder "simple-folder" using the webUI
    Then as "Alice" file "simple-folder/lorem.txt" should not exist

  @issue-ocis-reva-243
  Scenario: copy a folder into another folder with no change permission
    Given user "Alice" has created folder "simple-empty-folder"
    And user "Brian" has been created with default attributes and without skeleton files
    And user "Brian" has created folder "simple-folder"
    And user "Brian" has shared folder "simple-folder" with user "Alice" with "read" permissions
    And user "Alice" has logged in using the webUI
    When the user tries to copy folder "simple-empty-folder" into folder "simple-folder" using the webUI
    Then as "Alice" file "simple-folder/simple-empty-folder" should not exist


  Scenario: copy a folder into the same folder
    Given user "Alice" has created folder "simple-empty-folder"
    And user "Alice" has logged in using the webUI
    When the user tries to copy folder "simple-empty-folder" into folder "simple-empty-folder" using the webUI
    Then the error message with header 'An error occurred while copying simple-empty-folder' should be displayed on the webUI
    And as "Alice" file "simple-empty-folder/simple-empty-folder" should not exist


  Scenario: copy a folder into another folder with same name
    Given user "Alice" has created folder "simple-empty-folder"
    And user "Alice" has created folder "folder with space"
    And user "Alice" has created folder "folder with space/simple-empty-folder"
    And user "Alice" has logged in using the webUI
    When the user copies folder "simple-empty-folder" into folder "folder with space/simple-empty-folder" using the webUI
    Then breadcrumb for folder "folder with space" should be displayed on the webUI
    And folder "simple-empty-folder" should be listed on the webUI
    And as "Alice" folder "folder with space/simple-empty-folder/simple-empty-folder" should exist
    And as "Alice" folder "simple-empty-folder" should exist

  Scenario: cancel copying a file
    Given user "Alice" has uploaded file "data.zip" to "data.zip"
    And user "Alice" has created folder "simple-empty-folder"
    And user "Alice" has logged in using the webUI
    And the user has browsed to the files page
    When the user opens the file action menu of folder "data.zip" using the webUI
    And the user selects copy action for folder "data.zip" using the webUI
    And the user selects the folder "simple-empty-folder" as a place to copy the file using the webUI
    And the user cancels the attempt to copy resources using the webUI
    Then file "data.zip" should be listed on the webUI
    But  file "data.zip" should not be listed in the folder "simple-empty-folder" on the webUI

  Scenario: cancel copying of multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip"
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip"
    And user "Alice" has created file "lorem.txt"
    And user "Alice" has created folder "simple-empty-folder"
    And user "Alice" has logged in using the webUI
    And the user has browsed to the files page
    When the user marks these files for batch action using the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    And the user selects the copy button to copy files using the webUI
    And the user selects the folder "simple-empty-folder" as a place to copy the files using the webUI
    And the user cancels the attempt to copy resources using the webUI
    Then the following files should be listed on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
    But these resources should not be listed in the folder "simple-empty-folder" on the webUI
      | file_name   |
      | data.zip    |
      | lorem.txt   |
      | testapp.zip |
