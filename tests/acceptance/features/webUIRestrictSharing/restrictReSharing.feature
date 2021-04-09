@issue-ocis-1317
Feature: restrict resharing
  As an admin
  I want to be able to forbid the sharing of a received share globally
  As a user
  I want to be able to forbid a user that received a share from me to share it further

  Background:
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares"
    And these users have been created with default attributes and without skeleton files:
      | username |
      | Alice    |
      | Brian    |
      | Carol    |
    And these groups have been created:
      | groupname |
      | grp1      |
    And user "Alice" has been added to group "grp1"
    And user "Brian" has been added to group "grp1"

  @smokeTest @issue-2447
  Scenario: disable resharing and check if the received resource can be reshared
    Given the setting "shareapi_allow_resharing" of app "core" has been set to "no"
    And user "Brian" has created folder "simple-folder"
    And user "Brian" has uploaded file "lorem.txt" to "simple-folder/lorem.txt"
    And user "Brian" has shared folder "simple-folder" with user "Alice"
    And user "Alice" has accepted the share "simple-folder" offered by user "Brian"
    And user "Alice" has favorited element "/Shares/simple-folder"
    When user "Alice" logs in using the webUI
    And the user opens folder "Shares" using the webUI
    Then the user should not be able to share folder "simple-folder" using the webUI
    When the user browses to the shared-with-me page
#    Then the user should not be able to share folder "simple-folder (2)" using the webUI
    And the user shares folder "simple-folder" with user "Carol King" as "Editor" using the webUI
    Then the error message with header "Error while sharing." should be displayed on the webUI
    And as "Carol" folder "simple-folder" should not exist
    When the user browses to the favorites page
    Then the user should not be able to share folder "Shares/simple-folder" using the webUI

  @smokeTest
  Scenario: disable resharing and check if the received resource from group share can be reshared
    Given the setting "shareapi_allow_resharing" of app "core" has been set to "no"
    And user "Carol" has uploaded file "lorem.txt" to "lorem.txt"
    And user "Carol" has shared file "lorem.txt" with group "grp1"
    And user "Alice" has accepted the share "lorem.txt" offered by user "Carol"
    And user "Brian" has accepted the share "lorem.txt" offered by user "Carol"
    When user "Alice" logs in using the webUI
    And the user opens folder "Shares" using the webUI
    Then the user should not be able to share file "lorem.txt" using the webUI
    When the user re-logs in as "Brian" using the webUI
    And the user opens folder "Shares" using the webUI
    Then the user should not be able to share file "lorem.txt" using the webUI
