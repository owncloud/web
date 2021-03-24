@skip @ocis-konnectd-issue-14
Feature: Logout users
  As a user
  I want to be able to logout of my account
  So that I can protect my work and identity and be assured of privacy


  Scenario:logging out
    Given user "Alice" has been created with default attributes and without skeleton files
    And user "Alice" has logged in using the webUI
    When the user browses to the account page
    And the user logs out of the webUI
    Then the authentication page should be visible
