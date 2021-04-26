@files_trashbin-app-required
Feature: files and folders exist in the trashbin after being deleted
  As a user
  I want deleted files and folders to be available in the trashbin
  So that I can recover data easily

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt"
    And user "Alice" has uploaded file "lorem-big.txt" to "lorem-big.txt"
    And user "Alice" has uploaded file "new-lorem.txt" to "textfile0.txt"
    And user "Alice" has uploaded file "testavatar.png" to "testimage.png"
    And user "Alice" has created file "sample,1.txt"
    And user "Alice" has created file "strängé filename (duplicate #2 &).txt"
    And user "Alice" has created folder "Folder,With,Comma"
    And user "Alice" has created folder "strängé नेपाली folder"
    And user "Alice" has created folder "simple-folder"
    And user "Alice" has uploaded file "lorem.txt" to "simple-folder/lorem.txt"
    And user "Alice" has uploaded file "lorem.txt" to "strängé नेपाली folder/lorem.txt"
    And user "Alice" has logged in using the webUI

  @smokeTest @ocis-reva-issue-111 @skipOnOCIS @issue-product-186 @disablePreviews
  Scenario: Delete files & folders one by one and check that they are all in the trashbin
    When the user deletes the following elements using the webUI
      | name                                  |
      | simple-folder                         |
      | lorem.txt                             |
      | strängé नेपाली folder                 |
      | strängé filename (duplicate #2 &).txt |
    And the user browses to the trashbin page
    Then as "Alice" folder "simple-folder" should exist in the trashbin
    And as "Alice" file "lorem.txt" should exist in the trashbin
    And as "Alice" folder "strängé नेपाली folder" should exist in the trashbin
    And as "Alice" file "strängé filename (duplicate #2 &).txt" should exist in the trashbin
    And the deleted elements should be listed on the webUI

  @ocis-reva-issue-111 @skipOnOCIS @issue-product-183 @issue-product-186 @disablePreviews
  Scenario: Delete a file with problematic characters and check it is in the trashbin
    Given user "Alice" has renamed the following files
      | from-name-parts | to-name-parts   |
      | lorem.txt       | 'single'        |
      | lorem-big.txt   | "double" quotes |
      | textfile0.txt   | question?       |
      | testimage.png   | &and#hash       |
      | sample,1.txt    | sämple,1.txt    |
    When the user reloads the current page of the webUI
    And the user deletes the following elements using the webUI
      | name-parts      |
      | 'single'        |
      | "double" quotes |
      | question?       |
      | &and#hash       |
      | sämple,1.txt    |
    And the user browses to the trashbin page
    Then these files should be listed on the webUI
      | files           |
      | 'single'        |
      | "double" quotes |
      | question?       |
      | &and#hash       |
      | sämple,1.txt    |

  @skipOnOCIS @issue-product-186 @skipOnOC10 @issue-4582
  Scenario: Delete multiple files at once and check that they are all in the trashbin
    When the user batch deletes these files using the webUI
      | name              |
      | Folder,With,Comma |
      | simple-folder     |
      | data.zip          |
      | lorem.txt         |
      | sample,1.txt      |
    And the user browses to the trashbin page
    Then as "Alice" file "data.zip" should exist in the trashbin
    And as "Alice" file "lorem.txt" should exist in the trashbin
    And as "Alice" file "sample,1.txt" should exist in the trashbin
    And as "Alice" folder "simple-folder" should exist in the trashbin
    And as "Alice" folder "Folder,With,Comma" should exist in the trashbin
    And as "Alice" the file with original path "simple-folder/lorem.txt" should exist in the trashbin
    And the deleted elements should be listed on the webUI

  @skipOnOCIS @issue-1725 @issue-1910 @issue-product-186
  Scenario: Delete an empty folder and check it is in the trashbin
    Given user "Alice" has created folder "my-empty-folder"
    And user "Alice" has created folder "my-other-empty-folder"
    When the user reloads the current page of the webUI
    And the user deletes folder "my-empty-folder" using the webUI
    Then as "Alice" folder "my-empty-folder" should exist in the trashbin
    But as "Alice" the folder with original path "my-other-empty-folder" should not exist in the trashbin
    When the user browses to the trashbin page
    Then folder "my-empty-folder" should be listed on the webUI
    But folder "my-other-empty-folder" should not be listed on the webUI
    # Uncomment after https://github.com/owncloud/web/issues/1725 is solved
    #When the user opens folder "my-empty-folder" using the webUI
    #Then there should be no resources listed on the webUI

  @skipOnOCIS @issue-product-186 @disablePreviews
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
    Then as "Alice" the file with original path "lorem.txt" should exist in the trashbin
    And as "Alice" the file with original path "simple-folder/lorem.txt" should exist in the trashbin
    And as "Alice" the file with original path "strängé नेपाली folder/lorem.txt" should exist in the trashbin
    And file "lorem.txt" should be listed on the webUI
#    And file "lorem.txt" with path "./lorem.txt" should be listed in the trashbin on the webUI
#    And file "lorem.txt" with path "simple-folder/lorem.txt" should be listed in the trashbin on the webUI
#    And file "lorem.txt" with path "strängé नेपाली folder/lorem.txt" should be listed in the trashbin on the webUI

  @issue-1910
  Scenario: trashbin list appears empty when no deleted files exist
    When the user browses to the trashbin page
    Then there should be no resources listed on the webUI

