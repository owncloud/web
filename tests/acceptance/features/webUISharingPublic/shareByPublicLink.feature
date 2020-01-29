@mailhog @public_link_share-feature-required
Feature: Share by public link
  As a user
  I want to share files through a publicly accessible link
  So that users who do not have an account on my ownCloud server can access them

  As an admin
  I want to limit the ability of a user to share files/folders through a publicly accessible link
  So that public sharing is limited according to organization policy

  Background:
    Given user "user1" has been created with default attributes

  @smokeTest
  Scenario Outline: simple sharing by public link
    Given user "user1" has logged in using the webUI
    When the user creates a new public link for resource "<shared-resource>" using the webUI
    Then user "user1" should have a share with these details:
      | field       | value              |
      | share_type  | public_link        |
      | uid_owner   | user1              |
      | permissions | read               |
      | path        | /<shared-resource> |
      | name        | Public link        |
    And a link named "Public link" should be listed with role "Viewer" in the public link list of resource "<shared-resource>" on the webUI
    When the public uses the webUI to access the last public link created by user "user1"
    Then file "lorem.txt" should be listed on the webUI
    Examples:
      | shared-resource |
      | simple-folder   |
      | lorem.txt       |

  @smokeTest
  Scenario Outline: simple sharing by public link with different roles
    Given user "user1" has logged in using the webUI
    When the user creates a new public link for folder "simple-folder" using the webUI with
      | role | <role> |
    Then user "user1" should have a share with these details:
      | field       | value          |
      | share_type  | public_link    |
      | uid_owner   | user1          |
      | permissions | <permissions>  |
      | path        | /simple-folder |
      | name        | Public link    |
    And a link named "Public link" should be listed with role "<role>" in the public link list of folder "simple-folder" on the webUI
    When the public uses the webUI to access the last public link created by user "user1"
    Then file "lorem.txt" should be listed on the webUI
    Examples:
      | role        | permissions                  |
      | Viewer      | read                         |
      | Editor      | read, update, create, delete |
      | Contributor | read, create                 |

  Scenario: sharing by public link with "Uploader" role
    Given user "user1" has logged in using the webUI
    When the user creates a new public link for folder "simple-folder" using the webUI with
      | role | Uploader |
    Then user "user1" should have a share with these details:
      | field       | value          |
      | share_type  | public_link    |
      | uid_owner   | user1          |
      | permissions | create         |
      | path        | /simple-folder |
      | name        | Public link    |
    And a link named "Public link" should be listed with role "Uploader" in the public link list of folder "simple-folder" on the webUI
    When the public uses the webUI to access the last public link created by user "user1"
    Then there should be no files/folders listed on the webUI

  Scenario: public link share shows up on shared-with-others page
    Given user "user1" has logged in using the webUI
    And user "user1" has shared folder "simple-folder" with link with "read" permissions
    When the user browses to the shared-with-others page using the webUI
    Then folder "simple-folder" should be listed on the webUI
    But file "data.zip" should not be listed on the webUI

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link
    Given user "user1" has shared folder "simple-folder" with link with "read, update, create, delete" permissions
    When the public uses the webUI to access the last public link created by user "user1"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI
    And the deleted elements should not be listed on the webUI after a page reload

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link even with password set
    Given user "user1" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "pass123"
    When the public uses the webUI to access the last public link created by user "user1" with password "pass123"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI

  Scenario: creating a public link with "Viewer" role only makes it impossible to delete files via the link
    Given user "user1" has shared folder "simple-folder" with link with "read" permissions
    When the public uses the webUI to access the last public link created by user "user1"
    Then it should not be possible to delete file "lorem.txt" using the webUI

  Scenario: creating a public link with "Editor" role makes it possible to upload a file
    Given user "user1" has shared folder "simple-folder" with link with "read, update, create, delete" permissions
    When the public uses the webUI to access the last public link created by user "user1"
    And the user uploads file "new-lorem.txt" using the webUI
    Then file "new-lorem.txt" should be listed on the webUI
    And as "user1" file "simple-folder/new-lorem.txt" should exist

  Scenario: creating a public link with "Editor" role makes it possible to upload a file inside a subdirectory with password set
    Given user "user1" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "pass123"
    When the public uses the webUI to access the last public link created by user "user1" with password "pass123"
    And the user opens folder "simple-empty-folder" using the webUI
    And the user uploads file "new-lorem.txt" using the webUI
    Then file "new-lorem.txt" should be listed on the webUI
    And as "user1" file "simple-folder/simple-empty-folder/new-lorem.txt" should exist

  Scenario: creating a public link with "Editor" role makes it possible to upload a folder
    Given user "user1" has shared folder "simple-folder" with link with "read, update, create, delete" permissions
    When the public uses the webUI to access the last public link created by user "user1"
    And the user uploads folder "PARENT" using the webUI
    Then folder "PARENT" should be listed on the webUI
    And folder "CHILD" should be listed in the folder "PARENT" on the webUI
    And file "child.txt" should be listed in the folder "CHILD" on the webUI
    And as "user1" file "simple-folder/PARENT/CHILD/child.txt" should exist

  Scenario: creating a public link with "Editor" role makes it possible to upload a folder inside a subdirectory
    Given user "user1" has shared folder "simple-folder" with link with "read, update, create, delete" permissions
    When the public uses the webUI to access the last public link created by user "user1"
    And the user opens folder "simple-empty-folder" using the webUI
    And the user uploads folder "PARENT" using the webUI
    Then folder "PARENT" should be listed on the webUI
    And folder "CHILD" should be listed in the folder "PARENT" on the webUI
    And file "child.txt" should be listed in the folder "CHILD" on the webUI
    And as "user1" file "simple-folder/simple-empty-folder/PARENT/CHILD/child.txt" should exist

  Scenario: creating a public link with "Editor" role makes it possible to upload files via the link even with password set
    Given user "user1" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "pass123"
    When the public uses the webUI to access the last public link created by user "user1" with password "pass123"
    And the user uploads file "new-lorem.txt" using the webUI
    Then file "new-lorem.txt" should be listed on the webUI
    And as "user1" file "simple-folder/new-lorem.txt" should exist

  Scenario: creating a public link with "Editor" role makes it possible to upload files inside a subdirectory
    Given user "user1" has shared folder "simple-folder" with link with "read, update, create, delete" permissions
    When the public uses the webUI to access the last public link created by user "user1"
    And the user uploads folder "PARENT" using the webUI
    Then folder "PARENT" should be listed on the webUI
    And folder "CHILD" should be listed in the folder "PARENT" on the webUI
    And file "child.txt" should be listed in the folder "CHILD" on the webUI
    And as "user1" file "simple-folder/PARENT/CHILD/child.txt" should exist

  Scenario: creating a public link with "Editor" role makes it possible to upload a folder even with password set
    Given user "user1" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "pass123"
    When the public uses the webUI to access the last public link created by user "user1" with password "pass123"
    And the user uploads folder "PARENT" using the webUI
    Then folder "PARENT" should be listed on the webUI
    And folder "CHILD" should be listed in the folder "PARENT" on the webUI
    And file "child.txt" should be listed in the folder "CHILD" on the webUI
    And as "user1" file "simple-folder/PARENT/CHILD/child.txt" should exist

  Scenario: creating a public link with "Editor" role makes it possible to upload a folder inside a sub-directory even with password set
    Given user "user1" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "pass123"
    When the public uses the webUI to access the last public link created by user "user1" with password "pass123"
    And the user opens folder "simple-empty-folder" using the webUI
    And the user uploads folder "PARENT" using the webUI
    Then folder "PARENT" should be listed on the webUI
    And folder "CHILD" should be listed in the folder "PARENT" on the webUI
    And file "child.txt" should be listed in the folder "CHILD" on the webUI
    And as "user1" file "simple-folder/simple-empty-folder/PARENT/CHILD/child.txt" should exist

  Scenario: creating a public link with "Viewer" role makes it possible to create files via the link even with password set
    Given user "user1" has shared folder "simple-folder" with link with "read" permissions and password "pass123"
    When the public uses the webUI to access the last public link created by user "user1" with password "pass123"
    Then it should not be possible to create files using the webUI

  Scenario: opening public-link page of the files-drop link protected with password should redirect to files-drop page
    Given user "user1" has shared folder "simple-folder" with link with "create" permissions and password "pass123"
    When the public tries to open the public link page of the last public link created by user "user1" with password "pass123"
    Then the user should be redirected to the files-drop page

  @issue-2414
  Scenario: opening public-link page of the files-drop link without password set should redirect to files-drop page
    Given user "user1" has shared folder "simple-folder" with link with "create" permissions
    When the public tries to open the public link page of the last public link created by user "user1"
#    Then the user should be redirected to the files-drop page
    Then the user should be redirected to the public links page

  @issue-2414
  Scenario: creating a public link with "Uploader" role makes it possible to upload a file
    # FIXME: Delete this scenario after fixing the issue at large
    Given user "user1" has shared folder "simple-folder" with link with "create" permissions
    When the public opens the public link page of the last public link created by user "user1"
    And the user uploads file "new-lorem.txt" using the webUI
    Then as "user1" file "simple-folder/new-lorem.txt" should exist

  @issue-2414
  Scenario: creating a public link with "Uploader" role makes it possible to upload a folder
    # FIXME: Delete this scenario after fixing the issue at large
    Given user "user1" has shared folder "simple-folder" with link with "create" permissions
    When the public opens the public link page of the last public link created by user "user1"
    And the user uploads folder "PARENT" using the webUI
    Then as "user1" file "simple-folder/PARENT/CHILD/child.txt" should exist

  Scenario: creating a public link with "Uploader" role makes it possible to upload a file through files-drop page
    Given user "user1" has shared folder "simple-folder" with link with "create" permissions
    When the public uses the webUI to access the last public link created by user "user1"
    And the public uploads file "new-lorem.txt" in files-drop page
    Then the following files should be listed on the files-drop page:
      | new-lorem.txt |
    And as "user1" file "simple-folder/new-lorem.txt" should exist

  Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
    Given user "user1" has shared folder "simple-folder" with link with "create" permissions
    When the public uses the webUI to access the last public link created by user "user1"
    And the public uploads file "'single'quotes.txt" in files-drop page
    And the public uploads file "new-lorem.txt" in files-drop page
    Then the following files should be listed on the files-drop page:
      | 'single'quotes.txt |
      | new-lorem.txt      |
    And as "user1" the content of "simple-folder/'single'quotes.txt" should be the same as the local "'single'quotes.txt"
    And as "user1" the content of "simple-folder/new-lorem.txt" should be the same as the local "new-lorem.txt"

  @issue-2443 @yetToImplement
  Scenario: creating a public link with "Uploader" role makes it possible to upload a folder
    Given user "user1" has shared folder "simple-folder" with link with "create" permissions
    When the public uses the webUI to access the last public link created by user "user1"
    And the public uploads file "FOLDER" in files-drop page
    Then the following files should be listed on the files-drop page:
      | FOLDER |
    And as "user1" file "simple-folder/FOLDER" should exist
    And the content of file "simple-folder/FOLDER" for user "user1" should be ""

  Scenario: creating a public link with "Uploader" role makes it possible to create files through files-drop page even with password set
    Given user "user1" has shared folder "simple-folder" with link with "create" permissions and password "pass123"
    When the public uses the webUI to access the last public link created by user "user1" with password "pass123"
    And the public uploads file "'single'quotes.txt" in files-drop page
    Then the following files should be listed on the files-drop page:
      | 'single'quotes.txt |
    And as "user1" the content of "simple-folder/'single'quotes.txt" should be the same as the local "'single'quotes.txt"

  Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page even with password set
    Given user "user1" has shared folder "simple-folder" with link with "create" permissions and password "pass123"
    When the public uses the webUI to access the last public link created by user "user1" with password "pass123"
    And the public uploads file "'single'quotes.txt" in files-drop page
    And the public uploads file "new-lorem.txt" in files-drop page
    Then the following files should be listed on the files-drop page:
      | 'single'quotes.txt |
      | new-lorem.txt      |
    And as "user1" the content of "simple-folder/'single'quotes.txt" should be the same as the local "'single'quotes.txt"
    And as "user1" the content of "simple-folder/new-lorem.txt" should be the same as the local "new-lorem.txt"

  @skip @yetToImplement
  Scenario: mount public link
    Given using server "REMOTE"
    And user "user2" has been created with default attributes
    When the user creates a new public link for folder "simple-folder" using the webUI
    And the user logs out of the webUI
    And the public accesses the last created public link using the webUI
    And the public adds the public link to "%remote_server%" as user "user2" with password "%alt2%" using the webUI
    And the user accepts the offered remote shares using the webUI
    Then folder "simple-folder (2)" should be listed on the webUI
    When the user opens folder "simple-folder (2)" using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And the content of "lorem.txt" on the remote server should be the same as the original "simple-folder/lorem.txt"
    And it should not be possible to delete file "lorem.txt" using the webUI

  @skip @yetToImplement
  Scenario: mount public link and overwrite file
    Given using server "REMOTE"
    And user "user2" has been created with default attributes
    When the user creates a new public link for folder "simple-folder" using the webUI with
      | permission | read-write |
    And the user logs out of the webUI
    And the public accesses the last created public link using the webUI
    And the public adds the public link to "%remote_server%" as user "user2" with password "%alt2%" using the webUI
    And the user accepts the offered remote shares using the webUI
    Then folder "simple-folder (2)" should be listed on the webUI
    When the user opens folder "simple-folder (2)" using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And the content of "lorem.txt" on the remote server should be the same as the original "simple-folder/lorem.txt"
    When the user uploads overwriting file "lorem.txt" using the webUI and retries if the file is locked
    Then file "lorem.txt" should be listed on the webUI
    And the content of "lorem.txt" on the remote server should be the same as the local "lorem.txt"

  Scenario: public should be able to access a public link with correct password
    Given user "user1" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "pass123"
    When the public uses the webUI to access the last public link created by user "user1" with password "pass123"
    Then file "lorem.txt" should be listed on the webUI

  Scenario: public should not be able to access a public link with wrong password
    Given user "user1" has shared folder "simple-folder" with link with "read" permissions and password "pass123"
    When the public uses the webUI to access the last public link created by user "user1" with password "pass12"
    Then the public should not get access to the publicly shared file

  Scenario: user shares a public link with folder longer than 64 chars and shorter link name
    Given user "user1" has renamed folder "simple-folder" to "aquickbrownfoxjumpsoveraverylazydogaquickbrownfoxjumpsoveralazydog"
    And user "user1" has logged in using the webUI
    When the user creates a new public link for folder "aquickbrownfoxjumpsoveraverylazydogaquickbrownfoxjumpsoveralazydog" using the webUI with
      | name | short_linkname |
    And the public uses the webUI to access the last public link created by user "user1"
    Then file "lorem.txt" should be listed on the webUI

  Scenario: user tries to create a public link with Viewer role without entering share password while enforce password on read only public share is enforced
    Given the setting "shareapi_enforce_links_password_read_only" of app "core" has been set to "yes"
    And user "user1" has logged in using the webUI
    When the user creates a new public link for folder "simple-folder" using the webUI
    Then the user should see an error message on the public link share dialog saying "Passwords are enforced for link shares"
    And user "user1" should not have created any shares

  Scenario: user tries to create a public link with Contributor role without entering share password while enforce password on read-write public share is enforced
    Given the setting "shareapi_enforce_links_password_read_write" of app "core" has been set to "yes"
    And user "user1" has logged in using the webUI
    When the user creates a new public link for folder "simple-folder" using the webUI with
      | role | Contributor |
    Then the user should see an error message on the public link share dialog saying "Passwords are enforced for link shares"
    And user "user1" should not have created any shares

  Scenario: user tries to create a public link with Editor Role without entering share password while enforce password on read-write public share is enforced
    Given the setting "shareapi_enforce_links_password_read_write_delete" of app "core" has been set to "yes"
    And user "user1" has logged in using the webUI
    When the user creates a new public link for folder "simple-folder" using the webUI with
      | role | Editor |
    Then the user should see an error message on the public link share dialog saying "Passwords are enforced for link shares"
    And user "user1" should not have created any shares

  Scenario: user tries to create a public link with Uploader role without entering share password while enforce password on write only public share is enforced
    Given the setting "shareapi_enforce_links_password_write_only" of app "core" has been set to "yes"
    And user "user1" has logged in using the webUI
    When the user creates a new public link for folder "simple-folder" using the webUI with
      | role | Uploader |
    Then the user should see an error message on the public link share dialog saying "Passwords are enforced for link shares"
    And user "user1" should not have created any shares

  Scenario: user creates a public link with Contributor Role without entering share password while enforce password on read only public share is enforced
    Given the setting "shareapi_enforce_links_password_read_only" of app "core" has been set to "yes"
    And user "user1" has logged in using the webUI
    When the user creates a new public link for folder "simple-folder" using the webUI with
      | role | Contributor |
    Then user "user1" should have a share with these details:
      | field       | value          |
      | share_type  | public_link    |
      | uid_owner   | user1          |
      | permissions | read, create   |
      | path        | /simple-folder |
      | name        | Public link    |

  Scenario Outline: user tries to change the role of an existing public link role without entering share password while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes"
    And user "user1" has shared folder "simple-folder" with link with "<initial-permissions>" permissions
    And user "user1" has logged in using the webUI
    When the user edits the public link named "{}" of folder "simple-folder" changing following
      | role | <role> |
    Then the user should see an error message on the public link share dialog saying "Passwords are enforced for link shares"
    And user "user1" should have a share with these details:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | user1                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions | role        | setting-name                                      |
      | read, create        | Viewer      | shareapi_enforce_links_password_read_only         |
      | read                | Contributor | shareapi_enforce_links_password_read_write        |
      | read                | Editor      | shareapi_enforce_links_password_read_write_delete |
      | read, create        | Uploader    | shareapi_enforce_links_password_write_only        |

  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes"
    And user "user1" has shared folder "simple-folder" with link with "<initial-permissions>" permissions and password "123"
    And user "user1" has logged in using the webUI
    When the user edits the public link named "{}" of folder "simple-folder" changing following
      | password | |
    Then the user should see an error message on the public link share dialog saying "Passwords are enforced for link shares"
    And user "user1" should have a share with these details:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | user1                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read                         | shareapi_enforce_links_password_read_only         |
      | read, create                 | shareapi_enforce_links_password_read_write        |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |
      | create                       | shareapi_enforce_links_password_write_only        |

  Scenario Outline: user changes the role of an existing public link role without entering share password while enforce password for the original role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes"
    And user "user1" has shared folder "simple-folder" with link with "<initial-permissions>" permissions and password "123"
    And user "user1" has logged in using the webUI
    When the user edits the public link named "{}" of folder "simple-folder" changing following
      | role     | <role> |
      | password |        |
    Then user "user1" should have a share with these details:
      | field       | value                  |
      | share_type  | public_link            |
      | uid_owner   | user1                  |
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
    Given user "user1" has logged in using the webUI
    And user "user1" has created a public link with following settings
      | path       | lorem.txt        |
      | name       | Public link      |
    When the public uses the webUI to access the last public link created by user "user1"
    Then file "lorem.txt" should be listed on the webUI
#    Then the text preview of the public link should contain "Lorem ipsum dolor sit amet, consectetur"
#    And the content of the file shared by the last public link should be the same as "lorem.txt"

  @skip @yetToImplement
  Scenario: user shares a public link via email
    Given the setting "shareapi_allow_public_notification" of app "core" has been set to "yes"
    And user "user1" has logged in using the webUI
    And the user reloads the current page of the webUI
    When the user creates a new public link for folder "simple-folder" using the webUI with
      | email | foo@bar.co |
    Then the email address "foo@bar.co" should have received an email with the body containing
      """
      User One shared simple-folder with you
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
      User One shared simple-folder with you
      """
    And the email address "user1@example.org" should have received an email with the body containing
      """
      User One shared simple-folder with you
      """
    And the email address "foo@bar.co" should have received an email containing the last shared public link
    And the email address "user1@example.org" should have received an email containing the last shared public link

  @skip @yetToImplement
  Scenario: user shares a public link via email with multiple addresses
    Given the setting "shareapi_allow_public_notification" of app "core" has been set to "yes"
    And the user reloads the current page of the webUI
    When the user creates a new public link for folder "simple-folder" using the webUI with
      | email | foo@bar.co, foo@barr.co |
    Then the email address "foo@bar.co" should have received an email with the body containing
      """
      User One shared simple-folder with you
      """
    And the email address "foo@barr.co" should have received an email with the body containing
      """
      User One shared simple-folder with you
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
      User One shared simple-folder with you
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
      User One shared simple-folder with you
      """
    And the email address "foo1234@barr.co" should have received an email with the body containing
      """
      User One shared simple-folder with you
      """
    And the email address "foo5678@bar.co" should have received an email containing the last shared public link
    And the email address "foo1234@barr.co" should have received an email containing the last shared public link
    But the email address "foo1234@bar.co" should not have received an email
    And the email address "foo5678@barr.co" should not have received an email

  @yetToImplement
  Scenario: user edits a public link and does not save the changes
    Given the setting "shareapi_allow_public_notification" of app "core" has been set to "yes"
    And user "user1" has logged in using the webUI
    And user "user1" has created a public link with following settings
      | path      | simple-folder    |
      | name      | test_public_link |
      | password  | pass123          |
#      | email     | foo1234@bar.co   |
    When the user edits the public link named "test_public_link" of folder "simple-folder" changing following but not saving
      | password |  qwertyui  |
    And the public uses the webUI to access the last public link created by user "user1" with password "qwertyui"
    Then the public should not get access to the publicly shared file

  @skip @yetToImplement
  Scenario: user shares a public link via email with a personal message
    Given parameter "shareapi_allow_public_notification" of app "core" has been set to "yes"
    And the user has reloaded the current page of the webUI
    When the user creates a new public link for folder "simple-folder" using the webUI with
      | email           | foo@bar.co  |
      | personalMessage | lorem ipsum |
    Then the email address "foo@bar.co" should have received an email with the body containing
      """
      User One shared simple-folder with you
      """
    And the email address "foo@bar.co" should have received an email with the body containing
      """
      lorem ipsum
      """
    And the email address "foo@bar.co" should have received an email containing the last shared public link

  Scenario: user edits a name of an already existing public link
    Given user "user1" has logged in using the webUI
    And user "user1" has shared folder "simple-folder" with link with "read" permissions and password "pass123"
    When the user edits the public link named "{}" of folder "simple-folder" changing following
    | name  | simple-folder Share |
    And the public uses the webUI to access the last public link created by user "user1" with password "pass123"
    Then file "lorem.txt" should be listed on the webUI

  Scenario: user shares a file through public link and then it appears in a shared-with-others page
    Given the setting "shareapi_allow_public_notification" of app "core" has been set to "yes"
    And user "user1" has shared folder "simple-folder" with link with "read, update, create, delete" permissions
    And user "user1" has logged in using the webUI
    When the user browses to the shared-with-others page
    Then folder "simple-folder" should be listed on the webUI

  Scenario: user edits the password of an already existing public link
    Given user "user1" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "pass123"
    And user "user1" has logged in using the webUI
    When the user edits the public link named "{}" of folder "simple-folder" changing following
      | password |  qwertyui  |
    And the public uses the webUI to access the last public link created by user "user1" with password "qwertyui"
    Then file "lorem.txt" should be listed on the webUI

  Scenario: user edits the password of an already existing public link and tries to access with old password
    Given user "user1" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "pass123"
    And user "user1" has logged in using the webUI
    And the user edits the public link named "{}" of folder "simple-folder" changing following
      | password |  qwertyui  |
    When the public uses the webUI to access the last public link created by user "user1" with password "pass123"
    Then the public should not get access to the publicly shared file

  Scenario: user edits the permission of an already existing public link from read-write to read
    Given user "user1" has shared folder "simple-folder" with link with "read, update, create, delete" permissions
    And user "user1" has logged in using the webUI
    When the user edits the public link named "{}" of folder "simple-folder" changing following
      | role  | Viewer  |
    And the public uses the webUI to access the last public link created by user "user1"
    Then file "lorem.txt" should be listed on the webUI
    And it should not be possible to delete file "lorem.txt" using the webUI

  Scenario: user edits the permission of an already existing public link from read to read-write
    Given user "user1" has shared folder "simple-folder" with link with "read" permissions
    And user "user1" has logged in using the webUI
    When the user edits the public link named "{}" of folder "simple-folder" changing following
      | role | Editor |
    And the public uses the webUI to access the last public link created by user "user1"
    And the user deletes the following elements using the webUI
      | name                |
      | simple-empty-folder |
      | lorem.txt           |
    Then the deleted elements should not be listed on the webUI
    And the deleted elements should not be listed on the webUI after a page reload

  Scenario: user changes the expiration date of an already existing public link using webUI
    Given user "user1" has created a public link with following settings
      | path       | lorem.txt        |
      | name       | Public link      |
      | expireDate | 2038-10-14       |
    And user "user1" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing following
      | expireDate  | 2038 July 21  |
    Then the fields of the last public link share response of user "user1" should include
      | expireDate | 2038-07-21 |

  Scenario: user tries to change the expiration date of the public link to past date using webUI
    Given user "user1" has created a public link with following settings
      | path       | lorem.txt        |
      | name       | Public link      |
      | expireDate | 2038-10-14       |
    And user "user1" has logged in using the webUI
    When the user tries to edit expiration of the public link named "Public link" of file "lorem.txt" to past date "2019-Oct-10"
    Then the fields of the last public link share response of user "user1" should include
      | expireDate | 2038-10-14 |

  Scenario Outline: auto set expiration date on public link (with default amount of expiry days)
    Given the setting "shareapi_default_expire_date" of app "core" has been set to "yes"
    And user "user1" has logged in using the webUI
    When the user creates a new public link for resource "<shared-resource>" using the webUI
    Then user "user1" should have a share with these details:
      | field       | value              |
      | share_type  | public_link        |
      | uid_owner   | user1              |
      | permissions | read               |
      | path        | /<shared-resource> |
      | name        | Public link        |
      | expiration  | +7                 |
    Examples:
      | shared-resource |
      | lorem.txt       |
      | simple-folder   |

  Scenario Outline: auto set expiration date on public link (with set amount expiry days)
    Given the setting "shareapi_default_expire_date" of app "core" has been set to "yes"
    And the setting "shareapi_expire_after_n_days" of app "core" has been set to "42"
    And user "user1" has logged in using the webUI
    When the user creates a new public link for resource "<shared-resource>" using the webUI
    Then user "user1" should have a share with these details:
      | field       | value              |
      | share_type  | public_link        |
      | uid_owner   | user1              |
      | permissions | read               |
      | path        | /<shared-resource> |
      | name        | Public link        |
      | expiration  | +42                |
    Examples:
      | shared-resource |
      | lorem.txt       |
      | simple-folder   |

  Scenario: user cannot set an expiry date when creating a public link to a date that is past the enforced max expiry date
    Given the setting "shareapi_default_expire_date" of app "core" has been set to "yes"
    And the setting "shareapi_enforce_expire_date" of app "core" has been set to "yes"
    And user "user1" has logged in using the webUI
    When the user tries to create a new public link for resource "simple-folder" using the webUI with
      | expireDate | +8 |
    Then the user should see an error message on the public link share dialog saying "Cannot set expiration date more than 7 days in the future"
    And user "user1" should not have created any shares

  Scenario: user cannot change the expiry date of an existing public link to a date that is past the enforced max expiry date
    Given the setting "shareapi_default_expire_date" of app "core" has been set to "yes"
    And the setting "shareapi_enforce_expire_date" of app "core" has been set to "yes"
    And user "user1" has created a public link with following settings
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | +6          |
    And user "user1" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing following
      | expireDate | +8 |
    Then the user should see an error message on the public link share dialog saying "Cannot set expiration date more than 7 days in the future"
    And user "user1" should have a share with these details:
      | field       | value       |
      | share_type  | public_link |
      | uid_owner   | user1       |
      | permissions | read        |
      | path        | /lorem.txt  |
      | name        | Public link |
      | expiration  | +6          |

  Scenario: user can set an expiry date when creating a public link to a date that is before the enforced max expiry date
    Given the setting "shareapi_default_expire_date" of app "core" has been set to "yes"
    And the setting "shareapi_enforce_expire_date" of app "core" has been set to "yes"
    And user "user1" has logged in using the webUI
    When the user creates a new public link for resource "lorem.txt" using the webUI with
      | expireDate | +7 |
    Then user "user1" should have a share with these details:
      | field       | value       |
      | share_type  | public_link |
      | uid_owner   | user1       |
      | permissions | read        |
      | path        | /lorem.txt  |
      | name        | Public link |
      | expiration  | +7          |

  Scenario: user can change the expiry date of an existing public link to a date that is before the enforced max expiry date
    Given the setting "shareapi_default_expire_date" of app "core" has been set to "yes"
    And the setting "shareapi_enforce_expire_date" of app "core" has been set to "yes"
    And user "user1" has created a public link with following settings
      | path       | lorem.txt   |
      | name       | Public link |
      | expireDate | +5          |
    And user "user1" has logged in using the webUI
    When the user edits the public link named "Public link" of file "lorem.txt" changing following
      | expireDate | +7 |
    Then user "user1" should have a share with these details:
      | field       | value       |
      | share_type  | public_link |
      | uid_owner   | user1       |
      | permissions | read        |
      | path        | /lorem.txt  |
      | name        | Public link |
      | expiration  | +7          |

  @skip @yetToImplement
  Scenario: share two file with same name but different paths by public link
    When the user creates a new public link for file "lorem.txt" using the webUI
    And the user closes the details dialog
    And the user opens folder "simple-folder" using the webUI
    And the user creates a new public link for file "lorem.txt" using the webUI
    And the user browses to the shared-by-link page
    Then file "lorem.txt" with path "" should be listed in the shared with others page on the webUI
    And file "lorem.txt" with path "/simple-folder" should be listed in the shared with others page on the webUI

  Scenario: user removes the public link of a file using webUI
    Given user "user1" has logged in using the webUI
    And user "user1" has shared file "lorem.txt" with link with "read" permissions
    When the user "user1" removes the public link named "{}" of file "lorem.txt" using the webUI
    Then user "user1" should not have any public link

  @skip @yetToImplement
  Scenario: user cancel removes operation for the public link of a file
    Given the user has created a new public link for file "lorem.txt" using the webUI
    When the user tries to remove the public link of file "lorem.txt" but later cancels the remove dialog using webUI
    And the public accesses the last created public link using the webUI
    Then the content of the file shared by the last public link should be the same as "lorem.txt"

  Scenario: user creates a multiple public link of a file and delete the first link
    Given user "user1" has created a public link with following settings
      | path       | lorem.txt        |
      | name       | first-name       |
    And user "user1" has created a public link with following settings
      | path       | lorem.txt        |
      | name       | second-name      |
    And user "user1" has created a public link with following settings
      | path       | lorem.txt        |
      | name       | third-name       |
    And user "user1" has logged in using the webUI
    When the user "user1" removes the public link named "first-name" of file "lorem.txt" using the webUI
    Then public link named "first-name" should not be listed on the public links list on the webUI
    And a link named "second-name" should be listed with role "Viewer" in the public link list of file "lorem.txt" on the webUI
    And a link named "third-name" should be listed with role "Viewer" in the public link list of folder "lorem.txt" on the webUI

  Scenario: user creates a multiple public link of a file and delete the second link
    Given user "user1" has created a public link with following settings
      | path       | lorem.txt        |
      | name       | first-name       |
    And user "user1" has created a public link with following settings
      | path       | lorem.txt        |
      | name       | second-name      |
    And user "user1" has created a public link with following settings
      | path       | lorem.txt        |
      | name       | third-name       |
    And user "user1" has logged in using the webUI
    When the user "user1" removes the public link named "second-name" of file "lorem.txt" using the webUI
    Then public link named "second-name" should not be listed on the public links list on the webUI
    And a link named "first-name" should be listed with role "Viewer" in the public link list of file "lorem.txt" on the webUI
    And a link named "third-name" should be listed with role "Viewer" in the public link list of folder "lorem.txt" on the webUI

  Scenario: user creates a multiple public link of a file and delete the third link
    Given user "user1" has created a public link with following settings
      | path       | lorem.txt        |
      | name       | first-name       |
    And user "user1" has created a public link with following settings
      | path       | lorem.txt        |
      | name       | second-name      |
    And user "user1" has created a public link with following settings
      | path       | lorem.txt        |
      | name       | third-name       |
    And user "user1" has logged in using the webUI
    When the user "user1" removes the public link named "third-name" of file "lorem.txt" using the webUI
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
    When the user uploads file "lorem.txt" keeping both new and existing files using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And file "lorem (2).txt" should be listed on the webUI

  Scenario: user browses to public link share using copy link button
    Given user "user1" has shared folder "simple-folder" with link with "read" permissions
    And user "user1" has logged in using the webUI
    When the user copies the url of public link named "{}" of folder "simple-folder" using the webUI
    And the user navigates to the copied public link using the webUI
    Then file "lorem.txt" should be listed on the webUI

  Scenario Outline: user creates multiple public links with same name for the same file/folder
    Given user "user1" has logged in using the webUI
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
    Given user "user1" has logged in using the webUI
    When the user creates a new public link for folder "simple-folder" using the webUI with
      | role | Editor |
    And the public uses the webUI to access the last public link created by user "user1"
    And the user picks the row of file "lorem.txt" in the webUI
    Then the following tabs should be visible in the details dialog
      | name          |
      | versions      |
      | links         |
      | collaborators |
#    Then the following tabs should not be visible in the details dialog
#      | name          |
#      | links         |
#      | collaborators |

  @issue-2060
  Scenario: sharing indicator inside a shared folder
    Given user "user1" has created folder "/simple-folder/sub-folder"
    And user "user1" has uploaded file with content "test" to "/simple-folder/textfile.txt"
    And user "user1" has shared folder "simple-folder" with link with "read" permissions
    When user "user1" has logged in using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators |
      | simple-folder | link-direct        |
    When the user opens folder "simple-folder" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName     | expectedIndicators |
      | sub-folder   | link-indirect      |
      | textfile.txt | link-indirect      |

  @issue-2060
  Scenario: sharing indicator for file uploaded inside a shared folder
    Given user "user1" has shared folder "simple-folder" with link with "read" permissions
    And user "user1" has logged in using the webUI
    When the user opens folder "simple-folder" using the webUI
    And the user uploads file "new-lorem.txt" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators |
      | new-lorem.txt | link-indirect      |

  @issue-2060
  Scenario: sharing indicator for folder created inside a shared folder
    Given user "user1" has shared folder "simple-folder" with link with "read" permissions
    And user "user1" has logged in using the webUI
    When the user opens folder "simple-folder" using the webUI
    And the user creates a folder with the name "sub-folder" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName   | expectedIndicators |
      | sub-folder | link-indirect      |

  @issue-2060
  Scenario: sharing indicators public link and collaborators inside a shared folder
    Given user "user2" has been created with default attributes
    And user "user1" has created folder "/simple-folder/sub-folder"
    And user "user1" has uploaded file with content "test" to "/simple-folder/textfile.txt"
    And user "user1" has shared folder "simple-folder" with link with "read" permissions
    And user "user1" has shared folder "simple-folder" with user "user2"
    When user "user1" has logged in using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName      | expectedIndicators      |
      | simple-folder | link-direct,user-direct |
    When the user opens folder "simple-folder" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName     | expectedIndicators |
      | sub-folder   | link-indirect,user-indirect |
      | textfile.txt | link-indirect,user-indirect |

  @issue-2060
  Scenario: sharing indicators public link from reshare
    Given user "user2" has been created with default attributes
    And user "user1" has created folder "/simple-folder/sub-folder"
    And user "user1" has uploaded file with content "test" to "/simple-folder/textfile.txt"
    And user "user1" has shared folder "simple-folder" with user "user2"
    And user "user2" has shared folder "simple-folder (2)" with link with "read" permissions
    When user "user2" has logged in using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName          | expectedIndicators        |
      | simple-folder (2) | link-direct,user-indirect |
    When the user opens folder "simple-folder (2)" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName     | expectedIndicators |
      | sub-folder   | link-indirect,user-indirect |
      | textfile.txt | link-indirect,user-indirect |

  @issue-2060
  Scenario: sharing indicators public link from child of reshare
    Given user "user2" has been created with default attributes
    And user "user1" has created folder "/simple-folder/sub-folder"
    And user "user1" has uploaded file with content "test" to "/simple-folder/textfile.txt"
    And user "user1" has shared folder "simple-folder" with user "user2"
    And user "user2" has shared folder "simple-folder (2)/sub-folder" with link with "read" permissions
    When user "user2" has logged in using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName          | expectedIndicators |
      | simple-folder (2) | user-indirect      |
    When the user opens folder "simple-folder (2)" using the webUI
    Then the following resources should have share indicators on the webUI
      | fileName     | expectedIndicators          |
      | sub-folder   | link-direct,user-indirect   |
      | textfile.txt | user-indirect |

  @issue-2060
  Scenario: no sharing indicator visible in file list from public link
    Given user "user2" has been created with default attributes
    And user "user3" has been created with default attributes
    And user "user1" has shared folder "simple-folder" with user "user2"
    And user "user2" has shared folder "simple-folder (2)/simple-empty-folder" with user "user3"
    And user "user2" has shared folder "simple-folder (2)" with link with "read" permissions
    When the public uses the webUI to access the last public link created by user "user2"
    Then the following resources should not have share indicators on the webUI
      | simple-empty-folder |

  @issue-2897
  Scenario: sharing details of indirect items inside a shared folder
    Given user "user1" has created folder "/simple-folder/sub-folder"
    And user "user1" has uploaded file with content "test" to "/simple-folder/textfile.txt"
    And user "user1" has created a public link with following settings
      | path | /simple-folder |
      | name | Public Link    |
    And user "user1" has logged in using the webUI
    When the user opens folder "simple-folder" using the webUI
    Then a link named "Public Link" should be listed with role "Viewer" in the public link list of resource "sub-folder" via "simple-folder" on the webUI

  @issue-2897
  Scenario: sharing details of multiple indirect public link shares
    Given user "user1" has created folder "/simple-folder/sub-folder"
    And user "user1" has uploaded file with content "test" to "/simple-folder/sub-folder/textfile.txt"
    And user "user1" has created a public link with following settings
      | path | /simple-folder |
      | name | Public Link    |
    And user "user1" has created a public link with following settings
      | path | /simple-folder/sub-folder      |
      | name | strängé लिंक नाम (#2 &).नेपाली |
    And user "user1" has logged in using the webUI
    When the user opens folder "simple-folder/sub-folder" directly on the webUI
    Then a link named "Public Link" should be listed with role "Viewer" in the public link list of resource "textfile.txt" via "simple-folder" on the webUI
    And a link named "strängé लिंक नाम (#2 &).नेपाली" should be listed with role "Viewer" in the public link list of resource "textfile.txt" via "sub-folder" on the webUI

