@oauthLogin @notToImplementOnOCIS
Feature: login users
  As a user
  I want to be able to log into my account
  So that I have access to my files

  As an admin
  I want only authorised users to log in
  So that unauthorised access is impossible

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files in the server


  Scenario: admin login
    Given the user has browsed to the login page
    When the user logs in with username "admin" and password "admin" using the webUI
    Then the files table should be displayed
    And the files table should not be empty


  Scenario: logging out
    Given user "Alice" has logged in using the webUI
    And the user has browsed to the files page
    When the user logs out of the webUI
    Then the user should be redirected to the IdP login page


  Scenario: try to login with invalid username
    Given the user has browsed to the login page
    When the user tries to log in with username "invalid" and password "1234" using the webUI
    Then the warning 'Wrong password. Reset it?' should be displayed on the login page


  Scenario: try to login with valid username and invalid password
    Given the user has browsed to the login page
    When the user tries to log in with username "Alice" and password "invalid" using the webUI
    Then the warning 'Wrong password. Reset it?' should be displayed on the login page


  Scenario: the user session of a deleted user is cleared properly
    Given user "Alice" has logged in using the webUI
    And the user has browsed to the files page
    And user "Alice" has been deleted in the server
    When the user reloads the current page of the webUI
    Then the user should be redirected to the owncloud login page


  Scenario: the user session of a deleted user should not be valid for newly created user of same name
    Given user "Alice" has logged in using the webUI
    And user "Alice" has been deleted in the server
    And user "Alice" has been created with default attributes and without skeleton files in the server
    When the user reloads the current page of the webUI
    Then the user should be redirected to the owncloud login page
