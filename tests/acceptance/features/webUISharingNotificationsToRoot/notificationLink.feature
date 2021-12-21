@app-required @notifications-app-required @notToImplementOnOCIS
Feature: Display notifications when receiving a share and follow embedded links
  As a user
  I want to use the notification header as a link
  So that I will be redirected to the most appropriate screen

  Background:
    Given app "notifications" has been "enabled" in the server
    And the setting "shareapi_auto_accept_share" of app "core" has been set to "no" in the server
    And these users have been created with default attributes and without skeleton files in the server:
      | username |
      | Alice    |
      | Brian    |
    And user "Brian" has logged in using the webUI

  @smokeTest @issue-5227
  Scenario: notification link redirection in case a share is pending
    Given user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has shared folder "/simple-folder" with user "Brian" in the server
    When the user re-logs in as "Brian" using the webUI
    And the user follows the link of following share from notification using the webUI
      | resource | simple-folder |
      | sharer   | Alice         |
    Then the user should be redirected to a webUI page with the title "Shared with you - %productname%"
