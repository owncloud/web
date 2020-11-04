Feature: copy files and folders
  As a user
  I want to copy files and folders
  So that I can work safely on a copy without changing the original

  Background:
    Given user "user1" has been created with default attributes

  @smokeTest
  Scenario: copy a file and a folder into a folder
    Given user "user1" has logged in using the webUI
    And the user has browsed to the files page
    When the user copies file "data.zip" into folder "simple-empty-folder" using the webUI
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And file "data.zip" should be listed on the webUI
    When the user browses to the files page
    And the user copies folder "simple-folder" into folder "strängé नेपाली folder empty" using the webUI
    Then breadcrumb for folder "strängé नेपाली folder empty" should be displayed on the webUI
    And folder "wrong-folder-name" should be listed on the webUI

  Scenario: copy a file into a folder where a file with the same name already exists
    Given user "user1" has logged in using the webUI
    And the user has browsed to the files page
    When the user copies file "strängé filename (duplicate #2 &).txt" into folder "strängé नेपाली folder" using the webUI
    Then the error message with header 'An error occurred while copying strängé filename (duplicate #2 &).txt' should be displayed on the webUI

  @smokeTest
  Scenario: Copy multiple files at once
    Given user "user1" has logged in using the webUI
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
    Given user "user1" has logged in using the webUI
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

  @skipOnOCIS @issue-3755
  Scenario: copy files on a public share
    Given user "user1" has shared folder "simple-folder" with link with "read, update, create, delete" permissions
    And the public uses the webUI to access the last public link created by user "user1"
    And the user copies file "data.zip" into folder "simple-empty-folder" using the webUI
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And file "data.zip" should be listed on the webUI
    And as "user1" file "simple-folder/simple-empty-folder/data.zip" should exist
    And as "user1" file "simple-folder/data.zip" should exist

  @skipOnOCIS @issue-ocis-reva-243
  Scenario: copy a file into another folder with no change permission
    Given user "user2" has been created with default attributes
    And user "user2" has shared folder "simple-folder" with user "user1" with "read" permissions
    And user "user1" has logged in using the webUI
    When the user tries to copy file "lorem.txt" into folder "simple-folder (2)" using the webUI
    Then it should not be possible to copy into folder "simple-folder (2)" using the webUI

  @skipOnOCIS @issue-ocis-reva-243
  Scenario: copy a folder into another folder with no change permission
    Given user "user2" has been created with default attributes
    And user "user2" has shared folder "simple-folder" with user "user1" with "read" permissions
    And user "user1" has logged in using the webUI
    When the user tries to copy folder "simple-empty-folder" into folder "simple-folder (2)" using the webUI
    Then it should not be possible to copy into folder "simple-folder (2)" using the webUI

  Scenario: copy a folder into the same folder
    And user "user1" has logged in using the webUI
    When the user tries to copy folder "simple-empty-folder" into folder "simple-empty-folder" using the webUI
    Then it should not be possible to copy into folder "simple-empty-folder" using the webUI

  Scenario: copy a folder into another folder with same name
    And user "user1" has logged in using the webUI
    When the user copies folder "simple-empty-folder" into folder "folder with space/simple-empty-folder" using the webUI
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And folder "simple-empty-folder" should be listed on the webUI
    And as "user1" folder "folder with space/simple-empty-folder/simple-empty-folder" should exist
    And as "user1" folder "wrong-folder-name" should exist
