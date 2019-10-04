Feature: display notifications on the webUI

  As a user
  I want to see my notifications on the webUI
  So that I can stay informed

  Background:
    Given user "user1" has been created with default attributes
    And user "user1" has logged in using the webUI

  Scenario: Display notifications
    When user "user1" is sent a notification
    Then the user should see the notification bell on the webUI after a page reload

  Scenario: Mark notification as read
    When user "user1" is sent a notification
    Then the user should see the notification bell on the webUI after a page reload
    And the user marks the notification as read
    Then the notification bell should disappear on the webUI
