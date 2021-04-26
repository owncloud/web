@ocis-reva-issue-64 @issue-ocis-1317
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

  @skip @yetToImplement
  Scenario: user tries to share a file from a group which is blacklisted from sharing
    Given group "grp1" has been created
    And user "Alice" has been added to group "grp1"
    And user "Carol" has been created with default attributes
    And the administrator has browsed to the admin sharing settings page
    When the administrator enables exclude groups from sharing using the webUI
    And the administrator adds group "grp1" to the group sharing blacklist using the webUI
    Then user "Alice" should not be able to share file "testimage.jpg" with user "Carol" using the sharing API


  Scenario: member of a blacklisted from sharing group tries to re-share a file or folder received as a share
    Given user "Carol" has been created with default attributes and without skeleton files
    And user "Carol" has uploaded file "testavatar.jpg" to "testimage.jpg"
    And user "Carol" has created folder "simple-folder"
    And group "grp1" has been created
    And user "Alice" has been added to group "grp1"
    And user "Carol" has shared file "testimage.jpg" with user "Alice"
    And user "Alice" has accepted the share "testimage.jpg" offered by user "Carol"
    And user "Carol" has shared folder "simple-folder" with user "Alice"
    And user "Alice" has accepted the share "simple-folder" offered by user "Carol"
    And the administrator has enabled exclude groups from sharing
    And the administrator has excluded group "grp1" from sharing
    When user "Alice" logs in using the webUI
    And the user opens folder "Shares" using the webUI
    Then the user should not be able to share file "testimage.jpg" using the webUI
    And the user should not be able to share folder "simple-folder" using the webUI


  Scenario: member of a blacklisted from sharing group tries to re-share a file inside a folder received as a share
    Given user "Carol" has been created with default attributes and without skeleton files
    And user "Carol" has uploaded file "testavatar.jpg" to "testimage.jpg"
    And user "Carol" has created folder "simple-folder"
    And group "grp1" has been created
    And user "Alice" has been added to group "grp1"
    And user "Carol" has created folder "common"
    And user "Carol" has moved file "testimage.jpg" to "common/testimage.jpg"
    And user "Carol" has shared folder "common" with user "Alice"
    And user "Alice" has accepted the share "common" offered by user "Carol"
    And the administrator has enabled exclude groups from sharing
    And the administrator has excluded group "grp1" from sharing
    And user "Alice" has logged in using the webUI
    And the user has opened folder "Shares"
    When the user opens folder "common" using the webUI
    Then the user should not be able to share file "testimage.jpg" using the webUI


  Scenario: member of a blacklisted from sharing group tries to re-share a folder inside a folder received as a share
    Given these users have been created with default attributes and without skeleton files:
      | username |
      | Carol    |
    And group "grp1" has been created
    And user "Alice" has been added to group "grp1"
    And user "Carol" has created folder "common"
    And user "Carol" has created folder "common/inside-common"
    And user "Carol" has shared folder "common" with user "Alice"
    And user "Alice" has accepted the share "common" offered by user "Carol"
    And the administrator has enabled exclude groups from sharing
    And the administrator has excluded group "grp1" from sharing
    And user "Alice" has logged in using the webUI
    And the user has opened folder "Shares"
    When the user opens folder "common" using the webUI
    Then the user should not be able to share folder "inside-common" using the webUI


  Scenario: user tries to share a file or folder from a group which is blacklisted from sharing from files page
    Given group "grp1" has been created
    And user "Alice" has been added to group "grp1"
    And user "Alice" has uploaded file "testavatar.jpg" to "testimage.jpg"
    And user "Alice" has created folder "simple-folder"
    And the administrator has enabled exclude groups from sharing
    And the administrator has excluded group "grp1" from sharing
    When user "Alice" logs in using the webUI
    Then the user should not be able to share file "testimage.jpg" using the webUI
    And the user should not be able to share folder "simple-folder" using the webUI


  Scenario: user tries to re-share a file from a group which is blacklisted from sharing using webUI from shared with you page
    Given group "grp1" has been created
    And user "Alice" has been added to group "grp1"
    And user "Carol" has been created with default attributes and without skeleton files
    And user "Brian" has uploaded file "testavatar.jpg" to "testimage.jpg"
    And user "Brian" has shared file "/testimage.jpg" with user "Alice"
    And user "Alice" has accepted the share "testimage.jpg" offered by user "Brian"
    And the administrator has enabled exclude groups from sharing
    And the administrator has excluded group "grp1" from sharing
    And user "Alice" has logged in using the webUI
    When the user browses to the shared-with-me page
    And the user opens the share dialog for file "testimage.jpg" using the webUI
    Then the user should not be able to share file "testimage.jpg" using the webUI
