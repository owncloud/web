Feature: view profile
  As an admin
  I want to be able to disable a user
  So that I can remove access to files and resources for a user, without actually deleting the files and resources

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files
    And user "Alice" has logged in using the webUI
    And the user has browsed to the files page
    And user "Alice" has been blocked by admin

  @openIdLogin
  Scenario: the user session of a blocked user is cleared properly using openid authentication
    When the user reloads the current page of the webUI
    Then the user should be redirected to the login error page
    When the user exits the login error page
    Then the user should be redirected to the login page

  @oauthLogin @notToImplementOnOCIS
  Scenario: the user session of a blocked user is cleared properly using oauth authentication
    When the user reloads the current page of the webUI
    Then the user should be redirected to the user disabled page
