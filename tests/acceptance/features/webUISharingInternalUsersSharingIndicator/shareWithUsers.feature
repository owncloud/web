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
    And user "Alice" has created folder "simple-folder"

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files
    And user "David" has been created with default attributes and without skeleton files
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png"
    When user "Alice" has logged in using the webUI
    Then the following resources should not have share indicators on the webUI
      | simple-folder |
    When the user shares folder "simple-folder" with user "Brian Murphy" as "Viewer" using the webUI
    And the user shares folder "simple-folder" with user "Carol King" as "Viewer" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators |
      | simple-folder | user-direct        |
    When the user opens folder "simple-folder" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators |
      | testimage.png | user-indirect      |
    When the user shares file "testimage.png" with user "David Lopez" as "Viewer" using the webUI
    # the indicator changes from user-indirect to user-direct to show the direct share
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators |
      | testimage.png | user-direct        |
    # removing the last collaborator reverts the indicator to user-indirect
    When the user opens the share dialog for file "testimage.png" using the webUI
    And the user deletes "David Lopez" as collaborator for the current file using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators |
      | testimage.png | user-indirect      |
    When the user opens folder "" directly on the webUI
    And the user opens the share dialog for folder "simple-folder" using the webUI
    And the user deletes "Carol King" as collaborator for the current file using the webUI
    # because there is still another share left, the indicator stays
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators |
      | simple-folder | user-direct        |
    # deleting the last collaborator removes the indicator
    When the user opens the share dialog for folder "simple-folder" using the webUI
    And the user deletes "Brian Murphy" as collaborator for the current file using the webUI
    Then the following resources should not have share indicators on the webUI
      | simple-folder |

  @issue-4167
  Scenario: sharing indicator of items inside a shared folder two levels down
    Given user "Alice" has created folder "/simple-folder/simple-empty-folder"
    And user "Alice" has created folder "/simple-folder/simple-empty-folder/new-folder"
    And user "Alice" has uploaded file with content "test" to "/simple-folder/simple-empty-folder/lorem.txt"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has accepted the share "Shares/simple-folder" offered by user "Alice"
    When user "Alice" has logged in using the webUI
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
    Given user "Carol" has been created with default attributes and without skeleton files
    And user "Alice" has created folder "/simple-folder/simple-empty-folder"
    And user "Alice" has created file "/simple-folder/lorem.txt"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has accepted the share "Shares/simple-folder" offered by user "Alice"
    And user "Brian" has shared folder "Shares/simple-folder" with user "Carol"
    When user "Brian" has logged in using the webUI
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

  @issue-4167
  Scenario: sharing indicator of items inside a re-shared subfolder
    Given user "Carol" has been created with default attributes and without skeleton files
    And user "Alice" has created folder "/simple-folder/simple-empty-folder"
    And user "Alice" has created file "/simple-folder/lorem.txt"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has accepted the share "Shares/simple-folder" offered by user "Alice"
    And user "Brian" has shared folder "Shares/simple-folder/simple-empty-folder" with user "Carol"
    When user "Brian" has logged in using the webUI
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

  @issue-2060 @issue-4167 @ocis-issue-891
  Scenario: sharing indicator of items inside an incoming shared folder
    Given user "Alice" has created folder "/simple-folder/simple-empty-folder"
    And user "Alice" has created file "/simple-folder/lorem.txt"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has accepted the share "Shares/simple-folder" offered by user "Alice"
    When user "Brian" has logged in using the webUI
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
    Given user "Brian" has created folder "simple-folder"
    And user "Brian" has created folder "simple-folder/simple-empty-folder"
    And user "Brian" has created file "/simple-folder/lorem.txt"
    And user "Alice" has created file "textfile0.txt"
    And user "Alice" has shared file "/textfile0.txt" with user "Brian"
    And user "Brian" has accepted the share "Shares/textfile0.txt" offered by user "Alice"
    When user "Brian" has logged in using the webUI
    Then the following resources should not have share indicators on the webUI
      | simple-folder |
    When the user opens folder "simple-folder" using the webUI
    Then the following resources should not have share indicators on the webUI
      | simple-empty-folder |
      | lorem.txt           |

  @issue-2060
  Scenario: sharing indicator for file uploaded inside a shared folder
    Given user "Alice" has shared folder "/simple-folder" with user "Brian"
    And user "Alice" has logged in using the webUI
    When the user opens folder "simple-folder" using the webUI
    And the user uploads file "new-lorem.txt" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators |
      | new-lorem.txt | user-indirect      |

  @issue-2060
  Scenario: sharing indicator for folder created inside a shared folder
    Given user "Alice" has shared folder "/simple-folder" with user "Brian"
    And user "Alice" has logged in using the webUI
    When the user opens folder "simple-folder" using the webUI
    And the user creates a folder with the name "sub-folder" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName   | expectedIndicators |
      | sub-folder | user-indirect      |
