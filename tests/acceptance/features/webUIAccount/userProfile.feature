Feature: view profile
  As a user
  I want to be able to view and browse to my profile
  So that I can manage my account

  Background:
    Given user "user1" has been created with default attributes

  Scenario: view user profile for the logged in user
    When user "user1" logs in using the webUI
    Then the user profile should be visible in the webUI
    When the user opens the user profile
    Then username "User One" should be visible in the webUI

  Scenario: browse to account page to manage user account
    Given user "user1" has logged in using the webUI
    When the user opens the user profile
    And the user browses to manage the account
    Then the accounts page should be visible in the webUI
