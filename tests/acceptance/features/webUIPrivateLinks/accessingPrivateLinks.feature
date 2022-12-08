@notToImplementOnOCIS @issue-6844
Feature: Access private link
  As a user I want to directly access item which I have received private link for

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server

  @smokeTest
  Scenario: Copy and access private link
    Given user "Alice" has logged in using the webUI
    When the user copies the private link of the file "lorem.txt" using the webUI
    And the user navigates to the copied private link using the webUI
    Then file "lorem.txt" should be listed on the webUI

  @smokeTest
  Scenario: Access private link before authorisation
    When an anonymous user tries to navigate to the private link created by user "Alice" for file "lorem.txt"
    Then the user should be redirected to the IdP login page
    When user "Alice" fills in the login form using the webUI
    Then file "lorem.txt" should be listed on the webUI


  Scenario: Access private link as a collaborator
    Given user "Brian" has been created with default attributes and without skeleton files in the server
    And user "Alice" has shared file "lorem.txt" with user "Brian" with "read" permissions in the server
    And user "Brian" has logged in using the webUI
    When the user navigates to the private link created by user "Alice" for file "lorem.txt"
    And the private link resolved successfully
    Then file "lorem.txt" should be listed on the webUI

  @issue-3243
  Scenario: Access the private link as an user that does not have permissions to see the file
    Given user "Brian" has been created with default attributes and without skeleton files in the server
    And user "Brian" has logged in using the webUI
    When the user navigates to the private link created by user "Alice" for file "lorem.txt"
    Then the user should see the following error message on the link resolve page
      """
      An error occurred while resolving the private link
      """
