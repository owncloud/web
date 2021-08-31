@notToImplementOnOCIS
Feature: Sharing files and folders with internal users
  As a user
  I want to share files and folders with other users
  So that those users can access the files and folders

  Background:
    Given these users have been created with default attributes and without skeleton files:
      | username |
      | Alice    |
      | Brian    |

  @smokeTest
  Scenario Outline: share a file & folder with another internal user
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes"
    And user "Brian" has created folder "simple-folder"
    And user "Brian" has created file "simple-folder/lorem.txt"
    And user "Brian" has uploaded file "testavatar.jpg" to "testimage.jpg"
    And user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "<set-role>" using the webUI
    And the user shares file "testimage.jpg" with user "Alice Hansen" as "<set-role>" using the webUI
    Then user "Alice Hansen" should be listed as "<expected-role>" in the collaborators list for folder "simple-folder" on the webUI
    And user "Alice Hansen" should be listed as "<expected-role>" in the collaborators list for file "testimage.jpg" on the webUI
    And user "Alice" should have received a share with these details:
      | field       | value                |
      | uid_owner   | Brian                |
      | share_with  | Alice                |
      | file_target | /simple-folder       |
      | item_type   | folder               |
      | permissions | <permissions-folder> |
    And user "Alice" should have received a share with these details:
      | field       | value              |
      | uid_owner   | Brian              |
      | share_with  | Alice              |
      | file_target | /testimage.jpg     |
      | item_type   | file               |
      | permissions | <permissions-file> |
    And as "Alice" these resources should be listed on the webUI
      | entry_name    |
      | simple-folder |
      | testimage.jpg |
    When the user opens the share dialog for file "simple-folder" using the webUI
    Then user "Brian Murphy" should be listed as "Owner" in the collaborators list on the webUI
    When the user opens the share dialog for file "testimage.jpg" using the webUI
    Then user "Brian Murphy" should be listed as "Owner" in the collaborators list on the webUI
    Examples:
      | set-role             | expected-role        | permissions-folder              | permissions-file  |
      | Viewer               | Viewer               | read,share                      | read,share        |
      | Editor               | Editor               | read,update,create,delete,share | read,update,share |
      | Custom permissions | Custom permissions | read                            | read              |


  Scenario: share a file with another internal user who overwrites and unshares the file
    Given user "Brian" has created file "new-lorem.txt"
    And user "Brian" has logged in using the webUI
    And user "Brian" has shared file "new-lorem.txt" with user "Alice" with "all" permissions
    When the user re-logs in as "Alice" using the webUI
    Then as "Alice" the content of "new-lorem.txt" should not be the same as the content of local file "new-lorem.txt"
    # overwrite the received shared file
    When the user uploads overwriting file "new-lorem.txt" using the webUI
    Then file "new-lorem.txt" should be listed on the webUI
    And as "Alice" the content of "new-lorem.txt" should be the same as the content of local file "new-lorem.txt"
    # unshare the received shared file
    When the user deletes file "new-lorem.txt" using the webUI
    Then file "new-lorem.txt" should not be listed on the webUI
    # check that the original file owner can still see the file
    And as "Brian" the content of "new-lorem.txt" should be the same as the content of local file "new-lorem.txt"


  Scenario: share a folder with another internal user who uploads, overwrites and deletes files
    Given user "Brian" has created folder "new-simple-folder"
    And user "Brian" has created file "new-simple-folder/lorem.txt"
    And user "Brian" has uploaded file "data.zip" to "new-simple-folder/data.zip"
    And user "Brian" has logged in using the webUI
    When the user shares folder "new-simple-folder" with user "Alice Hansen" as "Editor" using the webUI
    And the user re-logs in as "Alice" using the webUI
    And the user opens folder "new-simple-folder" using the webUI
    Then as "Alice" the content of "new-simple-folder/lorem.txt" should not be the same as the content of local file "lorem.txt"
    # overwrite an existing file in the received share
    When the user uploads overwriting file "lorem.txt" using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And as "Alice" the content of "new-simple-folder/lorem.txt" should be the same as the content of local file "lorem.txt"
    # upload a new file into the received share
    When the user uploads file "new-lorem.txt" using the webUI
    Then as "Alice" the content of "new-simple-folder/new-lorem.txt" should be the same as the content of local file "new-lorem.txt"
    # delete a file in the received share
    When the user deletes file "data.zip" using the webUI
    Then file "data.zip" should not be listed on the webUI
    # check that the file actions by the sharee are visible for the share owner
    When the user re-logs in as "Brian" using the webUI
    And the user opens folder "new-simple-folder" using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And as "Brian" the content of "new-simple-folder/lorem.txt" should be the same as the content of local file "lorem.txt"
    And file "new-lorem.txt" should be listed on the webUI
    And as "Brian" the content of "new-simple-folder/new-lorem.txt" should be the same as the content of local file "new-lorem.txt"
    But file "data.zip" should not be listed on the webUI


  Scenario: share a folder with another internal user who unshares the folder
    Given user "Brian" has created folder "new-simple-folder"
    And user "Brian" has uploaded file "lorem.txt" to "new-simple-folder/lorem.txt"
    And user "Brian" has logged in using the webUI
    When the user shares folder "new-simple-folder" with user "Alice Hansen" as "Editor" using the webUI
    # unshare the received shared folder and check it is gone
    And the user re-logs in as "Alice" using the webUI
    Then folder "new-simple-folder" should be listed on the webUI
    And the user deletes folder "new-simple-folder" using the webUI
    And folder "new-simple-folder" should not be listed on the webUI
    # check that the folder is still visible for the share owner
    When the user re-logs in as "Brian" using the webUI
    Then folder "new-simple-folder" should be listed on the webUI
    And as "Brian" the content of "new-simple-folder/lorem.txt" should be the same as the content of local file "lorem.txt"


  Scenario: share a folder with another internal user and prohibit deleting
    Given user "Brian" has created folder "simple-folder"
    And user "Brian" has created file "simple-folder/lorem.txt"
    And user "Brian" has logged in using the webUI
    And user "Brian" has shared folder "simple-folder" with user "Alice" with "create, read, share" permissions
    When the user re-logs in as "Alice" using the webUI
    And the user opens folder "simple-folder" using the webUI
    Then it should not be possible to delete file "lorem.txt" using the webUI


  Scenario: user shares the file/folder with another internal user and delete the share with user
    Given user "Alice" has created file "lorem.txt"
    And user "Alice" has logged in using the webUI
    And user "Alice" has shared file "lorem.txt" with user "Brian"
    When the user opens the share dialog for file "lorem.txt" using the webUI
    Then user "Brian Murphy" should be listed as "Editor" in the collaborators list on the webUI
    And as "Brian" file "lorem.txt" should exist
    When the user deletes "Brian Murphy" as collaborator for the current file using the webUI
    Then user "Brian Murphy" should not be listed in the collaborators list on the webUI
    And file "lorem.txt" should not be listed in shared-with-others page on the webUI
    And as "Brian" file "lorem.txt" should not exist


  Scenario: user shares the file/folder with multiple internal users and delete the share with one user
    Given user "Carol" has been created with default attributes and without skeleton files
    And user "Alice" has created file "lorem.txt"
    And user "Alice" has logged in using the webUI
    And user "Alice" has shared file "lorem.txt" with user "Brian"
    And user "Alice" has shared file "lorem.txt" with user "Carol"
    When the user opens the share dialog for file "lorem.txt" using the webUI
    Then user "Brian Murphy" should be listed as "Editor" in the collaborators list on the webUI
    And user "Carol King" should be listed as "Editor" in the collaborators list on the webUI
    And as "Brian" file "lorem.txt" should exist
    And as "Carol" file "lorem.txt" should exist
    When the user deletes "Brian Murphy" as collaborator for the current file using the webUI
    Then user "Brian Murphy" should not be listed in the collaborators list on the webUI
    And user "Carol King" should be listed as "Editor" in the collaborators list on the webUI
    And file "lorem.txt" should be listed in shared-with-others page on the webUI
    And as "Brian" file "lorem.txt" should not exist
    But as "Carol" file "lorem.txt" should exist


  Scenario: Try to share file and folder that used to exist but does not anymore
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has created file "lorem.txt"
    And user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice"
      | name          |
      | lorem.txt     |
      | simple-folder |
    When the user shares file "lorem.txt" with user "Brian Murphy" as "Editor" using the webUI
    Then the error message with header 'Error while sharing.' should be displayed on the webUI
    And user "UserTwo" should not be listed in the collaborators list on the webUI
    When the user clears all error message from the webUI
    And the user shares folder "simple-folder" with user "Brian Murphy" as "Editor" using the webUI
    Then the error message with header 'Error while sharing.' should be displayed on the webUI
    And user "UserTwo" should not be listed in the collaborators list on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And folder "simple-folder" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist
    And as "Alice" folder "simple-folder" should not exist

  @issue-2897
  Scenario: sharing details of items inside a shared folder
    Given user "Carol" has been created with default attributes and without skeleton files
    And user "Alice" has created folder "simple-folder"
    And user "Alice" has created folder "simple-folder/simple-empty-folder"
    And user "Alice" has uploaded file with content "test" to "/simple-folder/lorem.txt"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Alice" has logged in using the webUI
    And the user opens folder "simple-folder" using the webUI
    When the user opens the share dialog for folder "simple-empty-folder" using the webUI
    Then user "Brian Murphy" should be listed as "Editor" via "simple-folder" in the collaborators list on the webUI
    When the user opens the share dialog for file "lorem.txt" using the webUI
    Then user "Brian Murphy" should be listed as "Editor" via "simple-folder" in the collaborators list on the webUI

  @issue-2897
  Scenario: sharing details of items inside a re-shared folder
    Given user "Carol" has been created with default attributes and without skeleton files
    And user "Alice" has created folder "simple-folder"
    And user "Alice" has created folder "simple-folder/simple-empty-folder"
    And user "Alice" has uploaded file with content "test" to "/simple-folder/lorem.txt"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has shared folder "simple-folder" with user "Carol"
    And user "Brian" has logged in using the webUI
    And the user opens folder "simple-folder" using the webUI
    When the user opens the share dialog for folder "simple-empty-folder" using the webUI
    Then user "Carol King" should be listed as "Editor" via "simple-folder" in the collaborators list on the webUI
    When the user opens the share dialog for file "lorem.txt" using the webUI
    Then user "Carol King" should be listed as "Editor" via "simple-folder" in the collaborators list on the webUI

  @issue-2897
  Scenario: sharing details of items inside a shared folder shared with multiple users
    Given user "Carol" has been created with default attributes and without skeleton files
    And user "Alice" has created folder "simple-folder"
    And user "Alice" has created folder "/simple-folder/sub-folder"
    And user "Alice" has uploaded file with content "test" to "/simple-folder/sub-folder/lorem.txt"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Alice" has shared folder "simple-folder/sub-folder" with user "Carol"
    And user "Alice" has logged in using the webUI
    And the user opens folder "simple-folder/sub-folder" directly on the webUI
    When the user opens the share dialog for file "lorem.txt" using the webUI
    Then user "Brian Murphy" should be listed as "Editor" via "simple-folder" in the collaborators list on the webUI
    And user "Carol King" should be listed as "Editor" via "sub-folder" in the collaborators list on the webUI


  Scenario Outline: Share files/folders with special characters in their name
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes"
    And user "Brian" has created folder "Sample,Folder,With,Comma"
    And user "Brian" has created file "sample,1.txt"
    And user "Brian" has logged in using the webUI
    When the user shares folder "Sample,Folder,With,Comma" with user "Alice Hansen" as "<set-role>" using the webUI
    And the user shares file "sample,1.txt" with user "Alice Hansen" as "<set-role>" using the webUI
    Then user "Alice Hansen" should be listed as "<expected-role>" in the collaborators list for folder "Sample,Folder,With,Comma" on the webUI
    And user "Alice Hansen" should be listed as "<expected-role>" in the collaborators list for file "sample,1.txt" on the webUI
    And user "Alice" should have received a share with these details:
      | field       | value                     |
      | uid_owner   | Brian                     |
      | share_with  | Alice                     |
      | file_target | /Sample,Folder,With,Comma |
      | item_type   | folder                    |
      | permissions | <permissions-folder>      |
    And user "Alice" should have received a share with these details:
      | field       | value              |
      | uid_owner   | Brian              |
      | share_with  | Alice              |
      | file_target | /sample,1.txt      |
      | item_type   | file               |
      | permissions | <permissions-file> |
    And as "Alice" these resources should be listed on the webUI
      | entry_name               |
      | Sample,Folder,With,Comma |
      | sample,1.txt             |
    Examples:
      | set-role             | expected-role        | permissions-folder              | permissions-file  |
      | Viewer               | Viewer               | read,share                      | read,share        |
      | Editor               | Editor               | read,update,create,delete,share | read,update,share |
      | Custom permissions | Custom permissions | read                            | read              |


  Scenario: file list view image preview in file share
    Given user "Alice" has uploaded file "testavatar.jpg" to "testavatar.jpg"
    And user "Alice" has shared file "testavatar.jpg" with user "Brian"
    When user "Brian" logs in using the webUI
    Then the preview image of file "testavatar.jpg" should be displayed in the file list view on the webUI


  Scenario: file list view image preview in file share when previews is disabled
    Given the property "disablePreviews" of "options" has been set to true in web config file
    And user "Alice" has uploaded file "testavatar.jpg" to "testavatar.jpg"
    And user "Alice" has shared file "testavatar.jpg" with user "Brian"
    When user "Brian" logs in using the webUI
    Then the preview image of file "testavatar.jpg" should not be displayed in the file list view on the webUI


  Scenario: sharing file after renaming it is possible
    Given user "Alice" has uploaded file with content "test" to "lorem.txt"
    And user "Alice" has logged in using the webUI
    And the user has renamed file "lorem.txt" to "new-lorem.txt"
    When the user shares resource "new-lorem.txt" with user "Brian Murphy" using the quick action on the webUI
    Then user "Brian Murphy" should be listed as "Viewer" in the collaborators list for file "new-lorem.txt" on the webUI
