@files_trashbin-app-required @ocis-reva-issue-112
Feature: Restore deleted files/folders
  As a user
  I would like to restore files/folders
  So that I can recover accidentally deleted files/folders in ownCloud

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files
    And user "Alice" has created file "sample,1.txt"
    And user "Alice" has created folder "Folder,With,Comma"
    And user "Alice" has logged in using the webUI

  @smokeTest @ocisSmokeTest
  Scenario: Restore files
    Given user "Alice" has uploaded file "data.zip" to "data.zip"
    And the user has reloaded the current page of the webUI
    When the user deletes file "data.zip" using the webUI
    And the user deletes file "sample,1.txt" using the webUI
    And the user browses to the trashbin page
    Then file "data.zip" should be listed on the webUI
    And file "sample,1.txt" should be listed on the webUI
    When the user restores file "data.zip" from the trashbin using the webUI
    And the user restores file "sample,1.txt" from the trashbin using the webUI
    Then there should be no resources listed on the webUI
    When the user browses to the files page
    Then file "data.zip" should be listed on the webUI
    And file "sample,1.txt" should be listed on the webUI


  Scenario: Restore folder
    Given user "Alice" has created folder "folder with space"
    And the user has browsed to the files page
    When the user deletes folder "folder with space" using the webUI
    And the user deletes folder "Folder,With,Comma" using the webUI
    And the user browses to the trashbin page
    Then folder "folder with space" should be listed on the webUI
    And folder "Folder,With,Comma" should be listed on the webUI
    When the user restores folder "folder with space" from the trashbin using the webUI
    And the user restores folder "Folder,With,Comma" from the trashbin using the webUI
    Then there should be no resources listed on the webUI
    When the user browses to the files page
    Then folder "folder with space" should be listed on the webUI
    And folder "Folder,With,Comma" should be listed on the webUI

  @smokeTest @issue-1502
  Scenario: Select some trashbin files and restore them in a batch
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has uploaded file "data.zip" to "data.zip"
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt"
    And user "Alice" has uploaded file "lorem-big.txt" to "lorem-big.txt"
    And the following files have been deleted by user "Alice"
      | name              |
      | data.zip          |
      | lorem.txt         |
      | lorem-big.txt     |
      | simple-folder     |
      | sample,1.txt      |
      | Folder,With,Comma |
    And the user has browsed to the trashbin page
    When the user marks these files for batch action using the webUI
      | name              |
      | lorem.txt         |
      | lorem-big.txt     |
      | sample,1.txt      |
      | Folder,With,Comma |
    And the user batch restores the marked files using the webUI
    # You can delete the line below after the issue-1502 is fixed
    And the user reloads the current page of the webUI
    Then file "data.zip" should be listed on the webUI
    And folder "simple-folder" should be listed on the webUI
    But file "lorem.txt" should not be listed on the webUI
    And file "lorem-big.txt" should not be listed on the webUI
    And file "sample,1.txt" should not be listed on the webUI
    And folder "Folder,With,Comma" should not be listed on the webUI
    When the user browses to the files page
    And file "lorem.txt" should be listed on the webUI
    And file "lorem-big.txt" should be listed on the webUI
    And file "sample,1.txt" should be listed on the webUI
    And folder "Folder,With,Comma" should be listed on the webUI
    But file "data.zip" should not be listed on the webUI
    And folder "simple-folder" should not be listed on the webUI

  @issue-1502
  Scenario: Select all except for some trashbin files and restore them in a batch
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has uploaded file "data.zip" to "data.zip"
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt"
    And user "Alice" has uploaded file "lorem-big.txt" to "lorem-big.txt"
    And the following files have been deleted by user "Alice"
      | name          |
      | data.zip      |
      | lorem.txt     |
      | lorem-big.txt |
      | simple-folder |
    And the user has browsed to the trashbin page
    When the user marks all files for batch action using the webUI
    And the user unmarks these files for batch action using the webUI
      | name          |
      | lorem.txt     |
      | lorem-big.txt |
    And the user batch restores the marked files using the webUI
    # You can delete the line below after the issue-1502 is fixed
    And the user reloads the current page of the webUI
    Then file "lorem.txt" should be listed on the webUI
    And file "lorem-big.txt" should be listed on the webUI
    But file "data.zip" should not be listed on the webUI
    And folder "simple-folder" should not be listed on the webUI
    When the user browses to the files page
    Then file "data.zip" should be listed on the webUI
    And folder "simple-folder" should be listed on the webUI
    But file "lorem.txt" should not be listed on the webUI
    And file "lorem-big.txt" should not be listed on the webUI

  @skipOnOC10 @issue-core-38039
  Scenario: Select all trashbin files and restore them in a batch
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has uploaded file "data.zip" to "data.zip"
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt"
    And user "Alice" has uploaded file "lorem-big.txt" to "lorem-big.txt"
    And the following files have been deleted by user "Alice"
      | name          |
      | data.zip      |
      | lorem.txt     |
      | lorem-big.txt |
      | simple-folder |
    And the user has browsed to the trashbin page
    When the user marks all files for batch action using the webUI
    And the user batch restores the marked files using the webUI
    Then there should be no resources listed on the webUI
    And there should be no resources listed on the webUI after a page reload
    When the user browses to the files page
    Then file "lorem.txt" should be listed on the webUI
    And file "lorem-big.txt" should be listed on the webUI
    And file "data.zip" should be listed on the webUI
    And folder "simple-folder" should be listed on the webUI

  @issue-1753 @issue-product-186
  Scenario: Restore a file from trashbin whose parent folder is renamed
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has created file "simple-folder/file-to-delete-and-restore"
    And the following files have been deleted by user "Alice"
      | name                                     |
      | simple-folder/file-to-delete-and-restore |
    And user "Alice" has renamed folder "simple-folder" to "simple-folder-renamed"
    When the user browses to the trashbin page
    And the user restores file "simple-folder/file-to-delete-and-restore" from the trashbin using the webUI
    Then the following error message should be displayed on the webUI
     """
     Restoration of file-to-delete-and-restore failed
     The destination node is not found
     """
    #And a success message "file-to-delete-and-restore was restored successfully" should be displayed on the webUI
    #And as "Alice" the file with original path "simple-folder/file-to-delete-and-restore" should not exist in the trashbin
    And as "Alice" the file with original path "simple-folder/file-to-delete-and-restore" should exist in the trashbin
    And as "Alice" file "simple-folder-renamed/file-to-delete-and-restore" should not exist
    #And as "Alice" file "simple-folder-renamed/file-to-delete-and-restore" should exist
    And as "Alice" file "simple-folder/file-to-delete-and-restore" should not exist

  @skipOnOC10 @issue-product-186 @issue-ocis-1057
  Scenario: Restore a file from trashbin whose parent folder is renamed (ocis bug demonstration)
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has created file "simple-folder/file-to-delete-and-restore"
    And the following files have been deleted by user "Alice"
      | name                                     |
      | simple-folder/file-to-delete-and-restore |
    And user "Alice" has renamed folder "simple-folder" to "simple-folder-renamed"
    When the user browses to the trashbin page
    And the user restores file "simple-folder/file-to-delete-and-restore" from the trashbin using the webUI
    Then the following error message should be displayed on the webUI
      """
      Restoration of file-to-delete-and-restore failed
      Unknown error
      """
    #And a success message "file-to-delete-and-restore was restored successfully" should be displayed on the webUI
    #And as "Alice" the file with original path "simple-folder/file-to-delete-and-restore" should not exist in the trashbin
    And as "Alice" file "simple-folder-renamed/file-to-delete-and-restore" should not exist
    #And as "Alice" file "simple-folder-renamed/file-to-delete-and-restore" should exist
    And as "Alice" file "simple-folder/file-to-delete-and-restore" should not exist

  @issue-1753 @skipOnOCIS @issue-product-186
  Scenario: Restore a file from trashbin without restoring the parent folder (bug demonstration)
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has created file "simple-folder/file-to-delete-and-restore"
    And the following files have been deleted by user "Alice"
      | name                                     |
      | simple-folder/file-to-delete-and-restore |
      | simple-folder                            |
    When the user browses to the trashbin page
    And the user restores file "simple-folder/file-to-delete-and-restore" from the trashbin using the webUI
    Then the following error message should be displayed on the webUI
     """
     Restoration of file-to-delete-and-restore failed
     The destination node is not found
     """
    #And a success message "file-to-delete-and-restore was restored successfully" should be displayed on the webUI
    #And as "Alice" the file with original path "simple-folder/file-to-delete-and-restore" should not exist in the trashbin
    And as "Alice" the file with original path "simple-folder/file-to-delete-and-restore" should exist in the trashbin
    And as "Alice" file "simple-folder/file-to-delete-and-restore" should not exist
    #And as "Alice" file "simple-folder/file-to-delete-and-restore" should exist

  @skipOnOC10 @issue-product-186 @issue-ocis-1057
  Scenario: Restore a file from trashbin without restoring the parent folder (ocis bug demonstration)
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has created file "simple-folder/file-to-delete-and-restore"
    And the following files have been deleted by user "Alice"
      | name                                     |
      | simple-folder/file-to-delete-and-restore |
      | simple-folder                            |
    When the user browses to the trashbin page
    And the user restores file "simple-folder/file-to-delete-and-restore" from the trashbin using the webUI
    Then the following error message should be displayed on the webUI
      """
      Restoration of file-to-delete-and-restore failed
      Unknown error
      """
    #And a success message "file-to-delete-and-restore was restored successfully" should be displayed on the webUI
    #And as "Alice" the file with original path "simple-folder/file-to-delete-and-restore" should not exist in the trashbin
    And as "Alice" file "simple-folder/file-to-delete-and-restore" should not exist
    #And as "Alice" file "simple-folder/file-to-delete-and-restore" should exist

  @issue-1723
  Scenario: Delete and restore a file that has the same name like a deleted folder
    Given user "Alice" has uploaded file "lorem.txt" to "lorem.txt"
    And the following files have been deleted by user "Alice"
      | name      |
      | lorem.txt |
    And user "Alice" has created folder "lorem.txt"
    And the following folders have been deleted by user "Alice"
      | name      |
      | lorem.txt |
    When the user browses to the trashbin page
    And the user restores file "lorem.txt" from the trashbin using the webUI
    Then the success message with header "lorem.txt was restored successfully" should be displayed on the webUI
    And file "lorem.txt" should not be listed on the webUI
    And folder "lorem.txt" should be listed on the webUI
    When the user browses to the files page using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And folder "lorem.txt" should not be listed on the webUI


  Scenario: Delete and restore a folder that has the same name like a deleted file
    Given user "Alice" has created file "lorem.txt"
    And the following files have been deleted by user "Alice"
      | name      |
      | lorem.txt |
    And user "Alice" has created folder "lorem.txt"
    And the following folders have been deleted by user "Alice"
      | name      |
      | lorem.txt |
    When the user browses to the trashbin page
    And the user restores folder "lorem.txt" from the trashbin using the webUI
    Then the success message with header "lorem.txt was restored successfully" should be displayed on the webUI
    And folder "lorem.txt" should not be listed on the webUI
    And file "lorem.txt" should be listed on the webUI
    When the user browses to the files page using the webUI
    Then folder "lorem.txt" should be listed on the webUI
    And file "lorem.txt" should not be listed on the webUI

  @issue-ocis-1124
  Scenario: delete and restore a file inside a received shared folder
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares"
    And user "Carol" has been created with default attributes and without skeleton files
    And user "Carol" has created folder "folder-to-share"
    And user "Carol" has uploaded file with content "does-not-matter" to "folder-to-share/fileToShare.txt"
    And user "Carol" has shared folder "folder-to-share" with user "Alice"
    And user "Alice" has accepted the share "Shares/folder-to-share" offered by user "Carol"
    And the user has reloaded the current page of the webUI
    When the user opens folder "Shares" using the webUI
    And the user opens folder "folder-to-share" using the webUI
    And the user deletes file "fileToShare.txt" using the webUI
    And the user browses to the trashbin page
    Then as "Alice" file "fileToShare.txt" should exist in the trashbin
    When the user restores file "…/folder-to-share/fileToShare.txt" from the trashbin using the webUI
    Then the success message with header "fileToShare.txt was restored successfully" should be displayed on the webUI
    And as "Alice" file "/Shares/folder-to-share/fileToShare.txt" should exist

  @issue-1502
  Scenario: Delete and restore folders with dot in the name
    Given user "Alice" has created the following folders
      | folders  |
      | fo.      |
      | fo.1     |
      | fo...1.. |
      | ...      |
      | ..fo     |
      | fo.xyz   |
    And the following folders have been deleted by user "Alice"
      | name     |
      | fo.      |
      | fo.1     |
      | fo...1.. |
      | ...      |
      | ..fo     |
      | fo.xyz   |
    And the user has browsed to the trashbin page
    When the user marks these files for batch action using the webUI
      | name     |
      | fo.      |
      | fo.1     |
      | fo...1.. |
      | ...      |
      | ..fo     |
      | fo.xyz   |
    And the user batch restores the marked files using the webUI
    And the user reloads the current page of the webUI
    Then these folders should not be listed on the webUI
      | name     |
      | fo.      |
      | fo.1     |
      | fo...1.. |
      | ...      |
      | ..fo     |
      | fo.xyz   |
    When the user browses to the files page
    Then the following folders should be listed on the webUI
      | name     |
      | fo.      |
      | fo.1     |
      | fo...1.. |
      | ...      |
      | ..fo     |
      | fo.xyz   |

