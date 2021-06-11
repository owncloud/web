@files_trashbin-app-required @issue-ocis-web-118
Feature: files and folders can be deleted from the trashbin
  As a user
  I want to delete files and folders from the trashbin
  So that I can control my trashbin space and which files are kept in that space

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files
    Given user "Alice" has created file "lorem.txt"
    Given user "Alice" has created file "lorem-big.txt"
    And user "Alice" has created file "sample,1.txt"
    And user "Alice" has created folder "simple-folder"
    And user "Alice" has created folder "Folder,With,Comma"
    And user "Alice" has created file "simple-folder/lorem.txt"
    And user "Alice" has created file "simple-folder/lorem-big.txt"
    And user "Alice" has uploaded file "data.zip" to "data.zip"
    And the following files have been deleted by user "Alice"
      | name              |
      | lorem.txt         |
      | simple-folder     |
      | sample,1.txt      |
      | lorem-big.txt     |
      | Folder,With,Comma |
      | data.zip          |
    And user "Alice" has logged in using the webUI
    And the user has browsed to the trashbin page

  @smokeTest @yetToImplement
  Scenario: Delete files and check that they are gone
    When the user deletes file "lorem.txt" using the webUI
    And the user deletes file "sample,1.txt" using the webUI
    # web does not yet support navigating into deleted folders
    # And the user opens folder "simple-folder" using the webUI
    # And the user deletes file "lorem-big.txt" using the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "sample,1.txt" should not be listed on the webUI
    # But file "lorem.txt" should be listed in the trashbin folder "simple-folder" on the webUI
    # And file "lorem-big.txt" should not be listed in the trashbin folder "simple-folder" on the webUI
    But file "lorem-big.txt" should be listed on the webUI

  @issue-product-188
  Scenario: Delete folders and check that they are gone
    When the user deletes folder "simple-folder" using the webUI
    And the user deletes folder "Folder,With,Comma" using the webUI
    Then folder "simple-folder" should not be listed on the webUI
    And folder "Folder,With,Comma" should not be listed on the webUI

  @skipOnOC10 @issue-product-188
  # after the issue is fixed delete this scenario and use the one above
  Scenario: Delete folders and check that they are gone (ocis bug demonstration)
    When the user deletes folder "simple-folder" using the webUI
    Then the error message with header "Deletion of simple-folder failed" should be displayed on the webUI
    And folder "simple-folder" should be listed on the webUI
    When the user deletes folder "Folder,With,Comma" using the webUI
    Then folder "Folder,With,Comma" should not be listed on the webUI

  @ocisSmokeTest @skipOnOC10 @issue-4582
  Scenario: Select some files and delete from trashbin in a batch
    When the user batch deletes these files using the webUI
      | name          |
      | lorem.txt     |
      | lorem-big.txt |
    Then the deleted elements should not be listed on the webUI
    And the deleted elements should not be listed on the webUI after a page reload
    But file "data.zip" should be listed on the webUI
    And folder "simple-folder" should be listed on the webUI
    And the user browses to the files page
    And file "lorem.txt" should not be listed on the webUI
    And file "lorem-big.txt" should not be listed on the webUI

  @issue-product-188 @skipOnOC10 @issue-4582
  Scenario: Select all except for some files and delete from trashbin in a batch
    When the user marks all files for batch action using the webUI
    And the user unmarks these files for batch action using the webUI
      | name          |
      | lorem.txt     |
      | lorem-big.txt |
    And the user batch deletes the marked files using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And file "lorem-big.txt" should be listed on the webUI
    But file "data.zip" should not be listed on the webUI
    And folder "simple-folder" should not be listed on the webUI

  @skipOnOC10 @issue-product-188
  # after the issue is fixed delete this scenario and use the one above
  Scenario: Select all except for some files and delete from trashbin in a batch (ocis bug demonstration)
    When the user marks all files for batch action using the webUI
    And the user unmarks these files for batch action using the webUI
      | name          |
      | lorem.txt     |
      | lorem-big.txt |
    And the user batch deletes the marked files using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And file "lorem-big.txt" should be listed on the webUI
    But folder "simple-folder" should be listed on the webUI
    And file "data.zip" should not be listed on the webUI

  @issue-product-188 @skipOnOC10 @issue-4582
  Scenario: Select all files and delete from trashbin in a batch
    When the user marks all files for batch action using the webUI
    And the user batch deletes the marked files using the webUI
    Then there should be no resources listed on the webUI

  @skipOnOC10 @issue-product-188
  # after the issue is fixed delete this scenario and use the one above
  Scenario: Select all files and delete from trashbin in a batch (ocis bug demonstration)
    When the user marks all files for batch action using the webUI
    And the user batch deletes the marked files using the webUI
    Then file "lorem.txt" should not be listed on the webUI
    But folder "simple-folder" should be listed on the webUI

  @issue-4437
  Scenario: Delete single file from deleted files list
    When the user deletes the file "lorem.txt" from the deleted files list
    Then file "lorem.txt" should not be listed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI

  @issue-product-139
  Scenario: Clear trashbin
    When the user clears the trashbin
    Then the success message with header "All deleted files were removed" should be displayed on the webUI
    And there should be no resources listed on the webUI
