Feature: restrict resharing
  As an admin
  I want to be able to forbid the sharing of a received share globally
  As a user
  I want to be able to forbid a user that received a share from me to share it further

  Background:
    Given these users have been created with default attributes:
      | username |
      | user1    |
      | user2    |
      | user3    |
    And these groups have been created:
      | groupname |
      | grp1      |
    And user "user1" has been added to group "grp1"
    And user "user2" has been added to group "grp1"

  @smokeTest
  Scenario: disable resharing and check if the received resource can be reshared
    Given the setting "shareapi_allow_resharing" of app "core" has been set to "no"
    And user "user2" has shared folder "simple-folder" with user "user1"
    When user "user1" logs in using the webUI
    Then the user should not be able to share folder "simple-folder (2)" using the webUI

  @smokeTest
  Scenario: disable resharing and check if the received resource from group share can be reshared
    Given the setting "shareapi_allow_resharing" of app "core" has been set to "no"
    And user "user3" has shared file "lorem.txt" with group "grp1"
    When user "user1" logs in using the webUI
    Then the user should not be able to share file "lorem (2).txt" using the webUI
    When the user re-logs in as "user2" using the webUI
    Then the user should not be able to share file "lorem (2).txt" using the webUI
