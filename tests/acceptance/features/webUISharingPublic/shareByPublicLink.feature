@mailhog @public_link_share-feature-required @ocis-reva-issue-64
Feature: Share by public link
  As a user
  I want to share files through a publicly accessible link
  So that users who do not have an account on my ownCloud server can access them

  As an admin
  I want to limit the ability of a user to share files/folders through a publicly accessible link
  So that public sharing is limited according to organization policy

  Background:
    Given user "Alice" has been created with default attributes

  @smokeTest @issue-ocis-reva-383
  Scenario Outline: simple sharing by public link
    Given user "Alice" has logged in using the webUI
    When the user creates a new public link for resource "<shared-resource>" using the webUI
    Then user "Alice" should have a share with these details:
      | field       | value              |
      | share_type  | public_link        |
      | uid_owner   | Alice              |
      | permissions | read               |
      | path        | /<shared-resource> |
      | name        | Public link        |
    And a link named "Public link" should be listed with role "Viewer" in the public link list of resource "<shared-resource>" on the webUI
    When the public uses the webUI to access the last public link created by user "Alice"
    Then file "lorem.txt" should be listed on the webUI
    Examples:
      | shared-resource |
      | simple-folder   |
      | lorem.txt       |

  @skipOnOC10 @issue-ocis-reva-383
  # When this issue is fixed delete this scenario and use the one above
  Scenario Outline: simple sharing by public link (ocis bug demonstration)
    Given user "Alice" has logged in using the webUI
    When the user creates a new public link for resource "<shared-resource>" using the webUI
    Then user "Alice" should have a share with these details:
      | field       | value              |
      | share_type  | public_link        |
      | uid_owner   | Alice              |
      | permissions | read               |
      | path        | /<shared-resource> |
    And a public link with the last created link share token as name should be listed for resource "<shared-resource>" on the webUI
    When the public uses the webUI to access the last public link created by user "Alice"
    Then file "lorem.txt" should be listed on the webUI
    Examples:
      | shared-resource |
      | simple-folder   |
      | lorem.txt       |


  Scenario: public link share shows up on shared-with-others page
    Given user "Alice" has logged in using the webUI
    And user "Alice" has shared folder "simple-folder" with link with "read" permissions
    When the user browses to the shared-with-others page using the webUI
    Then the resource "simple-folder" should have the token of last link in the people column on the webUI
    But file "data.zip" should not be listed on the webUI

  @issue-4858 @issue-276 @issue-ocis-reva-398
  Scenario: Thumbnails are loaded for known file types in public link file list
    Given user "Alice" has shared folder "simple-folder" with link with "read,create" permissions
    When the public uses the webUI to access the last public link created by user "Alice"
    And the user uploads file "new-lorem.txt" using the webUI
    Then the file "new-lorem.txt" should have a thumbnail displayed on the webUI

  @issue-276 @issue-ocis-reva-398
  Scenario: Thumbnails are not loaded for known file types in public link file list
    Given user "Alice" has shared folder "simple-folder" with link with "read,create" permissions
    When the public uses the webUI to access the last public link created by user "Alice"
    And the user uploads file "new-data.zip" using the webUI
    Then the file "new-data.zip" should have a file type icon displayed on the webUI


  Scenario: opening public-link page of the files-drop link protected with password should redirect to files-drop page
    Given user "Alice" has shared folder "simple-folder" with link with "create" permissions and password "pass123"
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass123"
    Then the user should be redirected to the files-drop page


  Scenario: opening public-link page of the files-drop link without password set should redirect to files-drop page
    Given user "Alice" has shared folder "simple-folder" with link with "create" permissions
    When the public uses the webUI to access the last public link created by user "Alice"
    Then the user should be redirected to the files-drop page


  @skip @yetToImplement
  Scenario: mount public link
    Given using server "REMOTE"
    And user "Brian" has been created with default attributes
    When the user creates a new public link for folder "simple-folder" using the webUI
    And the user logs out of the webUI
    And the public accesses the last created public link using the webUI
    And the public adds the public link to "%remote_server%" as user "Brian" with password "%alt2%" using the webUI
    And the user accepts the offered remote shares using the webUI
    Then folder "simple-folder (2)" should be listed on the webUI
    When the user opens folder "simple-folder (2)" using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And the content of "lorem.txt" on the remote server should be the same as the original "simple-folder/lorem.txt"
    And it should not be possible to delete file "lorem.txt" using the webUI

  @skip @yetToImplement
  Scenario: mount public link and overwrite file
    Given using server "REMOTE"
    And user "Brian" has been created with default attributes
    When the user creates a new public link for folder "simple-folder" using the webUI with
      | permission | read-write |
    And the user logs out of the webUI
    And the public accesses the last created public link using the webUI
    And the public adds the public link to "%remote_server%" as user "Brian" with password "%alt2%" using the webUI
    And the user accepts the offered remote shares using the webUI
    Then folder "simple-folder (2)" should be listed on the webUI
    When the user opens folder "simple-folder (2)" using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And the content of "lorem.txt" on the remote server should be the same as the original "simple-folder/lorem.txt"
    When the user uploads overwriting file "lorem.txt" using the webUI and retries if the file is locked
    Then file "lorem.txt" should be listed on the webUI
    And the content of "lorem.txt" on the remote server should be the same as the local "lorem.txt"


  Scenario: public should be able to access a public link with correct password
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "pass123"
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass123"
    Then file "lorem.txt" should be listed on the webUI


  Scenario: public should not be able to access a public link with wrong password
    Given user "Alice" has shared folder "simple-folder" with link with "read" permissions and password "pass123"
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass12"
    Then the public should not get access to the publicly shared file

  @issue-ocis-reva-389
  Scenario: user shares a public link with folder longer than 64 chars and shorter link name
    Given user "Alice" has renamed folder "simple-folder" to "aquickbrownfoxjumpsoveraverylazydogaquickbrownfoxjumpsoveralazydog"
    And user "Alice" has logged in using the webUI
    When the user creates a new public link for folder "aquickbrownfoxjumpsoveraverylazydogaquickbrownfoxjumpsoveralazydog" using the webUI with
      | name | short_linkname |
    And the public uses the webUI to access the last public link created by user "Alice"
    Then file "lorem.txt" should be listed on the webUI

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

  @yetToImplement
  Scenario: public should be able to access the shared file through public link
    Given user "Alice" has logged in using the webUI
    And user "Alice" has created a public link with following settings
      | path | lorem.txt   |
      | name | Public link |
    When the public uses the webUI to access the last public link created by user "Alice"
    Then file "lorem.txt" should be listed on the webUI
#    Then the text preview of the public link should contain "Lorem ipsum dolor sit amet, consectetur"
#    And the content of the file shared by the last public link should be the same as "lorem.txt"

  @skip @yetToImplement
  Scenario: user shares a public link via email
    Given the setting "shareapi_allow_public_notification" of app "core" has been set to "yes"
    And user "Alice" has logged in using the webUI
    And the user reloads the current page of the webUI
    When the user creates a new public link for folder "simple-folder" using the webUI with
      | email | foo@bar.co |
    Then the email address "foo@bar.co" should have received an email with the body containing
      """
      Alice Hansen shared simple-folder with you
      """
    And the email address "foo@bar.co" should have received an email containing the last shared public link

  @skip @yetToImplement
  Scenario: user shares a public link via email and sends a copy to self
    Given the setting "shareapi_allow_public_notification" of app "core" has been set to "yes"
    And the user reloads the current page of the webUI
    When the user creates a new public link for folder "simple-folder" using the webUI with
      | email       | foo@bar.co |
      | emailToSelf | true       |
    Then the email address "foo@bar.co" should have received an email with the body containing
      """
      Alice Hansen shared simple-folder with you
      """
    And the email address "alice@example.org" should have received an email with the body containing
      """
      Alice Hansen shared simple-folder with you
      """
    And the email address "foo@bar.co" should have received an email containing the last shared public link
    And the email address "alice@example.org" should have received an email containing the last shared public link

  @skip @yetToImplement
  Scenario: user shares a public link via email with multiple addresses
    Given the setting "shareapi_allow_public_notification" of app "core" has been set to "yes"
    And the user reloads the current page of the webUI
    When the user creates a new public link for folder "simple-folder" using the webUI with
      | email | foo@bar.co, foo@barr.co |
    Then the email address "foo@bar.co" should have received an email with the body containing
      """
      Alice Hansen shared simple-folder with you
      """
    And the email address "foo@barr.co" should have received an email with the body containing
      """
      Alice Hansen shared simple-folder with you
      """
    And the email address "foo@bar.co" should have received an email containing the last shared public link
    And the email address "foo@barr.co" should have received an email containing the last shared public link

  @skip @yetToImplement
  Scenario: user shares a public link via email with a personal message
    Given the setting "shareapi_allow_public_notification" of app "core" has been set to "yes"
    And the user reloads the current page of the webUI
    When the user creates a new public link for folder "simple-folder" using the webUI with
      | email           | foo@bar.co  |
      | personalMessage | lorem ipsum |
    Then the email address "foo@bar.co" should have received an email with the body containing
      """
      Alice Hansen shared simple-folder with you
      """
    And the email address "foo@bar.co" should have received an email with the body containing
      """
      lorem ipsum
      """
    And the email address "foo@bar.co" should have received an email containing the last shared public link

  @skip @yetToImplement
  Scenario: user shares a public link via email adding few addresses before and then removing some addresses afterwards
    Given the setting "shareapi_allow_public_notification" of app "core" has been set to "yes"
    And the user reloads the current page of the webUI
    When the user opens the link share dialog for folder "simple-folder" using the webUI
    And the user opens the create public link share popup
    And the user adds the following email addresses using the webUI:
      | email           |
      | foo1234@bar.co  |
      | foo5678@bar.co  |
      | foo1234@barr.co |
      | foo5678@barr.co |
    And the user removes the following email addresses using the webUI:
      | email           |
      | foo1234@bar.co  |
      | foo5678@barr.co |
    And the user creates the public link using the webUI
    Then the email address "foo5678@bar.co" should have received an email with the body containing
      """
      Alice Hansen shared simple-folder with you
      """
    And the email address "foo1234@barr.co" should have received an email with the body containing
      """
      Alice Hansen shared simple-folder with you
      """
    And the email address "foo5678@bar.co" should have received an email containing the last shared public link
    And the email address "foo1234@barr.co" should have received an email containing the last shared public link
    But the email address "foo1234@bar.co" should not have received an email
    And the email address "foo5678@barr.co" should not have received an email

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

  @skip @yetToImplement @issue-ocis-reva-41
  Scenario: user shares a public link via email with a personal message (duplicate)
    Given parameter "shareapi_allow_public_notification" of app "core" has been set to "yes"
    And the user has reloaded the current page of the webUI
    When the user creates a new public link for folder "simple-folder" using the webUI with
      | email           | foo@bar.co  |
      | personalMessage | lorem ipsum |
    Then the email address "foo@bar.co" should have received an email with the body containing
      """
      Alice Hansen shared simple-folder with you
      """
    And the email address "foo@bar.co" should have received an email with the body containing
      """
      lorem ipsum
      """
    And the email address "foo@bar.co" should have received an email containing the last shared public link


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

  @issue-ocis-reva-41
  Scenario: user shares a file through public link and then it appears in a shared-with-others page
    Given the setting "shareapi_allow_public_notification" of app "core" has been set to "yes"
    And user "Alice" has created a public link with following settings
      | path        | simple-folder                |
      | name        | link-editor                  |
      | permissions | read, update, create, delete |
    And user "Alice" has created a public link with following settings
      | path        | simple-folder |
      | name        | link-viewer   |
      | permissions | read          |
    And user "Alice" has logged in using the webUI
    When the user browses to the shared-with-others page
    Then folder "simple-folder" should be listed on the webUI
    And the following resources should have the following collaborators
      | fileName      | expectedCollaborators    |
      | simple-folder | link-editor, link-viewer |


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

  @skip @yetToImplement
  Scenario: share two file with same name but different paths by public link
    When the user creates a new public link for file "lorem.txt" using the webUI
    And the user closes the details dialog
    And the user opens folder "simple-folder" using the webUI
    And the user creates a new public link for file "lorem.txt" using the webUI
    And the user browses to the shared-by-link page
    Then file "lorem.txt" with path "" should be listed in the shared with others page on the webUI
    And file "lorem.txt" with path "/simple-folder" should be listed in the shared with others page on the webUI

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
  Scenario: user cancel removes operation for the public link of a file
    Given the user has created a new public link for file "lorem.txt" using the webUI
    When the user tries to remove the public link of file "lorem.txt" but later cancels the remove dialog using webUI
    And the public accesses the last created public link using the webUI
    Then the content of the file shared by the last public link should be the same as "lorem.txt"


  Scenario: user creates a multiple public link of a file and delete the first link
    Given user "Alice" has created a public link with following settings
      | path | lorem.txt  |
      | name | first-name |
    And user "Alice" has created a public link with following settings
      | path | lorem.txt   |
      | name | second-name |
    And user "Alice" has created a public link with following settings
      | path | lorem.txt  |
      | name | third-name |
    And user "Alice" has logged in using the webUI
    When the user removes the public link named "first-name" of file "lorem.txt" using the webUI
    Then public link named "first-name" should not be listed on the public links list on the webUI
    And a link named "second-name" should be listed with role "Viewer" in the public link list of file "lorem.txt" on the webUI
    And a link named "third-name" should be listed with role "Viewer" in the public link list of folder "lorem.txt" on the webUI


  Scenario: user creates a multiple public link of a file and delete the second link
    Given user "Alice" has created a public link with following settings
      | path | lorem.txt  |
      | name | first-name |
    And user "Alice" has created a public link with following settings
      | path | lorem.txt   |
      | name | second-name |
    And user "Alice" has created a public link with following settings
      | path | lorem.txt  |
      | name | third-name |
    And user "Alice" has logged in using the webUI
    When the user removes the public link named "second-name" of file "lorem.txt" using the webUI
    Then public link named "second-name" should not be listed on the public links list on the webUI
    And a link named "first-name" should be listed with role "Viewer" in the public link list of file "lorem.txt" on the webUI
    And a link named "third-name" should be listed with role "Viewer" in the public link list of folder "lorem.txt" on the webUI


  Scenario: user creates a multiple public link of a file and delete the third link
    Given user "Alice" has created a public link with following settings
      | path | lorem.txt  |
      | name | first-name |
    And user "Alice" has created a public link with following settings
      | path | lorem.txt   |
      | name | second-name |
    And user "Alice" has created a public link with following settings
      | path | lorem.txt  |
      | name | third-name |
    And user "Alice" has logged in using the webUI
    When the user removes the public link named "third-name" of file "lorem.txt" using the webUI
    Then public link named "third-name" should not be listed on the public links list on the webUI
    And a link named "first-name" should be listed with role "Viewer" in the public link list of file "lorem.txt" on the webUI
    And a link named "second-name" should be listed with role "Viewer" in the public link list of folder "lorem.txt" on the webUI

  @skip @yetToImplement
  Scenario: user creates public link with view and upload feature
    When the user creates a new public link for folder "simple-folder" using the webUI with
      | permission | upload-write-without-modify |
    And the public accesses the last created public link using the webUI

  @skip @yetToImplement
  Scenario: user edits the permission of an already existing public link from read-write to upload-write-without-overwrite
    Given the user has created a new public link for folder "simple-folder" using the webUI with
      | permission | read-write |
    When the user changes the permission of the public link named "Public link" to "upload-write-without-modify"
    And the public accesses the last created public link using the webUI
    And the user uploads file "lorem.txt" keeping both new and existing files using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And file "lorem (2).txt" should be listed on the webUI


  Scenario: user browses to public link share using copy link button
    Given user "Alice" has created a public link with following settings
      | path        | simple-folder |
      | name        | Public-link   |
      | permissions | read          |
    And user "Alice" has logged in using the webUI
    When the user copies the url of public link named "Public-link" of folder "simple-folder" using the webUI
    And the user navigates to the copied public link using the webUI
    Then file "lorem.txt" should be listed on the webUI


  Scenario Outline: user creates multiple public links with same name for the same file/folder
    Given user "Alice" has logged in using the webUI
    When the user creates a new public link for <element> "<name>" using the webUI with
      | name | same_link_name |
    And the user creates a new public link for <element> "<name>" using the webUI with
      | name | same_link_name |
    Then the tokens should be unique for each public links on the webUI
    Examples:
      | element | name          |
      | folder  | simple-folder |
      | file    | lorem.txt     |

  @issue-2090
  Scenario: access details dialog of public share and check the tabs displayed
    Given user "Alice" has logged in using the webUI
    When the user creates a new public link for folder "simple-folder" using the webUI with
      | role | Editor |
    And the public uses the webUI to access the last public link created by user "Alice"
    And the user picks the row of file "lorem.txt" in the webUI
    Then the following accordion items should be visible in the details dialog on the webUI
      | name     |
      | versions |
      | links    |
      | people   |
#    Then the following tabs should not be visible in the details dialog
#      | name          |
#      | links         |
#      | people        |

  @issue-2060 @issue-ocis-reva-243
  Scenario: sharing indicator inside a shared folder
    Given user "Alice" has created folder "/simple-folder/sub-folder"
    And user "Alice" has uploaded file with content "test" to "/simple-folder/textfile.txt"
    And user "Alice" has shared folder "simple-folder" with link with "read" permissions
    When user "Alice" has logged in using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators |
      | simple-folder | link-direct        |
    When the user opens folder "simple-folder" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName     | expectedIndicators |
      | sub-folder   | link-indirect      |
      | textfile.txt | link-indirect      |

  @issue-2060 @issue-ocis-reva-243
  Scenario: sharing indicator for file uploaded inside a shared folder
    Given user "Alice" has shared folder "simple-folder" with link with "read" permissions
    And user "Alice" has logged in using the webUI
    When the user opens folder "simple-folder" using the webUI
    And the user uploads file "new-lorem.txt" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators |
      | new-lorem.txt | link-indirect      |

  @issue-2060 @issue-ocis-reva-243
  Scenario: sharing indicator for folder created inside a shared folder
    Given user "Alice" has shared folder "simple-folder" with link with "read" permissions
    And user "Alice" has logged in using the webUI
    When the user opens folder "simple-folder" using the webUI
    And the user creates a folder with the name "sub-folder" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName   | expectedIndicators |
      | sub-folder | link-indirect      |

  @issue-2060 @issue-ocis-reva-243
  Scenario: sharing indicators public link and collaborators inside a shared folder
    Given user "Brian" has been created with default attributes
    And user "Alice" has created folder "/simple-folder/sub-folder"
    And user "Alice" has uploaded file with content "test" to "/simple-folder/textfile.txt"
    And user "Alice" has shared folder "simple-folder" with link with "read" permissions
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    When user "Alice" has logged in using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators      |
      | simple-folder | link-direct,user-direct |
    When the user opens folder "simple-folder" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName     | expectedIndicators          |
      | sub-folder   | link-indirect,user-indirect |
      | textfile.txt | link-indirect,user-indirect |

  @issue-2060 @issue-ocis-reva-243
  Scenario: sharing indicators public link from reshare
    Given user "Brian" has been created with default attributes
    And user "Alice" has created folder "/simple-folder/sub-folder"
    And user "Alice" has uploaded file with content "test" to "/simple-folder/textfile.txt"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has shared folder "simple-folder (2)" with link with "read" permissions
    When user "Brian" has logged in using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName          | expectedIndicators        |
      | simple-folder (2) | link-direct,user-indirect |
    When the user opens folder "simple-folder (2)" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName     | expectedIndicators          |
      | sub-folder   | link-indirect,user-indirect |
      | textfile.txt | link-indirect,user-indirect |

  @issue-2060 @issue-ocis-reva-243
  Scenario: sharing indicators public link from child of reshare
    Given user "Brian" has been created with default attributes
    And user "Alice" has created folder "/simple-folder/sub-folder"
    And user "Alice" has uploaded file with content "test" to "/simple-folder/textfile.txt"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has shared folder "simple-folder (2)/sub-folder" with link with "read" permissions
    When user "Brian" has logged in using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName          | expectedIndicators |
      | simple-folder (2) | user-indirect      |
    When the user opens folder "simple-folder (2)" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName     | expectedIndicators        |
      | sub-folder   | link-direct,user-indirect |
      | textfile.txt | user-indirect             |

  @issue-2060 @issue-ocis-reva-243
  Scenario: no sharing indicator visible in file list from public link
    Given user "Brian" has been created with default attributes
    And user "Carol" has been created with default attributes
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has shared folder "simple-folder (2)/simple-empty-folder" with user "Carol"
    And user "Brian" has shared folder "simple-folder (2)" with link with "read" permissions
    When the public uses the webUI to access the last public link created by user "Brian"
    Then the following resources should not have share indicators on the webUI
      | simple-empty-folder |

  @issue-2939 @issue-ocis-reva-243
  Scenario: sharing indicator for link shares stays up to date
    Given user "Brian" has been created with default attributes
    When user "Alice" has logged in using the webUI
    Then the following resources should not have share indicators on the webUI
      | simple-folder |
    When the user shares folder "simple-folder" with user "Brian Murphy" as "Viewer" using the webUI
    And the user creates a new public link for resource "simple-folder" using the webUI with
      | field | value |
      | name  | first |
    And the user creates a new public link for resource "simple-folder" using the webUI with
      | field | value  |
      | name  | second |
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators      |
      | simple-folder | user-direct,link-direct |
    When the user opens folder "simple-folder" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators          |
      | testimage.png | user-indirect,link-indirect |
    When the user creates a new public link for resource "testimage.png" using the webUI with
      | field | value |
      | name  | third |
    # the indicator changes from link-indirect to link-direct to show the direct share
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators        |
      | testimage.png | user-indirect,link-direct |
    # removing the last link reverts the indicator to user-indirect
    When the user removes the public link named "third" of resource "testimage.png" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators          |
      | testimage.png | user-indirect,link-indirect |
    When the user opens folder "" directly on the webUI
    And the user removes the public link named "second" of resource "simple-folder" using the webUI
    # because there is still another link share left, the indicator stays
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators      |
      | simple-folder | user-direct,link-direct |
    # deleting the last collaborator removes the indicator
    When the user removes the public link named "first" of resource "simple-folder" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators |
      | simple-folder | user-direct        |

  @issue-2897
  Scenario: sharing details of indirect items inside a shared folder
    Given user "Alice" has created folder "/simple-folder/sub-folder"
    And user "Alice" has uploaded file with content "test" to "/simple-folder/textfile.txt"
    And user "Alice" has created a public link with following settings
      | path | /simple-folder |
      | name | Public Link    |
    And user "Alice" has logged in using the webUI
    When the user opens folder "simple-folder" using the webUI
    Then a link named "Public Link" should be listed with role "Viewer" in the public link list of resource "sub-folder" via "simple-folder" on the webUI

  @issue-2897
  Scenario: sharing details of multiple indirect public link shares
    Given user "Alice" has created folder "/simple-folder/sub-folder"
    And user "Alice" has uploaded file with content "test" to "/simple-folder/sub-folder/textfile.txt"
    And user "Alice" has created a public link with following settings
      | path | /simple-folder |
      | name | Public Link    |
    And user "Alice" has created a public link with following settings
      | path | /simple-folder/sub-folder      |
      | name | strängé लिंक नाम (#2 &).नेपाली |
    And user "Alice" has logged in using the webUI
    When the user opens folder "simple-folder/sub-folder" directly on the webUI
    Then a link named "Public Link" should be listed with role "Viewer" in the public link list of resource "textfile.txt" via "simple-folder" on the webUI
    And a link named "strängé लिंक नाम (#2 &).नेपाली" should be listed with role "Viewer" in the public link list of resource "textfile.txt" via "sub-folder" on the webUI

  @issue-3040 @issue-3841 @issue-ocis-reva-372
  Scenario: sharing details of indirect link share in "favorites" file lists
    Given user "Alice" has created a public link with following settings
      | path | /simple-folder |
      | name | Public Link    |
    And user "Alice" has created a public link with following settings
      | path | /simple-folder/simple-empty-folder |
      | name | Public Link Sub                    |
    And user "Alice" has favorited element "simple-folder/simple-empty-folder"
    And user "Alice" has logged in using the webUI
    When the user browses to the shared-with-others page
    And the user opens the share dialog for folder "simple-empty-folder" using the webUI
    Then a link named "Public Link" should be listed with role "Viewer" in the public link list of resource "simple-empty-folder" via "simple-folder" on the webUI
    And a link named "Public Link Sub" should be listed with role "Viewer" in the public link list of resource "simple-empty-folder" on the webUI
    When the user browses to the favorites page using the webUI
    Then a link named "Public Link" should be listed with role "Viewer" in the public link list of resource "simple-folder/simple-empty-folder" via "simple-folder" on the webUI

  @issue-ocis-reva-243
  Scenario: token is shown for links without a name
    When user "Alice" has created a public link with following settings
      | path | /simple-folder |
    And user "Alice" logs in using the webUI
    Then a public link with the last created link share token as name should be listed for resource "simple-folder" on the webUI

  @issue-ocis-reva-243
  Scenario: User can create a public link via quick action
    Given user "Alice" has logged in using the webUI
    When the user creates a public link via quick action for resource "simple-folder" using the webUI
    Then user "Alice" should have a share with these details:
      | field       | value             |
      | share_type  | public_link       |
      | uid_owner   | Alice             |
      | permissions | read              |
      | path        | /simple-folder    |
      | name        | Quick action link |
    And the following success message should be displayed on the webUI
      """
      Public link created
      Public link has been successfully created and copied into your clipboard.
      """

  @issue-product-130
  Scenario: User can attempt to upload a file in public link
    Given user "Alice" has created a public link with following settings
      | path        | lorem.txt   |
      | name        | public link |
      | permissions | read        |
    When the public uses the webUI to access the last public link created by user "Alice"
    Then file "lorem.txt" should be listed on the webUI
    And it should not be possible to create files using the webUI

  @skipOnOC10 @issue-product-130
  # When this issue is fixed delete this scenario and use the one above
  Scenario: User can attempt to upload a file in public link (ocis bug demonstration)
    Given user "Alice" has created a public link with following settings
      | path        | lorem.txt   |
      | name        | public link |
      | permissions | read        |
    When the public uses the webUI to access the last public link created by user "Alice"
    Then file "lorem.txt" should be listed on the webUI
    And it should be possible to create files using the webUI
#    And it should not be possible to create files using the webUI
    When the public uploads file "textfile.txt" using the webUI
    Then the following error message should be displayed on the webUI
      """
      File upload failed…
      Unknown error
      """


  Scenario: public creates a folder in the public link
    Given user "Alice" has created a public link with following settings
      | path        | /simple-folder |
      | name        | public link    |
      | permissions | read, create   |
    When the public uses the webUI to access the last public link created by user "Alice"
    And the public creates a folder with the name "public-created-folder" using the webUI
    Then folder "public-created-folder" should be listed on the webUI
    When the public reloads the current page of the webUI
    Then folder "public-created-folder" should be listed on the webUI
    And as "Alice" folder "/simple-folder/public-created-folder" should exist

  @skipOnOC10 @issue-4582
  Scenario: public batch deletes resources in the public link
    Given user "Alice" has created a public link with following settings
      | path        | /simple-folder               |
      | name        | public link                  |
      | permissions | read, create, delete, update |
    When the public uses the webUI to access the last public link created by user "Alice"
    And the public marks these files for batch action using the webUI
      | name                |
      | lorem.txt           |
      | simple-empty-folder |
      | data.zip            |
    And the public batch deletes the marked files using the webUI
    Then file "data.zip" should not be listed on the webUI
    And folder "simple-folder" should not be listed on the webUI
    And file "lorem.txt" should not be listed on the webUI
    And as "Alice" folder "/simple-folder/simple-empty-folder" should not exist
    And as "Alice" file "/simple-folder/lorem.txt" should not exist
    And as "Alice" file "/simple-folder/data.zip" should not exist


  Scenario: files are not selected initially in the public share
    Given user "Alice" has created a public link with following settings
      | path | /simple-folder |
      | name | public link    |
    When the public uses the webUI to access the last public link created by user "Alice"
    Then these files should not be selected on the webUI
      | name                |
      | lorem.txt           |
      | simple-empty-folder |
      | data.zip            |


  Scenario: public selects files and clear the selection in the public share
    Given user "Alice" has created a public link with following settings
      | path | /simple-folder |
      | name | public link    |
    When the public uses the webUI to access the last public link created by user "Alice"
    And the public marks these files for batch action using the webUI
      | name                |
      | lorem.txt           |
      | simple-empty-folder |
      | data.zip            |
    Then these files should be selected on the webUI
      | name                |
      | lorem.txt           |
      | simple-empty-folder |
      | data.zip            |
    When the public clears the selection of files
    Then these files should not be selected on the webUI
      | name                |
      | lorem.txt           |
      | simple-empty-folder |
      | data.zip            |

  Scenario: assign password to already created public share
    Given user "Alice" has created a public link with following settings
      | path        | lorem.txt             |
      | name        | Public-link           |
    And user "Alice" has logged in using the webUI
    When the user edits the public link named "Public-link" of file "lorem.txt" changing following
      | password | pass123 |
    And the public uses the webUI to access the last public link created by user "Alice" with password "pass123"
    Then file "lorem.txt" should be listed on the webUI

  Scenario: Shared via link page is displayed
    Given user "Alice" has created a public link with following settings
      | path        | lorem.txt             |
      | name        | Public-link           |
    And user "Alice" has logged in using the webUI
    When the user browses to the shared-via-link page using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And the following resources should have the following collaborators
      | fileName  | expectedCollaborators |
      | lorem.txt | Public-link           |
