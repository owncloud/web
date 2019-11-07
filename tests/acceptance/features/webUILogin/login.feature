Feature: login users
  As a user
  I want to be able to log into my account
  So that I have access to my files

  As an admin
  I want only authorised users to log in
  So that unauthorised access is impossible

  Scenario: admin login
    Given the user has browsed to the login page
    When the user clicks the authenticate button
    And the user logs in with username "admin" and password "admin" using the webUI
    And the user authorizes access to phoenix
    Then the files table should be displayed
    And the files table should not be empty

  Scenario: logging out
    Given these users have been created with default attributes:
      | username |
      | user1    |
    And user "user1" has logged in using the webUI
    And the user has browsed to the files page
    When the user logs out of the webUI
    Then the authentication page should be visible

  Scenario Outline: try to login with invalid credentials
    Given these users have been created with default attributes:
      | username |
      | user1    |
    And the user has browsed to the login page
    And the user has clicked the authenticate button
    When the user tries to log in with username "<username>" and password "<password>" using the webUI
    Then the warning 'Wrong password. Reset it?' should be displayed on the login page
    Examples:
      | username | password |
      | user1    | invalid  |
      | invalid  | 1234     |

