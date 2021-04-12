@notToImplementOnOCIS
Feature: Shares collaborator list
  As a user
  I want to check the collaborator list
  So that I can know the collaborators of a shared resource

  Background:
    Given these users have been created with default attributes:
      | username |
      | Alice    |
      | Brian    |

  Scenario Outline: change the collaborators of a file & folder
    Given user "Brian" has logged in using the webUI
    And user "Brian" has shared folder "/simple-folder" with user "Alice" with "<initial-permissions>" permissions
    When the user changes the collaborator role of "Alice Hansen" for folder "simple-folder" to "<set-role>" using the webUI
    # check role without reloading the collaborators panel, see issue #1786
    Then user "Alice Hansen" should be listed as "<expected-role>" in the collaborators list on the webUI
    # check role after reopening the collaborators panel
    And user "Alice Hansen" should be listed as "<expected-role>" in the collaborators list for folder "simple-folder" on the webUI
    And user "Alice" should have received a share with these details:
      | field       | value                  |
      | uid_owner   | Brian                  |
      | share_with  | Alice                  |
      | file_target | /simple-folder (2)     |
      | item_type   | folder                 |
      | permissions | <expected-permissions> |
    Examples:
      | initial-permissions | set-role             | expected-role | expected-permissions            |
      | read,update,create  | Viewer               | Viewer        | read,share                      |
      | read                | Editor               | Editor        | read,update,create,delete,share |
      | read,share          | Advanced permissions | Viewer        | read,share                      |
      | all                 | Advanced permissions | Editor        | all                             |

  @issue-2898
  Scenario: see resource owner in collaborators list for direct shares
    Given user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has logged in using the webUI
    When the user opens the share dialog for folder "simple-folder (2)" using the webUI
    Then user "Alice Hansen" should be listed as "Owner" in the collaborators list on the webUI

  @issue-2898
  Scenario: see resource owner in collaborators list for reshares
    Given user "Carol" has been created with default attributes
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has shared folder "simple-folder (2)" with user "Carol"
    And user "Carol" has logged in using the webUI
    When the user opens the share dialog for folder "simple-folder (2)" using the webUI
    Then user "Alice Hansen" should be listed as "Owner" reshared through "Brian Murphy" in the collaborators list on the webUI
    And the current collaborators list should have order "Alice Hansen,Carol King"

  @issue-2898
  Scenario: see resource owner of parent shares in collaborators list
    Given user "Carol" has been created with default attributes
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has shared folder "simple-folder (2)" with user "Carol"
    And user "Carol" has logged in using the webUI
    And the user opens folder "simple-folder (2)" using the webUI
    When the user opens the share dialog for folder "simple-empty-folder" using the webUI
    Then user "Alice Hansen" should be listed as "Owner" reshared through "Brian Murphy" via "simple-folder (2)" in the collaborators list on the webUI
    And the current collaborators list should have order "Alice Hansen,Carol King"


  Scenario Outline: collaborators list contains additional info when enabled
    Given the setting "user_additional_info_field" of app "core" has been set to "<additional-info-field>"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    When user "Alice" has logged in using the webUI
    And the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "Brian Murphy" should be listed with additional info "<additional-info-result>" in the collaborators list on the webUI
    Examples:
      | additional-info-field | additional-info-result |
      | id                    | Brian                  |
      | email                 | brian@example.org      |


  Scenario: collaborators list does not contain additional info when disabled
    Given the setting "user_additional_info_field" of app "core" has been set to ""
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    When user "Alice" has logged in using the webUI
    And the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "Brian Murphy" should be listed without additional info in the collaborators list on the webUI


  Scenario: collaborators list contains the current user when they are an owner
    Given user "Alice" has shared folder "simple-folder" with user "Brian"
    When user "Alice" has logged in using the webUI
    And the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "Alice Hansen" should be listed with additional info "(me)" in the collaborators list on the webUI


  Scenario: collaborators list contains the current user when they are a receiver of the resource
    Given user "Alice" has shared folder "simple-folder" with user "Brian"
    When user "Brian" has logged in using the webUI
    And the user opens the share dialog for folder "simple-folder (2)" using the webUI
    Then user "Brian Murphy" should be listed with additional info "(me)" in the collaborators list on the webUI


  Scenario: current user should see the highest role in their entry in collaborators list
    Given group "grp1" has been created
    And user "Brian" has been added to group "grp1"
    And user "Alice" has shared folder "simple-folder" with user "Brian" with "read" permission
    And user "Alice" has shared folder "simple-folder" with group "grp1" with "read,update,create,delete" permissions
    When user "Brian" has logged in using the webUI
    Then user "Brian Murphy" should be listed as "Advanced permissions" in the collaborators list for folder "simple-folder (2)" on the webUI


  Scenario: share a file with another internal user via collaborators quick action
    Given user "Alice" has logged in using the webUI
    And the setting "shareapi_auto_accept_share" of app "core" has been set to "yes"
    When the user shares resource "simple-folder" with user "Brian Murphy" using the quick action in the webUI
    Then user "Brian Murphy" should be listed as "Viewer" in the collaborators list for folder "simple-folder" on the webUI
    And user "Brian" should have received a share with these details:
      | field       | value              |
      | uid_owner   | Alice              |
      | share_with  | Brian              |
      | file_target | /simple-folder (2) |
      | item_type   | folder             |
      | permissions | read,share         |
