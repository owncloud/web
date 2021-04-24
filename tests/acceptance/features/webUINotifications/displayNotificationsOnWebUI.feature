@skipOnOCIS @ocis-issue-130
Feature: display notifications on the webUI

  As a user
  I want to see my notifications on the webUI
  So that I can stay informed

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files
    And user "Alice" has logged in using the webUI


  Scenario: Display notifications
    When user "Alice" is sent a notification
    Then the user should see the notification bell on the webUI after a page reload


  Scenario: Mark notification as read
    When user "Alice" is sent a notification
    Then the user should see the notification bell on the webUI after a page reload
    And the user marks the notification as read
    And the notification bell should disappear on the webUI
