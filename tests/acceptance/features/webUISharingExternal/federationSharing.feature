Feature: Federation Sharing - sharing with users on other cloud storages
  As a user
  I want to share files with any users on other cloud storages
  So that other users have access to these files

  Background:
    Given app "notifications" has been enabled
    And the setting "auto_accept_trusted" of app "federatedfilesharing" has been set to "yes" on remote server
    And the setting "auto_accept_trusted" of app "federatedfilesharing" has been set to "no"
    And server "%remote_backend_url%" has been added as trusted server
    And server "%backend_url%" has been added as trusted server
    And server "%backend_url%" has been added as trusted server on remote server
    And server "%remote_backend_url%" has been added as trusted server on remote server
    And user "user1" has been created with default attributes on remote server
    And user "user1" has been created with default attributes
    And user "user1" has logged in using the webUI

  Scenario: test the single steps of sharing a folder to a remote server
    When the user shares folder "simple-folder" with remote user "user1" as "Editor" using the webUI
    And the user shares folder "simple-empty-folder" with remote user "user1" as "Editor" using the webUI
    Then as "user1" folder "/simple-folder (2)" should exist on remote server
    And as "user1" file "/simple-folder (2)/lorem.txt" should exist on remote server
    And as "user1" folder "/simple-empty-folder (2)" should exist on remote server

  @issue-2510 @yetToImplement
  Scenario: test the single steps of receiving a federation share
    Given user "user2" has been created with default attributes on remote server
    And user "user3" has been created with default attributes on remote server
    And user "user1" from remote server has shared "simple-folder" with user "user1" from local server
    And user "user2" from remote server has shared "simple-empty-folder" with user "user1" from local server
    And user "user3" from remote server has shared "lorem.txt" with user "user1" from local server
    And the user has reloaded the current page of the webUI
    Then the user should see 3 notifications on the webUI with these details
      | title                                                              |
      | "user1@%remote_backend_url%" shared "simple-folder" with you       |
      | "user2@%remote_backend_url%" shared "simple-empty-folder" with you |
      | "user3@%remote_backend_url%" shared "lorem.txt" with you           |
    When the user accepts all shares displayed in the notifications on the webUI
    And the user reloads the current page of the webUI
    Then file "lorem (2).txt" should be listed on the webUI
    And as "user1" the content of "lorem (2).txt" should be the same as the original "lorem.txt"
    And folder "simple-folder (2)" should be listed on the webUI
    And folder "simple-folder (2)" should be listed on the webUI
    When the user opens folder "simple-folder (2)" using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And as "user1" the content of "simple-folder (2)/lorem.txt" should be the same as the original "simple-folder/lorem.txt"
    #    When the user browses to the shared-with-me page
    #    Then file "lorem (2).txt" should be listed on the webUI
    #    And folder "simple-folder (2)" should be listed on the webUI
    #    And folder "simple-empty-folder (2)" should be listed on the webUI

  Scenario: declining a federation share on the webUI
    Given user "user1" from remote server has shared "/lorem.txt" with user "user1" from local server
    And the user has reloaded the current page of the webUI
    When the user declines all shares displayed in the notifications on the webUI
    Then file "lorem (2).txt" should not be listed on the webUI
    When the user browses to the shared-with-me page
    And the user reloads the current page of the webUI
    Then file "lorem (2).txt" should not be listed on the webUI

  @issue-2510 @yetToImplement
  Scenario: automatically accept a federation share when it is allowed by the config
    Given the setting "auto_accept_trusted" of app "federatedfilesharing" has been set to "yes"
    And user "user1" from remote server has shared "simple-folder" with user "user1" from local server
    When the user reloads the current page of the webUI
    Then folder "simple-folder" should be listed on the webUI
    When the user opens folder "simple-folder" directly on the webUI
    Then file "lorem.txt" should be listed on the webUI
    When the user browses to the shared-with-me page
    And the user reloads the current page of the webUI
    Then folder "simple-folder" should not be listed on the webUI

  Scenario: share a folder with an remote user with "Viewer" role
    When the user shares folder "simple-empty-folder" with remote user "user1" as "Viewer" using the webUI
    Then user "user1" should have shared a folder "simple-empty-folder" with these details:
      | field       | value                      |
      | uid_owner   | user1                      |
      | share_with  | user1@%remote_backend_url% |
      | item_type   | folder                     |
      | permissions | read                       |
    And as "user1" folder "simple-empty-folder" should exist on remote server

  Scenario: share a folder with an remote user and prohibit deleting - remote server shares - local server receives
    Given user "user1" from remote server has shared "simple-folder" with user "user1" from local server with "read" permissions
    When the user reloads the current page of the webUI
    And the user accepts all shares displayed in the notifications on the webUI
    And the user opens folder "simple-folder (2)" directly on the webUI
    Then it should not be possible to delete file "lorem.txt" using the webUI

  Scenario: overwrite a file in a received share - remote server shares - local server receives
    Given the setting "auto_accept_trusted" of app "federatedfilesharing" has been set to "yes"
    And user "user1" from remote server has shared "simple-folder" with user "user1" from local server
    And the user opens folder "simple-folder (2)" directly on the webUI
    When the user uploads overwriting file "lorem.txt" using the webUI
    Then as "user1" the content of "simple-folder (2)/lorem.txt" should be the same as the local "lorem.txt"

  Scenario: upload a new file in a received share - remote server shares - local server receives
    Given the setting "auto_accept_trusted" of app "federatedfilesharing" has been set to "yes"
    And user "user1" from remote server has shared "simple-folder" with user "user1" from local server
    When the user opens folder "simple-folder (2)" directly on the webUI
    And the user uploads file "new-lorem.txt" using the webUI
    Then as "user1" file "simple-folder/new-lorem.txt" should exist on remote server

  Scenario: rename a file in a received share - remote server shares - local server receives
    Given the setting "auto_accept_trusted" of app "federatedfilesharing" has been set to "yes"
    And user "user1" from remote server has shared "simple-folder" with user "user1" from local server
    When the user opens folder "simple-folder (2)" directly on the webUI
    And the user renames file "lorem.txt" to "new-lorem.txt" using the webUI
    Then as "user1" file "simple-folder/new-lorem.txt" should exist on remote server
    But as "user1" file "simple-folder/lorem.txt" should not exist on remote server

  Scenario: delete a file in a received share - remote server shares - local server receives
    Given the setting "auto_accept_trusted" of app "federatedfilesharing" has been set to "yes"
    And user "user1" from remote server has shared "simple-folder" with user "user1" from local server
    When the user opens folder "simple-folder (2)" directly on the webUI
    And the user deletes file "lorem.txt" using the webUI
    Then as "user1" file "simple-folder/lorem.txt" should not exist on remote server

  Scenario: unshare a federation share
    Given the setting "auto_accept_trusted" of app "federatedfilesharing" has been set to "yes"
    And user "user1" from remote server has shared "lorem.txt" with user "user1" from local server
    When the user reloads the current page of the webUI
    And the user deletes file "lorem (2).txt" using the webUI
    Then file "lorem (2).txt" should not be listed on the webUI
    And as "user1" file "lorem (2).txt" should not exist
    And as "user1" file "lorem.txt" should exist on remote server

  @issue-2510 @skip @yetToImplement
  Scenario: unshare a federation share from "share-with-you" page
    Given user "user1" from server "REMOTE" has shared "/lorem.txt" with user "user1" from server "LOCAL"
    And user "user1" from server "LOCAL" has accepted the last pending share
    And the user has reloaded the current page of the webUI
    When the user unshares file "lorem (2).txt" using the webUI
    Then file "lorem (2).txt" should not be listed on the webUI
    And file "lorem (2).txt" should not be listed in the files page on the webUI

  Scenario: test resharing folder with "Viewer" role
    Given the setting "auto_accept_trusted" of app "federatedfilesharing" has been set to "yes"
    And user "user2" has been created with default attributes
    And user "user1" from remote server has shared "simple-folder" with user "user1" from local server
    And the user has reloaded the current page of the webUI
    When the user shares folder "simple-folder (2)" with user "User Two" as "Viewer" using the webUI
    Then as "user2" folder "simple-folder (2)/lorem.txt" should exist
    And user "user2" should have received a share with these details:
      | field       | value                      |
      | uid_owner   | user1                      |
      | share_with  | user2                      |
      | item_type   | folder                     |
      | permissions | read                       |

  Scenario: test resharing a federated server to remote again
    Given the setting "auto_accept_trusted" of app "federatedfilesharing" has been set to "yes"
    And user "user2" has been created with default attributes on remote server
    And user "user1" from remote server has shared "simple-folder" with user "user1" from local server with "read, share" permissions
    And the user has reloaded the current page of the webUI
    When the user shares folder "simple-folder (2)" with remote user "user2" as "Viewer" using the webUI
    Then user "user1" should have shared a folder "simple-folder (2)" with these details:
      | field       | value                      |
      | uid_owner   | user1                      |
      | share_with  | user2@%remote_backend_url% |
      | item_type   | folder                     |
      | permissions | read                       |
    And as "user2" folder "simple-folder (2)" should exist on remote server

  Scenario: try resharing a folder with read-only permissions
    Given the setting "auto_accept_trusted" of app "federatedfilesharing" has been set to "yes"
    And user "user1" from remote server has shared "simple-folder" with user "user1" from local server with "read" permissions
    When the user reloads the current page of the webUI
    Then the user should not be able to share folder "simple-folder (2)" using the webUI

  Scenario: test sharing long file names with federation share
    When user "user1" has uploaded file with content "secret" to "averylongfilenamefortestingthatfileswithlongfilenamescannotbeshared.txt"
    And the user has reloaded the current page of the webUI
    When the user shares file "averylongfilenamefortestingthatfileswithlongfilenamescannotbeshared.txt" with remote user "user1" as "Viewer" using the webUI
    Then as "user1" file "averylongfilenamefortestingthatfileswithlongfilenamescannotbeshared.txt" should exist on remote server

  Scenario: sharee should be able to access the files/folders inside other folder
    Given the setting "auto_accept_trusted" of app "federatedfilesharing" has been set to "yes"
    And user "user1" from remote server has shared "'single'quotes" with user "user1" from local server
    And the user has reloaded the current page of the webUI
    When the user opens folder "'single'quotes (2)" using the webUI
    Then as "user1" these resources should be listed on the webUI
     | entry_name          |
     | simple-empty-folder |
     | for-git-commit      |
     | lorem.txt           |
    When the user opens folder "simple-empty-folder" using the webUI
    Then as "user1" these resources should be listed on the webUI
     | entry_name     |
     | for-git-commit |
    When the user downloads file "for-git-commit" using the webUI
    Then no message should be displayed on the webUI
    And as "user1" the content of "'single'quotes (2)/lorem.txt" should be the same as the original "'single'quotes/lorem.txt"
    And as "user1" the content of "'single'quotes (2)/simple-empty-folder/for-git-commit" should be the same as the original "'single'quotes/simple-empty-folder/for-git-commit"

  Scenario: uploading a file inside a folder of a folder
    Given the setting "auto_accept_trusted" of app "federatedfilesharing" has been set to "yes"
    And user "user1" from remote server has shared "simple-folder" with user "user1" from local server
    When the user opens folder "simple-folder (2)/simple-empty-folder" directly on the webUI
    And the user uploads file "new-lorem.txt" using the webUI
    Then file "new-lorem.txt" should be listed on the webUI
    And as "user1" file "simple-folder/simple-empty-folder/new-lorem.txt" should exist on remote server
    And as "user1" file "simple-folder (2)/simple-empty-folder/new-lorem.txt" should exist

  Scenario: rename a file in a folder inside a shared folder
    Given the setting "auto_accept_trusted" of app "federatedfilesharing" has been set to "yes"
    And user "user1" from remote server has shared "'single'quotes" with user "user1" from local server
    When the user opens folder "/'single'quotes (2)/simple-empty-folder" directly on the webUI
    And the user renames file "for-git-commit" to "not-for-git-commit" using the webUI
    Then file "for-git-commit" should not be listed on the webUI
    And as "user1" file "'single'quotes (2)/simple-empty-folder/for-git-commit" should not exist
    And as "user1" file "'single'quotes/simple-empty-folder/for-git-commit" should not exist on remote server
    But file "not-for-git-commit" should be listed on the webUI
    And as "user1" file "'single'quotes (2)/simple-empty-folder/not-for-git-commit" should exist
    And as "user1" file "'single'quotes/simple-empty-folder/not-for-git-commit" should exist on remote server

  Scenario: delete a file in a folder inside a shared folder
    Given the setting "auto_accept_trusted" of app "federatedfilesharing" has been set to "yes"
    And user "user1" from remote server has shared "'single'quotes" with user "user1" from local server
    When the user opens folder "/'single'quotes (2)/simple-empty-folder" directly on the webUI
    And the user deletes file "for-git-commit" using the webUI
    Then file "for-git-commit" should not be listed on the webUI
    And as "user1" file "'single'quotes (2)/simple-empty-folder/for-git-commit" should not exist
    And as "user1" file "'single'quotes/simple-empty-folder/for-git-commit" should not exist on remote server

  @issue-2060
  Scenario: sharing indicator of items inside a shared folder two levels down
    Given user "user1" has created folder "/simple-folder/simple-empty-folder/new-folder"
    And user "user1" has uploaded file with content "test" to "/simple-folder/simple-empty-folder/lorem.txt"
    And the user shares folder "simple-folder" with remote user "user1" as "Editor" using the webUI
    When the user opens folder "/" directly on the webUI
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
    Given user "user2" has been created with default attributes
    And user "user3" has been created with default attributes
    And user "user1" has shared folder "simple-folder" with user "user2"
    And the user re-logs in as "user2" using the webUI
    And user "user2" has shared folder "simple-folder (2)" with user "user3"
    And the user opens folder "simple-folder (2)" using the webUI
    And the user shares folder "simple-empty-folder" with remote user "user1" as "Editor" using the webUI
    When the user opens folder "/" directly on the webUI
    Then the following resources should have share indicators on the webUI
      | fileName            | expectedIndicators |
      | simple-folder (2)   | user-direct        |
    When the user opens folder "simple-folder (2)" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName            | expectedIndicators |
      | simple-empty-folder | user-direct        |
      | lorem.txt           | user-indirect      |

  @issue-2060
  Scenario: sharing indicator of items inside a re-shared subfolder
    Given user "user2" has been created with default attributes
    And user "user1" has shared folder "simple-folder" with user "user2"
    And the user re-logs in as "user2" using the webUI
    And the user opens folder "simple-folder (2)" using the webUI
    And the user shares folder "simple-empty-folder" with remote user "user1" as "Editor" using the webUI
    When the user opens folder "/" directly on the webUI
    Then the following resources should have share indicators on the webUI
      | fileName            | expectedIndicators |
      | simple-folder (2)   | user-indirect      |
    When the user opens folder "simple-folder (2)" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName            | expectedIndicators |
      | simple-empty-folder | user-direct        |
      | lorem.txt           | user-indirect      |

  @issue-2060
  Scenario: sharing indicator for file uploaded inside a shared folder
    Given the user shares folder "simple-empty-folder" with remote user "user1" as "Editor" using the webUI
    When the user opens folder "simple-empty-folder" using the webUI
    And the user uploads file "new-lorem.txt" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators |
      | new-lorem.txt | user-indirect      |

  @issue-2060
  Scenario: sharing indicator for folder created inside a shared folder
    Given the user shares folder "simple-empty-folder" with remote user "user1" as "Editor" using the webUI
    When the user opens folder "simple-empty-folder" using the webUI
    And the user creates a folder with the name "sub-folder" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators |
      | sub-folder    | user-indirect      |

  @issue-2939
  Scenario: sharing indicator for federated shares stays up to date
    When the user shares folder "simple-folder" with remote user "user1" as "Editor" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators |
      | simple-folder | user-direct        |
    When the user deletes "user1" as remote collaborator for the current file using the webUI
    Then the following resources should not have share indicators on the webUI
      | simple-folder |

  @issue-2897
  Scenario: sharing details inside folder shared using federated sharing
    Given user "user1" has created folder "/simple-folder/sub-folder"
    And user "user1" has uploaded file with content "test" to "/simple-folder/textfile.txt"
    And the user shares folder "simple-folder" with remote user "user1" as "Editor" using the webUI
    When the user opens folder "simple-folder" using the webUI
    And the user opens the share dialog for folder "sub-folder" using the webUI
    Then remote user "user1" should be listed as "Editor" via "simple-folder" in the collaborators list on the webUI
    When the user opens the share dialog for file "textfile.txt" using the webUI
    Then remote user "user1" should be listed as "Editor" via "simple-folder" in the collaborators list on the webUI

  @issue-2897
  Scenario: sharing details of items inside a shared folder shared with local user and federated user
    Given user "user2" has been created with default attributes
    And user "user1" has created folder "/simple-folder/sub-folder"
    And user "user1" has uploaded file with content "test" to "/simple-folder/sub-folder/textfile.txt"
    And the user shares folder "simple-folder" with remote user "user1" as "Editor" using the webUI
    And user "user1" has shared folder "simple-folder/sub-folder" with user "user2"
    When the user opens folder "simple-folder/sub-folder" directly on the webUI
    And the user opens the share dialog for file "textfile.txt" using the webUI
    Then remote user "user1" should be listed as "Editor" via "simple-folder" in the collaborators list on the webUI
    And user "User Two" should be listed as "Editor" via "sub-folder" in the collaborators list on the webUI
