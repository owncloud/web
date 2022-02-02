Feature: Shares collaborator list
  As a user
  I want to check the collaborator list
  So that I can know the collaborators of a shared resource

  Background:
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no" in the server
    And the administrator has set the default folder for received shares to "Shares" in the server
    And these users have been created with default attributes and without skeleton files in the server:
      | username |
      | Alice    |
      | Brian    |
    And user "Brian" has created folder "simple-folder" in the server

  @issue-ocis-2260
  Scenario Outline: change the collaborators of a file & folder
    Given user "Brian" has logged in using the webUI
    And user "Brian" has shared folder "/simple-folder" with user "Alice" with "<initial-permissions>" permissions in the server
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian" in the server
    When the user changes the collaborator role of "Alice Hansen" for folder "simple-folder" to "<set-role>" with permissions "<set-permissions>" using the webUI
    # check role without reloading the collaborators panel, see issue #1786
    Then user "Alice Hansen" should be listed as "<expected-role>" in the collaborators list on the webUI
    # check role after reopening the collaborators panel
    And user "Alice Hansen" should be listed as "<expected-role>" in the collaborators list for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                  |
      | uid_owner   | Brian                  |
      | share_with  | Alice                  |
      | file_target | /Shares/simple-folder  |
      | item_type   | folder                 |
      | permissions | <expected-permissions> |
    Examples:
      | initial-permissions | set-role             | expected-role | set-permissions            | expected-permissions            |
      | read,update,create  | Viewer               | Viewer        | ,                          | read,share                      |
      | read                | Editor               | Editor        | ,                          | read,update,create,delete,share |
      | read,share          | Custom permissions   | Viewer        | share                      | read,share                      |
      | all                 | Custom permissions   | Editor        | update,create,delete,share | all                             |
