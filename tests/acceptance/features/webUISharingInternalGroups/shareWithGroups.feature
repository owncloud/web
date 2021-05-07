Feature: Sharing files and folders with internal groups
  As a user
  I want to share files and folders with groups
  So that those groups can access the files and folders

  Background:
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares"
    And these users have been created with default attributes and without skeleton files:
      | username |
      | Alice    |
      | Brian    |
      | Carol    |
    And group "grp1" has been created
    And user "Alice" has been added to group "grp1"
    And user "Brian" has been added to group "grp1"


  Scenario: share a folder with multiple collaborators and check collaborator list order
    Given group "grp11" has been created
    And user "Carol" has created folder "simple-folder"
    And user "Carol" has logged in using the webUI
    When the user shares folder "simple-folder" with group "grp11" as "Viewer" using the webUI
    And the user shares folder "simple-folder" with user "Brian Murphy" as "Viewer" using the webUI
    And the user shares folder "simple-folder" with group "grp1" as "Viewer" using the webUI
    And the user shares folder "simple-folder" with user "Alice Hansen" as "Viewer" using the webUI
    Then the current collaborators list should have order "Carol King,Alice Hansen,Brian Murphy,grp1,grp11"

  @issue-ocis-1922 @issue-ocis-1743
  Scenario Outline: share a file & folder with another internal user
    Given user "Carol" has created folder "simple-folder"
    And user "Carol" has created file "simple-folder/lorem.txt"
    And user "Carol" has created file "testimage.jpg"
    And user "Carol" has logged in using the webUI
    When the user shares folder "simple-folder" with group "grp1" as "<set-role>" using the webUI
    And the user shares file "testimage.jpg" with group "grp1" as "<set-role>" using the webUI
    And user "Alice" accepts the share "simple-folder" offered by user "Carol" using the sharing API
    And user "Brian" accepts the share "simple-folder" offered by user "Carol" using the sharing API
    And user "Alice" accepts the share "testimage.jpg" offered by user "Carol" using the sharing API
    And user "Brian" accepts the share "testimage.jpg" offered by user "Carol" using the sharing API
    Then group "grp1" should be listed as "<expected-role>" in the collaborators list for folder "simple-folder" on the webUI
    And group "grp1" should be listed as "<expected-role>" in the collaborators list for file "testimage.jpg" on the webUI
    And user "Alice" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | Carol                 |
      | share_with  | grp1                  |
      | file_target | /Shares/simple-folder |
      | item_type   | folder                |
      | permissions | <permissions-folder>  |
    And user "Brian" should have received a share with these details:
      | field       | value                 |
      | uid_owner   | Carol                 |
      | share_with  | grp1                  |
      | file_target | /Shares/testimage.jpg |
      | item_type   | file                  |
      | permissions | <permissions-file>    |
    And as "Alice" these resources should be listed in the folder "Shares" on the webUI
      | entry_name    |
      | simple-folder |
      | testimage.jpg |
    And these resources should be listed in the folder "/Shares%2Fsimple-folder" on the webUI
      | entry_name |
      | lorem.txt  |
    But these resources should not be listed in the folder "/Shares%2Fsimple-folder" on the webUI
      | entry_name    |
      | simple-folder |
    When the user browses to the shared-with-me page using the webUI
    Then folder "simple-folder" should be marked as shared by "Carol King" on the webUI
    And file "testimage.jpg" should be marked as shared by "Carol King" on the webUI
    Examples:
      | set-role             | expected-role        | permissions-folder              | permissions-file  |
      | Viewer               | Viewer               | read,share                      | read,share        |
      | Editor               | Editor               | read,update,create,delete,share | read,update,share |
      | Advanced permissions | Advanced permissions | read                            | read              |

  @skip @issue-4102
  Scenario: share a file with an internal group a member overwrites and unshares the file
    Given user "Carol" has created file "lorem.txt"
    And user "Carol" has logged in using the webUI
    When the user renames file "lorem.txt" to "new-lorem.txt" using the webUI
    And the user shares file "new-lorem.txt" with group "grp1" as "Editor" using the webUI
    And user "Alice" accepts the share "new-lorem.txt" offered by user "Carol" using the sharing API
    And user "Brian" accepts the share "new-lorem.txt" offered by user "Carol" using the sharing API
    And the user re-logs in as "Alice" using the webUI
    Then as "Alice" the content of "/Shares/new-lorem.txt" should not be the same as the local "new-lorem.txt"
    # overwrite the received shared file
    When the user opens folder "Shares" using the webUI
    And the user uploads overwriting file "new-lorem.txt" using the webUI
    Then file "new-lorem.txt" should be listed on the webUI
    And as "Alice" the content of "/Shares/new-lorem.txt" should be the same as the local "new-lorem.txt"
    # unshare the received shared file
    When the user unshares file "new-lorem.txt" using the webUI
    Then file "new-lorem.txt" should not be listed on the webUI
    # check that another group member can still see the file
    And as "Brian" the content of "/Shares/new-lorem.txt" should be the same as the local "new-lorem.txt"
    # check that the original file owner can still see the file
    And as "Carol" the content of "new-lorem.txt" should be the same as the local "new-lorem.txt"

  @issue-ocis-1943
  Scenario: share a folder with an internal group and a member uploads, overwrites and deletes files
    Given user "Carol" has created folder "simple-folder"
    And user "Carol" has created file "simple-folder/lorem.txt"
    And user "Carol" has created file "simple-folder/data.zip"
    And user "Carol" has logged in using the webUI
    When the user renames folder "simple-folder" to "new-simple-folder" using the webUI
    And the user shares folder "new-simple-folder" with group "grp1" as "Editor" using the webUI
    And user "Alice" accepts the share "new-simple-folder" offered by user "Carol" using the sharing API
    And user "Brian" accepts the share "new-simple-folder" offered by user "Carol" using the sharing API
    And the user re-logs in as "Alice" using the webUI
    And the user opens folder "Shares" using the webUI
    And the user opens folder "new-simple-folder" using the webUI
    Then as "Alice" the content of "/Shares/new-simple-folder/lorem.txt" should not be the same as the local "lorem.txt"
    # overwrite an existing file in the received share
    When the user uploads overwriting file "lorem.txt" using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And as "Alice" the content of "/Shares/new-simple-folder/lorem.txt" should be the same as the local "lorem.txt"
    # upload a new file into the received share
    When the user uploads file "new-lorem.txt" using the webUI
    Then as "Alice" the content of "/Shares/new-simple-folder/new-lorem.txt" should be the same as the local "new-lorem.txt"
    # delete a file in the received share
    When the user deletes file "data.zip" using the webUI
    Then file "data.zip" should not be listed on the webUI
    # check that the file actions by the sharee are visible to another group member
    When the user re-logs in as "Brian" using the webUI
    And the user opens folder "Shares" using the webUI
    And the user opens folder "new-simple-folder" using the webUI
    Then as "Brian" the content of "/Shares/new-simple-folder/lorem.txt" should be the same as the local "lorem.txt"
    And as "Brian" the content of "/Shares/new-simple-folder/new-lorem.txt" should be the same as the local "new-lorem.txt"
    And file "data.zip" should not be listed on the webUI
    # check that the file actions by the sharee are visible for the share owner
    When the user re-logs in as "Carol" using the webUI
    And the user opens folder "new-simple-folder" using the webUI
    Then as "Carol" the content of "new-simple-folder/lorem.txt" should be the same as the local "lorem.txt"
    And as "Carol" the content of "new-simple-folder/new-lorem.txt" should be the same as the local "new-lorem.txt"
    And file "data.zip" should not be listed on the webUI

  @skip @issue-4102
  Scenario: share a folder with an internal group and a member unshares the folder
    Given user "Carol" has created folder "simple-folder"
    And user "Carol" has created file "simple-folder/lorem.txt"
    And user "Carol" has logged in using the webUI
    When the user renames folder "simple-folder" to "new-simple-folder" using the webUI
    And the user shares folder "new-simple-folder" with group "grp1" as "Editor" using the webUI
    And user "Alice" accepts the share "new-simple-folder" offered by user "Carol" using the sharing API
    And user "Brian" accepts the share "new-simple-folder" offered by user "Carol" using the sharing API
    # unshare the received shared folder and check it is gone
    And the user re-logs in as "Alice" using the webUI
    And the user opens folder "Shares" using the webUI
    And the user deletes folder "new-simple-folder" using the webUI
    Then folder "new-simple-folder" should not be listed on the webUI
    # check that the folder is still visible to another group member
    When the user re-logs in as "Brian" using the webUI
    And the user opens folder "Shares" using the webUI
    Then folder "new-simple-folder" should be listed on the webUI
    When the user opens folder "new-simple-folder" using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And as "Brian" the content of "/Shares/new-simple-folder/lorem.txt" should be the same as the original "simple-folder/lorem.txt"
    # check that the folder is still visible for the share owner
    When the user re-logs in as "Carol" using the webUI
    Then folder "new-simple-folder" should be listed on the webUI
    When the user opens folder "new-simple-folder" using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And as "Carol" the content of "new-simple-folder/lorem.txt" should be the same as the original "simple-folder/lorem.txt"

  @skip @yetToImplement
  Scenario: user tries to share a file in a group which is excluded from receiving share
    Given group "system-group" has been created
    And user "Alice" has created file "lorem.txt"
    And the administrator has browsed to the admin sharing settings page
    When the administrator excludes group "system-group" from receiving shares using the webUI
    Then user "Alice" should not be able to share file "lorem.txt" with group "system-group" using the sharing API

  @skip @yetToImplement
  Scenario: user tries to share a folder in a group which is excluded from receiving share
    Given group "system-group" has been created
    And user "Alice" has created folder "simple-folder"
    And the administrator has browsed to the admin sharing settings page
    When the administrator excludes group "system-group" from receiving shares using the webUI
    Then user "Alice" should not be able to share folder "simple-folder" with group "system-group" using the sharing API

  @issue-ocis-1277
  Scenario: user shares the file/folder with a group and delete the share with group
    Given user "Alice" has created file "lorem.txt"
    And user "Alice" has logged in using the webUI
    And user "Alice" has shared file "lorem.txt" with group "grp1"
    And user "Brian" has accepted the share "lorem.txt" offered by user "Alice"
    When the user opens the share dialog for file "lorem.txt" using the webUI
    Then group "grp1" should be listed as "Editor" in the collaborators list on the webUI
    When the user deletes "grp1" as collaborator for the current file using the webUI
    Then group "grp1" should not be listed in the collaborators list on the webUI
    And file "lorem.txt" should not be listed in shared-with-others page on the webUI
    And as "Brian" file "/Shares/lorem.txt" should not exist
    And as "Brian" file "lorem (2).txt" should not exist

  @issue-ocis-1277
  Scenario: user shares the file/folder with multiple internal users and delete the share with one user
    Given group "grp2" has been created
    And user "Alice" has created file "lorem.txt"
    And user "Carol" has been added to group "grp2"
    And user "Alice" has logged in using the webUI
    And user "Alice" has shared file "lorem.txt" with group "grp1"
    And user "Brian" has accepted the share "lorem.txt" offered by user "Alice"
    And user "Alice" has shared file "lorem.txt" with group "grp2"
    And user "Carol" has accepted the share "lorem.txt" offered by user "Alice"
    When the user opens the share dialog for file "lorem.txt" using the webUI
    Then group "grp1" should be listed as "Editor" in the collaborators list on the webUI
    And group "grp2" should be listed as "Editor" in the collaborators list on the webUI
    When the user deletes "grp1" as collaborator for the current file using the webUI
    Then group "grp1" should not be listed in the collaborators list on the webUI
    And group "grp2" should be listed as "Editor" in the collaborators list on the webUI
    And file "lorem.txt" should be listed in shared-with-others page on the webUI
    And as "Brian" file "/Shares/lorem.txt" should not exist
    But as "Carol" file "/Shares/lorem.txt" should exist

  @issue-ocis-1317
  Scenario: Auto-completion for a group that is excluded from receiving shares
    Given group "system-group" has been created
    And user "Alice" has created folder "simple-folder"
    And the administrator has excluded group "system-group" from receiving shares
    When the user re-logs in as "Alice" using the webUI
    And the user browses to the files page
    And the user opens the share dialog for folder "simple-folder" using the webUI
    And the user opens the share creation dialog in the webUI
    And the user types "system-group" in the share-with-field
    Then the autocomplete list should not be displayed on the webUI

  @issue-2897 @issue-ocis-1231 @issue-ocis-1277
  Scenario: sharing details of items inside a shared folder shared with user and group
    Given user "Carol" has created folder "/simple-folder"
    And user "Carol" has created folder "/simple-folder/sub-folder"
    And user "Carol" has created file "/simple-folder/sub-folder/lorem.txt"
    And user "Carol" has uploaded file with content "test" to "/simple-folder/sub-folder/lorem.txt"
    And user "Carol" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has accepted the share "simple-folder" offered by user "Carol"
    And user "Carol" has shared folder "/simple-folder/sub-folder" with group "grp1"
    And user "Alice" has accepted the share "simple-folder/sub-folder" offered by user "Carol"
    And user "Brian" has accepted the share "simple-folder/sub-folder" offered by user "Carol"
    And user "Carol" has logged in using the webUI
    When the user opens folder "simple-folder/sub-folder" directly on the webUI
    And the user opens the share dialog for file "lorem.txt" using the webUI
    Then user "Brian Murphy" should be listed as "Editor" via "simple-folder" in the collaborators list on the webUI
    And group "grp1" should be listed as "Editor" via "sub-folder" in the collaborators list on the webUI

  @issue-2898
  Scenario: see resource owner of parent group shares in collaborators list
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has created folder "simple-folder/simple-empty-folder"
    And user "Alice" has shared folder "simple-folder" with group "grp1"
    And user "Brian" has accepted the share "simple-folder" offered by user "Alice"
    And user "Brian" has shared folder "Shares/simple-folder" with user "Carol"
    And user "Carol" has accepted the share "simple-folder" offered by user "Brian"
    And user "Carol" has logged in using the webUI
    And the user opens folder "Shares" using the webUI
    And the user opens folder "simple-folder" using the webUI
    When the user opens the share dialog for folder "simple-empty-folder" using the webUI
    Then user "Alice Hansen" should be listed as "Owner" reshared through "Brian Murphy" via "simple-folder" in the collaborators list on the webUI
    And the current collaborators list should have order "Alice Hansen,Carol King"


  Scenario: share a folder with other group and then it should be listed on Shared with Others page
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has logged in using the webUI
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Alice" has shared folder "simple-folder" with group "grp1"
    When the user browses to the shared-with-others page
    Then the following resources should have the following collaborators
      | fileName      | expectedCollaborators |
      | simple-folder | Brian Murphy, grp1        |

  @issue-ocis-1250
  Scenario: change existing expiration date of an existing share with another internal group
    Given user "Carol" has created file "lorem.txt"
    And user "Carol" has created a new share with following settings
      | path            | lorem.txt |
      | shareTypeString | group     |
      | shareWith       | grp1      |
      | expireDate      | +14       |
    And user "Alice" has accepted the share "lorem.txt" offered by user "Carol"
    And user "Brian" has accepted the share "lorem.txt" offered by user "Carol"
    And user "Carol" has logged in using the webUI
    When the user edits the collaborator expiry date of "grp1" of file "lorem.txt" to "+7" days using the webUI
    Then user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 7 days
    And user "Carol" should have a share with these details:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +7         |

  @issue-ocis-1317 @issue-ocis-1250
  Scenario: share a resource with another internal group with default expiration date
    Given the setting "shareapi_default_expire_date_group_share" of app "core" has been set to "yes"
    And the setting "shareapi_expire_after_n_days_group_share" of app "core" has been set to "42"
    And user "Carol" has created file "lorem.txt"
    And user "Carol" has logged in using the webUI
    When the user shares folder "lorem.txt" with group "grp1" as "Viewer" using the webUI
    And user "Alice" accepts the share "lorem.txt" offered by user "Carol" using the sharing API
    And user "Brian" accepts the share "lorem.txt" offered by user "Carol" using the sharing API
    Then user "Carol" should have a share with these details:
      | field      | value      |
      | path       | /lorem.txt |
      | share_type | group      |
      | uid_owner  | Carol      |
      | share_with | grp1       |
      | expiration | +42        |
    And user "Alice" should have received a share with target "Shares/lorem.txt" and expiration date in 42 days
    And user "Brian" should have received a share with target "Shares/lorem.txt" and expiration date in 42 days

  @issue-ocis-1250
  Scenario Outline: share a resource with another internal group with expiration date beyond maximum enforced expiration date
    Given the setting "shareapi_default_expire_date_group_share" of app "core" has been set to "yes"
    And the setting "shareapi_enforce_expire_date_group_share" of app "core" has been set to "yes"
    And the setting "shareapi_expire_after_n_days_group_share" of app "core" has been set to "5"
    And user "Carol" has created file "lorem.txt"
    And user "Carol" has created folder "simple-folder"
    And user "Carol" has logged in using the webUI
    When the user tries to share resource "<shared-resource>" with group "grp1" which expires in "+6" days using the webUI
    Then the expiration date shown on the webUI should be "+5" days
    And user "Alice" should not have created any shares
    Examples:
      | shared-resource |
      | lorem.txt       |
      | simple-folder   |

  @issue-ocis-1250
  Scenario Outline: share a resource with another internal group with expiration date within maximum enforced expiration date
    Given the setting "shareapi_default_expire_date_group_share" of app "core" has been set to "yes"
    And the setting "shareapi_enforce_expire_date_group_share" of app "core" has been set to "yes"
    And the setting "shareapi_expire_after_n_days_group_share" of app "core" has been set to "5"
    And user "Carol" has created file "lorem.txt"
    And user "Carol" has created folder "simple-folder"
    And user "Carol" has created a new share with following settings
      | path            | <shared-resource> |
      | shareTypeString | group             |
      | shareWith       | grp1              |
      | expireDate      | +4                |
    And user "Alice" has accepted the share "<shared-resource>" offered by user "Carol"
    And user "Brian" has accepted the share "<shared-resource>" offered by user "Carol"
    And user "Carol" has logged in using the webUI
    When the user tries to edit the collaborator expiry date of "grp1" of resource "<shared-resource>" to "+7" days using the webUI
    Then the expiration date shown on the webUI should be "+4" days
    And it should not be possible to save the pending share on the webUI
    And user "Alice" should have received a share with target "<target-resource>" and expiration date in 4 days
    And user "Brian" should have received a share with target "<target-resource>" and expiration date in 4 days
    Examples:
      | shared-resource | target-resource      |
      | lorem.txt       | Shares/lorem.txt     |
      | simple-folder   | Shares/simple-folder |
