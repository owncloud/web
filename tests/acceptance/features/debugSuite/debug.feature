@disablePreviews
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
    And user "Alice" has created folder "simple-folder" in the server

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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


  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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


  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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


  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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


  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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


  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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


  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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


  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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

  @issue-4310
  Scenario: sharing indicator for user shares stays up to date
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "David" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
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
