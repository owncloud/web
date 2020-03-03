Feature: Sharing files and folders with internal users
  As a user
  I want to share files and folders with other users
  So that those users can access the files and folders

  Background:
    Given these users have been created with default attributes:
      | username |
      | user1    |
      | user2    |

  @yetToImplement
  @smokeTest
  Scenario Outline: share a file & folder with another internal user
    Given user "user2" has logged in using the webUI
    And the setting "shareapi_auto_accept_share" of app "core" has been set to "yes"
    When the user shares folder "simple-folder" with user "User One" as "<set-role>" using the webUI
    And the user shares file "testimage.jpg" with user "User One" as "<set-role>" using the webUI
    Then user "User One" should be listed as "<expected-role>" in the collaborators list for folder "simple-folder" on the webUI
    And user "User One" should be listed as "<expected-role>" in the collaborators list for file "testimage.jpg" on the webUI
    And user "user1" should have received a share with these details:
      | field       | value                |
      | uid_owner   | user2                |
      | share_with  | user1                |
      | file_target | /simple-folder (2)   |
      | item_type   | folder               |
      | permissions | <permissions-folder> |
    And user "user1" should have received a share with these details:
      | field       | value              |
      | uid_owner   | user2              |
      | share_with  | user1              |
      | file_target | /testimage (2).jpg |
      | item_type   | file               |
      | permissions | <permissions-file> |
    And as "user1" these resources should be listed on the webUI
      | entry_name        |
      | simple-folder (2) |
      | testimage (2).jpg |
    And these resources should be listed in the folder "simple-folder (2)" on the webUI
      | entry_name |
      | lorem.txt  |
    But these resources should not be listed in the folder "simple-folder (2)" on the webUI
      | entry_name        |
      | simple-folder (2) |
    #    And folder "simple-folder (2)" should be marked as shared by "User Two" on the webUI
    #    And file "testimage (2).jpg" should be marked as shared by "User Two" on the webUI
    Examples:
      | set-role             | expected-role | permissions-folder        | permissions-file |
      | Viewer               | Viewer        | read                      | read             |
      | Editor               | Editor        | read,update,create,delete | read,update      |
      | Advanced permissions | Viewer        | read                      | read             |

  Scenario Outline: change the collaborators of a file & folder
    Given user "user2" has logged in using the webUI
    And user "user2" has shared folder "/simple-folder" with user "user1" with "<initial-permissions>" permissions
    When the user changes the collaborator role of "User One" for folder "simple-folder" to "<set-role>" using the webUI
    # check role without reloading the collaborators panel, see issue #1786
    Then user "User One" should be listed as "<expected-role>" in the collaborators list on the webUI
    # check role after reopening the collaborators panel
    And user "User One" should be listed as "<expected-role>" in the collaborators list for folder "simple-folder" on the webUI
    And user "user1" should have received a share with these details:
      | field       | value                  |
      | uid_owner   | user2                  |
      | share_with  | user1                  |
      | file_target | /simple-folder (2)     |
      | item_type   | folder                 |
      | permissions | <expected-permissions> |
    Examples:
      | initial-permissions | set-role             | expected-role | expected-permissions      |
      | read,update,create  | Viewer               | Viewer        | read                      |
      | read                | Editor               | Editor        | read,update,create,delete |
      | read                | Advanced permissions | Viewer        | read                      |
      | all                 | Advanced permissions | Editor        | all                       |

  Scenario: share a file with another internal user who overwrites and unshares the file
    Given user "user2" has logged in using the webUI
    And user "user2" has renamed file "lorem.txt" to "new-lorem.txt"
    And user "user2" has shared file "new-lorem.txt" with user "user1" with "all" permissions
    When the user re-logs in as "user1" using the webUI
    Then as "user1" the content of "new-lorem.txt" should not be the same as the local "new-lorem.txt"
    # overwrite the received shared file
    When the user uploads overwriting file "new-lorem.txt" using the webUI
    Then file "new-lorem.txt" should be listed on the webUI
    And as "user1" the content of "new-lorem.txt" should be the same as the local "new-lorem.txt"
    # unshare the received shared file
    When the user deletes file "new-lorem.txt" using the webUI
    Then file "new-lorem.txt" should not be listed on the webUI
    # check that the original file owner can still see the file
    And as "user2" the content of "new-lorem.txt" should be the same as the local "new-lorem.txt"

  Scenario: share a folder with another internal user who uploads, overwrites and deletes files
    Given user "user2" has logged in using the webUI
    When the user renames folder "simple-folder" to "new-simple-folder" using the webUI
    And the user shares folder "new-simple-folder" with user "User One" as "Editor" using the webUI
    And the user re-logs in as "user1" using the webUI
    And the user opens folder "new-simple-folder" using the webUI
    Then as "user1" the content of "new-simple-folder/lorem.txt" should not be the same as the local "lorem.txt"
    # overwrite an existing file in the received share
    When the user uploads overwriting file "lorem.txt" using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And as "user1" the content of "new-simple-folder/lorem.txt" should be the same as the local "lorem.txt"
    # upload a new file into the received share
    When the user uploads file "new-lorem.txt" using the webUI
    Then as "user1" the content of "new-simple-folder/new-lorem.txt" should be the same as the local "new-lorem.txt"
    # delete a file in the received share
    When the user deletes file "data.zip" using the webUI
    Then file "data.zip" should not be listed on the webUI
    # check that the file actions by the sharee are visible for the share owner
    When the user re-logs in as "user2" using the webUI
    And the user opens folder "new-simple-folder" using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And as "user2" the content of "new-simple-folder/lorem.txt" should be the same as the local "lorem.txt"
    And file "new-lorem.txt" should be listed on the webUI
    And as "user2" the content of "new-simple-folder/new-lorem.txt" should be the same as the local "new-lorem.txt"
    But file "data.zip" should not be listed on the webUI

  Scenario: share a folder with another internal user who unshares the folder
    Given user "user2" has logged in using the webUI
    When the user renames folder "simple-folder" to "new-simple-folder" using the webUI
    And the user shares folder "new-simple-folder" with user "User One" as "Editor" using the webUI
    # unshare the received shared folder and check it is gone
    And the user re-logs in as "user1" using the webUI
    Then folder "new-simple-folder" should be listed on the webUI
    And the user deletes folder "new-simple-folder" using the webUI
    Then folder "new-simple-folder" should not be listed on the webUI
    # check that the folder is still visible for the share owner
    When the user re-logs in as "user2" using the webUI
    Then folder "new-simple-folder" should be listed on the webUI
    And as "user2" the content of "new-simple-folder/lorem.txt" should be the same as the original "simple-folder/lorem.txt"

  Scenario: share a folder with another internal user and prohibit deleting
    Given user "user2" has logged in using the webUI
    Given user "user2" has shared folder "simple-folder" with user "user1" with "create, read, share" permissions
    And the user re-logs in as "user1" using the webUI
    And the user opens folder "simple-folder (2)" using the webUI
    Then it should not be possible to delete file "lorem.txt" using the webUI

  Scenario: share a folder with other user and then it should be listed on Shared with You for other user
    Given user "user2" has renamed folder "simple-folder" to "new-simple-folder"
    And user "user2" has renamed file "lorem.txt" to "ipsum.txt"
    And user "user2" has shared file "ipsum.txt" with user "user1"
    And user "user2" has shared folder "new-simple-folder" with user "user1"
    And user "user1" has logged in using the webUI
    When the user browses to the shared-with-me page
    Then file "ipsum.txt" should be listed on the webUI
    And folder "new-simple-folder" should be listed on the webUI

  Scenario: share a folder with other user and then it should be listed on Shared with Others page
    Given user "user3" has been created with default attributes
    And user "user2" has logged in using the webUI
    And user "user2" has shared file "lorem.txt" with user "user1"
    And user "user2" has shared folder "simple-folder" with user "user1"
    And user "user2" has shared folder "simple-folder" with user "user3"
    When the user browses to the shared-with-others page
    Then the following resources should have the following collaborators
      | fileName            | expectedCollaborators |
      | lorem.txt           | User One              |
      | simple-folder       | User One, User Three  |

  @issue-2480 @yetToImplement
  Scenario: check file with same name but different paths are displayed correctly in shared with others page
    Given user "user2" has shared file "lorem.txt" with user "user1"
    And user "user2" has shared file "simple-folder/lorem.txt" with user "user1"
    And user "user2" has logged in using the webUI
    When the user browses to the shared-with-others page
    Then file "lorem.txt" should be listed on the webUI
#    Then file "lorem.txt" with path "" should be listed in the shared with others page on the webUI
#    And file "lorem.txt" with path "/simple-folder" should be listed in the shared with others page on the webUI

  @skip @yetToImplement
  Scenario: user tries to share a file from a group which is blacklisted from sharing
    Given group "grp1" has been created
    And user "user1" has been added to group "grp1"
    And user "user3" has been created with default attributes
    And the administrator has browsed to the admin sharing settings page
    When the administrator enables exclude groups from sharing using the webUI
    And the administrator adds group "grp1" to the group sharing blacklist using the webUI
    Then user "user1" should not be able to share file "testimage.jpg" with user "user3" using the sharing API

  Scenario: member of a blacklisted from sharing group tries to re-share a file or folder received as a share
    Given these users have been created with default attributes:
      | username |
      | user3    |
    And group "grp1" has been created
    And user "user1" has been added to group "grp1"
    And the setting "shareapi_auto_accept_share" of app "core" has been set to "yes"
    And user "user3" has shared file "testimage.jpg" with user "user1"
    And user "user3" has shared folder "simple-folder" with user "user1"
    And the administrator has enabled exclude groups from sharing
    And the administrator has excluded group "grp1" from sharing
    When user "user1" logs in using the webUI
    Then the user should not be able to share file "testimage (2).jpg" using the webUI
    And the user should not be able to share folder "simple-folder (2)" using the webUI

  Scenario: member of a blacklisted from sharing group tries to re-share a file inside a folder received as a share
    Given these users have been created with default attributes:
      | username |
      | user3    |
    And group "grp1" has been created
    And user "user1" has been added to group "grp1"
    And user "user3" has created folder "common"
    And user "user3" has moved file "testimage.jpg" to "common/testimage.jpg"
    And user "user3" has shared folder "common" with user "user1"
    And the administrator has enabled exclude groups from sharing
    And the administrator has excluded group "grp1" from sharing
    And user "user1" has logged in using the webUI
    When the user browses to the folder "common" on the files page
    Then the user should not be able to share file "testimage.jpg" using the webUI

  Scenario: member of a blacklisted from sharing group tries to re-share a folder inside a folder received as a share
    Given these users have been created with default attributes:
      | username |
      | user3    |
    And group "grp1" has been created
    And user "user1" has been added to group "grp1"
    And user "user3" has created folder "common"
    And user "user3" has created folder "common/inside-common"
    And user "user3" has shared folder "common" with user "user1"
    And the administrator has enabled exclude groups from sharing
    And the administrator has excluded group "grp1" from sharing
    And user "user1" has logged in using the webUI
    When the user browses to the folder "common" on the files page
    Then the user should not be able to share folder "inside-common" using the webUI

  Scenario: user tries to share a file or folder from a group which is blacklisted from sharing from files page
    Given group "grp1" has been created
    And user "user1" has been added to group "grp1"
    And the administrator has enabled exclude groups from sharing
    And the administrator has excluded group "grp1" from sharing
    When user "user1" logs in using the webUI
    Then the user should not be able to share file "testimage.jpg" using the webUI
    And the user should not be able to share folder "simple-folder" using the webUI

  Scenario: user tries to re-share a file from a group which is blacklisted from sharing using webUI from shared with you page
    Given group "grp1" has been created
    And user "user1" has been added to group "grp1"
    And user "user3" has been created with default attributes
    And user "user2" has shared file "/testimage.jpg" with user "user1"
    And the administrator has enabled exclude groups from sharing
    And the administrator has excluded group "grp1" from sharing
    And user "user1" has logged in using the webUI
    When the user browses to the shared-with-me page
    And the user opens the share dialog for file "testimage (2).jpg" using the webUI
    And the user opens the share creation dialog in the webUI
    And the user types "User Three" in the share-with-field
    Then "user" "User Three" should not be listed in the autocomplete list on the webUI

  Scenario: user shares the file/folder with another internal user and delete the share with user
    Given user "user1" has logged in using the webUI
    And user "user1" has shared file "lorem.txt" with user "user2"
    When the user opens the share dialog for file "lorem.txt" using the webUI
    Then user "User Two" should be listed as "Editor" in the collaborators list on the webUI
    And as "user2" file "lorem (2).txt" should exist
    When the user deletes "User Two" as collaborator for the current file using the webUI
    Then user "User Two" should not be listed in the collaborators list on the webUI
    And file "lorem.txt" should not be listed in shared-with-others page on the webUI
    And as "user2" file "lorem (2).txt" should not exist

  Scenario: user shares the file/folder with multiple internal users and delete the share with one user
    Given user "user3" has been created with default attributes
    And user "user1" has logged in using the webUI
    And user "user1" has shared file "lorem.txt" with user "user2"
    And user "user1" has shared file "lorem.txt" with user "user3"
    When the user opens the share dialog for file "lorem.txt" using the webUI
    Then user "User Two" should be listed as "Editor" in the collaborators list on the webUI
    And user "User Three" should be listed as "Editor" in the collaborators list on the webUI
    And as "user2" file "lorem (2).txt" should exist
    And as "user3" file "lorem (2).txt" should exist
    When the user deletes "User Two" as collaborator for the current file using the webUI
    Then user "User Two" should not be listed in the collaborators list on the webUI
    And user "User Three" should be listed as "Editor" in the collaborators list on the webUI
    And file "lorem.txt" should be listed in shared-with-others page on the webUI
    And as "user2" file "lorem (2).txt" should not exist
    But as "user3" file "lorem (2).txt" should exist

  Scenario: send share shows up on shared-with-others page
    Given user "user1" has shared folder "simple-folder" with user "user2"
    And user "user1" has logged in using the webUI
    When the user browses to the shared-with-others page using the webUI
    Then folder "simple-folder" should be listed on the webUI
    But file "data.zip" should not be listed on the webUI

  Scenario: received share shows up on shared-with-me page
    Given user "user1" has shared folder "simple-folder" with user "user2"
    And user "user2" has logged in using the webUI
    When the user browses to the shared-with-me page using the webUI
    Then folder "simple-folder (2)" should be listed on the webUI
    But file "data.zip" should not be listed on the webUI

  Scenario: clicking a folder on shared-with-me page jumps to the main file list inside the folder
    Given user "user1" has shared folder "simple-folder" with user "user2"
    And user "user1" has created file "simple-folder/collaborate-on-this.txt"
    And user "user2" has logged in using the webUI
    When the user browses to the shared-with-me page using the webUI
    And the user opens folder "simple-folder (2)" using the webUI
    Then file "collaborate-on-this.txt" should be listed on the webUI

  Scenario: deleting an entry on the shared-with-me page unshares from self
    Given user "user1" has shared folder "simple-folder" with user "user2"
    And user "user2" has logged in using the webUI
    When the user browses to the shared-with-me page using the webUI
    And the user deletes folder "simple-folder (2)" using the webUI
    And the user browses to the files page
    Then folder "simple-folder (2)" should not be listed on the webUI

  Scenario: deleting multiple entries on the shared-with-me page
    Given user "user1" has shared folder "simple-folder" with user "user2"
    And user "user1" has shared file "lorem.txt" with user "user2"
    And user "user2" has logged in using the webUI
    And the user browses to the shared-with-me page using the webUI
    When the user batch deletes these files using the webUI
      | name              |
      | simple-folder (2) |
      | lorem (2).txt     |
    Then the deleted elements should not be listed on the webUI

  Scenario: Try to share file and folder that used to exist but does not anymore
    Given user "user1" has logged in using the webUI
    And the following files have been deleted by user "user1"
      | name          |
      | lorem.txt     |
      | simple-folder |
    When the user shares file "lorem.txt" with user "User Two" as "Editor" using the webUI
    Then the error message with header 'Error while sharing.' should be displayed on the webUI
    And user "UserTwo" should not be listed in the collaborators list on the webUI
    When the user clears all error message from the webUI
    And the user shares folder "simple-folder" with user "User Two" as "Editor" using the webUI
    Then the error message with header 'Error while sharing.' should be displayed on the webUI
    And user "UserTwo" should not be listed in the collaborators list on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And folder "simple-folder" should not be listed on the webUI
    And as "user1" file "lorem.txt" should not exist
    And as "user1" folder "simple-folder" should not exist

  @issue-2060
  Scenario: sharing indicator of items inside a shared folder two levels down
    Given user "user1" has created folder "/simple-folder/simple-empty-folder/new-folder"
    And user "user1" has uploaded file with content "test" to "/simple-folder/simple-empty-folder/lorem.txt"
    And user "user1" has shared folder "simple-folder" with user "user2"
    When user "user1" has logged in using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName            | expectedIndicators |
      | simple-folder       | user-direct        |
    When the user opens folder "simple-folder" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName            | expectedIndicators |
      | simple-empty-folder | user-indirect      |
    When the user opens folder "simple-empty-folder" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName   | expectedIndicators |
      | new-folder | user-indirect      |
      | lorem.txt  | user-indirect      |

  @issue-2060
  Scenario: sharing indicator of items inside a re-shared folder
    Given user "user3" has been created with default attributes
    And user "user1" has shared folder "simple-folder" with user "user2"
    And user "user2" has shared folder "simple-folder (2)" with user "user3"
    When user "user2" has logged in using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName            | expectedIndicators |
      | simple-folder (2)   | user-direct        |
    When the user opens folder "simple-folder (2)" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName            | expectedIndicators |
      | simple-empty-folder | user-indirect      |
      | lorem.txt           | user-indirect      |

  @issue-2060
  Scenario: sharing indicator of items inside a re-shared subfolder
    Given user "user3" has been created with default attributes
    And user "user1" has shared folder "simple-folder" with user "user2"
    And user "user2" has shared folder "simple-folder (2)/simple-empty-folder" with user "user3"
    When user "user2" has logged in using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName            | expectedIndicators |
      | simple-folder (2)   | user-indirect      |
    When the user opens folder "simple-folder (2)" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName            | expectedIndicators |
      | simple-empty-folder | user-direct        |
      | lorem.txt           | user-indirect      |

  @issue-2060
  Scenario: sharing indicator of items inside an incoming shared folder
    Given user "user1" has shared folder "simple-folder" with user "user2"
    When user "user2" has logged in using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName            | expectedIndicators |
      | simple-folder (2)   | user-indirect      |
    When the user opens folder "simple-folder (2)" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName            | expectedIndicators |
      | simple-empty-folder | user-indirect      |
      | lorem.txt           | user-indirect      |

  @issue-2060
  Scenario: no sharing indicator of items inside a not shared folder
    Given user "user1" has shared file "/textfile0.txt" with user "user2"
    When user "user2" has logged in using the webUI
    Then the following resources should not have share indicators on the webUI
      | simple-folder       |
    When the user opens folder "simple-folder" using the webUI
    Then the following resources should not have share indicators on the webUI
      | simple-empty-folder |
      | lorem.txt           |

  @issue-2060
  Scenario: sharing indicator for file uploaded inside a shared folder
    Given user "user1" has shared folder "/simple-empty-folder" with user "user2"
    And user "user1" has logged in using the webUI
    When the user opens folder "simple-empty-folder" using the webUI
    And the user uploads file "new-lorem.txt" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators |
      | new-lorem.txt | user-indirect      |

  @issue-2060
  Scenario: sharing indicator for folder created inside a shared folder
    Given user "user1" has shared folder "/simple-empty-folder" with user "user2"
    And user "user1" has logged in using the webUI
    When the user opens folder "simple-empty-folder" using the webUI
    And the user creates a folder with the name "sub-folder" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators |
      | sub-folder    | user-indirect      |

  @issue-2939
  Scenario: sharing indicator for user shares stays up to date
    Given user "user3" has been created with default attributes
    And user "user4" has been created with default attributes
    When user "user1" has logged in using the webUI
    Then the following resources should not have share indicators on the webUI
      | simple-folder |
    When the user shares folder "simple-folder" with user "User Two" as "Viewer" using the webUI
    And the user shares folder "simple-folder" with user "User Three" as "Viewer" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators |
      | simple-folder | user-direct        |
    When the user opens folder "simple-folder" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators |
      | testimage.png | user-indirect      |
    When the user shares file "testimage.png" with user "User Four" as "Viewer" using the webUI
    # the indicator changes from user-indirect to user-direct to show the direct share
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators |
      | testimage.png | user-direct        |
    # removing the last collaborator reverts the indicator to user-indirect
    When the user deletes "User Four" as collaborator for the current file using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators |
      | testimage.png | user-indirect      |
    When the user opens folder "" directly on the webUI
    And the user opens the share dialog for folder "simple-folder" using the webUI
    And the user deletes "User Three" as collaborator for the current file using the webUI
    # because there is still another share left, the indicator stays
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators |
      | simple-folder | user-direct        |
    # deleting the last collaborator removes the indicator
    When the user deletes "User Two" as collaborator for the current file using the webUI
    Then the following resources should not have share indicators on the webUI
      | simple-folder |

  @issue-2897
  Scenario: sharing details of items inside a shared folder
    Given user "user3" has been created with default attributes
    And user "user1" has uploaded file with content "test" to "/simple-folder/lorem.txt"
    And user "user1" has shared folder "simple-folder" with user "user2"
    And user "user1" has logged in using the webUI
    And the user opens folder "simple-folder" using the webUI
    When the user opens the share dialog for folder "simple-empty-folder" using the webUI
    Then user "User Two" should be listed as "Editor" via "simple-folder" in the collaborators list on the webUI
    When the user opens the share dialog for file "lorem.txt" using the webUI
    Then user "User Two" should be listed as "Editor" via "simple-folder" in the collaborators list on the webUI

  @issue-2897
  Scenario: sharing details of items inside a re-shared folder
    Given user "user3" has been created with default attributes
    And user "user1" has uploaded file with content "test" to "/simple-folder/lorem.txt"
    And user "user1" has shared folder "simple-folder" with user "user2"
    And user "user2" has shared folder "simple-folder (2)" with user "user3"
    And user "user2" has logged in using the webUI
    And the user opens folder "simple-folder (2)" using the webUI
    When the user opens the share dialog for folder "simple-empty-folder" using the webUI
    Then user "User Three" should be listed as "Editor" via "simple-folder (2)" in the collaborators list on the webUI
    When the user opens the share dialog for file "lorem.txt" using the webUI
    Then user "User Three" should be listed as "Editor" via "simple-folder (2)" in the collaborators list on the webUI

  @issue-2897
  Scenario: sharing details of items inside a shared folder shared with multiple users
    Given user "user3" has been created with default attributes
    And user "user1" has created folder "/simple-folder/sub-folder"
    And user "user1" has uploaded file with content "test" to "/simple-folder/sub-folder/lorem.txt"
    And user "user1" has shared folder "simple-folder" with user "user2"
    And user "user1" has shared folder "simple-folder/sub-folder" with user "user3"
    And user "user1" has logged in using the webUI
    And the user opens folder "simple-folder/sub-folder" directly on the webUI
    When the user opens the share dialog for file "lorem.txt" using the webUI
    Then user "User Two" should be listed as "Editor" via "simple-folder" in the collaborators list on the webUI
    And user "User Three" should be listed as "Editor" via "sub-folder" in the collaborators list on the webUI

  @issue-2898
  Scenario: see resource owner in collaborators list for direct shares
    Given user "user1" has shared folder "simple-folder" with user "user2"
    And user "user2" has logged in using the webUI
    When the user opens the share dialog for folder "simple-folder (2)" using the webUI
    Then user "User One" should be listed as "Owner" in the collaborators list on the webUI

  @issue-2898
  Scenario: see resource owner in collaborators list for reshares
    Given user "user3" has been created with default attributes
    And user "user1" has shared folder "simple-folder" with user "user2"
    And user "user2" has shared folder "simple-folder (2)" with user "user3"
    And user "user3" has logged in using the webUI
    When the user opens the share dialog for folder "simple-folder (2)" using the webUI
    Then user "User One" should be listed as "Owner" reshared through "User Two" in the collaborators list on the webUI
    And the current collaborators list should have order "User One,User Three"

  @issue-2898
  Scenario: see resource owner of parent shares in collaborators list
    Given user "user3" has been created with default attributes
    And user "user1" has shared folder "simple-folder" with user "user2"
    And user "user2" has shared folder "simple-folder (2)" with user "user3"
    And user "user3" has logged in using the webUI
    And the user opens folder "simple-folder (2)" using the webUI
    When the user opens the share dialog for folder "simple-empty-folder" using the webUI
    Then user "User One" should be listed as "Owner" reshared through "User Two" via "simple-folder (2)" in the collaborators list on the webUI
    And the current collaborators list should have order "User One,User Three"

  @issue-2898
  Scenario: see resource owner for direct shares in "shared with me"
    Given user "user1" has shared folder "simple-folder" with user "user2"
    And user "user2" has logged in using the webUI
    When the user browses to the shared-with-me page
    And the user opens the share dialog for folder "simple-folder (2)" using the webUI
    Then user "User One" should be listed as "Owner" in the collaborators list on the webUI

  Scenario Outline: collaborators list contains additional info when enabled
    Given the setting "user_additional_info_field" of app "core" has been set to "<additional-info-field>"
    And user "user1" has shared folder "simple-folder" with user "user2"
    When user "user1" has logged in using the webUI
    And the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "User Two" should be listed with additional info "<additional-info-result>" in the collaborators list on the webUI
    Examples:
      | additional-info-field | additional-info-result |
      | id                    | (user2)                |
      | email                 | (user2@example.org)    |

  Scenario: collaborators list does not contain additional info when disabled
    Given the setting "user_additional_info_field" of app "core" has been set to ""
    And user "user1" has shared folder "simple-folder" with user "user2"
    When user "user1" has logged in using the webUI
    And the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "User Two" should be listed without additional info in the collaborators list on the webUI

  Scenario: collaborators list contains the current user when they are an owner
    Given user "user1" has shared folder "simple-folder" with user "user2"
    When user "user1" has logged in using the webUI
    And the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "User One" should be listed with additional info "(me)" in the collaborators list on the webUI

  Scenario: collaborators list contains the current user when they are a receiver of the resource
    Given user "user1" has shared folder "simple-folder" with user "user2"
    When user "user2" has logged in using the webUI
    And the user opens the share dialog for folder "simple-folder (2)" using the webUI
    Then user "User Two" should be listed with additional info "(me)" in the collaborators list on the webUI

  Scenario: current user should see the highest role in their entry in collaborators list
    Given group "grp1" has been created
    And user "user2" has been added to group "grp1"
    And user "user1" has shared folder "simple-folder" with user "user2" with "read" permission
    And user "user1" has shared folder "simple-folder" with group "grp1" with "read,update,create,delete" permissions
    When user "user2" has logged in using the webUI
    Then user "User Two" should be listed as "Editor" in the collaborators list for folder "simple-folder (2)" on the webUI

  Scenario: share a file with another internal user which should expire after 2 days
    Given user "user1" has logged in using the webUI
    When the user shares file "testimage.jpg" with user "User Two" which expires after 2 days using the webUI
    Then user "user2" should have received a share with target "testimage (2).jpg" and expiration date in 2 days

  Scenario: share a file with another internal user with default expiration date
    Given the setting "shareapi_default_expire_date_user_share" of app "core" has been set to "yes"
    And default expiration date for users is set to 3 days
    And user "user1" has logged in using the webUI
    When the user shares file "testimage.jpg" with user "User Two" using the webUI
    Then user "user2" should have received a share with target "testimage (2).jpg" and expiration date in 3 days