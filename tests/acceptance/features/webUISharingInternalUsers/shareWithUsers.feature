@ocis-reva-issue-64
Feature: Sharing files and folders with internal users
  As a user
  I want to share files and folders with other users
  So that those users can access the files and folders

  Background:
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares"
    And these users have been created with default attributes and without skeleton files:
      | username |
      | Alice    |
      | Brian    |
    And user "Brian" has created folder "simple-folder"

  @yetToImplement @smokeTest @issue-ocis-1743
  Scenario Outline: share a file & folder with another internal user
    Given user "Brian" has created file "testimage.jpg"
    And user "Brian" has created file "simple-folder/lorem.txt"
    And user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "<set-role>" using the webUI
    And user "Alice" accepts the share "simple-folder" offered by user "Brian" using the sharing API
    And the user shares file "testimage.jpg" with user "Alice Hansen" as "<set-role>" using the webUI
    And user "Alice" accepts the share "testimage.jpg" offered by user "Brian" using the sharing API
    Then user "Alice Hansen" should be listed as "<expected-role>" in the collaborators list for folder "simple-folder" on the webUI
    And user "Alice Hansen" should be listed as "<expected-role>" in the collaborators list for file "testimage.jpg" on the webUI
    And user "Alice" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | Brian                 |
      | share_with  | Alice                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | <permissions-folder>  |
    And user "Alice" should have received a share with these details:
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
    And these resources should be listed in the folder "/Shares%2Fsimple-folder" on the webUI
      | entry_name |
      | lorem.txt  |
    But these resources should not be listed in the folder "/Shares%2Fsimple-folder" on the webUI
      | entry_name    |
      | simple-folder |
    #    And folder "simple-folder (2)" should be marked as shared by "Brian Murphy" on the webUI
    #    And file "testimage (2).jpg" should be marked as shared by "Brian Murphy" on the webUI
    Examples:
      | set-role             | expected-role        | permissions-folder              | permissions-file  |
      | Viewer               | Viewer               | read,share                      | read, share       |
      | Editor               | Editor               | read,update,create,delete,share | read,update,share |
      | Advanced permissions | Advanced permissions | read                            | read              |

  @issue-ocis-1743
  Scenario Outline: change the collaborators of a file & folder
    Given user "Brian" has logged in using the webUI
    And user "Brian" has shared folder "/simple-folder" with user "Alice" with "<initial-permissions>" permissions
    And user "Alice" has accepted the share "simple-folder" offered by user "Brian"
    When the user changes the collaborator role of "Alice Hansen" for folder "simple-folder" to "<set-role>" using the webUI
    # check role without reloading the collaborators panel, see issue #1786
    Then user "Alice Hansen" should be listed as "<expected-role>" in the collaborators list on the webUI
    # check role after reopening the collaborators panel
    And user "Alice Hansen" should be listed as "<expected-role>" in the collaborators list for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details:
      | field       | value                  |
      | uid_owner   | Brian                  |
      | share_with  | Alice                  |
      | file_target | /Shares/simple-folder  |
      | item_type   | folder                 |
      | permissions | <expected-permissions> |
    Examples:
      | initial-permissions | set-role             | expected-role | expected-permissions            |
      | read,update,create  | Viewer               | Viewer        | read,share                      |
      | read                | Editor               | Editor        | read,update,create,delete,share |
      | read,share          | Advanced permissions | Viewer        | read,share                      |
      | all                 | Advanced permissions | Editor        | all                             |

  @skip @issue-4102
  Scenario: share a file with another internal user who overwrites and unshares the file
    Given user "Brian" has created file "lorem.txt"
    And user "Brian" has logged in using the webUI
    And user "Brian" has renamed file "lorem.txt" to "new-lorem.txt"
    And user "Brian" has shared file "new-lorem.txt" with user "Alice" with "all" permissions
    And user "Alice" has accepted the share "new-lorem.txt" offered by user "Brian"
    When the user re-logs in as "Alice" using the webUI
    And the user opens folder "Shares" using the webUI
    Then as "Alice" the content of "Shares/new-lorem.txt" should not be the same as the local "new-lorem.txt"
    # overwrite the received shared file
    When the user uploads overwriting file "new-lorem.txt" using the webUI
    Then file "new-lorem.txt" should be listed on the webUI
    And as "Alice" the content of "Shares/new-lorem.txt" should be the same as the local "new-lorem.txt"
    # unshare the received shared file
    When the user deletes file "new-lorem.txt" using the webUI
    Then file "new-lorem.txt" should not be listed on the webUI
    # check that the original file owner can still see the file
    And as "Brian" the content of "new-lorem.txt" should be the same as the local "new-lorem.txt"


  Scenario: share a folder with another internal user who uploads, overwrites and deletes files
    Given user "Brian" has created file "simple-folder/lorem.txt"
    And user "Brian" has created file "simple-folder/data.zip"
    And user "Brian" has logged in using the webUI
    When the user shares folder "simple-folder" with user "Alice Hansen" as "Editor" using the webUI
    And user "Alice" accepts the share "simple-folder" offered by user "Brian" using the sharing API
    And the user re-logs in as "Alice" using the webUI
    And the user browses to the folder "Shares" on the files page
    And the user opens folder "simple-folder" using the webUI
    Then as "Alice" the content of "Shares/simple-folder/lorem.txt" should not be the same as the local "lorem.txt"
    # overwrite an existing file in the received share
    When the user uploads overwriting file "lorem.txt" using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And as "Alice" the content of "Shares/simple-folder/lorem.txt" should be the same as the local "lorem.txt"
    # upload a new file into the received share
    When the user uploads file "new-lorem.txt" using the webUI
    Then as "Alice" the content of "Shares/simple-folder/new-lorem.txt" should be the same as the local "new-lorem.txt"
    # delete a file in the received share
    When the user deletes file "data.zip" using the webUI
    Then file "data.zip" should not be listed on the webUI
    # check that the file actions by the sharee are visible for the share owner
    When the user re-logs in as "Brian" using the webUI
    And the user opens folder "simple-folder" using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And as "Brian" the content of "simple-folder/lorem.txt" should be the same as the local "lorem.txt"
    And file "new-lorem.txt" should be listed on the webUI
    And as "Brian" the content of "simple-folder/new-lorem.txt" should be the same as the local "new-lorem.txt"
    But file "data.zip" should not be listed on the webUI

  @issue-product-270
  Scenario: share a folder with another internal user who unshares the folder
    Given user "Brian" has uploaded file with content "text file" to "simple-folder/lorem.txt"
    And user "Brian" has logged in using the webUI
    When the user renames folder "simple-folder" to "new-simple-folder" using the webUI
    And the user shares folder "new-simple-folder" with user "Alice Hansen" as "Editor" using the webUI
    And user "Alice" accepts the share "new-simple-folder" offered by user "Brian" using the sharing API
    # unshare the received shared folder and check it is gone
    And the user re-logs in as "Alice" using the webUI
    And the user browses to the folder "Shares" on the files page
    Then folder "new-simple-folder" should be listed on the webUI
    And the user deletes folder "new-simple-folder" using the webUI
    Then folder "new-simple-folder" should not be listed on the webUI
    # check that the folder is still visible for the share owner
    When the user re-logs in as "Brian" using the webUI
    Then folder "new-simple-folder" should be listed on the webUI
    And the content of file "new-simple-folder/lorem.txt" for user "Brian" should be "text file"
    
  @issue-product-270
  Scenario: share a folder with another internal user and prohibit deleting
    Given user "Brian" has created file "simple-folder/lorem.txt"
    And user "Brian" has logged in using the webUI
    And user "Brian" has shared folder "simple-folder" with user "Alice" with "create, read, share" permissions
    And user "Alice" has accepted the share "simple-folder" offered by user "Brian"
    When the user re-logs in as "Alice" using the webUI
    And the user opens folder "Shares" using the webUI
    And the user opens folder "simple-folder" using the webUI
    Then it should not be possible to delete file "lorem.txt" using the webUI

  @issue-#4192
  Scenario: share a folder with other user and then it should be listed on Shared with You for other user
    Given user "Brian" has created file "lorem.txt"
    And user "Brian" has renamed folder "simple-folder" to "new-simple-folder"
    And user "Brian" has renamed file "lorem.txt" to "ipsum.txt"
    And user "Brian" has shared file "ipsum.txt" with user "Alice"
    And user "Alice" has accepted the share "ipsum.txt" offered by user "Brian"
    And user "Brian" has shared folder "new-simple-folder" with user "Alice"
    And user "Alice" has accepted the share "new-simple-folder" offered by user "Brian"
    And user "Alice" has logged in using the webUI
    When the user browses to the shared-with-me page
    Then file "ipsum.txt" should be listed on the webUI
    And folder "new-simple-folder" should be listed on the webUI


  Scenario: share a folder with other user and then it should be listed on Shared with Others page
    Given user "Carol" has been created with default attributes and without skeleton files
    And user "Brian" has created file "lorem.txt"
    And user "Brian" has logged in using the webUI
    And user "Brian" has shared file "lorem.txt" with user "Alice"
    And user "Alice" has accepted the share "lorem.txt" offered by user "Brian"
    And user "Brian" has shared folder "simple-folder" with user "Alice"
    And user "Alice" has accepted the share "simple-folder" offered by user "Brian"
    And user "Brian" has shared folder "simple-folder" with user "Carol"
    And user "Carol" has accepted the share "simple-folder" offered by user "Brian"
    When the user browses to the shared-with-others page
    Then the following resources should have the following collaborators
      | fileName      | expectedCollaborators |
      | lorem.txt     | Alice Hansen              |
      | simple-folder | Alice Hansen, Carol King  |

  @issue-2480 @yetToImplement
  Scenario: check file with same name but different paths are displayed correctly in shared with others page
    Given user "Brian" has created file "lorem.txt"
    And user "Brian" has created file "simple-folder/lorem.txt"
    And user "Brian" has shared file "lorem.txt" with user "Alice"
    And user "Brian" has shared file "simple-folder/lorem.txt" with user "Alice"
    And user "Brian" has logged in using the webUI
    When the user browses to the shared-with-others page
    Then file "lorem.txt" should be listed on the webUI
#    Then file "lorem.txt" with path "" should be listed in the shared with others page on the webUI
#    And file "lorem.txt" with path "/simple-folder" should be listed in the shared with others page on the webUI

  @issue-4193
  Scenario: user shares the file/folder with another internal user and delete the share with user
    Given user "Alice" has created file "lorem.txt"
    And user "Alice" has logged in using the webUI
    And user "Alice" has shared file "lorem.txt" with user "Brian"
    And user "Brian" has accepted the share "lorem.txt" offered by user "Alice"
    When the user opens the share dialog for file "lorem.txt" using the webUI
    Then user "Brian Murphy" should be listed as "Editor" in the collaborators list on the webUI
    And as "Brian" file "Shares/lorem.txt" should exist
    When the user deletes "Brian Murphy" as collaborator for the current file using the webUI
    Then user "Brian Murphy" should not be listed in the collaborators list on the webUI
    And file "lorem.txt" should not be listed in shared-with-others page on the webUI
    And as "Brian" file "Shares/lorem.txt" should not exist

  @issue-4193
  Scenario: user shares the file/folder with multiple internal users and delete the share with one user
    Given user "Carol" has been created with default attributes and without skeleton files
    And user "Alice" has created file "lorem.txt"
    And user "Alice" has logged in using the webUI
    And user "Alice" has shared file "lorem.txt" with user "Brian"
    And user "Brian" has accepted the share "lorem.txt" offered by user "Alice"
    And user "Alice" has shared file "lorem.txt" with user "Carol"
    And user "Carol" has accepted the share "lorem.txt" offered by user "Alice"
    When the user opens the share dialog for file "lorem.txt" using the webUI
    Then user "Brian Murphy" should be listed as "Editor" in the collaborators list on the webUI
    And user "Carol King" should be listed as "Editor" in the collaborators list on the webUI
    And as "Brian" file "Shares/lorem.txt" should exist
    And as "Carol" file "Shares/lorem.txt" should exist
    When the user deletes "Brian Murphy" as collaborator for the current file using the webUI
    Then user "Brian Murphy" should not be listed in the collaborators list on the webUI
    And user "Carol King" should be listed as "Editor" in the collaborators list on the webUI
    And file "lorem.txt" should be listed in shared-with-others page on the webUI
    And as "Brian" file "Shares/lorem.txt" should not exist
    But as "Carol" file "Shares/lorem.txt" should exist


  Scenario: send share shows up on shared-with-others page
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has created file "data.zip"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Alice" has logged in using the webUI
    When the user browses to the shared-with-others page using the webUI
    Then folder "simple-folder" should be listed on the webUI
    But file "data.zip" should not be listed on the webUI


  Scenario: received share shows up on shared-with-me page
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has created file "data.zip"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has accepted the share "simple-folder" offered by user "Alice"
    And user "Brian" has logged in using the webUI
    When the user browses to the shared-with-me page using the webUI
    Then folder "simple-folder" should be listed on the webUI
    But file "data.zip" should not be listed on the webUI

  @issue-4170
  Scenario: clicking a folder on shared-with-me page jumps to the main file list inside the folder
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has accepted the share "simple-folder" offered by user "Alice"
    And user "Alice" has created file "simple-folder/collaborate-on-this.txt"
    And user "Brian" has logged in using the webUI
    When the user browses to the shared-with-me page using the webUI
    And the user opens folder "simple-folder" using the webUI
    Then file "collaborate-on-this.txt" should be listed on the webUI

  @issue-ocis-730
  Scenario: deleting an entry on the shared-with-me page unshares from self
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has accepted the share "simple-folder" offered by user "Alice"
    And user "Brian" has logged in using the webUI
    When the user browses to the shared-with-me page using the webUI
    And the user deletes folder "simple-folder" using the webUI
    And the user browses to the folder "Shares" on the files page
    Then folder "simple-folder" should not be listed on the webUI

  @issue-ocis-730 @skipOnOC10 @issue-4582
  Scenario: deleting multiple entries on the shared-with-me page
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has created file "lorem.txt"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has accepted the share "simple-folder" offered by user "Alice"
    And user "Alice" has shared file "lorem.txt" with user "Brian"
    And user "Brian" has accepted the share "lorem.txt" offered by user "Alice"
    And user "Brian" has logged in using the webUI
    And the user browses to the shared-with-me page using the webUI
    When the user batch deletes these files using the webUI
      | name          |
      | simple-folder |
      | lorem.txt     |
    Then the deleted elements should not be listed on the webUI


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
    And user "Brian Murphy" should not be listed in the collaborators list on the webUI
    When the user clears all error message from the webUI
    And the user shares folder "simple-folder" with user "Brian Murphy" as "Editor" using the webUI
    Then the error message with header 'Error while sharing.' should be displayed on the webUI
    And user "Brian Murphy" should not be listed in the collaborators list on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And folder "simple-folder" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist
    And as "Alice" folder "simple-folder" should not exist

  @issue-2897 @issue-4193
  Scenario: sharing details of items inside a shared folder
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has created folder "simple-folder/simple-empty-folder"
    And user "Carol" has been created with default attributes and without skeleton files
    And user "Alice" has uploaded file with content "test" to "/simple-folder/lorem.txt"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Alice" has logged in using the webUI
    And the user opens folder "simple-folder" using the webUI
    When the user opens the share dialog for folder "simple-empty-folder" using the webUI
    Then user "Brian Murphy" should be listed as "Editor" via "simple-folder" in the collaborators list on the webUI
    When the user opens the share dialog for file "lorem.txt" using the webUI
    Then user "Brian Murphy" should be listed as "Editor" via "simple-folder" in the collaborators list on the webUI

  # Share permission is not available in oCIS webUI so when setting all permissions, it is displayed as "Advanced permissions" there
  @issue-2897
  Scenario: sharing details of items inside a re-shared folder
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has created folder "simple-folder/simple-empty-folder"
    And user "Carol" has been created with default attributes and without skeleton files
    And user "Alice" has uploaded file with content "test" to "/simple-folder/lorem.txt"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has accepted the share "simple-folder" offered by user "Alice"
    And user "Brian" has shared folder "Shares/simple-folder" with user "Carol"
    And user "Brian" has logged in using the webUI
    And the user has opened folder "Shares"
    And the user has opened folder "simple-folder"
    When the user opens the share dialog for folder "simple-empty-folder" using the webUI
    Then user "Carol King" should be listed as "Editor" via "simple-folder" in the collaborators list on the webUI
    When the user opens the share dialog for file "lorem.txt" using the webUI
    Then user "Carol King" should be listed as "Editor" via "simple-folder" in the collaborators list on the webUI

  @skipOnOC10 @issue-2897
  Scenario: sharing details of items inside a re-shared folder (ocis bug demonstration)
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has created folder "simple-folder/simple-empty-folder"
    And user "Carol" has been created with default attributes and without skeleton files
    And user "Alice" has uploaded file with content "test" to "/simple-folder/lorem.txt"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has accepted the share "simple-folder" offered by user "Alice"
    And user "Brian" has shared folder "Shares/simple-folder" with user "Carol"
    And user "Brian" has logged in using the webUI
    And the user has opened folder "Shares"
    And the user has opened folder "simple-folder"
    When the user opens the share dialog for folder "simple-empty-folder" using the webUI
    Then user "Carol King" should be listed as "Advanced permissions" via "simple-folder" in the collaborators list on the webUI
    When the user opens the share dialog for file "lorem.txt" using the webUI
    Then user "Carol King" should be listed as "Advanced permissions" via "simple-folder" in the collaborators list on the webUI

  @issue-2897 @issue-4193
  Scenario: sharing details of items inside a shared folder shared with multiple users
    Given user "Alice" has created folder "simple-folder"
    And user "Carol" has been created with default attributes and without skeleton files
    And user "Alice" has created folder "/simple-folder/sub-folder"
    And user "Alice" has uploaded file with content "test" to "/simple-folder/sub-folder/lorem.txt"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Alice" has shared folder "simple-folder/sub-folder" with user "Carol"
    And user "Alice" has logged in using the webUI
    And the user opens folder "simple-folder/sub-folder" directly on the webUI
    When the user opens the share dialog for file "lorem.txt" using the webUI
    Then user "Brian Murphy" should be listed as "Editor" via "simple-folder" in the collaborators list on the webUI
    And user "Carol King" should be listed as "Editor" via "sub-folder" in the collaborators list on the webUI

  @issue-2898
  Scenario: see resource owner in collaborators list for direct shares
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has accepted the share "simple-folder" offered by user "Alice"
    And user "Brian" has logged in using the webUI
    And the user has opened folder "Shares"
    When the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "Alice Hansen" should be listed as "Owner" in the collaborators list on the webUI

  @issue-2898
  Scenario: see resource owner in collaborators list for reshares
    Given user "Alice" has created folder "simple-folder"
    And user "Carol" has been created with default attributes and without skeleton files
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has accepted the share "simple-folder" offered by user "Alice"
    And user "Brian" has shared folder "Shares/simple-folder" with user "Carol"
    And user "Carol" has accepted the share "simple-folder" offered by user "Brian"
    And user "Carol" has logged in using the webUI
    And the user has opened folder "Shares"
    When the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "Alice Hansen" should be listed as "Owner" reshared through "Brian Murphy" in the collaborators list on the webUI
    And the current collaborators list should have order "Alice Hansen,Carol King"

  @issue-2898 @issue-4168
  Scenario: see resource owner of parent shares in collaborators list
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has created folder "simple-folder/simple-empty-folder"
    And user "Carol" has been created with default attributes and without skeleton files
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has accepted the share "simple-folder" offered by user "Alice"
    And user "Brian" has shared folder "Shares/simple-folder" with user "Carol"
    And user "Carol" has accepted the share "simple-folder" offered by user "Brian"
    And user "Carol" has logged in using the webUI
    And the user has opened folder "Shares"
    And the user has opened folder "simple-folder"
    When the user opens the share dialog for folder "simple-empty-folder" using the webUI
    Then user "Alice Hansen" should be listed as "Owner" reshared through "Brian Murphy" via "simple-folder" in the collaborators list on the webUI
    And the current collaborators list should have order "Alice Hansen,Carol King"

  @issue-3040 @issue-4113 @ocis-reva-issue-39
  Scenario: see resource owner of parent shares in "shared with others" and "favorites" list
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has created folder "simple-folder/simple-empty-folder"
    And user "Carol" has been created with default attributes and without skeleton files
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has accepted the share "simple-folder" offered by user "Alice"
    And user "Brian" has shared folder "Shares/simple-folder/simple-empty-folder" with user "Carol"
    And user "Brian" has favorited element "Shares/simple-folder/simple-empty-folder"
    And user "Brian" has logged in using the webUI
    When the user browses to the shared-with-others page
    And the user opens the share dialog for folder "simple-empty-folder" using the webUI
    Then user "Alice Hansen" should be listed as "Owner" via "simple-folder" in the collaborators list on the webUI
    When the user browses to the favorites page using the webUI
    And the user opens the share dialog for folder "…/simple-folder/simple-empty-folder" using the webUI
    Then user "Alice Hansen" should be listed as "Owner" via "simple-folder" in the collaborators list on the webUI

  @issue-2898 @ocis-issue-891
  Scenario: see resource owner for direct shares in "shared with me"
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has accepted the share "simple-folder" offered by user "Alice"
    And user "Brian" has logged in using the webUI
    When the user browses to the shared-with-me page
    And the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "Alice Hansen" should be listed as "Owner" in the collaborators list on the webUI

  @issue-ocis-reva-41
  Scenario Outline: collaborators list contains additional info when enabled
    Given the setting "user_additional_info_field" of app "core" has been set to "<additional-info-field>"
    And user "Alice" has created folder "simple-folder"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    When user "Alice" has logged in using the webUI
    And the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "Brian Murphy" should be listed with additional info "<additional-info-result>" in the collaborators list on the webUI
    Examples:
      | additional-info-field | additional-info-result |
      | id                    | Brian                  |
      | email                 | brian@example.org      |


  Scenario: collaborators list does not contain additional info when disabled
    Given the setting "user_additional_info_field" of app "core" has been set to ""
    And user "Alice" has created folder "simple-folder"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    When user "Alice" has logged in using the webUI
    And the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "Brian Murphy" should be listed without additional info in the collaborators list on the webUI


  Scenario: collaborators list contains the current user when they are an owner
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    When user "Alice" has logged in using the webUI
    And the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "Alice Hansen" should be listed with additional info "(me)" in the collaborators list on the webUI


  Scenario: collaborators list contains the current user when they are a receiver of the resource
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has accepted the share "simple-folder" offered by user "Alice"
    And user "Brian" has logged in using the webUI
    When the user opens folder "Shares" using the webUI
    And the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "Brian Murphy" should be listed with additional info "(me)" in the collaborators list on the webUI

  @issue-ocis-reva-34
  Scenario: current user should see the highest role in their entry in collaborators list
    Given group "grp1" has been created
    And user "Brian" has been added to group "grp1"
    And user "Alice" has created folder "simple-folder"
    And user "Alice" has shared folder "simple-folder" with user "Brian" with "read" permission
    And user "Brian" has accepted the share "simple-folder" offered by user "Alice"
    And user "Alice" has shared folder "simple-folder" with group "grp1" with "read,update,create,delete" permissions
    And user "Brian" has accepted the share "simple-folder" offered by user "Alice"
    When user "Brian" logs in using the webUI
    And the user opens folder "Shares" using the webUI
    Then user "Brian Murphy" should be listed as "Advanced permissions" in the collaborators list for folder "simple-folder (2)" on the webUI


  Scenario: share a file with another internal user via collaborators quick action
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has logged in using the webUI
    When the user shares resource "simple-folder" with user "Brian Murphy" using the quick action in the webUI
    And user "Brian" accepts the share "simple-folder" offered by user "Alice" using the sharing API
    Then user "Brian Murphy" should be listed as "Viewer" in the collaborators list for folder "simple-folder" on the webUI
    And user "Brian" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | Alice                 |
      | share_with  | Brian                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read,share            |


  Scenario Outline: Share files/folders with special characters in their name
    Given user "Brian" has created folder "Sample,Folder,With,Comma"
    And user "Brian" has created file "sample,1.txt"
    And user "Brian" has logged in using the webUI
    When the user shares folder "Sample,Folder,With,Comma" with user "Alice Hansen" as "<set-role>" using the webUI
    And user "Alice" accepts the share "Sample,Folder,With,Comma" offered by user "Brian" using the sharing API
    And the user shares file "sample,1.txt" with user "Alice Hansen" as "<set-role>" using the webUI
    And user "Alice" accepts the share "sample,1.txt" offered by user "Brian" using the sharing API
    Then user "Alice Hansen" should be listed as "<expected-role>" in the collaborators list for folder "Sample,Folder,With,Comma" on the webUI
    And user "Alice Hansen" should be listed as "<expected-role>" in the collaborators list for file "sample,1.txt" on the webUI
    And user "Alice" should have received a share with these details:
      | field       | value                            |
      | uid_owner   | Brian                            |
      | share_with  | Alice                            |
      | file_target | /Shares/Sample,Folder,With,Comma |
      | item_type   | folder                           |
      | permissions | <permissions-folder>             |
    And user "Alice" should have received a share with these details:
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
      | set-role             | expected-role        | permissions-folder              | permissions-file  |
      | Viewer               | Viewer               | read,share                      | read,share        |
      | Editor               | Editor               | read,update,create,delete,share | read,update,share |
      | Advanced permissions | Advanced permissions | read                            | read              |

  @skipOnOC10
  #after fixing the issue delete this scenario and use the one above by deleting the @skipOnOCIS tag there
  Scenario Outline: Share files/folders with special characters in their name
    Given user "Brian" has created folder "Sample,Folder,With,Comma"
    And user "Brian" has created file "sample,1.txt"
    And user "Brian" has logged in using the webUI
    When the user shares folder "Sample,Folder,With,Comma" with user "Alice Hansen" as "<set-role>" using the webUI
    And user "Alice" accepts the share "Sample,Folder,With,Comma" offered by user "Brian" using the sharing API
    And the user shares file "sample,1.txt" with user "Alice Hansen" as "<set-role>" using the webUI
    And user "Alice" accepts the share "sample,1.txt" offered by user "Brian" using the sharing API
    Then user "Alice Hansen" should be listed as "<expected-role>" in the collaborators list for folder "Sample,Folder,With,Comma" on the webUI
    And user "Alice Hansen" should be listed as "<expected-role>" in the collaborators list for file "sample,1.txt" on the webUI
    And user "Alice" should have received a share with these details:
      | field       | value                            |
      | uid_owner   | Brian                            |
      | share_with  | Alice                            |
      | file_target | /Shares/Sample,Folder,With,Comma |
      | item_type   | folder                           |
      | permissions | <permissions-folder>             |
    And user "Alice" should have received a share with these details:
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
      | set-role             | expected-role | permissions-folder        | permissions-file |
      | Viewer               | Viewer        | read                      | read             |
      | Editor               | Editor        | read,update,create,delete | read,update      |
      | Advanced permissions | Viewer        | read                      | read             |

  Scenario: file list view image preview in file share
    Given user "Alice" has created file "testavatar.jpg"
    And user "Alice" has uploaded file "testavatar.jpg" to "testavatar.jpg"
    And user "Alice" has shared file "testavatar.jpg" with user "Brian"
    And user "Brian" has accepted the share "testavatar.jpg" offered by user "Alice"
    And user "Brian" has logged in using the webUI
    When the user opens folder "Shares" using the webUI
    Then the preview image of file "testavatar.jpg" should be displayed in the file list view on the webUI

  Scenario: file list view image preview in file share when previews is disabled
    Given the property "disablePreviews" of "options" has been set to true in web config file
    And user "Alice" has created file "testavatar.jpg"
    And user "Alice" has uploaded file "testavatar.jpg" to "testavatar.jpg"
    And user "Alice" has shared file "testavatar.jpg" with user "Brian"
    And user "Brian" has accepted the share "testavatar.jpg" offered by user "Alice"
    And user "Brian" has logged in using the webUI
    When the user opens folder "Shares" using the webUI
    Then the preview image of file "testavatar.jpg" should not be displayed in the file list view on the webUI

  @issue-4192
  Scenario: sharing file after renaming it is possible
    Given user "Alice" has created file "lorem.txt"
    And user "Alice" has logged in using the webUI
    And user "Alice" has uploaded file with content "test" to "lorem.txt"
    And the user has renamed file "lorem.txt" to "new-lorem.txt"
    When the user shares resource "new-lorem.txt" with user "Brian Murphy" using the quick action in the webUI
    Then user "Brian Murphy" should be listed as "Viewer" in the collaborators list for file "new-lorem.txt" on the webUI
