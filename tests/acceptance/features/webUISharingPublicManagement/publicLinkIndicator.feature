@public_link_share-feature-required @disablePreviews
Feature: Public link share indicator
  As a user
  I want to check share indicator
  So that I can know with resources are shared

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files in the server
    And user "Alice" has created folder "/simple-folder" in the server

  @issue-2060
  Scenario: sharing indicator inside a shared folder
    Given user "Alice" has created folder "/simple-folder/sub-folder" in the server
    And user "Alice" has uploaded file with content "test" to "/simple-folder/textfile.txt" in the server
    And user "Alice" has shared folder "simple-folder" with link with "read" permissions in the server
    When user "Alice" has logged in using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators |
      | simple-folder | link-direct        |
    When the user opens folder "simple-folder" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName     | expectedIndicators |
      | sub-folder   | link-indirect      |
      | textfile.txt | link-indirect      |

  @issue-2060
  Scenario: sharing indicator for file uploaded inside a shared folder
    Given user "Alice" has shared folder "simple-folder" with link with "read" permissions in the server
    And user "Alice" has logged in using the webUI
    When the user opens folder "simple-folder" using the webUI
    And the user uploads file "new-lorem.txt" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators |
      | new-lorem.txt | link-indirect      |

  @issue-2060
  Scenario: sharing indicator for folder created inside a shared folder
    Given user "Alice" has shared folder "simple-folder" with link with "read" permissions in the server
    And user "Alice" has logged in using the webUI
    When the user opens folder "simple-folder" using the webUI
    And the user creates a folder with the name "sub-folder" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName   | expectedIndicators |
      | sub-folder | link-indirect      |

  @issue-2060
  Scenario: sharing indicators public link and collaborators inside a shared folder
    Given user "Brian" has been created with default attributes and without skeleton files in the server
    And user "Alice" has created folder "/simple-folder/sub-folder" in the server
    And user "Alice" has uploaded file with content "test" to "/simple-folder/textfile.txt" in the server
    And user "Alice" has shared folder "simple-folder" with link with "read" permissions in the server
    And user "Alice" has shared folder "simple-folder" with user "Brian" in the server
    When user "Alice" has logged in using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators      |
      | simple-folder | link-direct,user-direct |
    When the user opens folder "simple-folder" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName     | expectedIndicators          |
      | sub-folder   | link-indirect,user-indirect |
      | textfile.txt | link-indirect,user-indirect |

  @issue-2060
  Scenario: sharing indicators public link from reshare
    Given user "Brian" has been created with default attributes and without skeleton files in the server
    And user "Alice" has created folder "/simple-folder/sub-folder" in the server
    And user "Alice" has uploaded file with content "test" to "/simple-folder/textfile.txt" in the server
    And user "Alice" has shared folder "simple-folder" with user "Brian" in the server
    And user "Brian" has shared folder "simple-folder" with link with "read" permissions in the server
    When user "Brian" has logged in using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName          | expectedIndicators        |
      | simple-folder     | link-direct,user-indirect |
    When the user opens folder "simple-folder" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName     | expectedIndicators          |
      | sub-folder   | link-indirect,user-indirect |
      | textfile.txt | link-indirect,user-indirect |

  @issue-2060
  Scenario: sharing indicators public link from child of reshare
    Given user "Brian" has been created with default attributes and without skeleton files in the server
    And user "Alice" has created folder "/simple-folder/sub-folder" in the server
    And user "Alice" has uploaded file with content "test" to "/simple-folder/textfile.txt" in the server
    And user "Alice" has shared folder "simple-folder" with user "Brian" in the server
    And user "Brian" has shared folder "simple-folder/sub-folder" with link with "read" permissions in the server
    When user "Brian" has logged in using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName          | expectedIndicators |
      | simple-folder     | user-indirect      |
    When the user opens folder "simple-folder" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName     | expectedIndicators        |
      | sub-folder   | link-direct,user-indirect |
      | textfile.txt | user-indirect             |

  @issue-2060
  Scenario: no sharing indicator visible in file list from public link
    Given user "Brian" has been created with default attributes and without skeleton files in the server
    And user "Carol" has been created with default attributes and without skeleton files in the server
    And user "Alice" has created folder "simple-folder/simple-empty-folder" in the server
    And user "Alice" has shared folder "simple-folder" with user "Brian" in the server
    And user "Brian" has shared folder "simple-folder/simple-empty-folder" with user "Carol" in the server
    And user "Brian" has shared folder "simple-folder" with link with "read" permissions in the server
    When the public uses the webUI to access the last public link created by user "Brian" in a new session
    Then the following resources should not have share indicators on the webUI
      | simple-empty-folder |

  @issue-2939
  Scenario: sharing indicator for link shares stays up to date
    Given user "Brian" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "testavatar.png" to "simple-folder/testimage.png" in the server
    When user "Alice" has logged in using the webUI
    Then the following resources should not have share indicators on the webUI
      | simple-folder |
    When the user shares folder "simple-folder" with user "Brian Murphy" as "Viewer" using the webUI
    And the user creates a new public link for resource "simple-folder" using the webUI with
      | field | value |
      | name  | first |
    And the user creates a new public link for resource "simple-folder" using the webUI with
      | field | value  |
      | name  | second |
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators      |
      | simple-folder | user-direct,link-direct |
    When the user opens folder "simple-folder" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators          |
      | testimage.png | user-indirect,link-indirect |
    When the user creates a new public link for resource "testimage.png" using the webUI with
      | field | value |
      | name  | third |
    # the indicator changes from link-indirect to link-direct to show the direct share
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators        |
      | testimage.png | user-indirect,link-direct |
    # removing the last link reverts the indicator to user-indirect
    When the user removes the public link named "third" of resource "testimage.png" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators          |
      | testimage.png | user-indirect,link-indirect |
    When the user opens folder "" directly on the webUI
    And the user removes the public link named "second" of resource "simple-folder" using the webUI
    # because there is still another link share left, the indicator stays
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators      |
      | simple-folder | user-direct,link-direct |
    # deleting the last collaborator removes the indicator
    When the user removes the public link named "first" of resource "simple-folder" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators |
      | simple-folder | user-direct        |
