@skipOnOCIS
Feature: Access private link
  As a user I want to directly access item which I have received private link for

  Background:
    Given user "user1" has been created with default attributes

  @smokeTest
  Scenario: Copy and access private link
    Given user "user1" has logged in using the webUI
    When the user copies the private link of the file "lorem.txt" using the webUI
    And the user navigates to the copied private link using the webUI
    Then the app-sidebar for file "lorem.txt" should be visible on the webUI
    And the "versions" details panel should be visible

  @smokeTest
  Scenario: Access private link before authorisation
    Given the user navigates to the private link created by user "user1" for file "lorem.txt"
    When user "user1" has logged in using the webUI
    Then the app-sidebar for file "lorem.txt" should be visible on the webUI
    And the "versions" details panel should be visible

  Scenario: Access private link as a collaborator
    Given user "user2" has been created with default attributes
    And user "user1" has shared file "lorem.txt" with user "user2" with "read" permissions
    And user "user2" has logged in using the webUI
    When the user navigates to the private link created by user "user1" for file "lorem.txt"
    Then the app-sidebar for file "lorem (2).txt" should be visible on the webUI
    And the "versions" details panel should be visible

  @issue-3243
  Scenario: Access the private link as an user that does not have permissions to see the file
    Given user "user2" has been created with default attributes
    And user "user2" has logged in using the webUI
    When the user navigates to the private link created by user "user1" for file "lorem.txt"
    Then the user should see the following error message on the login card dialog
      """
      An error occurred while resolving the private link
      Error: Unknown error
      """
#    Then the user should see the following error message on the login card dialog
#      """
#      An error occurred while resolving the private link
#      Any nice error message
#      """

  Scenario: Access the private link anonymously
    When the user tries to navigate to the private link created by user "user1" for file "lorem.txt"
    Then the user should be redirected to the login page
