Feature: deleting files and folders
  As a user
  I want to delete files and folders
  So that I can keep my filing system clean and tidy

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files
    And user "Alice" has logged in using the webUI
    And the user has browsed to the files page

  @smokeTest @ocisSmokeTest @disablePreviews
  Scenario: Delete files & folders one by one and check its existence after page reload
    Given user "Alice" has created folder "simple-empty-folder"
    And user "Alice" has created folder "simple-folder"
    And user "Alice" has created file "lorem.txt"
    And user "Alice" has created file "lorem-big.txt"
    And user "Alice" has created folder "strängé नेपाली folder"
    And user "Alice" has created file "strängé filename (duplicate #2 &).txt"
    And user "Alice" has created file "sample,1.txt"
    And user "Alice" has created folder "Sample,Folder,With,Comma"
    And the user has reloaded the current page of the webUI
    When the user deletes the following elements using the webUI
      | name                                  |
      | simple-folder                         |
      | lorem.txt                             |
      | strängé नेपाली folder                 |
      | strängé filename (duplicate #2 &).txt |
      | sample,1.txt                          |
      | Sample,Folder,With,Comma              |
    Then as "Alice" folder "simple-folder" should not exist
    And as "Alice" file "lorem.txt" should not exist
    And as "Alice" folder "strängé नेपाली folder" should not exist
    And as "Alice" file "strängé filename (duplicate #2 &).txt" should not exist
    And as "Alice" file "sample,1.txt" should not exist
    And as "Alice" folder "Sample,Folder,With,Comma" should not exist
    And no message should be displayed on the webUI
    And the deleted elements should not be listed on the webUI
    But folder "simple-empty-folder" should be listed on the webUI
    And file "lorem-big.txt" should be listed on the webUI
    And file "strängé नेपाली folder" should not be listed on the webUI
    But the deleted elements should not be listed on the webUI after a page reload


  Scenario Outline: Delete a file with problematic characters
    Given user "Alice" has created file <file_name>
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

  @smokeTest @issue-4582 @disablePreviews
  Scenario: Delete multiple files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip"
    And user "Alice" has created file "lorem.txt"
    And user "Alice" has created folder "simple-folder"
    And the user has reloaded the current page of the webUI
    When the user batch deletes these files using the webUI
      | name          |
      | data.zip      |
      | lorem.txt     |
      | simple-folder |
    Then as "Alice" file "data.zip" should not exist
    And as "Alice" file "lorem.txt" should not exist
    And as "Alice" folder "simple-folder" should not exist
    And the deleted elements should not be listed on the webUI
    And the deleted elements should not be listed on the webUI after a page reload
    And no message should be displayed on the webUI

  @skipOnOC10 @issue-4582
  Scenario: Delete all files at once
    When the user marks all files for batch action using the webUI
    And the user batch deletes the marked files using the webUI
    And there should be no resources listed on the webUI
    And there should be no resources listed on the webUI after a page reload
    And no message should be displayed on the webUI

  @ocis-reva-issue-106 @ocis-reve-issue-442 @skipOnOC10 @issue-4582
  Scenario: Delete all except for a few files at once
    Given user "Alice" has uploaded file "data.zip" to "data.zip"
    And user "Alice" has created file "lorem.txt"
    And user "Alice" has created folder "simple-folder"
    And the user has reloaded the current page of the webUI
    When the user marks all files for batch action using the webUI
    And the user unmarks these files for batch action using the webUI
      | name          |
      | lorem.txt     |
      | simple-folder |
    And the user batch deletes the marked files using the webUI
    Then as "Alice" file "lorem.txt" should exist
    And as "Alice" folder "simple-folder" should exist
    And folder "simple-folder" should be listed on the webUI
    And file "lorem.txt" should be listed on the webUI
    # Check just an example of a file that should not exist any more
    But as "Alice" file "data.zip" should not exist
    And file "data.zip" should not be listed on the webUI
    And the count of files and folders shown on the webUI should be 2
    And no message should be displayed on the webUI

  @ocis-reva-issue-106
  Scenario: Delete an empty folder
    When the user creates a folder with the name "my-empty-folder" using the webUI
    And the user creates a folder with the name "my-other-empty-folder" using the webUI
    And the user deletes folder "my-empty-folder" using the webUI
    Then as "Alice" folder "my-other-empty-folder" should exist
    And folder "my-other-empty-folder" should be listed on the webUI
    But as "Alice" folder "my-empty-folder" should not exist
    And folder "my-empty-folder" should not be listed on the webUI
    And no message should be displayed on the webUI


  Scenario: Delete the last file in a folder
    Given user "Alice" has created file "zzzz-must-be-last-file-in-folder.txt"
    And the user has reloaded the current page of the webUI
    When the user deletes file "zzzz-must-be-last-file-in-folder.txt" using the webUI
    Then as "Alice" file "zzzz-must-be-last-file-in-folder.txt" should not exist
    And file "zzzz-must-be-last-file-in-folder.txt" should not be listed on the webUI
    And no message should be displayed on the webUI

  @skip @yetToImplement @public_link_share-feature-required
  Scenario: delete files from shared by link page
    Given user "Alice" has created file "lorem.txt"
    And the user has reloaded the current page of the webUI
    And the user has created a new public link for file "lorem.txt" using the webUI
    And the user has browsed to the shared-by-link page
    Then file "lorem.txt" should be listed on the webUI
    When the user deletes file "lorem.txt" using the webUI
    Then as "Alice" file "lorem.txt" should not exist
    And file "lorem.txt" should not be listed on the webUI
    When the user browses to the files page
    Then file "lorem.txt" should not be listed on the webUI

  @skip @yetToImplement @systemtags-app-required
  Scenario: delete files from tags page
    Given user "Alice" has created file "lorem.txt"
    And the user has reloaded the current page of the webUI
    And user "Alice" has created a "normal" tag with name "lorem"
    And user "Alice" has added tag "lorem" to file "/lorem.txt"
    When the user browses to the tags page
    And the user searches for tag "lorem" using the webUI
    Then file "lorem.txt" should be listed on the webUI
    When the user deletes file "lorem.txt" using the webUI
    Then as "Alice" file "lorem.txt" should not exist
    And file "lorem.txt" should not be listed on the webUI
    When the user browses to the files page
    Then file "lorem.txt" should not be listed on the webUI

  @ocis-reva-issue-64
  Scenario: delete a file on a public share
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has created file "simple-folder/lorem.txt"
    And user "Alice" has created folder "simple-folder/simple-empty-folder"
    And user "Alice" has created folder "simple-folder/strängé filename (duplicate #2 &).txt"
    And the user has reloaded the current page of the webUI
    And user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions
    When the public uses the webUI to access the last public link created by user "Alice"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
    Then as "Alice" file "simple-folder/lorem.txt" should not exist
    And as "Alice" folder "simple-folder/simple-empty-folder" should not exist
    And as "Alice" file "simple-folder/strängé filename (duplicate #2 &).txt" should not exist
    And the deleted elements should not be listed on the webUI
    And no message should be displayed on the webUI
    And the deleted elements should not be listed on the webUI after a page reload

  @ocis-reva-issue-64
  Scenario: delete a file on a public share with problematic characters
    Given user "Alice" has created file "lorem.txt"
    And user "Alice" has created folder "simple-folder"
    And the user has reloaded the current page of the webUI
    And user "Alice" has renamed the following file
      | from-name-parts | to-name-parts   |
      | lorem.txt       | simple-folder/  |
      |                 | 'single'        |
      |                 | "double" quotes |
      |                 | question?       |
      |                 | &and#hash       |
    And user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions
    When the public uses the webUI to access the last public link created by user "Alice"
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

  @skip @yetToImplement @issue-4582
  Scenario: Delete multiple files at once on a public share
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has created file "simple-folder/data.zip"
    And user "Alice" has created file "simple-folder/lorem.txt"
    And user "Alice" has created file "simple-folder/simple-empty-folder"
    And the user has reloaded the current page of the webUI
    And user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions
    When the public uses the webUI to access the last public link created by user "Alice"
    And the user batch deletes these files using the webUI
      | name                |
      | data.zip            |
      | lorem.txt           |
      | simple-empty-folder |
    Then as "Alice" file "simple-folder/data.zip" should not exist
    And as "Alice" file "simple-folder/lorem.txt" should not exist
    And as "Alice" folder "simple-folder/simple-empty-folder" should not exist
    And the deleted elements should not be listed on the webUI
    And the deleted elements should not be listed on the webUI after a page reload

  @ocis-reva-issue-64
  Scenario: Delete a file and folder from shared with me page
    Given user "Brian" has been created with default attributes and without skeleton files
    And user "Brian" has created folder "simple-folder"
    And user "Brian" has created file "lorem.txt"
    And user "Brian" has shared folder "simple-folder" with user "Alice"
    And user "Brian" has shared file "lorem.txt" with user "Alice"
    And the user has browsed to the shared-with-me page
    When the user deletes folder "simple-folder" using the webUI
    And the user deletes file "lorem.txt" using the webUI
    Then as "Alice" folder "simple-folder" should not exist
    And as "Alice" file "lorem.txt" should not exist
    And no message should be displayed on the webUI

  @ocis-reva-issue-64
  Scenario: Delete a file and folder in shared with others page
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has created file "lorem.txt"
    And the user has reloaded the current page of the webUI
    And user "Brian" has been created with default attributes and without skeleton files
    And user "Alice" has shared file "lorem.txt" with user "Brian"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    When the user browses to the shared-with-others page
    And the user deletes folder "simple-folder" using the webUI
    And the user deletes file "lorem.txt" using the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And folder "simple-folder" should not be listed on the webUI
    And no message should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And folder "simple-folder" should not be listed on the webUI
    When the user browses to the files page
    Then file "lorem.txt" should not be listed on the webUI
    And folder "simple-folder" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist
    And as "Alice" folder "simple-folder" should not exist

  @ocis-reva-issue-64
  Scenario: Delete multiple files at once from shared with others page
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has created file "lorem.txt"
    And user "Alice" has uploaded file "data.zip" to "data.zip"
    And the user has reloaded the current page of the webUI
    And user "Brian" has been created with default attributes and without skeleton files
    And user "Alice" has shared file "lorem.txt" with user "Brian"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Alice" has shared file "data.zip" with user "Brian"
    And the user has browsed to the shared-with-others page
    When the user batch deletes these files using the webUI
      | name          |
      | data.zip      |
      | lorem.txt     |
      | simple-folder |
    Then as "Alice" file "data.zip" should not exist
    And as "Alice" file "lorem.txt" should not exist
    And as "Alice" folder "simple-folder" should not exist
    And the deleted elements should not be listed on the webUI
    And no message should be displayed on the webUI
    And the deleted elements should not be listed on the webUI after a page reload

  @ocis-reva-issue-39
  Scenario: Try to delete file and folder from favorites page
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has created file "lorem.txt"
    And the user has reloaded the current page of the webUI
    And user "Alice" has favorited element "simple-folder"
    And user "Alice" has favorited element "lorem.txt"
    When the user browses to the favorites page
    And the user deletes file "lorem.txt" using the webUI
    And the user deletes folder "simple-folder" using the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And folder "simple-folder" should not be listed on the webUI


  Scenario: Try to delete file and folder that used to exist but does not anymore
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has created file "lorem.txt"
    And the user has browsed to the files page
    And the following files have been deleted by user "Alice"
      | name          |
      | lorem.txt     |
      | simple-folder |
    When the user deletes file "lorem.txt" using the webUI
    Then the error message with header 'Error while deleting "lorem.txt"' should be displayed on the webUI
    When the user clears all error message from the webUI
    And the user deletes folder "simple-folder" using the webUI
    Then the error message with header 'Error while deleting "simple-folder"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And folder "simple-folder" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist
    And as "Alice" folder "simple-folder" should not exist
