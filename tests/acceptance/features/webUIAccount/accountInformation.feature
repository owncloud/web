Feature: View account information
  As a user
  I would like to view my account information
  So that I can verify and use my account details correctly

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files in the server

  @ocis-reva-issue-107
  Scenario: view account information when the user has been created without group memberships
    Given user "Alice" has logged in using the webUI
    When the user browses to the account page
    Then the accounts page should be visible on the webUI
