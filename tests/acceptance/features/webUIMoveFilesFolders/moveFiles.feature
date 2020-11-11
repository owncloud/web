Feature: move files
  As a user
  I want to move files
  So that I can organise my data structure

  Background:
    Given user "user1" has been created with default attributes

  Scenario: An attempt to move a file into a sub-folder using rename is not allowed
    Given user "user1" has logged in using the webUI
    And the user has browsed to the files page
    When the user tries to rename file "data.zip" to "simple-folder/data.zip" using the webUI
    Then the error message 'The name cannot contain "/"' should be displayed on the webUI dialog prompt
    And file "data.zip" should be listed on the webUI

  @smokeTest
  Scenario: move a file into a folder
    Given user "user1" has logged in using the webUI
    And the user has browsed to the files page
    When the user moves file "data.zip" into folder "simple-empty-folder" using the webUI
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And file "data.zip" should be listed on the webUI
    When the user browses to the files page
    And the user moves file "data.tar.gz" into folder "strängé नेपाली folder empty" using the webUI
    Then breadcrumb for folder "strängé नेपाली folder empty" should be displayed on the webUI
    And file "data.tar.gz" should be listed on the webUI
    When the user browses to the files page
    And the user moves file "strängé filename (duplicate #2 &).txt" into folder "strängé नेपाली folder empty" using the webUI
    Then breadcrumb for folder "strängé नेपाली folder empty" should be displayed on the webUI
    And file "strängé filename (duplicate #2 &).txt" should be listed on the webUI
    When the user browses to the files page
    Then file "data.zip" should not be listed on the webUI
    And file "data.tar.gz" should not be listed on the webUI
    And file "strängé filename (duplicate #2 &).txt" should not be listed on the webUI

  Scenario: move a file into a folder where a file with the same name already exists
    Given user "user1" has logged in using the webUI
    And the user has browsed to the files page
    When the user moves file "strängé filename (duplicate #2 &).txt" into folder "strängé नेपाली folder" using the webUI
    Then the error message with header 'An error occurred while moving strängé filename (duplicate #2 &).txt' should be displayed on the webUI

  @smokeTest
  Scenario: Move multiple files at once
    Given user "user1" has logged in using the webUI
    And the user has browsed to the files page
    When the user batch moves these files into folder "simple-empty-folder" using the webUI
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

  Scenario Outline: move a file into a folder (problematic characters)
    Given user "user1" has logged in using the webUI
    And the user has browsed to the files page
    When the user renames file "lorem.txt" to <file_name> using the webUI
    And the user renames folder "simple-empty-folder" to <folder_name> using the webUI
    And the user moves file <file_name> into folder <folder_name> using the webUI
    Then breadcrumb for folder <folder_name> should be displayed on the webUI
    And file <file_name> should be listed on the webUI
    Examples:
      | file_name           | folder_name                      |
      | "'single'"          | "folder-with-'single'"           |
      # | "\"double\" quotes" | "folder-with\"double\" quotes" | FIXME: Needs a way to access breadcrumbs with double quotes issue-3734
      | "question?"         | "folder-with-question?"          |
      | "&and#hash"         | "folder-with-&and#hash"          |

  Scenario: move files on a public share
    Given user "user1" has shared folder "simple-folder" with link with "read, update, create, delete" permissions
    And the public uses the webUI to access the last public link created by user "user1"
    And the user moves file "data.zip" into folder "simple-empty-folder" using the webUI
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And file "data.zip" should be listed on the webUI
    And as "user1" file "simple-folder/simple-empty-folder/data.zip" should exist
    But as "user1" file "simple-folder/data.zip" should not exist

  @issue-ocis-reva-243
  Scenario: move a file into another folder with no change permission
    Given user "user2" has been created with default attributes
    And user "user2" has shared folder "simple-folder" with user "user1" with "read" permissions
    And user "user1" has logged in using the webUI
    When the user tries to move file "lorem.txt" into folder "simple-folder (2)" using the webUI
    Then it should not be possible to move into folder "simple-folder (2)" using the webUI
