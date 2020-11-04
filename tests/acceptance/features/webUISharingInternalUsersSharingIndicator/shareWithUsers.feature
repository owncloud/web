@ocis-reva-issue-64
Feature: Sharing files and folders with internal users
  As a user
  I want to share files and folders with other users
  So that those users can access the files and folders

  Background:
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares"
    And these users have been created with default attributes:
      | username |
      | user1    |
      | user2    |

  @issue-2939 @issue-4193
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
    When the user opens the share dialog for file "testimage.png" using the webUI
    And the user deletes "User Four" as collaborator for the current file using the webUI
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
    When the user opens the share dialog for folder "simple-folder" using the webUI
    And the user deletes "User Two" as collaborator for the current file using the webUI
    Then the following resources should not have share indicators on the webUI
      | simple-folder |

  @issue-4167
  Scenario: sharing indicator of items inside a shared folder two levels down
    Given user "user1" has created folder "/simple-folder/simple-empty-folder/new-folder"
    And user "user1" has uploaded file with content "test" to "/simple-folder/simple-empty-folder/lorem.txt"
    And user "user1" has shared folder "simple-folder" with user "user2"
    And user "user2" has accepted the share "simple-folder" offered by user "user1"
    When user "user1" has logged in using the webUI
    And the user opens the share dialog for folder "simple-folder" using the webUI
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

  @issue-4167
  Scenario: sharing indicator of items inside a re-shared folder
    Given user "user3" has been created with default attributes
    And user "user1" has shared folder "simple-folder" with user "user2"
    And user "user2" has accepted the share "simple-folder" offered by user "user1"
    And user "user2" has shared folder "Shares/simple-folder" with user "user3"
    When user "user2" has logged in using the webUI
    And the user opens folder "Shares" using the webUI
    And the user opens the sharing sidebar for folder "simple-folder"
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators |
      | simple-folder | user-direct        |
    When the user opens folder "simple-folder" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName            | expectedIndicators |
      | simple-empty-folder | user-indirect      |
      | lorem.txt           | user-indirect      |

  @issue-4167 @issue-4171
  Scenario: sharing indicator of items inside a re-shared subfolder
    Given user "user3" has been created with default attributes
    And user "user1" has shared folder "simple-folder" with user "user2"
    And user "user2" has accepted the share "simple-folder" offered by user "user1"
    And user "user2" has shared folder "Shares/simple-folder/simple-empty-folder" with user "user3"
    When user "user2" has logged in using the webUI
    And the user opens folder "Shares" using the webUI
    And the user opens the sharing sidebar for folder "simple-folder"
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators |
      | simple-folder | user-indirect      |
    When the user opens folder "simple-folder" using the webUI
    And the user opens the sharing sidebar for file "lorem.txt"
    Then the following resources should have share indicators on the webUI
      | fileName            | expectedIndicators |
      | simple-empty-folder | user-direct        |
      | lorem.txt           | user-indirect      |

  @issue-2060
  @issue-4167
  @ocis-issue-891
  Scenario: sharing indicator of items inside an incoming shared folder
    Given user "user1" has shared folder "simple-folder" with user "user2"
    And user "user2" has accepted the share "simple-folder" offered by user "user1"
    When user "user2" has logged in using the webUI
    And the user opens folder "Shares" using the webUI
    And the user opens the sharing sidebar for folder "simple-folder"
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators |
      | simple-folder | user-indirect      |
    When the user opens folder "simple-folder" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName            | expectedIndicators |
      | simple-empty-folder | user-indirect      |
      | lorem.txt           | user-indirect      |

  @issue-2060 @issue-4172
  Scenario: no sharing indicator of items inside a not shared folder
    Given user "user1" has shared file "/textfile0.txt" with user "user2"
    And user "user2" has accepted the share "textfile0.txt" offered by user "user1"
    When user "user2" has logged in using the webUI
    Then the following resources should not have share indicators on the webUI
      | simple-folder |
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
      | fileName   | expectedIndicators |
      | sub-folder | user-indirect      |
