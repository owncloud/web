@public_link_share-feature-required @ocis-reva-issue-64
Feature: Edit public link shares
  As a user
  I want to edit public share
  So that I can manage the the shares

  Background:
    Given user "Alice" has been created with default attributes

  @issue-ocis-reva-41
  Scenario Outline: user tries to change the role of an existing public link role without entering share password while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes"
    And user "Alice" has created a public link with following settings
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public-link" of folder "simple-folder" changing following
      | role | <role> |
    Then the user should see an error message on the public link share dialog saying "Passwords are enforced for link shares"
    And user "Alice" should have a share with these details:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions | role        | setting-name                                      |
      | read, create        | Viewer      | shareapi_enforce_links_password_read_only         |
      | read                | Contributor | shareapi_enforce_links_password_read_write        |
      | read                | Editor      | shareapi_enforce_links_password_read_write_delete |
      | read, create        | Uploader    | shareapi_enforce_links_password_write_only        |

  @issue-ocis-reva-41
  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes"
    And user "Alice" has created a public link with following settings
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public-link" of folder "simple-folder" changing following
      | password |  |
    Then the user should see an error message on the public link share dialog saying "Passwords are enforced for link shares"
    And user "Alice" should have a share with these details:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read                         | shareapi_enforce_links_password_read_only         |
      | read, create                 | shareapi_enforce_links_password_read_write        |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |
      | create                       | shareapi_enforce_links_password_write_only        |

  @issue-ocis-reva-41
  Scenario Outline: user changes the role of an existing public link role without entering share password while enforce password for the original role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes"
    And user "Alice" has created a public link with following settings
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public-link" of folder "simple-folder" changing following
      | role     | <role> |
      | password |        |
    Then user "Alice" should have a share with these details:
      | field       | value                  |
      | share_type  | public_link            |
      | uid_owner   | Alice                  |
      | permissions | <expected-permissions> |
      | path        | /simple-folder         |
    Examples:
      | initial-permissions          | role        | setting-name                                      | expected-permissions         |
      | read                         | Contributor | shareapi_enforce_links_password_read_only         | read, create                 |
      | read, create                 | Viewer      | shareapi_enforce_links_password_read_write        | read                         |
      | read, update, create, delete | Uploader    | shareapi_enforce_links_password_read_write_delete | create                       |
      | create                       | Editor      | shareapi_enforce_links_password_write_only        | read, update, create, delete |

  @yetToImplement @issue-ocis-reva-41
  Scenario: user edits a public link and does not save the changes
    Given the setting "shareapi_allow_public_notification" of app "core" has been set to "yes"
    And user "Alice" has logged in using the webUI
    And user "Alice" has created a public link with following settings
      | path     | simple-folder    |
      | name     | test_public_link |
      | password | pass123          |
#      | email     | foo1234@bar.co   |
    When the user edits the public link named "test_public_link" of folder "simple-folder" changing following but not saving
      | password | qwertyui |
    And the public uses the webUI to access the last public link created by user "Alice" with password "qwertyui"
    Then the public should not get access to the publicly shared file

  Scenario: user edits a name of an already existing public link
    Given user "Alice" has logged in using the webUI
    And user "Alice" has created a public link with following settings
      | path        | simple-folder |
      | name        | Public-link   |
      | permissions | read          |
      | password    | pass123       |
    When the user edits the public link named "Public-link" of folder "simple-folder" changing following
      | name | simple-folder Share |
    And the public uses the webUI to access the last public link created by user "Alice" with password "pass123"
    Then file "lorem.txt" should be listed on the webUI

  Scenario: user edits the password of an already existing public link
    Given user "Alice" has created a public link with following settings
      | path        | simple-folder                |
      | name        | Public-link                  |
      | permissions | read, update, create, delete |
      | password    | pass123                      |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public-link" of folder "simple-folder" changing following
      | password | qwertyui |
    And the public uses the webUI to access the last public link created by user "Alice" with password "qwertyui"
    Then file "lorem.txt" should be listed on the webUI

  @issue-3830
  Scenario: user edits the password of an already existing public link and tries to access with old password
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "pass123"
    And user "Alice" has created a public link with following settings
      | path        | simple-folder                |
      | name        | Public-link                  |
      | permissions | read, update, create, delete |
      | password    | pass123                      |
    And user "Alice" has logged in using the webUI
    And the user edits the public link named "Public-link" of folder "simple-folder" changing following
      | password | qwertyui |
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass123"
    Then the public should not get access to the publicly shared file

  @issue-ocis-reva-292
  Scenario: user edits the permission of an already existing public link from read-write to read
    Given user "Alice" has created a public link with following settings
      | path        | simple-folder                |
      | name        | Public-link                  |
      | permissions | read, update, create, delete |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public-link" of folder "simple-folder" changing following
      | role | Viewer |
    And the public uses the webUI to access the last public link created by user "Alice"
    Then file "lorem.txt" should be listed on the webUI
    And it should not be possible to delete file "lorem.txt" using the webUI

  @issue-ocis-reva-292 @disablePreviews
  Scenario: user edits the permission of an already existing public link from read to read-write
    Given user "Alice" has created a public link with following settings
      | path        | simple-folder |
      | name        | Public-link   |
      | permissions | read          |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public-link" of folder "simple-folder" changing following
      | role | Editor |
    And the public uses the webUI to access the last public link created by user "Alice"
    And the user deletes the following elements using the webUI
      | name                |
      | simple-empty-folder |
      | lorem.txt           |
    Then the deleted elements should not be listed on the webUI
    And the deleted elements should not be listed on the webUI after a page reload

  @issue-ocis-reva-389
  Scenario: user removes the public link of a file using webUI
    Given user "Alice" has logged in using the webUI
    And user "Alice" has created a public link with following settings
      | path        | lorem.txt   |
      | name        | Public-link |
      | permissions | read        |
    When the user removes the public link named "Public-link" of file "lorem.txt" using the webUI
    Then user "Alice" should not have any public link

  @skip @yetToImplement
  Scenario: user edits the permission of an already existing public link from read-write to upload-write-without-overwrite
    Given the user has created a new public link for folder "simple-folder" using the webUI with
      | permission | read-write |
    When the user changes the permission of the public link named "Public link" to "upload-write-without-modify"
    And the public accesses the last created public link using the webUI
    When the user uploads file "lorem.txt" keeping both new and existing files using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And file "lorem (2).txt" should be listed on the webUI


  Scenario: assign password to already created public share
    Given user "Alice" has created a public link with following settings
      | path        | lorem.txt             |
      | name        | Public-link           |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public-link" of file "lorem.txt" changing following
      | password | pass123 |
    And the public tries to open the public link page of the last public link created by user "Alice" with password "pass123"
    Then file "lorem.txt" should be listed on the webUI