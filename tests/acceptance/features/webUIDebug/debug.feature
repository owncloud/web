Feature: Sharing files and folders with internal users with different permissions
  As a user
  I want to set different permissions on shared files and folders with other users
  So that I can control the access on those files/folders by other collaborators

  Background:
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no" in the server
    And the administrator has set the default folder for received shares to "Shares" in the server
    And these users have been created with default attributes and without skeleton files in the server:
      | username |
      | Alice    |
      | Brian    |
    And user "Brian" has created folder "simple-folder" in the server
    And user "Brian" has created folder "simple-empty-folder" in the server
    And user "Brian" has created folder "simple-folder/simple-empty-folder" in the server
    And user "Brian" has uploaded file "data.zip" to "data.zip" in the server
    And user "Brian" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Brian" has uploaded file "lorem.txt" to "simple-folder/lorem.txt" in the server


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |


  Scenario Outline: Change permissions of the previously shared file
    Given user "Brian" has shared file "lorem.txt" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/lorem.txt" offered by user "Brian" in the server
    And user "Brian" has logged in using the webUI
    Then custom permission "<displayed-permissions>" should be set for user "Alice Hansen" for file "lorem.txt" on the webUI
    When the user sets custom permission for current role of collaborator "Alice Hansen" for file "lorem.txt" to "share" using the webUI
    Then user "Alice" should have received a share with these details in the server:
      | field       | value             |
      | uid_owner   | Brian             |
      | share_with  | Alice             |
      | file_target | /Shares/lorem.txt |
      | item_type   | file              |
      | permissions | <permissions>     |
    Examples:
      | initial-permissions | permissions | displayed-permissions |
      | read, update        | read, share | update                |
      | read                | read, share | ,                     |
