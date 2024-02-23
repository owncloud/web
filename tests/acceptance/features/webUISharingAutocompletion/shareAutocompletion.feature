# Most of the tests in this file is skipped in OCIS most of the tests set minimum characters for search
# while it can be configured in OCIS too but not in the same manner as oc10
# the skipped tests are listed in issue https://github.com/owncloud/web/issues/7264 for further implementation in playwright

Feature: Autocompletion of share-with names
  As a user
  I want to share files, with minimal typing, to the right people or groups
  So that I can efficiently share my files with other users or groups

  Background:
    Given the administrator has set the default folder for received shares to "Shares" in the server
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


  Scenario: autocompletion for a pattern that does not match any user or group
    Given user "regularuser" has created folder "simple-folder" in the server
    And user "regularuser" has logged in using the webUI
    And the user has browsed to the personal page
    And the user has opened the share dialog for folder "simple-folder"
    When the user types "doesnotexist" in the share-with-field
    Then the autocomplete list should not be displayed on the webUI


  Scenario: autocompletion when minimum characters is the default (2) and not enough characters are typed
    Given user "regularuser" has created folder "simple-folder" in the server
    And user "regularuser" has logged in using the webUI
    And the user has browsed to the personal page
    And the user has opened the share dialog for folder "simple-folder"
    When the user types "u" in the share-with-field
    Then the autocomplete list should not be displayed on the webUI


  Scenario: add collaborators in the invite list and remove some of them
    Given user "regularuser" has created folder "simple-folder" in the server
    And user "regularuser" has logged in using the webUI
    And the user has opened the share dialog for folder "simple-folder"
    When the user selects the following collaborators for the share as "Viewer" with "," permissions:
      | collaborator    | type  |
      | Alice Hansen    | user  |
      | Carol King      | user  |
      | John Finn Smith | user  |
      | finance1        | group |
      | finance3        | group |
    And the user removes "John Finn Smith" as a collaborator from the share
    And the user removes "Carol King" as a collaborator from the share
    And the user removes "finance3" as a collaborator from the share
    Then user "John Finn Smith" should not be visible in the collaborators selected options in the webUI
    And user "Carol King" should not be visible in the collaborators selected options in the webUI
    And group "finance3" should not be visible in the collaborators selected options in the webUI
    But user "Alice Hansen" should be visible in the collaborators selected options in the webUI
    And group "finance1" should be visible in the collaborators selected options in the webUI
