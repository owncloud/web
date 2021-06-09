@notToImplementOnOCIS
Feature: Sharing files and folders with internal users
  As a user
  I want to share files and folders with other users
  So that those users can access the files and folders

  Background:
    Given these users have been created with default attributes and without skeleton files:
      | username |
      | Alice    |
      | Brian    |


  Scenario: member of a blacklisted from sharing group tries to re-share a file or folder received as a share
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes"
    And user "Carol" has been created with default attributes and without skeleton files
    And user "Carol" has created folder "simple-folder"
    And user "Carol" has uploaded file "testavatar.jpg" to "testimage.jpg"
    And group "grp1" has been created
    And user "Alice" has been added to group "grp1"
    And user "Carol" has shared file "testimage.jpg" with user "Alice"
    And user "Carol" has shared folder "simple-folder" with user "Alice"
    And the administrator has enabled exclude groups from sharing
    And the administrator has excluded group "grp1" from sharing
    When user "Alice" logs in using the webUI
    Then the user should not be able to share file "testimage.jpg" using the webUI
    And the user should not be able to share folder "simple-folder" using the webUI


  Scenario: member of a blacklisted from sharing group tries to re-share a file inside a folder received as a share
    Given user "Carol" has been created with default attributes and without skeleton files
    And user "Carol" has created folder "common"
    And user "Carol" has uploaded file "testavatar.jpg" to "common/testimage.jpg"
    And group "grp1" has been created
    And user "Alice" has been added to group "grp1"
    And user "Carol" has shared folder "common" with user "Alice"
    And the administrator has enabled exclude groups from sharing
    And the administrator has excluded group "grp1" from sharing
    And user "Alice" has logged in using the webUI
    When the user browses to the folder "common" on the files page
    Then the user should not be able to share file "testimage.jpg" using the webUI


  Scenario: member of a blacklisted from sharing group tries to re-share a folder inside a folder received as a share
    Given user "Carol" has been created with default attributes and without skeleton files
    And user "Carol" has created folder "common"
    And user "Carol" has created folder "common/inside-common"
    And group "grp1" has been created
    And user "Alice" has been added to group "grp1"
    And user "Carol" has shared folder "common" with user "Alice"
    And the administrator has enabled exclude groups from sharing
    And the administrator has excluded group "grp1" from sharing
    And user "Alice" has logged in using the webUI
    When the user browses to the folder "common" on the files page
    Then the user should not be able to share folder "inside-common" using the webUI


  Scenario: user tries to share a file or folder from a group which is blacklisted from sharing from files page
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has uploaded file "testavatar.jpg" to "testimage.jpg"
    And group "grp1" has been created
    And user "Alice" has been added to group "grp1"
    And the administrator has enabled exclude groups from sharing
    And the administrator has excluded group "grp1" from sharing
    When user "Alice" logs in using the webUI
    Then the user should not be able to share file "testimage.jpg" using the webUI
    And the user should not be able to share folder "simple-folder" using the webUI


  Scenario: user tries to re-share a file from a group which is blacklisted from sharing using webUI from shared with you page
    Given user "Brian" has uploaded file "testavatar.jpg" to "testimage.jpg"
    And group "grp1" has been created
    And user "Alice" has been added to group "grp1"
    And user "Brian" has shared file "/testimage.jpg" with user "Alice"
    And the administrator has enabled exclude groups from sharing
    And the administrator has excluded group "grp1" from sharing
    And user "Alice" has logged in using the webUI
    When the user browses to the shared-with-me page
    And the user opens the share dialog for file "testimage.jpg" using the webUI
    Then the user should not be able to share file "testimage.jpg" using the webUI
