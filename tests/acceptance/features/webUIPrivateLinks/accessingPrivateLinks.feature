@notToImplementOnOCIS @issue-6844
Feature: Access private link
  As a user I want to directly access item which I have received private link for

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server


  @issue-3243
  Scenario: Access the private link as an user that does not have permissions to see the file
    Given user "Brian" has been created with default attributes and without skeleton files in the server
    And user "Brian" has logged in using the webUI
    When the user navigates to the private link created by user "Alice" for file "lorem.txt"
    Then the user should see the following error message on the link resolve page
      """
      An error occurred while resolving the private link
      """
