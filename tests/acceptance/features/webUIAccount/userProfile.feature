Feature: view profile
  As a user
  I want to be able to view and browse to my profile
  So that I can manage my account

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files in the server

  @ocis-reva-issue-107
  Scenario: view user profile for the logged in user
    When user "Alice" logs in using the webUI
    Then the user profile should be visible on the webUI


  Scenario: browse to account page to manage user account
    Given user "Alice" has logged in using the webUI
    When the user opens the user profile
    And the user browses to manage the account
    Then the accounts page should be visible on the webUI
