Feature: view profile
  As an admin
  I want to be able to disable a user
  So that I can remove access to files and resources for a user, without actually deleting the files and resources

  Scenario: the user session of a blocked user is cleared properly
    Given these users have been created with default attributes:
      | username |
      | user1    |
    And user "user1" has logged in using the webUI
    And the user has browsed to the files page
    And user "user1" has been blocked by admin
    When the user reloads the current page of the webUI
    Then the user should be redirected to the login page
