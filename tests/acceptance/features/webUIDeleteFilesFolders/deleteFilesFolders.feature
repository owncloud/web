Feature: deleting files and folders
  As a user
  I want to delete files and folders
  So that I can keep my filing system clean and tidy

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files in the server
    And user "Alice" has logged in using the webUI
    And the user reloads the current page of the webUI

  @smokeTest @ocisSmokeTest @disablePreviews @skipOnXGAPortraitResolution
  Scenario: Delete files & folders one by one and check its existence after page reload
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created file "lorem-big.txt" in the server
    And user "Alice" has created folder "strängé नेपाली folder" in the server
    And user "Alice" has created file "strängé filename (duplicate #2 &).txt" in the server
    And user "Alice" has created file "sample,1.txt" in the server
    And user "Alice" has created folder "Sample,Folder,With,Comma" in the server
    And the user has reloaded the current page of the webUI
    When the user deletes the following elements using the webUI
      | name                                  |
      | simple-folder                         |
      | lorem.txt                             |
      | strängé नेपाली folder                 |
      | strängé filename (duplicate #2 &).txt |
      | sample,1.txt                          |
      | Sample,Folder,With,Comma              |
    Then as "Alice" folder "simple-folder" should not exist in the server
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" folder "strängé नेपाली folder" should not exist in the server
    And as "Alice" file "strängé filename (duplicate #2 &).txt" should not exist in the server
    And as "Alice" file "sample,1.txt" should not exist in the server
    And as "Alice" folder "Sample,Folder,With,Comma" should not exist in the server
    And no message should be displayed on the webUI
    And the deleted elements should not be listed on the webUI
    But folder "simple-empty-folder" should be listed on the webUI
    And file "lorem-big.txt" should be listed on the webUI
    And file "strängé नेपाली folder" should not be listed on the webUI
    But the deleted elements should not be listed on the webUI after a page reload


  Scenario Outline: Delete a file with problematic characters
    Given user "Alice" has created file <file_name> in the server
    When the user reloads the current page of the webUI
    And the user deletes file <file_name> using the webUI
    Then file <file_name> should not be listed on the webUI
    When the user reloads the current page of the webUI
    Then file <file_name> should not be listed on the webUI
    Examples:
      | file_name           |
      | "'single'"          |
      | "\"double\" quotes" |
      | "question?"         |
      | "&and#hash"         |

  @smokeTest @issue-4582 @disablePreviews @skipOnOC10 @issue-core-38221
  Scenario: Delete multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user batch deletes these files using the webUI
      | name          |
      | data.zip      |
      | lorem.txt     |
      | simple-folder |
    Then as "Alice" file "data.zip" should not exist in the server
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" folder "simple-folder" should not exist in the server
    And the deleted elements should not be listed on the webUI
    And the deleted elements should not be listed on the webUI after a page reload
    And no message should be displayed on the webUI

  @skipOnOC10 @issue-4582
  Scenario: Delete all files at once at the root level
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And the user has browsed to the personal page
    When the user marks all files for batch action using the webUI
    # Shares is a special folder that cannot be deleted on oCIS
    # The user has to unmark it in order to "delete all" the rest of the items
    # See discussion in web issue 6305.
    And the user unmarks these files for batch action using the webUI
      | name   |
      | Shares |
    And the user batch deletes the marked files using the webUI
    Then as "Alice" file "data.zip" should not exist in the server
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" folder "simple-folder" should not exist in the server
    And file "data.zip" should not be listed on the webUI
    And the count of files and folders shown on the webUI should be 1
    And no message should be displayed on the webUI

  @ocis-reva-issue-106 @ocis-reve-issue-442 @skipOnOC10 @issue-4582
  Scenario: Delete all except for a few files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created file "fileToDelete.txt" in the server
    And user "Alice" has created folder "folderToDelete" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user marks all files for batch action using the webUI
    And the user unmarks these files for batch action using the webUI
      | name          |
      | lorem.txt     |
      | simple-folder |
      | Shares        |
    And the user batch deletes the marked files using the webUI
    Then as "Alice" file "lorem.txt" should exist in the server
    And as "Alice" folder "simple-folder" should exist in the server
    And folder "simple-folder" should be listed on the webUI
    And folder "Shares" should be listed on the webUI
    And file "lorem.txt" should be listed on the webUI
    But as "Alice" file "data.zip" should not exist in the server
    And as "Alice" file "fileToDelete.txt" should not exist in the server
    And as "Alice" folder "folderToDelete" should not exist in the server
    And file "data.zip" should not be listed on the webUI
    And the count of files and folders shown on the webUI should be 3
    And no message should be displayed on the webUI

  @ocis-reva-issue-106
  Scenario: Delete an empty folder
    When the user creates a folder with the name "my-empty-folder" using the webUI
    And the user creates a folder with the name "my-other-empty-folder" using the webUI
    And the user deletes folder "my-empty-folder" using the webUI
    Then as "Alice" folder "my-other-empty-folder" should exist in the server
    And folder "my-other-empty-folder" should be listed on the webUI
    But as "Alice" folder "my-empty-folder" should not exist in the server
    And folder "my-empty-folder" should not be listed on the webUI
    And no message should be displayed on the webUI


  Scenario: Delete the last file in a folder
    Given user "Alice" has created file "zzzz-must-be-last-file-in-folder.txt" in the server
    And the user has reloaded the current page of the webUI
    When the user deletes file "zzzz-must-be-last-file-in-folder.txt" using the webUI
    Then as "Alice" file "zzzz-must-be-last-file-in-folder.txt" should not exist in the server
    And file "zzzz-must-be-last-file-in-folder.txt" should not be listed on the webUI
    And no message should be displayed on the webUI

  @issue-5017 @systemtags-app-required
  Scenario: delete files from tags page
    Given user "Alice" has created file "lorem.txt" in the server
    And the user has reloaded the current page of the webUI
    And user "Alice" has created a "normal" tag with name "lorem" in the server
    And user "Alice" has added tag "lorem" to file "/lorem.txt" in the server
    When the user browses to the tags page
    And the user searches for tag "lorem" using the webUI
    Then file "lorem.txt" should be listed on the webUI
    When the user deletes file "lorem.txt" using the webUI
    Then as "Alice" file "lorem.txt" should not exist in the server
    And file "lorem.txt" should not be listed on the webUI
    When the user browses to the files page
    Then file "lorem.txt" should not be listed on the webUI


  Scenario: delete a file on a public share
    Given user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created file "simple-folder/lorem.txt" in the server
    And user "Alice" has created folder "simple-folder/simple-empty-folder" in the server
    And user "Alice" has created folder "simple-folder/strängé filename (duplicate #2 &).txt" in the server
    And the user has reloaded the current page of the webUI
    And user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions in the server
    When the public uses the webUI to access the last public link created by user "Alice" in a new session
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
    Then as "Alice" file "simple-folder/lorem.txt" should not exist in the server
    And as "Alice" folder "simple-folder/simple-empty-folder" should not exist in the server
    And as "Alice" file "simple-folder/strängé filename (duplicate #2 &).txt" should not exist in the server
    And the deleted elements should not be listed on the webUI
    And no message should be displayed on the webUI
    And the deleted elements should not be listed on the webUI after a page reload


  Scenario: delete a file on a public share with problematic characters
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And the user has reloaded the current page of the webUI
    And user "Alice" has renamed the following file in the server
      | from-name-parts | to-name-parts   |
      | lorem.txt       | simple-folder/  |
      |                 | 'single'        |
      |                 | "double" quotes |
      |                 | question?       |
      |                 | &and#hash       |
    And user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions in the server
    When the public uses the webUI to access the last public link created by user "Alice" in a new session
    And the user deletes the following file using the webUI
      | name-parts      |
      | 'single'        |
      | "double" quotes |
      | question?       |
      | &and#hash       |
    Then the following file should not be listed on the webUI
      | name-parts      |
      | 'single'        |
      | "double" quotes |
      | question?       |
      | &and#hash       |
    And no message should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then the following file should not be listed on the webUI
      | name-parts      |
      | 'single'        |
      | "double" quotes |
      | question?       |
      | &and#hash       |

  @issue-4582
  Scenario: Delete multiple files at once on a public share
    Given user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created file "simple-folder/data.zip" in the server
    And user "Alice" has created file "simple-folder/lorem.txt" in the server
    And user "Alice" has created file "simple-folder/simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    And user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions in the server
    When the public uses the webUI to access the last public link created by user "Alice" in a new session
    And the user batch deletes these files using the webUI
      | name                |
      | data.zip            |
      | lorem.txt           |
      | simple-empty-folder |
    Then as "Alice" file "simple-folder/data.zip" should not exist in the server
    And as "Alice" file "simple-folder/lorem.txt" should not exist in the server
    And as "Alice" folder "simple-folder/simple-empty-folder" should not exist in the server
    And the deleted elements should not be listed on the webUI
    And the deleted elements should not be listed on the webUI after a page reload

  @issue-5435
  Scenario: Delete a file and folder from shared with me page
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no" in the server
    And user "Brian" has been created with default attributes and without skeleton files in the server
    And user "Brian" has created folder "simple-folder" in the server
    And user "Brian" has created file "lorem.txt" in the server
    And user "Brian" has shared folder "simple-folder" with user "Alice" in the server
    And user "Brian" has shared file "lorem.txt" with user "Alice" in the server
    And the user has browsed to the shared-with-me page
    When the user accepts share "simple-folder" offered by user "Brian Murphy" using the webUI
    When the user accepts share "lorem.txt" offered by user "Brian Murphy" using the webUI
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "lorem.txt" using the webUI
    Then as "Alice" folder "simple-folder" should not exist in the server
    And as "Alice" file "lorem.txt" should not exist in the server
    And no message should be displayed on the webUI


  Scenario: Try to delete file and folder that used to exist but does not anymore
    Given user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created file "lorem.txt" in the server
    And the user has browsed to the personal page
    And the following files have been deleted by user "Alice" in the server
      | name          |
      | lorem.txt     |
      | simple-folder |
    When the user deletes file "lorem.txt" using the webUI
    Then the error message with header 'Failed to delete "lorem.txt"' should be displayed on the webUI
    When the user clears all error message from the webUI
    And the user deletes folder "simple-folder" using the webUI
    Then the error message with header 'Failed to delete "simple-folder"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And folder "simple-folder" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" folder "simple-folder" should not exist in the server


  Scenario: Delete folder with dot in the name
    Given user "Alice" has created the following folders in the server
      | folders  |
      | fo.      |
      | fo.1     |
      | fo...1.. |
      | fo.xyz   |
    And the user has reloaded the current page of the webUI
    When the user batch deletes these files using the webUI
      | folders  |
      | fo.      |
      | fo.1     |
      | fo...1.. |
      | fo.xyz   |
    Then as "Alice" these folders should not be listed on the webUI
      | folders  |
      | fo.      |
      | fo.1     |
      | fo...1.. |
      | fo.xyz   |
