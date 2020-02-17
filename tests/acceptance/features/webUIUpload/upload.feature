Feature: File Upload

  As a user
  I would like to be able to upload files via the WebUI
  So that I can store files in ownCloud

  Background:
    Given user "user1" has been created with default attributes
    And user "user1" has logged in using the webUI

  @smokeTest
  Scenario: simple upload of a file that does not exist before
    When the user uploads file "new-lorem.txt" using the webUI
    Then no message should be displayed on the webUI
    And file "new-lorem.txt" should be listed on the webUI
    And as "user1" the content of "new-lorem.txt" should be the same as the local "new-lorem.txt"

  @smokeTest
  Scenario: simple upload of a folder that does not exist before
    When the user uploads a folder containing the following files in separate sub-folders using the webUI:
      | lorem.txt     |
      | new-lorem.txt |
    Then no message should be displayed on the webUI
    And the last uploaded folder should be listed on the webUI
    And as "user1" the last uploaded folder should exist
    And as "user1" the last uploaded folder should contain the following files inside the sub-folders:
      | new-lorem.txt                |
      | lorem.txt                    |

  @smokeTest
  Scenario: simple upload of a folder that does not exist before
    When the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user browses to the folder "PARENT" on the files page
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "user1" folder "PARENT" should exist
    And as "user1" file "PARENT/parent.txt" should exist
    And as "user1" folder "PARENT/CHILD" should exist

  @smokeTest
  Scenario: Upload of a folder inside a subdirectory
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "user1" folder "simple-empty-folder/PARENT" should exist
    And as "user1" file "simple-empty-folder/PARENT/parent.txt" should exist
    And as "user1" folder "simple-empty-folder/PARENT/CHILD" should exist

  @smokeTest
  Scenario: uploading a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally
    When the user uploads a created file "big-video.mp4" using the webUI
    Then no message should be displayed on the webUI
    And file "big-video.mp4" should be listed on the webUI
    And as "user1" the content of "big-video.mp4" should be the same as the local "big-video.mp4"

  @skipOnFIREFOX
  @skip @yetToImplement
  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user uploads overwriting file "big-video.mp4" using the webUI and retries if the file is locked
    Then file "big-video.mp4" should be listed on the webUI
    And the content of "big-video.mp4" should be the same as the local "big-video.mp4"

  Scenario: upload a new file into a sub folder
    When the user opens folder "simple-folder" using the webUI
    And the user uploads file "new-lorem.txt" using the webUI
    Then no message should be displayed on the webUI
    And file "new-lorem.txt" should be listed on the webUI
    And as "user1" the content of "simple-folder/new-lorem.txt" should be the same as the local "new-lorem.txt"

  @smokeTest
  Scenario: overwrite an existing file
    When the user uploads overwriting file "lorem.txt" using the webUI
    Then no message should be displayed on the webUI
    And file "lorem.txt" should be listed on the webUI
    And as "user1" the content of "lorem.txt" should be the same as the local "lorem.txt"
    And the versions list for resource "lorem.txt" should contain 1 entry
    But file "lorem (2).txt" should not be listed on the webUI

  @smokeTest
  Scenario: overwrite an existing file when versioning is disabled
    Given the app "files_versions" has been disabled
    When the user uploads overwriting file "lorem.txt" using the webUI
    Then no message should be displayed on the webUI
    And file "lorem.txt" should be listed on the webUI
    And as "user1" the content of "lorem.txt" should be the same as the local "lorem.txt"
    But file "lorem (2).txt" should not be listed on the webUI

  @smokeTest
  @skip @yetToImplement
  Scenario: keep new and existing file
    When the user uploads file "lorem.txt" using the webUI
    And the user chooses to keep the new files in the upload dialog
    And the user chooses to keep the existing files in the upload dialog
    And the user chooses "Continue" in the upload dialog
    Then no dialog should be displayed on the webUI
    And no message should be displayed on the webUI
    And file "lorem.txt" should be listed on the webUI
    And the content of "lorem.txt" should not have changed
    And file "lorem (2).txt" should be listed on the webUI
    And the content of "lorem (2).txt" should be the same as the local "lorem.txt"

  @skip @yetToImplement
  Scenario: cancel conflict dialog
    When the user uploads file "lorem.txt" using the webUI
    And the user chooses "Cancel" in the upload dialog
    Then no dialog should be displayed on the webUI
    And no message should be displayed on the webUI
    And file "lorem.txt" should be listed on the webUI
    And the content of "lorem.txt" should not have changed
    And file "lorem (2).txt" should not be listed on the webUI

  Scenario: overwrite an existing file in a sub-folder
    When the user opens folder "simple-folder" using the webUI
    And the user uploads overwriting file "lorem.txt" using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And as "user1" the content of "simple-folder/lorem.txt" should be the same as the local "lorem.txt"

  @skip @yetToImplement
  Scenario: keep new and existing file in a sub-folder
    When the user opens folder "simple-folder" using the webUI
    And the user uploads file "lorem.txt" using the webUI
    And the user chooses to keep the new files in the upload dialog
    And the user chooses to keep the existing files in the upload dialog
    And the user chooses "Continue" in the upload dialog
    Then no dialog should be displayed on the webUI
    And no message should be displayed on the webUI
    And file "lorem.txt" should be listed on the webUI
    And the content of "lorem.txt" should not have changed
    And file "lorem (2).txt" should be listed on the webUI
    And the content of "lorem (2).txt" should be the same as the local "lorem.txt"

  Scenario: upload overwriting a file into a public share
    Given user "user1" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "pass123"
    When the public uses the webUI to access the last public link created by user "user1" with password "pass123"
    And the user uploads overwriting file "lorem.txt" using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And as "user1" the content of "simple-folder/lorem.txt" should be the same as the local "lorem.txt"
