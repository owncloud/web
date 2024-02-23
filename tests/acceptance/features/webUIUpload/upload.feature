Feature: File Upload

  As a user
  I would like to be able to upload files via the WebUI
  So that I can store files in ownCloud

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has uploaded file with content "initial content" to "lorem.txt" in the server
    And user "Alice" has uploaded file with content "initial content" to "simple-folder/lorem.txt" in the server
    And user "Alice" has logged in using the webUI

  @smokeTest @ocisSmokeTest
  Scenario: simple upload of a folder that does not exist before
    Given a folder "CUSTOM" has been created with the following files in separate sub-folders in the middleware
      | subFolder | file          |
      |           | lorem.txt     |
      | sub1      | lorem.txt     |
      | sub1      | new-lorem.txt |
      | sub2/sub3 | new-lorem.txt |
    When the user uploads folder "CUSTOM" using the webUI
    Then no message should be displayed on the webUI
    And folder "CUSTOM" should be listed on the webUI
    And as "Alice" folder "CUSTOM" should exist in the server
    And as "Alice" file "CUSTOM/lorem.txt" should exist in the server
    And as "Alice" file "CUSTOM/sub1/lorem.txt" should exist in the server
    And as "Alice" file "CUSTOM/sub1/new-lorem.txt" should exist in the server
    And as "Alice" file "CUSTOM/sub2/sub3/new-lorem.txt" should exist in the server
    And as "Alice" the content of "CUSTOM/lorem.txt" in the server should be the same as the content of local file "CUSTOM/lorem.txt"
    And as "Alice" the content of "CUSTOM/sub1/lorem.txt" in the server should be the same as the content of local file "CUSTOM/sub1/lorem.txt"
    And as "Alice" the content of "CUSTOM/sub1/new-lorem.txt" in the server should be the same as the content of local file "CUSTOM/sub1/new-lorem.txt"
    And as "Alice" the content of "CUSTOM/sub2/sub3/new-lorem.txt" in the server should be the same as the content of local file "CUSTOM/sub2/sub3/new-lorem.txt"


  Scenario: simple upload of a folder that does not exist before with empty sub-folders
    Given a folder "CUSTOM" has been created with the following files in separate sub-folders in the middleware
      | subFolder      | file |
      | sub4           |      |
      | sub5/sub6/sub7 |      |
    When the user uploads folder "CUSTOM" using the webUI
    Then no message should be displayed on the webUI
    And folder "CUSTOM" should be listed on the webUI
    And as "Alice" folder "CUSTOM" should exist in the server
    And as "Alice" folder "CUSTOM/sub4" should exist in the server
    And as "Alice" folder "CUSTOM/sub5/sub6/sub7" should exist in the server

  @smokeTest @ocisSmokeTest
  Scenario: simple upload of a folder with subfolders that does not exist before
    When the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user browses to the folder "PARENT" on the files page
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "PARENT" should exist in the server
    And as "Alice" file "PARENT/parent.txt" should exist in the server
    And as "Alice" folder "PARENT/CHILD" should exist in the server

  @smokeTest @ocisSmokeTest
  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  @smokeTest @ocisSmokeTest
  Scenario: uploading a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user uploads a created file "big-video.mp4" using the webUI
    Then no message should be displayed on the webUI
    And file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"


  Scenario: conflict with a big file (when chunking is implemented this upload should be chunked)
    Given a file with the size of "30000000" bytes and the name "big-video.mp4" has been created locally in the middleware
    When the user renames file "lorem.txt" to "big-video.mp4" using the webUI
    And the user reloads the current page of the webUI
    And the user uploads a created file "big-video.mp4" with overwrite using the webUI
    Then file "big-video.mp4" should be listed on the webUI
    And as "Alice" the content of "big-video.mp4" in the server should be the same as the content of local file "big-video.mp4"

  @disablePreviews
  Scenario: overwrite an existing file in a sub-folder
    When the user opens folder "simple-folder" using the webUI
    And the user uploads overwriting file "lorem.txt" using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And as "Alice" the content of "simple-folder/lorem.txt" in the server should be the same as the content of local file "lorem.txt"

  @issue-ocis-2258 @disablePreviews
  Scenario: upload overwriting a file into a public share
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "#Passw0rd" in the server
    When the public uses the webUI to access the last public link created by user "Alice" with password "#Passw0rd" in a new session
    And the user uploads overwriting file "lorem.txt" using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And as "Alice" the content of "simple-folder/lorem.txt" in the server should be the same as the content of local file "lorem.txt"


  Scenario: simple upload of a folder, with comma in its name, that does not exist before
    When the user uploads folder "Folder,With,Comma" using the webUI
    Then no message should be displayed on the webUI
    And folder "Folder,With,Comma" should be listed on the webUI
    When the user browses to the folder "Folder,With,Comma" on the files page
    Then the following resources should be listed on the webUI
      | entry_name        |
      | sunday,monday.txt |
    And as "Alice" folder "Folder,With,Comma" should exist in the server
    And as "Alice" file "Folder,With,Comma/sunday,monday.txt" should exist in the server
