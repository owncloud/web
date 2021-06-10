Feature: Access private link
  As a user I want to directly access item which I have received private link for

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt"

  @smokeTest
  Scenario: Copy and access private link
    Given user "Alice" has logged in using the webUI
    When the user copies the private link of the file "lorem.txt" using the webUI
    And the user navigates to the copied private link using the webUI
    Then the app-sidebar for file "lorem.txt" should be visible on the webUI
    And the "actions" details panel should be visible

  @smokeTest
  Scenario: Access private link before authorisation
    When the user tries to navigate to the private link created by user "Alice" for file "lorem.txt"
    Then the user should be redirected to the IdP login page
    When user "Alice" has logged in using the webUI
    Then the app-sidebar for file "lorem.txt" should be visible on the webUI
    And the "actions" details panel should be visible


  Scenario: Access private link as a collaborator
    Given user "Brian" has been created with default attributes and without skeleton files
    And user "Alice" has shared file "lorem.txt" with user "Brian" with "read" permissions
    And user "Brian" has logged in using the webUI
    When the user navigates to the private link created by user "Alice" for file "lorem.txt"
    Then the app-sidebar for file "lorem.txt" should be visible on the webUI
    And the "actions" details panel should be visible

  @issue-3243
  Scenario: Access the private link as an user that does not have permissions to see the file
    Given user "Brian" has been created with default attributes and without skeleton files
    And user "Brian" has logged in using the webUI
    When the user navigates to the private link created by user "Alice" for file "lorem.txt"
    Then the user should see the following error message on the login card dialog
      """
      An error occurred while resolving the private link
      Error: Unknown error
      """

  Scenario: Access the private link anonymously
    When the user tries to navigate to the private link created by user "Alice" for file "lorem.txt"
    Then the user should be redirected to the IdP login page
