Feature: copy files and folders
  As a user
  I want to copy files and folders
  So that I can work safely on a copy without changing the original

  Background:
    Given the administrator has set the default folder for received shares to "Shares" in the server
    And user "Alice" has been created with default attributes and without skeleton files in the server

  @smokeTest @ocisSmokeTest @skipOnIphoneResolution
  Scenario: copy a file and a folder into a folder
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created folder "strängé नेपाली folder empty" in the server
    And user "Alice" has logged in using the webUI
    And the user reloads the current page of the webUI
    When the user copies file "data.zip" into folder "simple-empty-folder" using the webUI
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And file "data.zip" should be listed on the webUI
    When the user browses to the files page
    And the user copies folder "simple-folder" into folder "strängé नेपाली folder empty" using the webUI
    Then breadcrumb for folder "strängé नेपाली folder empty" should be displayed on the webUI
    And folder "simple-folder" should be listed on the webUI


  Scenario: copy a file into a folder where a file with the same name already exists
    Given user "Alice" has created file "strängé filename (duplicate #2 &).txt" in the server
    And user "Alice" has created folder "strängé नेपाली folder" in the server
    And user "Alice" has created file "strängé नेपाली folder/strängé filename (duplicate #2 &).txt" in the server
    And user "Alice" has logged in using the webUI
    And the user has browsed to the personal page
    When the user tries to copy file "strängé filename (duplicate #2 &).txt" into folder "strängé नेपाली folder" using the webUI
    Then the "modal error" message with header 'File with name "strängé filename (duplicate #2 &).txt" already exists.' should be displayed on the webUI

  @smokeTest @ocisSmokeTest @skipOnIphoneResolution
  Scenario: Copy multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "new-data.zip" to "testapp.zip" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
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
    Given user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has browsed to the personal page
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
    Given user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created folder "simple-folder/simple-empty-folder" in the server
    And user "Alice" has uploaded file "data.zip" to "simple-folder/data.zip" in the server
    And user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions in the server
    When the public uses the webUI to access the last public link created by user "Alice" in a new session
    And the user copies file "data.zip" into folder "simple-empty-folder" using the webUI
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And file "data.zip" should be listed on the webUI
    And as "Alice" file "simple-folder/simple-empty-folder/data.zip" should exist in the server
    And as "Alice" file "simple-folder/data.zip" should exist in the server


  Scenario: copy a folder into the same folder
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    When the user tries to copy folder "simple-empty-folder" into folder "simple-empty-folder" using the webUI
    Then the "error" message with header "You can't paste the selected file at this location because you can't paste an item into itself." should be displayed on the webUI
    And the user clears all error message from the webUI
    And as "Alice" file "simple-empty-folder/simple-empty-folder" should not exist in the server


  Scenario: copy a folder into another folder with same name
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has created folder "folder with space" in the server
    And user "Alice" has created folder "folder with space/simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    When the user copies folder "simple-empty-folder" into folder "folder with space/simple-empty-folder" using the webUI
    Then breadcrumb for folder "folder with space" should be displayed on the webUI
    And folder "simple-empty-folder" should be listed on the webUI
    And as "Alice" folder "folder with space/simple-empty-folder/simple-empty-folder" should exist in the server
    And as "Alice" folder "simple-empty-folder" should exist in the server
