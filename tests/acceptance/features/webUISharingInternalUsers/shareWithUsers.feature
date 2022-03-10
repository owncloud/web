Feature: Sharing files and folders with internal users
  As a user
  I want to share files and folders with other users
  So that those users can access the files and folders

  Background:
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no" in the server
    And the administrator has set the default folder for received shares to "Shares" in the server
    And these users have been created with default attributes and without skeleton files in the server:
      | username |
      | Alice    |
      | Brian    |
    And user "Brian" has created folder "simple-folder" in the server

  @smokeTest @issue-ocis-2260 @ocisSmokeTest @disablePreviews @skipOnXGAPortraitResolution
  Scenario Outline: share a file & folder with another internal user
    Given user "Brian" has created file "testimage.jpg" in the server
    And user "Brian" has created file "simple-folder/lorem.txt" in the server
    And user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "<set-role>" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    And the user shares file "testimage.jpg" with user "Alice Hansen" as "<set-role>" using the webUI
    And user "Alice" accepts the share "Shares/testimage.jpg" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "<expected-role>" in the collaborators list for folder "simple-folder" on the webUI
    And user "Alice Hansen" should be listed as "<expected-role>" in the collaborators list for file "testimage.jpg" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | <permissions-folder>  |
    And user "Alice" should have received a share with these details in the server:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/testimage.jpg |
      | item_type   | file                  |
      | permissions | <permissions-file>    |
    When the user re-logs in as "Alice" using the webUI
    And the user opens folder "Shares" using the webUI
    Then these files should be listed on the webUI
      | files         |
      | simple-folder |
      | testimage.jpg |
    # When the user opens the share dialog for file "simple-folder" using the webUI
    # Then user "Brian Murphy" should be listed as "Owner" in the collaborators list on the webUI
    # When the user opens the share dialog for file "testimage.jpg" using the webUI
    # Then user "Brian Murphy" should be listed as "Owner" in the collaborators list on the webUI
    Examples:
      | set-role           | expected-role      | permissions-folder              | permissions-file  |
      | Viewer             | Viewer             | read,share                      | read, share       |
      | Editor             | Editor             | read,update,create,delete,share | read,update,share |
      | Custom permissions | Custom permissions | read                            | read              |

  @issue-4102 @issue-ocis-2267 @disablePreviews
  Scenario: share a file with another internal user who overwrites and unshares the file
    Given user "Brian" has created file "lorem.txt" in the server
    And user "Brian" has logged in using the webUI
    And user "Brian" has renamed file "lorem.txt" to "new-lorem.txt" in the server
    And user "Brian" has shared file "new-lorem.txt" with user "Alice" with "all" permissions in the server
    And user "Alice" has accepted the share "Shares/new-lorem.txt" offered by user "Brian" in the server
    When the user re-logs in as "Alice" using the webUI
    And the user opens folder "Shares" using the webUI
    Then as "Alice" the content of "Shares/new-lorem.txt" in the server should not be the same as the content of local file "new-lorem.txt"
    # overwrite the received shared file
    When the user uploads overwriting file "new-lorem.txt" using the webUI
    Then file "new-lorem.txt" should be listed on the webUI
    And as "Alice" the content of "Shares/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"
    # unshare the received shared file
    When the user deletes file "new-lorem.txt" using the webUI
    Then file "new-lorem.txt" should not be listed on the webUI
    # check that the original file owner can still see the file
    And as "Brian" the content of "new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

  @disablePreviews
  Scenario: share a folder with another internal user who uploads, overwrites and deletes files
    Given user "Brian" has created file "simple-folder/lorem.txt" in the server
    And user "Brian" has created file "simple-folder/data.zip" in the server
    And user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Editor" using the webUI
    And user "Alice" accepts the share "Shares/simple-folder" offered by user "Brian" using the sharing API in the server
    And the user re-logs in as "Alice" using the webUI
    And the user browses to the folder "Shares" on the files page
    And the user reloads the current page of the webUI
    And the user opens folder "simple-folder" using the webUI
    Then as "Alice" the content of "Shares/simple-folder/lorem.txt" in the server should not be the same as the content of local file "lorem.txt"
    # overwrite an existing file in the received share
    When the user uploads overwriting file "lorem.txt" using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And as "Alice" the content of "Shares/simple-folder/lorem.txt" in the server should be the same as the content of local file "lorem.txt"
    # upload a new file into the received share
    When the user uploads file "new-lorem.txt" using the webUI
    Then as "Alice" the content of "Shares/simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"
    # delete a file in the received share
    When the user deletes file "data.zip" using the webUI
    Then file "data.zip" should not be listed on the webUI
    # check that the file actions by the sharee are visible for the share owner
    When the user re-logs in as "Brian" using the webUI
    And the user opens folder "simple-folder" using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And as "Brian" the content of "simple-folder/lorem.txt" in the server should be the same as the content of local file "lorem.txt"
    And file "new-lorem.txt" should be listed on the webUI
    And as "Brian" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"
    But file "data.zip" should not be listed on the webUI

  @issue-product-270 @disablePreviews
  Scenario: share a folder with another internal user who unshares the folder
    Given user "Brian" has uploaded file with content "text file" to "simple-folder/lorem.txt" in the server
    And user "Brian" has logged in using the webUI
    When the user renames folder "simple-folder" to "new-simple-folder" using the webUI
    And the user shares folder "new-simple-folder" with user "Alice Hansen" as "Editor" using the webUI
    And user "Alice" accepts the share "Shares/new-simple-folder" offered by user "Brian" using the sharing API in the server
    # unshare the received shared folder and check it is gone
    And the user re-logs in as "Alice" using the webUI
    And the user browses to the folder "Shares" on the files page
    Then folder "new-simple-folder" should be listed on the webUI
    And the user deletes folder "new-simple-folder" using the webUI
    And folder "new-simple-folder" should not be listed on the webUI
    # check that the folder is still visible for the share owner
    When the user re-logs in as "Brian" using the webUI
    Then folder "new-simple-folder" should be listed on the webUI
    And the content of file "new-simple-folder/lorem.txt" for user "Brian" should be "text file" in the server

  @issue-product-270 @disablePreviews
  Scenario: share a folder with another internal user and prohibit deleting
    Given user "Brian" has created file "simple-folder/lorem.txt" in the server
    And user "Brian" has logged in using the webUI
    And user "Brian" has shared folder "simple-folder" with user "Alice" with "create, read, share" permissions in the server
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian" in the server
    When the user re-logs in as "Alice" using the webUI
    And the user opens folder "Shares" using the webUI
    And the user opens folder "simple-folder" using the webUI
    Then it should not be possible to delete file "lorem.txt" using the webUI

  @issue-ocis-2260 @disablePreviews
  Scenario: user shares the file/folder with multiple internal users and delete the share with one user
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has logged in using the webUI
    And user "Alice" has shared file "lorem.txt" with user "Brian" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Alice" in the server
    And user "Alice" has shared file "lorem.txt" with user "Carol" in the server
    And user "Carol" has accepted the share "Shares/lorem.txt" offered by user "Alice" in the server
    When the user opens the share dialog for file "lorem.txt" using the webUI
    Then user "Brian Murphy" should be listed as "Editor" in the collaborators list on the webUI
    And user "Carol King" should be listed as "Editor" in the collaborators list on the webUI
    And as "Brian" file "Shares/lorem.txt" should exist in the server
    And as "Carol" file "Shares/lorem.txt" should exist in the server
    When the user deletes "Brian Murphy" as collaborator for the current file using the webUI
    Then user "Brian Murphy" should not be listed in the collaborators list on the webUI
    And user "Carol King" should be listed as "Editor" in the collaborators list on the webUI
    And file "lorem.txt" should be listed in shared-with-others page on the webUI
    And as "Brian" file "Shares/lorem.txt" should not exist in the server
    But as "Carol" file "Shares/lorem.txt" should exist in the server

  @disablePreviews
  Scenario: Try to share file and folder that used to exist but does not anymore
    Given user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name          |
      | lorem.txt     |
      | simple-folder |
    When the user shares file "lorem.txt" with user "Brian Murphy" as "Editor" using the webUI
    Then the error message with header 'Error while sharing.' should be displayed on the webUI
    And user "Brian Murphy" should not be listed in the collaborators list on the webUI
    When the user clears all error message from the webUI
    And the user shares folder "simple-folder" with user "Brian Murphy" as "Editor" using the webUI
    Then the error message with header 'Error while sharing.' should be displayed on the webUI
    And user "Brian Murphy" should not be listed in the collaborators list on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And folder "simple-folder" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" folder "simple-folder" should not exist in the server

  @issue-2897 @issue-ocis-2260 @disablePreviews
  Scenario: sharing details of items inside a shared folder ("via" info)
    Given user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created folder "simple-folder/simple-empty-folder" in the server
    And user "Carol" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file with content "test" to "/simple-folder/lorem.txt" in the server
    And user "Alice" has shared folder "simple-folder" with user "Brian" in the server
    And user "Alice" has logged in using the webUI
    And the user opens folder "simple-folder" using the webUI
    When the user opens the details dialog for folder "simple-empty-folder" using the webUI
    Then the shared-via path in the details dialog should be "/simple-folder"
    When the user opens the details dialog for file "lorem.txt" using the webUI
    Then the shared-via path in the details dialog should be "/simple-folder"

  # Share permission is not available in oCIS webUI so when setting all permissions, it is displayed as "Custom permissions" there
  @issue-2897 @issue-ocis-2260 @disablePreviews
  Scenario: sharing details of items inside a re-shared folder ("via" info)
    Given user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created folder "simple-folder/simple-empty-folder" in the server
    And user "Carol" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file with content "test" to "/simple-folder/lorem.txt" in the server
    And user "Alice" has shared folder "simple-folder" with user "Brian" in the server
    And user "Brian" has accepted the share "Shares/simple-folder" offered by user "Alice" in the server
    And user "Brian" has shared folder "Shares/simple-folder" with user "Carol" in the server
    And user "Brian" has logged in using the webUI
    And the user has opened folder "Shares"
    And the user has opened folder "simple-folder"
    When the user opens the details dialog for folder "simple-empty-folder" using the webUI
    Then the shared-via path in the details dialog should be "/Shares/simple-folder"
    When the user opens the details dialog for file "lorem.txt" using the webUI
    Then the shared-via path in the details dialog should be "/Shares/simple-folder"
































  @issue-ocis-2260 @disablePreviews
  Scenario Outline: Share files/folders with special characters in their name
    Given user "Brian" has created folder "Sample,Folder,With,Comma" in the server
    And user "Brian" has created file "sample,1.txt" in the server
    And user "Brian" has logged in using the webUI
    When the user shares folder "Sample,Folder,With,Comma" with user "Alice Hansen" as "<set-role>" using the webUI
    And user "Alice" accepts the share "Shares/Sample,Folder,With,Comma" offered by user "Brian" using the sharing API in the server
    And the user shares file "sample,1.txt" with user "Alice Hansen" as "<set-role>" using the webUI
    And user "Alice" accepts the share "Shares/sample,1.txt" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "<expected-role>" in the collaborators list for folder "Sample,Folder,With,Comma" on the webUI
    And user "Alice Hansen" should be listed as "<expected-role>" in the collaborators list for file "sample,1.txt" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                            |
      | uid_owner   | Brian                            |
      | share_with  | Alice                            |
      | file_target | /Shares/Sample,Folder,With,Comma |
      | item_type   | folder                           |
      | permissions | <permissions-folder>             |
    And user "Alice" should have received a share with these details in the server:
      | field       | value                |
      | uid_owner   | Brian                |
      | share_with  | Alice                |
      | file_target | /Shares/sample,1.txt |
      | item_type   | file                 |
      | permissions | <permissions-file>   |
    When the user re-logs in as "Alice" using the webUI
    And the user opens folder "Shares" using the webUI
    Then these files should be listed on the webUI
      | files                    |
      | Sample,Folder,With,Comma |
      | sample,1.txt             |
    Examples:
      | set-role           | expected-role      | permissions-folder              | permissions-file  |
      | Viewer             | Viewer             | read,share                      | read,share        |
      | Editor             | Editor             | read,update,create,delete,share | read,update,share |
      | Custom permissions | Custom permissions | read                            | read              |

  @skipOnOC10 @ocisSmokeTest @disablePreviews
  #after fixing the issue delete this scenario and use the one above by deleting the @skipOnOCIS tag there
  Scenario Outline: Share files/folders with special characters in their name
    Given user "Brian" has created folder "Sample,Folder,With,Comma" in the server
    And user "Brian" has created file "sample,1.txt" in the server
    And user "Brian" has logged in using the webUI
    When the user shares folder "Sample,Folder,With,Comma" with user "Alice Hansen" as "<set-role>" using the webUI
    And user "Alice" accepts the share "Shares/Sample,Folder,With,Comma" offered by user "Brian" using the sharing API in the server
    And the user shares file "sample,1.txt" with user "Alice Hansen" as "<set-role>" using the webUI
    And user "Alice" accepts the share "Shares/sample,1.txt" offered by user "Brian" using the sharing API in the server
    Then user "Alice Hansen" should be listed as "<expected-role>" in the collaborators list for folder "Sample,Folder,With,Comma" on the webUI
    And user "Alice Hansen" should be listed as "<expected-role>" in the collaborators list for file "sample,1.txt" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                            |
      | uid_owner   | Brian                            |
      | share_with  | Alice                            |
      | file_target | /Shares/Sample,Folder,With,Comma |
      | item_type   | folder                           |
      | permissions | <permissions-folder>             |
    And user "Alice" should have received a share with these details in the server:
      | field       | value                |
      | uid_owner   | Brian                |
      | share_with  | Alice                |
      | file_target | /Shares/sample,1.txt |
      | item_type   | file                 |
      | permissions | <permissions-file>   |
    When the user re-logs in as "Alice" using the webUI
    And the user opens folder "Shares" using the webUI
    Then these files should be listed on the webUI
      | files                    |
      | Sample,Folder,With,Comma |
      | sample,1.txt             |
    Examples:
      | set-role           | expected-role | permissions-folder        | permissions-file |
      | Viewer             | Viewer        | read                      | read             |
      | Editor             | Editor        | read,update,create,delete | read,update      |
      | Custom permissions | Viewer        | read                      | read             |


  @issue-4192 @disablePreviews
  Scenario: sharing file after renaming it is possible
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has logged in using the webUI
    And user "Alice" has uploaded file with content "test" to "lorem.txt" in the server
    And the user has renamed file "lorem.txt" to "new-lorem.txt"
    When the user shares resource "new-lorem.txt" with user "Brian Murphy" using the quick action on the webUI
    Then user "Brian Murphy" should be listed as "Viewer" in the collaborators list for file "new-lorem.txt" on the webUI


  Scenario: user shares the file/folder with another internal user and delete the share with user
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has logged in using the webUI
    And user "Alice" has shared file "lorem.txt" with user "Brian" in the server
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Alice" in the server
    When the user opens the share dialog for file "lorem.txt" using the webUI
    Then user "Brian Murphy" should be listed as "Editor" in the collaborators list on the webUI
    And as "Brian" file "Shares/lorem.txt" should exist in the server
    When the user deletes "Brian Murphy" as collaborator for the current file using the webUI
    Then user "Brian Murphy" should not be listed in the collaborators list on the webUI
    And file "lorem.txt" should not be listed in shared-with-others page on the webUI
    And as "Brian" file "Shares/lorem.txt" should not exist in the server


  Scenario: Sharing the share_folder to user is not possible
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "Brian" has shared folder "simple-folder" with user "Alice" in the server
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian" in the server
    And user "Alice" has logged in using the webUI
    When the user opens the share dialog for file "Shares" using the webUI
    Then the share permission denied message should be displayed in the sharing dialog on the webUI

