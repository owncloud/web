Feature: Autocompletion of share-with names
  As a user
  I want to share files, with minimal typing, to the right people or groups
  So that I can efficiently share my files with other users or groups

  Background:
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no" in the server
    And the administrator has set the default folder for received shares to "Shares" in the server
    # Users that are in the special known users already
    And these users have been created with default attributes and without skeleton files in the server but not initialized:
      | username    |
      | Alice       |
      | Carol       |
      | usergrp     |
      | regularuser |
    # Some extra users to make the share autocompletion interesting
    And these users have been created without initialization and without skeleton files in the server:
      | username  | password  | displayname     | email          |
      | two       | %regular% | Brian Murphy    | u2@oc.com.np   |
      | u444      | %regular% | Four            | u3@oc.com.np   |
      | five      | %regular% | User Group      | five@oc.com.np |
      | usersmith | %regular% | John Finn Smith | js@oc.com.np   |
    And these groups have been created in the server:
      | groupname     |
      | finance1      |
      | finance2      |
      | finance3      |
      | users-finance |
      | other         |

  @smokeTest @issue-ocis-1961
  Scenario: autocompletion of regular existing users
    Given user "regularuser" has created folder "simple-folder" in the server
    And user "regularuser" has logged in using the webUI

    And the user has opened the share dialog for folder "simple-folder"

    When the user types "us" in the share-with-field
    Then all users and groups that contain the string "us" in their name should be listed in the autocomplete list on the webUI
    But only users and groups that contain the string "us" in their name or displayname should be listed in the autocomplete list on the webUI
    And the users own name should not be listed in the autocomplete list on the webUI

  @smokeTest @issue-ocis-1961
  Scenario: autocompletion of regular existing groups
    Given user "regularuser" has created folder "simple-folder" in the server
    And user "regularuser" has logged in using the webUI

    And the user has opened the share dialog for folder "simple-folder"

    When the user types "fi" in the share-with-field
    Then all users and groups that contain the string "fi" in their name should be listed in the autocomplete list on the webUI
    But only users and groups that contain the string "fi" in their name or displayname should be listed in the autocomplete list on the webUI
    And the users own name should not be listed in the autocomplete list on the webUI

  @issue-ocis-1675
  Scenario: autocompletion for a pattern that does not match any user or group
    Given user "regularuser" has created folder "simple-folder" in the server
    And user "regularuser" has logged in using the webUI
    And the user has browsed to the personal page
    And the user has opened the share dialog for folder "simple-folder"

    When the user types "doesnotexist" in the share-with-field
    Then the autocomplete list should not be displayed on the webUI

  @issue-ocis-1675
  Scenario: autocompletion when minimum characters is the default (2) and not enough characters are typed
    Given user "regularuser" has created folder "simple-folder" in the server
    And user "regularuser" has logged in using the webUI
    And the user has browsed to the personal page
    And the user has opened the share dialog for folder "simple-folder"

    When the user types "u" in the share-with-field
    Then the autocomplete list should not be displayed on the webUI

  @issue-ocis-1675 @issue-ocis-1317
  Scenario: autocompletion when minimum characters is increased and not enough characters are typed
    Given the administrator has set the minimum characters for sharing autocomplete to "4" in the server
    And user "regularuser" has created folder "simple-folder" in the server
    And user "regularuser" has logged in using the webUI
    And the user has browsed to the personal page
    And the user has opened the share dialog for folder "simple-folder"

    When the user types "use" in the share-with-field
    Then the autocomplete list should not be displayed on the webUI

  @issue-ocis-1961
  Scenario: autocomplete short user/display names when completely typed
    Given the administrator has set the minimum characters for sharing autocomplete to "3" in the server
    And user "regularuser" has created folder "simple-folder" in the server
    And user "regularuser" has logged in using the webUI
    And the user has browsed to the personal page
    And these users have been created without initialization and without skeleton files in the server:
      | username | password | displayname | email        |
      | use      | %alt1%   | Use         | uz@oc.com.np |
    And the user has opened the share dialog for folder "simple-folder"

    When the user types "Use" in the share-with-field
    Then "user" "Use" should be listed in the autocomplete list on the webUI

  @issue-ocis-1961
  Scenario: autocomplete short group names when completely typed
    Given the administrator has set the minimum characters for sharing autocomplete to "2" in the server
    And user "regularuser" has created folder "simple-folder" in the server
    And these groups have been created in the server:
      | groupname |
      | fi        |
    And user "regularuser" has logged in using the webUI
    And the user has browsed to the personal page
    And the user has opened the share dialog for folder "simple-folder"

    When the user types "fi" in the share-with-field
    Then "group" "fi" should be listed in the autocomplete list on the webUI

  @issue-ocis-1675 @issue-ocis-1317
  Scenario: autocompletion when increasing the minimum characters for sharing autocomplete
    Given the administrator has set the minimum characters for sharing autocomplete to "3" in the server
    And user "regularuser" has created folder "simple-folder" in the server
    And user "regularuser" has logged in using the webUI
    And the user has browsed to the personal page
    And the user has opened the share dialog for folder "simple-folder"

    When the user types "use" in the share-with-field
    Then all users and groups that contain the string "use" in their name should be listed in the autocomplete list on the webUI
    But only users and groups that contain the string "use" in their name or displayname should be listed in the autocomplete list on the webUI
    And the users own name should not be listed in the autocomplete list on the webUI

  @issue-ocis-1675
  Scenario: autocompletion of a pattern that matches regular existing users but also a user with whom the item is already shared (folder)
    Given user "regularuser" has created folder "simple-folder" in the server
    And user "regularuser" has logged in using the webUI
    And the user has browsed to the personal page
    And user "regularuser" has shared folder "simple-folder" with user "Alice" in the server
    And the user has opened the share dialog for folder "simple-folder"

    When the user types "user" in the share-with-field
    Then all users and groups that contain the string "user" in their name should be listed in the autocomplete list on the webUI except user "Alice Hansen"
    But only users and groups that contain the string "user" in their name or displayname should be listed in the autocomplete list on the webUI
    And the users own name should not be listed in the autocomplete list on the webUI

  @issue-ocis-1675
  Scenario: autocompletion of a pattern that matches regular existing users but also a user with whom the item is already shared (file)
    Given user "regularuser" has created file "data.zip" in the server
    And user "regularuser" has logged in using the webUI
    And the user has browsed to the personal page
    And user "regularuser" has shared file "data.zip" with user "usergrp" in the server
    And the user has opened the share dialog for file "data.zip"

    When the user types "user" in the share-with-field
    Then all users and groups that contain the string "user" in their name should be listed in the autocomplete list on the webUI except user "User Grp"
    But only users and groups that contain the string "user" in their name or displayname should be listed in the autocomplete list on the webUI
    And the users own name should not be listed in the autocomplete list on the webUI

  @issue-ocis-1675 @issue-ocis-1317
  Scenario: autocompletion of a pattern that matches regular existing groups but also a group with whom the item is already shared (folder)
    Given the administrator has set the minimum characters for sharing autocomplete to "2" in the server
    And user "regularuser" has created folder "simple-folder" in the server
    And user "regularuser" has logged in using the webUI
    And the user has browsed to the personal page
    And user "regularuser" has shared folder "simple-folder" with group "finance1" in the server
    And the user has opened the share dialog for folder "simple-folder"

    When the user types "fi" in the share-with-field
    Then all users and groups that contain the string "fi" in their name should be listed in the autocomplete list on the webUI except group "finance1"
    But only users and groups that contain the string "fi" in their name or displayname should be listed in the autocomplete list on the webUI
    And the users own name should not be listed in the autocomplete list on the webUI

  @issue-ocis-1675 @issue-ocis-1317
  Scenario: autocompletion of a pattern that matches regular existing groups but also a group with whom the item is already shared (file)
    Given the administrator has set the minimum characters for sharing autocomplete to "2" in the server
    And user "regularuser" has created file "data.zip" in the server
    And user "regularuser" has logged in using the webUI
    And the user has browsed to the personal page
    And user "regularuser" has shared file "data.zip" with group "finance1" in the server
    And the user has opened the share dialog for file "data.zip"

    When the user types "fi" in the share-with-field
    Then all users and groups that contain the string "fi" in their name should be listed in the autocomplete list on the webUI except group "finance1"
    But only users and groups that contain the string "fi" in their name or displayname should be listed in the autocomplete list on the webUI
    And the users own name should not be listed in the autocomplete list on the webUI
