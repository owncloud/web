Feature: Shares in share-with pages
  As a user
  I want to check share-with pages
  So that I can know what is shared with me and by me

  Background:
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares"
    And these users have been created with default attributes and without skeleton files:
      | username |
      | Alice    |
      | Brian    |
    And user "Brian" has created folder "simple-folder"

  @issue-4192
  Scenario: share a folder with other user and then it should be listed on Shared with You for other user
    Given user "Brian" has created file "lorem.txt"
    And user "Brian" has renamed folder "simple-folder" to "new-simple-folder"
    And user "Brian" has renamed file "lorem.txt" to "ipsum.txt"
    And user "Brian" has shared file "ipsum.txt" with user "Alice"
    And user "Alice" has accepted the share "ipsum.txt" offered by user "Brian"
    And user "Brian" has shared folder "new-simple-folder" with user "Alice"
    And user "Alice" has accepted the share "new-simple-folder" offered by user "Brian"
    And user "Alice" has logged in using the webUI
    When the user browses to the shared-with-me page
    Then file "ipsum.txt" should be listed on the webUI
    And folder "new-simple-folder" should be listed on the webUI


  Scenario: share a folder with other user and then it should be listed on Shared with Others page
    Given user "Carol" has been created with default attributes and without skeleton files
    And user "Brian" has created file "lorem.txt"
    And user "Brian" has logged in using the webUI
    And user "Brian" has shared file "lorem.txt" with user "Alice"
    And user "Alice" has accepted the share "lorem.txt" offered by user "Brian"
    And user "Brian" has shared folder "simple-folder" with user "Alice"
    And user "Alice" has accepted the share "simple-folder" offered by user "Brian"
    And user "Brian" has shared folder "simple-folder" with user "Carol"
    And user "Carol" has accepted the share "simple-folder" offered by user "Brian"
    When the user browses to the shared-with-others page
    Then the following resources should have the following collaborators
      | fileName      | expectedCollaborators |
      | lorem.txt     | Alice Hansen              |
      | simple-folder | Alice Hansen, Carol King  |

  @issue-2480
  Scenario: check file with same name but different paths are displayed correctly in shared with others page
    Given user "Brian" has created file "lorem.txt"
    And user "Brian" has created file "simple-folder/lorem.txt"
    And user "Brian" has shared file "lorem.txt" with user "Alice"
    And user "Brian" has shared file "simple-folder/lorem.txt" with user "Alice"
    And user "Brian" has logged in using the webUI
    When the user browses to the shared-with-others page
    Then file "lorem.txt" should be listed on the webUI
#    Then file "lorem.txt" with path "" should be listed in the shared with others page on the webUI
#    And file "lorem.txt" with path "/simple-folder" should be listed in the shared with others page on the webUI


  Scenario: send share shows up on shared-with-others page
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has created file "data.zip"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Alice" has logged in using the webUI
    When the user browses to the shared-with-others page using the webUI
    Then folder "simple-folder" should be listed on the webUI
    But file "data.zip" should not be listed on the webUI


  Scenario: received share shows up on shared-with-me page
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has created file "data.zip"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has accepted the share "simple-folder" offered by user "Alice"
    And user "Brian" has logged in using the webUI
    When the user browses to the shared-with-me page
    Then folder "simple-folder" should be listed on the webUI
    But file "data.zip" should not be listed on the webUI

  @issue-4170
  Scenario: clicking a folder on shared-with-me page jumps to the main file list inside the folder
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has accepted the share "simple-folder" offered by user "Alice"
    And user "Alice" has created file "simple-folder/collaborate-on-this.txt"
    And user "Brian" has logged in using the webUI
    When the user browses to the shared-with-me page
    And the user opens folder "simple-folder" using the webUI
    Then file "collaborate-on-this.txt" should be listed on the webUI

  @issue-ocis-2266
  Scenario: unsharing an entry on the shared-with-me page unshares from self
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has accepted the share "simple-folder" offered by user "Alice"
    And user "Brian" has logged in using the webUI
    When the user browses to the shared-with-me page
    And the user unshares folder "simple-folder" using the webUI
    And the user browses to the folder "Shares" on the files page
    Then folder "simple-folder" should not be listed on the webUI

  @issue-4582 @issue-ocis-2266
  Scenario: unsharing multiple entries on the shared-with-me page
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has created file "lorem.txt"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has accepted the share "simple-folder" offered by user "Alice"
    And user "Alice" has shared file "lorem.txt" with user "Brian"
    And user "Brian" has accepted the share "lorem.txt" offered by user "Alice"
    And user "Brian" has logged in using the webUI
    And the user browses to the shared-with-me page in accepted shares view
    When the user batch unshares these files using the webUI
      | name          |
      | simple-folder |
      | lorem.txt     |
    And the user browses to the shared-with-me page in declined shares view
    Then the unshared elements should be in declined state on the webUI

  @issue-3040 @issue-4113 @ocis-reva-issue-39
  Scenario: see resource owner of parent shares in "shared with others" and "favorites" list
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has created folder "simple-folder/simple-empty-folder"
    And user "Carol" has been created with default attributes and without skeleton files
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has accepted the share "simple-folder" offered by user "Alice"
    And user "Brian" has shared folder "Shares/simple-folder/simple-empty-folder" with user "Carol"
    And user "Brian" has favorited element "Shares/simple-folder/simple-empty-folder"
    And user "Brian" has logged in using the webUI
    When the user browses to the shared-with-others page
    And the user opens the share dialog for folder "simple-empty-folder" using the webUI
    Then user "Alice Hansen" should be listed as "Owner" via "simple-folder" in the collaborators list on the webUI
    When the user browses to the favorites page using the webUI
    And the user opens the share dialog for folder "…/simple-folder/simple-empty-folder" using the webUI
    Then user "Alice Hansen" should be listed as "Owner" via "simple-folder" in the collaborators list on the webUI

  @issue-2898 @ocis-issue-891
  Scenario: see resource owner for direct shares in "shared with me"
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has accepted the share "simple-folder" offered by user "Alice"
    And user "Brian" has logged in using the webUI
    When the user browses to the shared-with-me page
    And the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "Alice Hansen" should be listed as "Owner" in the collaborators list on the webUI

  @issue-ocis-1328
  Scenario Outline: collaborators list contains additional info when enabled
    Given the setting "user_additional_info_field" of app "core" has been set to "<additional-info-field>"
    And user "Alice" has created folder "simple-folder"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    When user "Alice" has logged in using the webUI
    And the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "Brian Murphy" should be listed with additional info "<additional-info-result>" in the collaborators list on the webUI
    Examples:
      | additional-info-field | additional-info-result |
      | id                    | Brian                  |
      | email                 | brian@example.org      |

  @issue-ocis-1328
  Scenario: collaborators list does not contain additional info when disabled
    Given the setting "user_additional_info_field" of app "core" has been set to ""
    And user "Alice" has created folder "simple-folder"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    When user "Alice" has logged in using the webUI
    And the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "Brian Murphy" should be listed without additional info in the collaborators list on the webUI


  Scenario: collaborators list contains the current user when they are an owner
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    When user "Alice" has logged in using the webUI
    And the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "Alice Hansen" should be listed with additional info "(me)" in the collaborators list on the webUI


  Scenario: collaborators list contains the current user when they are a receiver of the resource
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has accepted the share "simple-folder" offered by user "Alice"
    And user "Brian" has logged in using the webUI
    When the user opens folder "Shares" using the webUI
    And the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "Brian Murphy" should be listed with additional info "(me)" in the collaborators list on the webUI

  @issue-ocis-1289
  Scenario: current user should see the highest role in their entry in collaborators list
    Given group "grp1" has been created
    And user "Brian" has been added to group "grp1"
    And user "Alice" has created folder "simple-folder"
    And user "Alice" has shared folder "simple-folder" with user "Brian" with "read" permission
    And user "Brian" has accepted the share "simple-folder" offered by user "Alice"
    And user "Alice" has shared folder "simple-folder" with group "grp1" with "read,update,create,delete" permissions
    And user "Brian" has accepted the share "simple-folder" offered by user "Alice"
    When user "Brian" logs in using the webUI
    And the user opens folder "Shares" using the webUI
    Then user "Brian Murphy" should be listed as "Custom permissions" in the collaborators list for folder "simple-folder (2)" on the webUI

  Scenario: share a file with another internal user via collaborators quick action
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has logged in using the webUI
    When the user shares resource "simple-folder" with user "Brian Murphy" using the quick action on the webUI
    And user "Brian" accepts the share "simple-folder" offered by user "Alice" using the sharing API
    Then user "Brian Murphy" should be listed as "Viewer" in the collaborators list for folder "simple-folder" on the webUI
    And user "Brian" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | Alice                 |
      | share_with  | Brian                 |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | read,share            |
