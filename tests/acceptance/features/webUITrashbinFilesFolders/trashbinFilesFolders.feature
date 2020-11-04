@files_trashbin-app-required
Feature: files and folders exist in the trashbin after being deleted
  As a user
  I want deleted files and folders to be available in the trashbin
  So that I can recover data easily

  Background:
    Given user "user1" has been created with default attributes
    And user "user1" has logged in using the webUI
    And user "user1" has created file "sample,1.txt"
    And user "user1" has created folder "Folder,With,Comma"
    And the user has browsed to the files page

  @smokeTest
  @ocis-reva-issue-111
  @issue-product-186
  Scenario: Delete files & folders one by one and check that they are all in the trashbin
    When the user deletes the following elements using the webUI
      | name                                  |
      | simple-folder                         |
      | lorem.txt                             |
      | strängé नेपाली folder                   |
      | strängé filename (duplicate #2 &).txt |
    And the user browses to the trashbin page
    Then as "user1" folder "simple-folder" should exist in the trashbin
    And as "user1" file "lorem.txt" should exist in the trashbin
    And as "user1" folder "strängé नेपाली folder" should exist in the trashbin
    And as "user1" file "strängé filename (duplicate #2 &).txt" should exist in the trashbin
    And the deleted elements should be listed on the webUI

  @ocis-reva-issue-111
  @issue-product-183
  @issue-product-186
  Scenario: Delete a file with problematic characters and check it is in the trashbin
    Given user "user1" has renamed the following files
      | from-name-parts   | to-name-parts   |
      | lorem.txt         | 'single'        |
      | lorem-big.txt     | "double" quotes |
      | textfile0.txt     | question?       |
      | testimage.png     | &and#hash       |
      | sample,1.txt      | sämple,1.txt    |
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

  @skipOnOC10
  @issue-product-183
  # after the issue is fixed delete this scenario and use the one above
  Scenario: Delete a file with problematic characters and check it is in the trashbin
    Given user "user1" has renamed the following files
      | from-name-parts   | to-name-parts   |
      | lorem-big.txt     | "double" quotes |
      | textfile0.txt     | question?       |
      | testimage.png     | &and#hash       |
      | sample,1.txt      | sämple,1.txt    |
    When the user reloads the current page of the webUI
    And the user deletes the following elements using the webUI
      | name-parts      |
      | "double" quotes |
      | question?       |
      | &and#hash       |
      | sämple,1.txt    |
    And the user browses to the trashbin page
    Then these files should be listed on the webUI
      | files           |
      | "double" quotes |
    And file "&and#hash" should not be listed on the webUI
    And file "sämple,1.txt" should not be listed on the webUI
    And file "question?" should not be listed on the webUI

  @ocis-reva-issue-111
  @issue-product-186
  Scenario: Delete multiple files at once and check that they are all in the trashbin
    When the user batch deletes these files using the webUI
      | name              |
      | data.zip          |
      | lorem.txt         |
      | simple-folder     |
      | sample,1.txt      |
      | Folder,With,Comma |
    And the user browses to the trashbin page
    Then as "user1" file "data.zip" should exist in the trashbin
    And as "user1" file "lorem.txt" should exist in the trashbin
    And as "user1" file "sample,1.txt" should exist in the trashbin
    And as "user1" folder "simple-folder" should exist in the trashbin
    And as "user1" folder "Folder,With,Comma" should exist in the trashbin
    And as "user1" the file with original path "simple-folder/lorem.txt" should exist in the trashbin
    And the deleted elements should be listed on the webUI

  @issue-1725
  @issue-1910
  @ocis-reva-issue-111
  @issue-product-186
  Scenario: Delete an empty folder and check it is in the trashbin
    Given user "user1" has created folder "my-empty-folder"
    And user "user1" has created folder "my-other-empty-folder"
    When the user reloads the current page of the webUI
    And the user deletes folder "my-empty-folder" using the webUI
    Then as "user1" folder "my-empty-folder" should exist in the trashbin
    But as "user1" the folder with original path "my-other-empty-folder" should not exist in the trashbin
    When the user browses to the trashbin page
    Then folder "my-empty-folder" should be listed on the webUI
    But folder "my-other-empty-folder" should not be listed on the webUI
    # Uncomment after https://github.com/owncloud/web/issues/1725 is solved
    #When the user opens folder "my-empty-folder" using the webUI
    #Then there should be no resources listed on the webUI

  @ocis-reva-issue-111
  @issue-product-186
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
    Then as "user1" the file with original path "lorem.txt" should exist in the trashbin
    And as "user1" the file with original path "simple-folder/lorem.txt" should exist in the trashbin
    And as "user1" the file with original path "strängé नेपाली folder/lorem.txt" should exist in the trashbin
    And file "lorem.txt" should be listed on the webUI
#    And file "lorem.txt" with path "./lorem.txt" should be listed in the trashbin on the webUI
#    And file "lorem.txt" with path "simple-folder/lorem.txt" should be listed in the trashbin on the webUI
#    And file "lorem.txt" with path "strängé नेपाली folder/lorem.txt" should be listed in the trashbin on the webUI

  @issue-1910
  Scenario: trashbin list appears empty when no deleted files exist
    When the user browses to the trashbin page
    Then there should be no resources listed on the webUI

