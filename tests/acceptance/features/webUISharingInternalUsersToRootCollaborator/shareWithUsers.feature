@notToImplementOnOCIS
Feature: Shares collaborator list
  As a user
  I want to check the collaborator list
  So that I can know the collaborators of a shared resource

  Background:
    Given these users have been created with default attributes and without skeleton files in the server:
      | username |
      | Alice    |
      | Brian    |
    And user "Alice" has created folder "simple-folder" in the server

  Scenario Outline: change the collaborators of a file & folder
    Given user "Alice" has logged in using the webUI
    And user "Alice" has shared folder "/simple-folder" with user "Brian" with "<initial-permissions>" permissions in the server
    When the user changes the collaborator role of "Brian Murphy" for folder "simple-folder" to "<set-role>" with permissions "<set-permissions>" using the webUI
    # check role without reloading the collaborators panel, see issue #1786
    Then user "Brian Murphy" should be listed as "<expected-role>" in the collaborators list on the webUI
    # check role after reopening the collaborators panel
    And user "Brian Murphy" should be listed as "<expected-role>" in the collaborators list for folder "simple-folder" on the webUI
    And user "Brian" should have received a share with these details in the server:
      | field       | value                  |
      | uid_owner   | Alice                  |
      | share_with  | Brian                  |
      | file_target | /simple-folder         |
      | item_type   | folder                 |
      | permissions | <expected-permissions> |
    Examples:
      | initial-permissions | set-role             | expected-role | | set-permissions            | expected-permissions            |
      | read,update,create  | Viewer               | Viewer        | | ,                          | read,share                      |
      | read                | Editor               | Editor        | | ,                          | read,update,create,delete,share |
      | read,share          | Custom permissions   | Viewer        | | share                      | read,share                      |
      | all                 | Custom permissions   | Editor        | | update,create,delete,share | all                             |































  Scenario Outline: collaborators list contains additional info when enabled
    Given the setting "user_additional_info_field" of app "core" has been set to "<additional-info-field>" in the server
    And user "Alice" has shared folder "simple-folder" with user "Brian" in the server
    When user "Alice" has logged in using the webUI
    And the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "Brian Murphy" should be listed with additional info "<additional-info-result>" in the collaborators list on the webUI
    Examples:
      | additional-info-field | additional-info-result |
      | id                    | (Brian)                |
      | email                 | (brian@example.org)    |


  Scenario: collaborators list does not contain additional info when disabled
    Given the setting "user_additional_info_field" of app "core" has been set to "" in the server
    And user "Alice" has shared folder "simple-folder" with user "Brian" in the server
    When user "Alice" has logged in using the webUI
    And the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "Brian Murphy" should be listed without additional info in the collaborators list on the webUI

























  Scenario: share a file with another internal user via collaborators quick action
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has logged in using the webUI
    When the user shares resource "simple-folder" with user "Brian Murphy" using the quick action on the webUI
    Then user "Brian Murphy" should be listed as "Viewer" in the collaborators list for folder "simple-folder" on the webUI
    And user "Brian" should have received a share with these details in the server:
      | field       | value              |
      | uid_owner   | Alice              |
      | share_with  | Brian              |
      | file_target | /simple-folder     |
      | item_type   | folder             |
      | permissions | read,share         |
