@notToImplementOnOCIS
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
    And user "Alice" has been created with default attributes and without skeleton files on remote server
    And user "Alice" has been created with default attributes and without skeleton files
    And user "Alice" has logged in using the webUI


  Scenario: test the single steps of sharing a folder to a remote server
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has created folder "simple-empty-folder"
    And user "Alice" has created file "simple-folder/lorem.txt"
    And the user has reloaded the current page of the webUI
    When the user shares folder "simple-folder" with remote user "Alice" as "Editor" using the webUI
    And the user shares folder "simple-empty-folder" with remote user "Alice" as "Editor" using the webUI
    Then as "Alice" folder "/simple-folder" should exist on remote server
    And as "Alice" file "/simple-folder/lorem.txt" should exist on remote server
    And as "Alice" folder "/simple-empty-folder" should exist on remote server

  @issue-2510
  Scenario: test the single steps of receiving a federation share
    Given user "Brian" has been created with default attributes and without skeleton files on remote server
    And user "Carol" has been created with default attributes and without skeleton files on remote server
    And user "Alice" has created folder "simple-folder" on remote server
    And user "Alice" has uploaded file "lorem.txt" to "simple-folder/lorem.txt" on remote server
    And user "Brian" has created folder "simple-empty-folder" on remote server
    And user "Carol" has uploaded file "lorem.txt" to "lorem.txt" on remote server
    And user "Alice" from remote server has shared "simple-folder" with user "Alice" from local server
    And user "Brian" from remote server has shared "simple-empty-folder" with user "Alice" from local server
    And user "Carol" from remote server has shared "lorem.txt" with user "Alice" from local server
    And the user has reloaded the current page of the webUI
    Then the user should see 3 notifications on the webUI with these details
      | title                                                              |
      | "Alice@%remote_backend_url%" shared "simple-folder" with you       |
      | "Brian@%remote_backend_url%" shared "simple-empty-folder" with you |
      | "Carol@%remote_backend_url%" shared "lorem.txt" with you           |
    When the user accepts all shares displayed in the notifications on the webUI
    And the user reloads the current page of the webUI
    Then file "lorem.txt" should be listed on the webUI
    And as "Alice" the content of "lorem.txt" should be the same as the content of local file "lorem.txt"
    And folder "simple-folder" should be listed on the webUI
    When the user opens folder "simple-folder" using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And as "Alice" the content of "simple-folder/lorem.txt" should be the same as the content of local file "lorem.txt"
    When the user browses to the shared-with-me page
    Then file "lorem.txt" should be listed on the webUI
    And folder "simple-folder" should be listed on the webUI
    And folder "simple-empty-folder" should be listed on the webUI


  Scenario: declining a federation share on the webUI
    Given user "Alice" has created file "lorem.txt" on remote server
    And user "Alice" from remote server has shared "/lorem.txt" with user "Alice" from local server
    And the user has reloaded the current page of the webUI
    When the user declines all shares displayed in the notifications on the webUI
    Then file "lorem.txt" should not be listed on the webUI
    When the user browses to the shared-with-me page
    And the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI

  @issue-2510
  Scenario: automatically accept a federation share when it is allowed by the config
    Given the setting "auto_accept_trusted" of app "federatedfilesharing" has been set to "yes"
    And user "Alice" has created folder "simple-folder" on remote server
    And user "Alice" has created file "simple-folder/lorem.txt" on remote server
    And user "Alice" from remote server has shared "simple-folder" with user "Alice" from local server
    When the user reloads the current page of the webUI
    Then folder "simple-folder" should be listed on the webUI
    When the user opens folder "simple-folder" directly on the webUI
    Then file "lorem.txt" should be listed on the webUI
    When the user browses to the shared-with-me page
    And the user reloads the current page of the webUI
    Then folder "simple-folder" should not be listed on the webUI


  Scenario: share a folder with an remote user with "Viewer" role
    Given user "Alice" has created folder "simple-empty-folder"
    And the user has reloaded the current page of the webUI
    When the user shares folder "simple-empty-folder" with remote user "Alice" as "Viewer" using the webUI
    Then user "Alice" should have shared a folder "simple-empty-folder" with these details:
      | field       | value                      |
      | uid_owner   | Alice                      |
      | share_with  | Alice@%remote_backend_url% |
      | item_type   | folder                     |
      | permissions | read, share                |
    And as "Alice" folder "simple-empty-folder" should exist on remote server

  @issue-3309
  Scenario: share a folder with an remote user and prohibit deleting - remote server shares - local server receives
    Given user "Alice" has created folder "simple-folder" on remote server
    And user "Alice" has created file "simple-folder/lorem.txt" on remote server
    And user "Alice" from remote server has shared "simple-folder" with user "Alice" from local server with "read" permissions
    When the user reloads the current page of the webUI
    And the user accepts all shares displayed in the notifications on the webUI
    And the user opens folder "simple-folder" directly on the webUI
    And the user reloads the current page of the webUI
    Then it should not be possible to delete file "lorem.txt" using the webUI

  @issue-3309
  Scenario: overwrite a file in a received share - remote server shares - local server receives
    Given the setting "auto_accept_trusted" of app "federatedfilesharing" has been set to "yes"
    And user "Alice" has created folder "simple-folder" on remote server
    And user "Alice" has created file "simple-folder/lorem.txt" on remote server
    And user "Alice" from remote server has shared "simple-folder" with user "Alice" from local server
    And the user reloads the current page of the webUI
    And the user opens folder "simple-folder" using the webUI
    When the user uploads overwriting file "lorem.txt" using the webUI
    Then as "Alice" the content of "simple-folder/lorem.txt" should be the same as the content of local file "lorem.txt"

  @issue-3309
  Scenario: upload a new file in a received share - remote server shares - local server receives
    Given the setting "auto_accept_trusted" of app "federatedfilesharing" has been set to "yes"
    And user "Alice" has created folder "simple-folder" on remote server
    And user "Alice" has created file "simple-folder/lorem.txt" on remote server
    And user "Alice" from remote server has shared "simple-folder" with user "Alice" from local server
    When the user reloads the current page of the webUI
    And the user opens folder "simple-folder" using the webUI
    And the user uploads file "new-lorem.txt" using the webUI
    Then as "Alice" file "simple-folder/new-lorem.txt" should exist on remote server

  @issue-3309
  Scenario: rename a file in a received share - remote server shares - local server receives
    Given the setting "auto_accept_trusted" of app "federatedfilesharing" has been set to "yes"
    And user "Alice" has created folder "simple-folder" on remote server
    And user "Alice" has created file "simple-folder/lorem.txt" on remote server
    And user "Alice" from remote server has shared "simple-folder" with user "Alice" from local server
    When the user reloads the current page of the webUI
    And the user opens folder "simple-folder" using the webUI
    And the user renames file "lorem.txt" to "new-lorem.txt" using the webUI
    Then as "Alice" file "simple-folder/new-lorem.txt" should exist on remote server
    But as "Alice" file "simple-folder/lorem.txt" should not exist on remote server

  @issue-3309
  Scenario: delete a file in a received share - remote server shares - local server receives
    Given the setting "auto_accept_trusted" of app "federatedfilesharing" has been set to "yes"
    And user "Alice" has created folder "simple-folder" on remote server
    And user "Alice" has created file "simple-folder/lorem.txt" on remote server
    And user "Alice" from remote server has shared "simple-folder" with user "Alice" from local server
    When the user reloads the current page of the webUI
    And the user opens folder "simple-folder" using the webUI
    And the user deletes file "lorem.txt" using the webUI
    Then as "Alice" file "simple-folder/lorem.txt" should not exist on remote server


  Scenario: unshare a federation share
    Given the setting "auto_accept_trusted" of app "federatedfilesharing" has been set to "yes"
    And user "Alice" has created file "lorem.txt" on remote server
    And user "Alice" from remote server has shared "lorem.txt" with user "Alice" from local server
    When the user reloads the current page of the webUI
    And the user deletes file "lorem.txt" using the webUI
    Then file "lorem.txt" should not be listed on the webUI
    When the user browses to the shared-with-me page
    Then file "lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist
    And as "Alice" file "lorem.txt" should exist on remote server

  @issue-2510
  Scenario: unshare a federation share from files page and check in the "shared-with-you" page
    Given user "Alice" has created file "lorem.txt" on remote server
    And user "Alice" from remote server has shared "/lorem.txt" with user "Alice" from local server
    And user "Alice" from server "LOCAL" has accepted the last pending share
    And the user has browsed to the shared-with-me page
    When the user deletes file "lorem.txt" using the webUI
    Then file "lorem.txt" should not be listed on the webUI
    When the user browses to the files page using the webUI
    Then file "lorem.txt" should not be listed on the webUI


  Scenario: test resharing folder with "Viewer" role
    Given the setting "auto_accept_trusted" of app "federatedfilesharing" has been set to "yes"
    And user "Brian" has been created with default attributes and without skeleton files
    And user "Alice" has created folder "simple-folder" on remote server
    And user "Alice" has created file "simple-folder/lorem.txt" on remote server
    And user "Alice" from remote server has shared "simple-folder" with user "Alice" from local server
    And the user has reloaded the current page of the webUI
    When the user shares folder "simple-folder" with user "Brian Murphy" as "Viewer" using the webUI
    Then as "Brian" file "simple-folder/lorem.txt" should exist
    And user "Brian" should have received a share with these details:
      | field       | value       |
      | uid_owner   | Alice       |
      | share_with  | Brian       |
      | item_type   | folder      |
      | permissions | read, share |


  Scenario: test resharing a federated server to remote again
    Given the setting "auto_accept_trusted" of app "federatedfilesharing" has been set to "yes"
    And user "Brian" has been created with default attributes and without skeleton files on remote server
    And user "Alice" has created folder "simple-folder" on remote server
    And user "Alice" from remote server has shared "simple-folder" with user "Alice" from local server with "read, share" permissions
    And the user has reloaded the current page of the webUI
    When the user shares folder "simple-folder" with remote user "Brian" as "Viewer" using the webUI
    Then user "Alice" should have shared a folder "simple-folder" with these details:
      | field       | value                      |
      | uid_owner   | Alice                      |
      | share_with  | Brian@%remote_backend_url% |
      | item_type   | folder                     |
      | permissions | read, share                |
    And as "Brian" folder "simple-folder" should exist on remote server


  Scenario: try resharing a folder with read-only permissions
    Given the setting "auto_accept_trusted" of app "federatedfilesharing" has been set to "yes"
    And user "Alice" has created folder "simple-folder" on remote server
    And user "Alice" from remote server has shared "simple-folder" with user "Alice" from local server with "read" permissions
    When the user reloads the current page of the webUI
    Then the user should not be able to share folder "simple-folder" using the webUI


  Scenario: test sharing long file names with federation share
    Given user "Alice" has uploaded file with content "secret" to "averylongfilenamefortestingthatfileswithlongfilenamescannotbeshared.txt"
    And the user has reloaded the current page of the webUI
    When the user shares file "averylongfilenamefortestingthatfileswithlongfilenamescannotbeshared.txt" with remote user "Alice" as "Viewer" using the webUI
    Then as "Alice" file "averylongfilenamefortestingthatfileswithlongfilenamescannotbeshared.txt" should exist on remote server


  Scenario: sharee should be able to access the files/folders inside other folder
    Given the setting "auto_accept_trusted" of app "federatedfilesharing" has been set to "yes"
    And user "Alice" has created folder "'single'quotes" on remote server
    And user "Alice" has created folder "'single'quotes/simple-empty-folder" on remote server
    And user "Alice" has uploaded file "lorem.txt" to "'single'quotes/lorem.txt" on remote server
    And user "Alice" has uploaded file "lorem.txt" to "'single'quotes/simple-empty-folder/lorem.txt" on remote server
    And user "Alice" from remote server has shared "'single'quotes" with user "Alice" from local server
    And the user has reloaded the current page of the webUI
    When the user opens folder "'single'quotes" using the webUI
    Then as "Alice" these resources should be listed on the webUI
      | entry_name          |
      | simple-empty-folder |
      | lorem.txt           |
    When the user opens folder "simple-empty-folder" using the webUI
    Then as "Alice" these resources should be listed on the webUI
      | entry_name     |
      | lorem.txt      |
    When the user downloads file "lorem.txt" using the webUI
    Then no message should be displayed on the webUI
    And as "Alice" the content of "'single'quotes/lorem.txt" should be the same as the content of local file "lorem.txt"
    And as "Alice" the content of "'single'quotes/simple-empty-folder/lorem.txt" should be the same as the content of local file "lorem.txt"


  Scenario: uploading a file inside a folder of a folder
    Given the setting "auto_accept_trusted" of app "federatedfilesharing" has been set to "yes"
    And user "Alice" has created folder "simple-folder" on remote server
    And user "Alice" has created folder "simple-folder/simple-empty-folder" on remote server
    And user "Alice" from remote server has shared "simple-folder" with user "Alice" from local server
    When the user opens folder "simple-folder/simple-empty-folder" directly on the webUI
    And the user uploads file "new-lorem.txt" using the webUI
    Then file "new-lorem.txt" should be listed on the webUI
    And as "Alice" file "simple-folder/simple-empty-folder/new-lorem.txt" should exist on remote server
    And as "Alice" file "simple-folder/simple-empty-folder/new-lorem.txt" should exist


  Scenario: rename a file in a folder inside a shared folder
    Given the setting "auto_accept_trusted" of app "federatedfilesharing" has been set to "yes"
    And user "Alice" has created folder "'single'quotes" on remote server
    And user "Alice" has created folder "'single'quotes/simple-empty-folder" on remote server
    And user "Alice" has created file "'single'quotes/simple-empty-folder/for-git-commit" on remote server
    And user "Alice" from remote server has shared "'single'quotes" with user "Alice" from local server
    When the user opens folder "/'single'quotes/simple-empty-folder" directly on the webUI
    And the user renames file "for-git-commit" to "not-for-git-commit" using the webUI
    Then file "for-git-commit" should not be listed on the webUI
    And as "Alice" file "'single'quotes/simple-empty-folder/for-git-commit" should not exist
    And as "Alice" file "'single'quotes/simple-empty-folder/for-git-commit" should not exist on remote server
    But file "not-for-git-commit" should be listed on the webUI
    And as "Alice" file "'single'quotes/simple-empty-folder/not-for-git-commit" should exist
    And as "Alice" file "'single'quotes/simple-empty-folder/not-for-git-commit" should exist on remote server


  Scenario: delete a file in a folder inside a shared folder
    Given the setting "auto_accept_trusted" of app "federatedfilesharing" has been set to "yes"
    And user "Alice" has created folder "'single'quotes" on remote server
    And user "Alice" has created folder "'single'quotes/simple-empty-folder" on remote server
    And user "Alice" has created file "'single'quotes/simple-empty-folder/for-git-commit" on remote server
    And user "Alice" from remote server has shared "'single'quotes" with user "Alice" from local server
    When the user opens folder "/'single'quotes/simple-empty-folder" directly on the webUI
    And the user deletes file "for-git-commit" using the webUI
    Then file "for-git-commit" should not be listed on the webUI
    And as "Alice" file "'single'quotes/simple-empty-folder/for-git-commit" should not exist
    And as "Alice" file "'single'quotes/simple-empty-folder/for-git-commit" should not exist on remote server

  @issue-2060
  Scenario: sharing indicator of items inside a shared folder two levels down
    Given user "Alice" has created folder "/simple-folder"
    And user "Alice" has created folder "/simple-folder/simple-empty-folder"
    And user "Alice" has created folder "/simple-folder/simple-empty-folder/new-folder"
    And user "Alice" has uploaded file with content "test" to "/simple-folder/simple-empty-folder/lorem.txt"
    And the user has reloaded the current page of the webUI
    When the user shares folder "simple-folder" with remote user "Alice" as "Editor" using the webUI
    And the user opens folder "/" directly on the webUI
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators |
      | simple-folder | user-direct        |
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
    Given user "Brian" has been created with default attributes and without skeleton files
    And user "Carol" has been created with default attributes and without skeleton files
    And user "Alice" has created folder "simple-folder"
    And user "Alice" has created folder "simple-folder/simple-empty-folder"
    And user "Alice" has created file "simple-folder/lorem.txt"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And the user re-logs in as "Brian" using the webUI
    And user "Brian" has shared folder "simple-folder" with user "Carol"
    And the user opens folder "simple-folder" using the webUI
    And the user shares folder "simple-empty-folder" with remote user "Alice" as "Editor" using the webUI
    When the user opens folder "/" directly on the webUI
    Then the following resources should have share indicators on the webUI
      | fileName          | expectedIndicators |
      | simple-folder     | user-direct        |
    When the user opens folder "simple-folder" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName            | expectedIndicators |
      | simple-empty-folder | user-direct        |
      | lorem.txt           | user-indirect      |

  @issue-2060
  Scenario: sharing indicator of items inside a re-shared subfolder
    Given user "Brian" has been created with default attributes and without skeleton files
    And user "Alice" has created folder "simple-folder"
    And user "Alice" has created folder "simple-folder/simple-empty-folder"
    And user "Alice" has created file "simple-folder/lorem.txt"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    When the user re-logs in as "Brian" using the webUI
    And the user opens folder "simple-folder" using the webUI
    And the user shares folder "simple-empty-folder" with remote user "Alice" as "Editor" using the webUI
    And the user opens folder "/" directly on the webUI
    Then the following resources should have share indicators on the webUI
      | fileName          | expectedIndicators |
      | simple-folder     | user-indirect      |
    When the user opens folder "simple-folder" directly on the webUI
    Then the following resources should have share indicators on the webUI
      | fileName            | expectedIndicators |
      | simple-empty-folder | user-direct        |
      | lorem.txt           | user-indirect      |

  @issue-2060
  Scenario: sharing indicator for file uploaded inside a shared folder
    Given user "Alice" has created folder "simple-empty-folder"
    And the user has reloaded the current page of the webUI
    When the user shares folder "simple-empty-folder" with remote user "Alice" as "Editor" using the webUI
    And the user opens folder "simple-empty-folder" using the webUI
    And the user uploads file "new-lorem.txt" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators |
      | new-lorem.txt | user-indirect      |

  @issue-2060
  Scenario: sharing indicator for folder created inside a shared folder
    Given user "Alice" has created folder "simple-empty-folder"
    And the user has reloaded the current page of the webUI
    When the user shares folder "simple-empty-folder" with remote user "Alice" as "Editor" using the webUI
    And the user opens folder "simple-empty-folder" using the webUI
    And the user creates a folder with the name "sub-folder" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName   | expectedIndicators |
      | sub-folder | user-indirect      |

  @issue-2939
  Scenario: sharing indicator for federated shares stays up to date
    Given user "Alice" has created folder "simple-folder"
    And the user has reloaded the current page of the webUI
    When the user shares folder "simple-folder" with remote user "Alice" as "Editor" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators |
      | simple-folder | user-direct        |
    When the user opens the share dialog for folder "simple-folder" using the webUI
    And the user deletes "Alice" as remote collaborator for the current file using the webUI
    Then the following resources should not have share indicators on the webUI
      | simple-folder |

  @issue-2897
  Scenario: sharing details inside folder shared using federated sharing
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has created folder "/simple-folder/sub-folder"
    And user "Alice" has uploaded file with content "test" to "/simple-folder/textfile.txt"
    And the user has reloaded the current page of the webUI
    When the user shares folder "simple-folder" with remote user "Alice" as "Editor" using the webUI
    And the user opens folder "simple-folder" using the webUI
    And the user opens the share dialog for folder "sub-folder" using the webUI
    Then remote user "Alice" should be listed as "Editor" via "simple-folder" in the collaborators list on the webUI
    When the user opens the share dialog for file "textfile.txt" using the webUI
    Then remote user "Alice" should be listed as "Editor" via "simple-folder" in the collaborators list on the webUI

  @issue-2897
  Scenario: sharing details of items inside a shared folder shared with local user and federated user
    Given user "Brian" has been created with default attributes and without skeleton files
    And user "Alice" has created folder "simple-folder"
    And user "Alice" has created folder "/simple-folder/sub-folder"
    And user "Alice" has uploaded file with content "test" to "/simple-folder/sub-folder/textfile.txt"
    And user "Alice" has shared folder "simple-folder" with user "Alice@%remote_backend_url%" with "all" permissions
    And user "Alice" has shared folder "simple-folder/sub-folder" with user "Brian"
    And the user has reloaded the current page of the webUI
    When the user opens folder "simple-folder/sub-folder" directly on the webUI
    And the user opens the share dialog for file "textfile.txt" using the webUI
    Then remote user "Alice" should be listed as "Editor" via "simple-folder" in the collaborators list on the webUI
    And user "Brian Murphy" should be listed as "Editor" via "sub-folder" in the collaborators list on the webUI
