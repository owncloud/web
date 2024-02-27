Feature: copy files and folders
  As a user
  I want to copy files and folders
  So that I can work safely on a copy without changing the original

  Background:
    Given the administrator has set the default folder for received shares to "Shares" in the server
    And user "Alice" has been created with default attributes and without skeleton files in the server


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
