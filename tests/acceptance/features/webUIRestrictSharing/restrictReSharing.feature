@issue-ocis-1328 @issue-6896 @skipOnOCIS
Feature: restrict resharing
  As an admin
  I want to be able to forbid the sharing of a received share globally
  As a user
  I want to be able to forbid a user that received a share from me to share it further

  Background:
    Given the administrator has set the default folder for received shares to "Shares" in the server
    And these users have been created with default attributes and without skeleton files in the server:
      | username |
      | Alice    |
      | Brian    |
      | Carol    |
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Alice" has been added to group "grp1" in the server
    And user "Brian" has been added to group "grp1" in the server

  @smokeTest @issue-2447
  Scenario: disable resharing and check if the received resource can be reshared
    Given the setting "shareapi_allow_resharing" of app "core" has been set to "no" in the server
    And user "Brian" has created folder "simple-folder" in the server
    And user "Brian" has uploaded file "lorem.txt" to "simple-folder/lorem.txt" in the server
    And user "Brian" has shared folder "simple-folder" with user "Alice" in the server
    When user "Alice" logs in using the webUI
    And the user browses to the files page
    And the user opens folder "Shares" using the webUI
    When the user marks file "simple-folder" as favorite using the webUI
    Then the user should not be able to share folder "simple-folder" using the webUI
    And as "Carol" folder "simple-folder" should not exist in the server
    When the user browses to the favorites page
    Then the user should not be able to share folder "Shares/simple-folder" using the webUI

  @smokeTest
  Scenario: disable resharing and check if the received resource from group share can be reshared
    Given the setting "shareapi_allow_resharing" of app "core" has been set to "no" in the server
    And user "Carol" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Carol" has shared file "lorem.txt" with group "grp1" in the server
    When user "Alice" logs in using the webUI
    And the user opens folder "Shares" using the webUI
    Then the user should not be able to share file "lorem.txt" using the webUI
    When the user re-logs in as "Brian" using the webUI
    And the user opens folder "Shares" using the webUI
    Then the user should not be able to share file "lorem.txt" using the webUI
