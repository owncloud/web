Feature: Checking users role after he is added as collaborator
  As a user
  I want to assign specific roles to users
  So that those users have only permissions the user wants them to have

  Background:
    Given these users have been created with default attributes:
      | username |
      | user1    |
      | user2    |
    And user "user1" has logged in using the webUI

  Scenario: share a file with another user and assign him role Viewer
    Given the user shares file "lorem.txt" with user "User Two" as "Viewer" using the webUI
    When the user opens the share dialog for file "lorem.txt" using the webUI
    Then user "User Two" should be listed as "Viewer" in the collaborators list on the webUI