@notToImplementOnOCIS
Feature: Sharing files and folders with internal users
  As a user
  I want to share files and folders with other users
  So that those users can access the files and folders

  Background:
    Given these users have been created with default attributes and without skeleton files in the server:
      | username |
      | Alice    |
      | Brian    |


  Scenario: member of a blacklisted from sharing group tries to re-share a file or folder received as a share
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Carol" has been created with default attributes and without skeleton files in the server
    And user "Carol" has created folder "simple-folder" in the server
    And user "Carol" has uploaded file "testavatar.jpg" to "testimage.jpg" in the server
    And group "grp1" has been created in the server
    And user "Alice" has been added to group "grp1" in the server
    And user "Carol" has shared file "testimage.jpg" with user "Alice" in the server
    And user "Carol" has shared folder "simple-folder" with user "Alice" in the server
    And the administrator has enabled exclude groups from sharing in the server
    And the administrator has excluded group "grp1" from sharing in the server
    When user "Alice" logs in using the webUI
    Then the user should not be able to share file "testimage.jpg" using the webUI
    And the user should not be able to share folder "simple-folder" using the webUI


  Scenario: member of a blacklisted from sharing group tries to re-share a file inside a folder received as a share
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "Carol" has created folder "common" in the server
    And user "Carol" has uploaded file "testavatar.jpg" to "common/testimage.jpg" in the server
    And group "grp1" has been created in the server
    And user "Alice" has been added to group "grp1" in the server
    And user "Carol" has shared folder "common" with user "Alice" in the server
    And the administrator has enabled exclude groups from sharing in the server
    And the administrator has excluded group "grp1" from sharing in the server
    And user "Alice" has logged in using the webUI
    When the user browses to the folder "common" on the files page
    Then the user should not be able to share file "testimage.jpg" using the webUI


  Scenario: member of a blacklisted from sharing group tries to re-share a folder inside a folder received as a share
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "Carol" has created folder "common" in the server
    And user "Carol" has created folder "common/inside-common" in the server
    And group "grp1" has been created in the server
    And user "Alice" has been added to group "grp1" in the server
    And user "Carol" has shared folder "common" with user "Alice" in the server
    And the administrator has enabled exclude groups from sharing in the server
    And the administrator has excluded group "grp1" from sharing in the server
    And user "Alice" has logged in using the webUI
    When the user browses to the folder "common" on the files page
    Then the user should not be able to share folder "inside-common" using the webUI


  Scenario: user tries to share a file or folder from a group which is blacklisted from sharing from files page
    Given user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "testimage.jpg" in the server
    And group "grp1" has been created in the server
    And user "Alice" has been added to group "grp1" in the server
    And the administrator has enabled exclude groups from sharing in the server
    And the administrator has excluded group "grp1" from sharing in the server
    When user "Alice" logs in using the webUI
    Then the user should not be able to share file "testimage.jpg" using the webUI
    And the user should not be able to share folder "simple-folder" using the webUI


  Scenario: user tries to re-share a file from a group which is blacklisted from sharing using webUI from shared with you page
    Given user "Brian" has uploaded file "testavatar.jpg" to "testimage.jpg" in the server
    And group "grp1" has been created in the server
    And user "Alice" has been added to group "grp1" in the server
    And user "Brian" has shared file "/testimage.jpg" with user "Alice" in the server
    And the administrator has enabled exclude groups from sharing in the server
    And the administrator has excluded group "grp1" from sharing in the server
    And user "Alice" has logged in using the webUI
    When the user browses to the shared-with-me page
    And the user opens the share dialog for file "testimage.jpg" using the webUI
    Then the user should not be able to share file "testimage.jpg" using the webUI
