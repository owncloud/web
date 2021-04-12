@app-required @notifications-app-required @ocis-reva-issue-14
Feature: Sharing files and folders with internal groups
  As a user
  I want to share files and folders with groups
  So that those groups can access the files and folders

  Background:
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares"
    And app "notifications" has been enabled
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
    And user "Brian" has logged in using the webUI


  Scenario: notifications about new share is displayed
    Given user "Carol" has created folder "simple-folder"
    And user "Carol" has uploaded file "data.zip" to "data.zip"
    And user "Carol" has shared folder "/simple-folder" with group "grp1"
    And user "Carol" has shared folder "/data.zip" with group "grp1"
    When the user reloads the current page of the webUI
    Then the user should see the notification bell on the webUI
    And the user should see 2 notifications on the webUI with these details
      | title                                        |
      | "Carol King" shared "simple-folder" with you |
      | "Carol King" shared "data.zip" with you      |
    When the user re-logs in as "Alice" using the webUI
    Then the user should see 2 notifications on the webUI with these details
      | title                                        |
      | "Carol King" shared "simple-folder" with you |
      | "Carol King" shared "data.zip" with you      |

