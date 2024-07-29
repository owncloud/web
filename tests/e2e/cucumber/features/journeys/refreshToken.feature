Feature: Refresh Access Token

  As a user
  I want the web application to automatically refresh its access token using a refresh token,
  So that I can be confident the application will not encounter issues related to expired access tokens.

#  reset access token to  5 min
  Scenario: validate access token
    Given "Admin" creates following users using API
      | id    |
      | Brian |
    And "Admin" assigns following roles to the users using API
      | id    | role        |
      | Brian | Space Admin |
    And "Brian" logs in
    When "Brian" access token expires, refresh token request for new access token

#    And "Alice" creates the following project space using API
#      | name | id     |
#      | team | team.1 |
#    And "Alice" navigates to the project space "team.1"
#    And "Alice" creates the following resources
#      | resource            | type    | content             |
#      | parent/textfile.txt | txtFile | some random content |

