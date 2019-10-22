Feature: restrict Sharing
  As an admin
  I want to be able to restrict the sharing function
  So that users can only share files with specific users and groups

  Background:
    Given these users have been created with default attributes:
      | username |
      | user1    |
      | user2    |
      | user3    |
    And these groups have been created:
      | groupname |
      | grp1      |
      | grp2      |
    And user "user1" has been added to group "grp1"
    And user "user2" has been added to group "grp1"
    And user "user3" has been added to group "grp2"
    And user "user2" has logged in using the webUI

  @smokeTest
  Scenario: Restrict users to only share with users in their groups
    Given the setting "shareapi_only_share_with_group_members" of app "core" has been set to "yes"
    When the user opens the share dialog for folder "simple-folder" using the webUI
    And the user types "User" in the share-with-field
    Then "user" "User Three" should not be listed in the autocomplete list on the webUI
    But "user" "User One" should be listed in the autocomplete list on the webUI

  @smokeTest
  Scenario: Restrict users to only share with groups they are member of
    Given the setting "shareapi_only_share_with_membership_groups" of app "core" has been set to "yes"
    When the user opens the share dialog for folder "simple-folder" using the webUI
    And the user types "grp" in the share-with-field
    Then "group" "grp2" should not be listed in the autocomplete list on the webUI
    But "group" "grp1" should be listed in the autocomplete list on the webUI

  Scenario: Do not restrict users to only share with groups they are member of
    Given the setting "shareapi_only_share_with_membership_groups" of app "core" has been set to "no"
    When the user shares folder "simple-folder" with group "grp2" as "Viewer" using the webUI
    Then as "user3" folder "simple-folder (2)" should exist

  @smokeTest
  Scenario: Forbid sharing with groups
    Given the setting "shareapi_allow_group_sharing" of app "core" has been set to "no"
    When the user opens the share dialog for folder "simple-folder" using the webUI
    And the user types "grp" in the share-with-field
    Then "group" "grp1" should not be listed in the autocomplete list on the webUI
    And "group" "grp2" should not be listed in the autocomplete list on the webUI
