@mailhog @public_link_share-feature-required
Feature: Share public link shares via email
  As a user
  I want to share public shared links via email
  So that I can send share links to other users using email

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And the setting "shareapi_allow_public_notification" of app "core" has been set to "yes" in the server
    And user "Alice" has logged in using the webUI
    And the user reloads the current page of the webUI

  @issue-2422
  Scenario: user shares a public link via email
    When the user creates a new public link for folder "simple-folder" using the webUI with
      | email | foo@bar.co |
    Then the email address "foo@bar.co" should have received an email with the body containing
      """
      Alice Hansen shared simple-folder with you
      """
    And the email address "foo@bar.co" should have received an email containing the last shared public link

  @issue-2422
  Scenario: user shares a public link via email and sends a copy to self
    When the user creates a new public link for folder "simple-folder" using the webUI with
      | email       | foo@bar.co |
      | emailToSelf | true       |
    Then the email address "foo@bar.co" should have received an email with the body containing
      """
      Alice Hansen shared simple-folder with you
      """
    And the email address "alice@example.org" should have received an email with the body containing
      """
      Alice Hansen shared simple-folder with you
      """
    And the email address "foo@bar.co" should have received an email containing the last shared public link
    And the email address "alice@example.org" should have received an email containing the last shared public link

  @issue-2422
  Scenario: user shares a public link via email with multiple addresses
    When the user creates a new public link for folder "simple-folder" using the webUI with
      | email | foo@bar.co, foo@barr.co |
    Then the email address "foo@bar.co" should have received an email with the body containing
      """
      Alice Hansen shared simple-folder with you
      """
    And the email address "foo@barr.co" should have received an email with the body containing
      """
      Alice Hansen shared simple-folder with you
      """
    And the email address "foo@bar.co" should have received an email containing the last shared public link
    And the email address "foo@barr.co" should have received an email containing the last shared public link

  @issue-2422
  Scenario: user shares a public link via email with a personal message
    When the user creates a new public link for folder "simple-folder" using the webUI with
      | email           | foo@bar.co  |
      | personalMessage | lorem ipsum |
    Then the email address "foo@bar.co" should have received an email with the body containing
      """
      Alice Hansen shared simple-folder with you
      """
    And the email address "foo@bar.co" should have received an email with the body containing
      """
      lorem ipsum
      """
    And the email address "foo@bar.co" should have received an email containing the last shared public link

  @issue-2422
  Scenario: user shares a public link via email adding few addresses before and then removing some addresses afterwards
    When the user opens the link share dialog for folder "simple-folder" using the webUI
    And the user opens the create public link share popup
    And the user adds the following email addresses using the webUI:
      | email           |
      | foo1234@bar.co  |
      | foo5678@bar.co  |
      | foo1234@barr.co |
      | foo5678@barr.co |
    And the user removes the following email addresses using the webUI:
      | email           |
      | foo1234@bar.co  |
      | foo5678@barr.co |
    And the user creates the public link using the webUI
    Then the email address "foo5678@bar.co" should have received an email with the body containing
      """
      Alice Hansen shared simple-folder with you
      """
    And the email address "foo1234@barr.co" should have received an email with the body containing
      """
      Alice Hansen shared simple-folder with you
      """
    And the email address "foo5678@bar.co" should have received an email containing the last shared public link
    And the email address "foo1234@barr.co" should have received an email containing the last shared public link
    But the email address "foo1234@bar.co" should not have received an email
    And the email address "foo5678@barr.co" should not have received an email

  @issue-2422 @issue-ocis-1328
  Scenario: user shares a public link via email with a personal message (duplicate)
    When the user creates a new public link for folder "simple-folder" using the webUI with
      | email           | foo@bar.co  |
      | personalMessage | lorem ipsum |
    Then the email address "foo@bar.co" should have received an email with the body containing
      """
      Alice Hansen shared simple-folder with you
      """
    And the email address "foo@bar.co" should have received an email with the body containing
      """
      lorem ipsum
      """
    And the email address "foo@bar.co" should have received an email containing the last shared public link
