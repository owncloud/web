@notToImplementOnOCIS
Feature: Sharing files and folders with internal groups
  As a user
  I want to share files and folders with groups
  So that those groups can access the files and folders

  Background:
    Given these users have been created with default attributes and without skeleton files in the server:
      | username |
      | Alice    |
      | Brian    |
      | Carol    |
    And these groups have been created in the server:
      | groupname |
      | grp1      |
      | grp11     |
    And user "Alice" has been added to group "grp1" in the server
    And user "Brian" has been added to group "grp1" in the server


  Scenario: share a folder with multiple collaborators and check collaborator list order
    Given user "Carol" has created folder "simple-folder" in the server
    And user "Carol" has logged in using the webUI
    When the user shares folder "simple-folder" with group "grp11" as "Viewer" using the webUI
    And the user shares folder "simple-folder" with user "Brian Murphy" as "Viewer" using the webUI
    And the user shares folder "simple-folder" with group "grp1" as "Viewer" using the webUI
    And the user shares folder "simple-folder" with user "Alice Hansen" as "Viewer" using the webUI
    Then the current collaborators list should have order "Alice Hansen,Brian Murphy,grp1,grp11"


  Scenario Outline: share a file & folder with another internal user
    Given user "Carol" has created folder "simple-folder" in the server
    And user "Carol" has created file "simple-folder/lorem.txt" in the server
    And user "Carol" has uploaded file "testavatar.jpg" to "testavatar.jpg" in the server
    And user "Carol" has logged in using the webUI
    When the user shares folder "simple-folder" with group "grp1" as "<set-role>" using the webUI
    And the user shares file "testavatar.jpg" with group "grp1" as "<set-role>" using the webUI
    Then group "grp1" should be listed as "<expected-role>" in the collaborators list for folder "simple-folder" on the webUI
    And group "grp1" should be listed as "<expected-role>" in the collaborators list for file "testavatar.jpg" on the webUI
    And user "Alice" should have received a share with these details in the server:
      | field       | value                |
      | uid_owner   | Carol                |
      | share_with  | grp1                 |
      | file_target | /simple-folder       |
      | item_type   | folder               |
      | permissions | <permissions-folder> |
    And user "Brian" should have received a share with these details in the server:
      | field       | value              |
      | uid_owner   | Carol              |
      | share_with  | grp1               |
      | file_target | /testavatar.jpg    |
      | item_type   | file               |
      | permissions | <permissions-file> |
    And as "Alice" these resources should be listed on the webUI
      | entry_name     |
      | simple-folder  |
      | testavatar.jpg |
    And these resources should be listed in the folder "simple-folder" on the webUI
      | entry_name |
      | lorem.txt  |
    But these resources should not be listed in the folder "simple-folder" on the webUI
      | entry_name    |
      | simple-folder |
    When the user browses to the shared-with-me page
    Then folder "simple-folder" should be marked as shared by "Carol King" on the webUI
    And file "testavatar.jpg" should be marked as shared by "Carol King" on the webUI
    Examples:
      | set-role             | expected-role        | permissions-folder              | permissions-file  |
      | Viewer               | Viewer               | read,share                      | read,share        |
      | Editor               | Editor               | read,update,create,delete,share | read,update,share |
      | Custom permissions   | Custom permissions   | read                            | read              |


  Scenario: share a file with an internal group a member overwrites and unshares the file
    Given user "Carol" has created file "new-lorem.txt" in the server
    And user "Carol" has logged in using the webUI
    When the user shares file "new-lorem.txt" with group "grp1" as "Editor" using the webUI
    And the user re-logs in as "Alice" using the webUI
    Then as "Alice" the content of "new-lorem.txt" in the server should not be the same as the content of local file "new-lorem.txt"
    # overwrite the received shared file
    When the user uploads overwriting file "new-lorem.txt" using the webUI
    Then file "new-lorem.txt" should be listed on the webUI
    And as "Alice" the content of "new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"
    # unshare the received shared file
    When the user deletes file "new-lorem.txt" using the webUI
    Then file "new-lorem.txt" should not be listed on the webUI
    # check that another group member can still see the file
    When the user re-logs in as "Brian" using the webUI
    Then as "Brian" the content of "new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"
    # check that the original file owner can still see the file
    When the user re-logs in as "Carol" using the webUI
    Then as "Carol" the content of "new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"


  Scenario: share a folder with an internal group and a member uploads, overwrites and deletes files
    Given user "Carol" has created folder "new-simple-folder" in the server
    And user "Carol" has created file "new-simple-folder/lorem.txt" in the server
    And user "Carol" has uploaded file "data.zip" to "new-simple-folder/data.zip" in the server
    And user "Carol" has logged in using the webUI
    When the user shares folder "new-simple-folder" with group "grp1" as "Editor" using the webUI
    And the user re-logs in as "Alice" using the webUI
    And the user opens folder "new-simple-folder" using the webUI
    Then as "Alice" the content of "new-simple-folder/lorem.txt" in the server should not be the same as the content of local file "lorem.txt"
    # overwrite an existing file in the received share
    When the user uploads overwriting file "lorem.txt" using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And as "Alice" the content of "new-simple-folder/lorem.txt" in the server should be the same as the content of local file "lorem.txt"
    # upload a new file into the received share
    When the user uploads file "new-lorem.txt" using the webUI
    Then as "Alice" the content of "new-simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"
    # delete a file in the received share
    When the user deletes file "data.zip" using the webUI
    Then file "data.zip" should not be listed on the webUI
    # check that the file actions by the sharee are visible to another group member
    When the user re-logs in as "Brian" using the webUI
    And the user opens folder "new-simple-folder" using the webUI
    Then as "Brian" the content of "new-simple-folder/lorem.txt" in the server should be the same as the content of local file "lorem.txt"
    And as "Brian" the content of "new-simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"
    And file "data.zip" should not be listed on the webUI
    # check that the file actions by the sharee are visible for the share owner
    When the user re-logs in as "Carol" using the webUI
    And the user opens folder "new-simple-folder" using the webUI
    Then as "Carol" the content of "new-simple-folder/lorem.txt" in the server should be the same as the content of local file "lorem.txt"
    And as "Carol" the content of "new-simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"
    And file "data.zip" should not be listed on the webUI


  Scenario: share a folder with an internal group and a member unshares the folder
    Given user "Carol" has created folder "new-simple-folder" in the server
    And user "Carol" has uploaded file "lorem.txt" to "new-simple-folder/lorem.txt" in the server
    And user "Carol" has logged in using the webUI
    When the user shares folder "new-simple-folder" with group "grp1" as "Editor" using the webUI
    # unshare the received shared folder and check it is gone
    And the user re-logs in as "Alice" using the webUI
    And the user deletes folder "new-simple-folder" using the webUI
    Then folder "new-simple-folder" should not be listed on the webUI
    # check that the folder is still visible to another group member
    When the user re-logs in as "Brian" using the webUI
    Then folder "new-simple-folder" should be listed on the webUI
    When the user opens folder "new-simple-folder" using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And as "Brian" the content of "new-simple-folder/lorem.txt" in the server should be the same as the content of local file "lorem.txt"
    # check that the folder is still visible for the share owner
    When the user re-logs in as "Carol" using the webUI
    Then folder "new-simple-folder" should be listed on the webUI
    When the user opens folder "new-simple-folder" using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And as "Carol" the content of "new-simple-folder/lorem.txt" in the server should be the same as the content of local file "lorem.txt"


  Scenario: user shares the file/folder with a group and delete the share with group
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has logged in using the webUI
    And user "Alice" has shared file "lorem.txt" with group "grp1" in the server
    When the user opens the share dialog for file "lorem.txt" using the webUI
    Then group "grp1" should be listed as "Editor" in the collaborators list on the webUI
    When the user deletes "grp1" as collaborator for the current file using the webUI
    Then group "grp1" should not be listed in the collaborators list on the webUI
    And file "lorem.txt" should not be listed in shared-with-others page on the webUI
    And as "Brian" file "lorem.txt" should not exist in the server


  Scenario: user shares the file/folder with multiple internal users and delete the share with one user
    Given group "grp2" has been created in the server
    And user "Alice" has created file "lorem.txt" in the server
    And user "Carol" has been added to group "grp2" in the server
    And user "Alice" has logged in using the webUI
    And user "Alice" has shared file "lorem.txt" with group "grp1" in the server
    And user "Alice" has shared file "lorem.txt" with group "grp2" in the server
    When the user opens the share dialog for file "lorem.txt" using the webUI
    Then group "grp1" should be listed as "Editor" in the collaborators list on the webUI
    And group "grp2" should be listed as "Editor" in the collaborators list on the webUI
    When the user deletes "grp1" as collaborator for the current file using the webUI
    Then group "grp1" should not be listed in the collaborators list on the webUI
    And group "grp2" should be listed as "Editor" in the collaborators list on the webUI
    And file "lorem.txt" should be listed in shared-with-others page on the webUI
    And as "Brian" file "lorem.txt" should not exist in the server
    But as "Carol" file "lorem.txt" should exist in the server


  Scenario: Auto-completion for a group that is excluded from receiving shares
    Given group "system-group" has been created in the server
    And the administrator has excluded group "system-group" from receiving shares in the server
    And user "Alice" has created folder "simple-folder" in the server
    When the user re-logs in as "Alice" using the webUI
    And the user browses to the files page
    And the user opens the share dialog for folder "simple-folder" using the webUI

    And the user types "system-group" in the share-with-field
    Then the autocomplete list should not be displayed on the webUI



























  Scenario: share a folder with other group and then it should be listed on Shared with Others page
    Given user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has logged in using the webUI
    And user "Alice" has shared folder "simple-folder" with user "Brian" in the server
    And user "Alice" has shared folder "simple-folder" with group "grp1" in the server
    When the user browses to the shared-with-others page
    Then the following resources should have the following collaborators
      | fileName      | expectedCollaborators |
      | simple-folder | Brian Murphy, grp1    |


  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has created a new share with following settings in the server
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "lorem.txt" and expiration date in 7 days in the server
    And user "Brian" should have received a share with target "lorem.txt" and expiration date in 7 days in the server
    And user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |


  Scenario: share a resource with another internal group with default expiration date
    Given the setting "shareapi_default_expire_date_group_share" of app "core" has been set to "yes" in the server
    And the setting "shareapi_expire_after_n_days_group_share" of app "core" has been set to "42" in the server
    And user "Carol" has created file "lorem.txt" in the server
    And user "Carol" has logged in using the webUI
    When the user shares file "lorem.txt" with group "grp1" as "Viewer" using the webUI
    Then user "Carol" should have a share with these details in the server:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +42        |
    And user "Alice" should have received a share with target "lorem.txt" and expiration date in 42 days in the server
    And user "Brian" should have received a share with target "lorem.txt" and expiration date in 42 days in the server


  Scenario Outline: share a resource with another internal group with expiration date beyond maximum enforced expiration date
    Given the setting "shareapi_default_expire_date_group_share" of app "core" has been set to "yes" in the server
    And the setting "shareapi_enforce_expire_date_group_share" of app "core" has been set to "yes" in the server
    And the setting "shareapi_expire_after_n_days_group_share" of app "core" has been set to "5" in the server
    And user "Carol" has created <element> "<shared-resource>" in the server
    And user "Carol" has logged in using the webUI
    When the user tries to share resource "<shared-resource>" with group "grp1" which expires in "+6" days using the webUI
    Then user "Alice" should not have created any shares in the server
    Examples:
      | element | shared-resource |
      | file    | lorem.txt       |
      | folder  | simple-folder   |
