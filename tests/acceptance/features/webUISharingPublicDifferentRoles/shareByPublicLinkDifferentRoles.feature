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
    When the user creates a folder with the name "shared-folder" using the webUI
    And the user creates a new public link for folder "shared-folder" using the webUI with
      | role | Uploader |
    Then user "user1" should have a share with these details:
      | field       | value          |
      | share_type  | public_link    |
      | uid_owner   | user1          |
      | permissions | create         |
      | path        | /shared-folder |
      | name        | Public link    |
    And a link named "Public link" should be listed with role "Uploader" in the public link list of folder "shared-folder" on the webUI
    When the public uses the webUI to access the last public link created by user "user1"
    Then there should be no resources listed on the webUI

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
