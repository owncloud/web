@notToImplementOnOCIS @disablePreviews
Feature: Sharing files and folders with internal groups
  As a user
  I want to share files and folders with groups
  So that those groups can access the files and folders

  Background:
    Given these users have been created with default attributes and without skeleton files in the server:
      | username |
      | Alice    |
      | Brian    |
      | Carol    |
    And these groups have been created in the server:
      | groupname |
      | grp1      |
      | grp11     |
    And user "Alice" has been added to group "grp1" in the server
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has created folder "simple-folder" in the server

  @issue-2060
  Scenario: sharing indicator of items inside a shared folder two levels down
    Given user "Alice" has created folder "simple-folder/simple-empty-folder" in the server
    And user "Alice" has uploaded file with content "test" to "/simple-folder/lorem.txt" in the server
    And user "Alice" has uploaded file with content "test" to "/simple-folder/simple-empty-folder/inside.txt" in the server
    And user "Alice" has shared folder "simple-folder" with group "grp1" in the server
    When user "Alice" has logged in using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators |
      | simple-folder | user-direct        |
    When the user opens folder "simple-folder" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName            | expectedIndicators |
      | simple-empty-folder | user-indirect      |
      | lorem.txt           | user-indirect      |
    When the user opens folder "simple-empty-folder" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName   | expectedIndicators |
      | inside.txt | user-indirect      |

  @issue-2060
  Scenario: sharing indicator of items inside a re-shared folder
    Given user "Alice" has created folder "simple-folder/simple-empty-folder" in the server
    And user "Alice" has created file "/simple-folder/lorem.txt" in the server
    And user "Alice" has shared folder "simple-folder" with user "Brian" in the server
    And user "Brian" has shared folder "simple-folder" with group "grp1" in the server
    When user "Brian" has logged in using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName          | expectedIndicators |
      | simple-folder     | user-direct        |
    When the user opens folder "simple-folder" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName            | expectedIndicators |
      | simple-empty-folder | user-indirect      |
      | lorem.txt           | user-indirect      |

  @issue-2060
  Scenario: sharing indicator of items inside a re-shared subfolder
    Given user "Alice" has created folder "simple-folder/simple-empty-folder" in the server
    And user "Alice" has created file "/simple-folder/lorem.txt" in the server
    And user "Alice" has shared folder "simple-folder" with user "Brian" in the server
    And user "Brian" has shared folder "simple-folder/simple-empty-folder" with group "grp1" in the server
    When user "Brian" has logged in using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName          | expectedIndicators |
      | simple-folder     | user-indirect      |
    When the user opens folder "simple-folder" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName            | expectedIndicators |
      | simple-empty-folder | user-direct        |
      | lorem.txt           | user-indirect      |

  @issue-2060
  Scenario: sharing indicator of items inside an incoming shared folder
    Given user "Alice" has created folder "simple-folder/simple-empty-folder" in the server
    And user "Alice" has created file "/simple-folder/lorem.txt" in the server
    And user "Alice" has shared folder "simple-folder" with group "grp1" in the server
    When user "Brian" has logged in using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName          | expectedIndicators |
      | simple-folder     | user-indirect      |
    When the user opens folder "simple-folder" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName            | expectedIndicators |
      | simple-empty-folder | user-indirect      |
      | lorem.txt           | user-indirect      |

  @issue-2060
  Scenario: no sharing indicator of items inside a not shared folder
    Given user "Brian" has created folder "simple-folder" in the server
    And user "Brian" has created folder "simple-folder/simple-empty-folder" in the server
    And user "Brian" has created file "/simple-folder/lorem.txt" in the server
    And user "Alice" has created file "textfile0.txt" in the server
    And user "Alice" has shared file "/textfile0.txt" with group "grp1" in the server
    When user "Brian" has logged in using the webUI
    Then the following resources should not have share indicators on the webUI
      | simple-folder |
    When the user opens folder "simple-folder" using the webUI
    Then the following resources should not have share indicators on the webUI
      | simple-empty-folder |
      | lorem.txt           |

  @issue-2060
  Scenario: sharing indicator for file uploaded inside a shared folder
    Given user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has logged in using the webUI
    When the user opens folder "simple-folder" using the webUI
    And the user uploads file "new-lorem.txt" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators |
      | new-lorem.txt | user-indirect      |

  @issue-2060
  Scenario: sharing indicator for folder created inside a shared folder
    Given user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has logged in using the webUI
    When the user opens folder "simple-folder" using the webUI
    And the user creates a folder with the name "sub-folder" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName   | expectedIndicators |
      | sub-folder | user-indirect      |

  @issue-2939
  Scenario: sharing indicator for group shares stays up to date
    Given these groups have been created in the server:
      | groupname |
      | grp2      |
      | grp3      |
      | grp4      |
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testavatar.png" in the server
    When user "Alice" has logged in using the webUI
    Then the following resources should not have share indicators on the webUI
      | simple-folder |
    When the user shares folder "simple-folder" with group "grp2" as "Viewer" using the webUI
    And the user shares folder "simple-folder" with group "grp3" as "Viewer" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators |
      | simple-folder | user-direct        |
    When the user opens folder "simple-folder" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName       | expectedIndicators |
      | testavatar.png | user-indirect      |
    When the user shares file "testavatar.png" with group "grp4" as "Viewer" using the webUI
    # the indicator changes from user-indirect to user-direct to show the direct share
    Then the following resources should have share indicators on the webUI
      | fileName       | expectedIndicators |
      | testavatar.png | user-direct        |
    # removing the last collaborator reverts the indicator to user-indirect
    When the user opens the share dialog for file "testavatar.png" using the webUI
    And the user deletes "grp4" as collaborator for the current file using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName       | expectedIndicators |
      | testavatar.png | user-indirect      |
    When the user opens folder "" directly on the webUI
    And the user opens the share dialog for folder "simple-folder" using the webUI
    And the user deletes "grp3" as collaborator for the current file using the webUI
    # because there is still another share left, the indicator stays
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators |
      | simple-folder | user-direct        |
    # deleting the last collaborator removes the indicator
    When the user opens the share dialog for folder "simple-folder" using the webUI
    And the user deletes "grp2" as collaborator for the current file using the webUI
    Then the following resources should not have share indicators on the webUI
      | simple-folder |
