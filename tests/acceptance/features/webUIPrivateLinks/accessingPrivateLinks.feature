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