Feature: Shares collaborator list
  As a user
  I want to check the collaborator list
  So that I can know the collaborators of a shared resource

  Background:
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares"
    And these users have been created with default attributes and without skeleton files:
      | username |
      | Alice    |
      | Brian    |
    And user "Brian" has created folder "simple-folder"

  @issue-ocis-2260
  Scenario Outline: change the collaborators of a file & folder
    Given user "Brian" has logged in using the webUI
    And user "Brian" has shared folder "/simple-folder" with user "Alice" with "<initial-permissions>" permissions
    And user "Alice" has accepted the share "Shares/simple-folder" offered by user "Brian"
    When the user changes the collaborator role of "Alice Hansen" for folder "simple-folder" to "<set-role>" using the webUI
    # check role without reloading the collaborators panel, see issue #1786
    Then user "Alice Hansen" should be listed as "<expected-role>" in the collaborators list on the webUI
    # check role after reopening the collaborators panel
    And user "Alice Hansen" should be listed as "<expected-role>" in the collaborators list for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details:
      | field       | value                  |
      | uid_owner   | Brian                  |
      | share_with  | Alice                  |
      | file_target | /Shares/simple-folder  |
      | item_type   | folder                 |
      | permissions | <expected-permissions> |
    Examples:
      | initial-permissions | set-role             | expected-role | expected-permissions            |
      | read,update,create  | Viewer               | Viewer        | read,share                      |
      | read                | Editor               | Editor        | read,update,create,delete,share |
      | read,share          | Custom permissions | Viewer        | read,share                      |
      | all                 | Custom permissions | Editor        | all                             |

  @issue-2898
  Scenario: see resource owner in collaborators list for direct shares
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has accepted the share "Shares/simple-folder" offered by user "Alice"
    And user "Brian" has logged in using the webUI
    And the user has opened folder "Shares"
    When the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "Alice Hansen" should be listed as "Owner" in the collaborators list on the webUI

  @issue-2898
  Scenario: see resource owner in collaborators list for reshares
    Given user "Alice" has created folder "simple-folder"
    And user "Carol" has been created with default attributes and without skeleton files
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has accepted the share "Shares/simple-folder" offered by user "Alice"
    And user "Brian" has shared folder "Shares/simple-folder" with user "Carol"
    And user "Carol" has accepted the share "Shares/simple-folder" offered by user "Brian"
    And user "Carol" has logged in using the webUI
    And the user has opened folder "Shares"
    When the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "Alice Hansen" should be listed as "Owner" reshared through "Brian Murphy" in the collaborators list on the webUI
    And the current collaborators list should have order "Alice Hansen,Carol King"

  @issue-2898 @issue-4168
  Scenario: see resource owner of parent shares in collaborators list
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has created folder "simple-folder/simple-empty-folder"
    And user "Carol" has been created with default attributes and without skeleton files
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has accepted the share "Shares/simple-folder" offered by user "Alice"
    And user "Brian" has shared folder "Shares/simple-folder" with user "Carol"
    And user "Carol" has accepted the share "Shares/simple-folder" offered by user "Brian"
    And user "Carol" has logged in using the webUI
    And the user has opened folder "Shares"
    And the user has opened folder "simple-folder"
    When the user opens the share dialog for folder "simple-empty-folder" using the webUI
    Then user "Alice Hansen" should be listed as "Owner" reshared through "Brian Murphy" via "simple-folder" in the collaborators list on the webUI
    And the current collaborators list should have order "Alice Hansen,Carol King"
