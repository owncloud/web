@files_trashbin-app-required
Feature: files and folders exist in the trashbin after being deleted
  As a user
  I want deleted files and folders to be available in the trashbin
  So that I can recover data easily

  Background:
    Given user "user1" has been created with default attributes
    And user "user1" has logged in using the webUI
    And the user has browsed to the files page

  @smokeTest
  Scenario: Delete files & folders one by one and check that they are all in the trashbin
    When the user deletes the following elements using the webUI
      | name                                  |
      | simple-folder                         |
      | lorem.txt                             |
      | strängé नेपाली folder                 |
      | strängé filename (duplicate #2 &).txt |
    And the user browses to the trashbin page
    Then as "user1" folder "simple-folder" should exist in trash
    And as "user1" file "lorem.txt" should exist in trash
    And as "user1" folder "strängé नेपाली folder" should exist in trash
    And as "user1" file "strängé filename (duplicate #2 &).txt" should exist in trash
    And the deleted elements should be listed on the webUI
    And file "lorem.txt" should be listed in the folder "simple-folder" on the webUI

  Scenario: Delete a file with problematic characters and check it is in the trashbin
    Given the user has renamed the following files
      | from-name-parts | to-name-parts   |
      | lorem.txt       | 'single'        |
      | lorem-big.txt   | "double" quotes |
      | textfile0.txt   | question?       |
      | testimage.png   | &and#hash       |
    When the user reloads the current page of the webUI
    And the user deletes the following elements using the webUI
      | name-parts      |
      | 'single'        |
      | "double" quotes |
      | question?       |
      | &and#hash       |
    And the user browses to the trashbin page
    Then these files should be listed on the webUI
      | files           |
      | 'single'        |
      | "double" quotes |
      | question?       |
      | &and#hash       |

  @skip @yetToImplement
  Scenario: Delete multiple files at once and check that they are all in the trashbin
    When the user batch deletes these files using the webUI
      | name          |
      | data.zip      |
      | lorem.txt     |
      | simple-folder |
    Then as "user1" file "data.zip" should exist in trash
    And as "user1" file "lorem.txt" should exist in trash
    And as "user1" folder "simple-folder" should exist in trash
    And as "user1" file "simple-folder/lorem.txt" should exist in trash
    And the deleted elements should be listed in the trashbin on the webUI
    And file "lorem.txt" should be listed in the trashbin folder "simple-folder" on the webUI

  Scenario: Delete an empty folder and check it is in the trashbin
    Given the user has created folder "my-empty-folder"
    And the user has created folder "my-other-empty-folder"
    When the user reloads the current page of the webUI
    And the user deletes folder "my-empty-folder" using the webUI
    Then as "user1" folder "my-empty-folder" should exist in trash
    But as "user1" the folder with original path "my-other-empty-folder" should not exist in trash
    When the user browses to the trashbin page
    Then folder "my-empty-folder" should be listed on the webUI
    But folder "my-other-empty-folder" should not be listed on the webUI
    When the user opens folder "my-empty-folder" using the webUI
    Then there should be no files/folders listed on the webUI

  @yetToImplement
  Scenario: Delete multiple file with same filename and check they are in the trashbin
    When the user deletes the following elements using the webUI
      | name      |
      | lorem.txt |
    And the user opens folder "simple-folder" using the webUI
    And the user deletes the following elements using the webUI
      | name      |
      | lorem.txt |
    And the user browses to the files page
    And the user opens folder "strängé नेपाली folder" using the webUI
    And the user deletes the following elements using the webUI
      | name      |
      | lorem.txt |
    And the user browses to the trashbin page
    Then as "user1" the file with original path "lorem.txt" should exist in trash
    And as "user1" the file with original path "simple-folder/lorem.txt" should exist in trash
    And as "user1" the file with original path "strängé नेपाली folder/lorem.txt" should exist in trash
    And file "lorem.txt" should be listed on the webUI
#    And file "lorem.txt" with path "./lorem.txt" should be listed in the trashbin on the webUI
#    And file "lorem.txt" with path "simple-folder/lorem.txt" should be listed in the trashbin on the webUI
#    And file "lorem.txt" with path "strängé नेपाली folder/lorem.txt" should be listed in the trashbin on the webUI
