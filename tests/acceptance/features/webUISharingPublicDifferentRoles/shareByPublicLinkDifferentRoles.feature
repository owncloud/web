@mailhog @public_link_share-feature-required
Feature: Share by public link with different roles
  As a user
  I want to share files through a publicly accessible link with different roles
  So that users who do not have an account on my ownCloud server can access them

  As an admin
  I want to limit the ability of a user to share files/folders through a publicly accessible link
  So that public sharing is limited according to organization policy

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files in the server
    And user "Alice" has created folder "simple-folder" in the server

  @smokeTest @ocisSmokeTest @issue-ocis-reva-383
  Scenario Outline: simple sharing by public link with different roles
    Given user "Alice" has created file "simple-folder/lorem.txt" in the server
    And user "Alice" has logged in using the webUI
    When the user creates a new public link for folder "simple-folder" using the webUI with
      | role | <role> |
    Then user "Alice" should have a share with these details in the server:
      | field       | value          |
      | share_type  | public_link    |
      | uid_owner   | Alice          |
      | permissions | <permissions>  |
      | path        | /simple-folder |
      | name        | Public link    |
    And a link named "Public link" should be listed with role "<role>" in the public link list of folder "simple-folder" on the webUI
    When the public uses the webUI to access the last public link created by user "Alice" in a new session
    Then file "lorem.txt" should be listed on the webUI
    Examples:
      | role        | permissions                  |
      | Viewer      | read                         |
      | Editor      | read, update, create, delete |
      | Contributor | read, create                 |

  @skipOnOC10 @issue-ocis-reva-383
  #after fixing the issue delete this scenario and use the one above by deleting the @skipOnOCIS tag there
  Scenario Outline: simple sharing by public link with different roles (ocis bug demonstration)
    Given user "Alice" has created file "simple-folder/lorem.txt" in the server
    And user "Alice" has logged in using the webUI
    When the user creates a new public link for folder "simple-folder" using the webUI with
      | role | <role> |
    Then user "Alice" should have a share with these details in the server:
      | field       | value          |
      | share_type  | public_link    |
      | uid_owner   | Alice          |
      | permissions | <permissions>  |
      | path        | /simple-folder |
    And a public link with the last created link share token as name should be listed for resource "simple-folder" on the webUI
    When the public uses the webUI to access the last public link created by user "Alice" in a new session
    Then file "lorem.txt" should be listed on the webUI
    Examples:
      | role        | permissions                  |
      | Viewer      | read                         |
      | Editor      | read, update, create, delete |
      | Contributor | read, create                 |

  @issue-ocis-reva-383
  Scenario: sharing by public link with "Uploader" role
    Given user "Alice" has created file "simple-folder/fileInside" in the server
    And user "Alice" has logged in using the webUI
    And the user creates a new public link for folder "simple-folder" using the webUI with
      | role | Uploader |
    Then user "Alice" should have a share with these details in the server:
      | field       | value          |
      | share_type  | public_link    |
      | uid_owner   | Alice          |
      | permissions | create         |
      | path        | /simple-folder |
      | name        | Public link    |
    And a link named "Public link" should be listed with role "Uploader" in the public link list of folder "simple-folder" on the webUI
    When the public uses the webUI to access the last public link created by user "Alice" in a new session
    Then there should be no resources listed on the webUI

  @skipOnOC10 @issue-ocis-reva-383
  #after fixing the issue delete this scenario and use the one above by deleting the @skipOnOCIS tag there
  Scenario: sharing by public link with "Uploader" role (ocis bug demonstration)
    Given user "Alice" has logged in using the webUI
    And the user creates a new public link for folder "simple-folder" using the webUI with
      | role | Uploader |
    Then user "Alice" should have a share with these details in the server:
      | field       | value          |
      | share_type  | public_link    |
      | uid_owner   | Alice          |
      | permissions | create         |
      | path        | /simple-folder |
    And a public link with the last created link share token as name should be listed for resource "simple-folder" on the webUI
    When the public uses the webUI to access the last public link created by user "Alice" in a new session
    Then there should be no resources listed on the webUI

  @issue-4582 @disablePreviews
  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link
    Given user "Alice" has created the following folders in the server
      | entry_name                        |
      | simple-folder/simple-empty-folder |
    And user "Alice" has created the following files in the server
      | entry_name                                          |
      | simple-folder/lorem.txt                             |
      | simple-folder/strängé filename (duplicate #2 &).txt |
      | simple-folder/zzzz-must-be-last-file-in-folder.txt  |
    And user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions in the server
    When the public uses the webUI to access the last public link created by user "Alice" in a new session
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI
    And the deleted elements should not be listed on the webUI after a page reload

  @issue-4582 @disablePreviews
  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link even with password set
    Given user "Alice" has created the following folders in the server
      | entry_name                        |
      | simple-folder/simple-empty-folder |
    And user "Alice" has created the following files in the server
      | entry_name                                          |
      | simple-folder/lorem.txt                             |
      | simple-folder/strängé filename (duplicate #2 &).txt |
      | simple-folder/zzzz-must-be-last-file-in-folder.txt  |
    And user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "pass123" in the server
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass123" in a new session
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI

  @issue-ocis-270
  Scenario: creating a public link with "Viewer" role only makes it impossible to delete files via the link
    Given user "Alice" has created file "simple-folder/lorem.txt" in the server
    And user "Alice" has shared folder "simple-folder" with link with "read" permissions in the server
    When the public uses the webUI to access the last public link created by user "Alice" in a new session
    Then it should not be possible to delete file "lorem.txt" using the webUI


  Scenario: creating a public link with "Editor" role makes it possible to upload a file
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions in the server
    When the public uses the webUI to access the last public link created by user "Alice" in a new session
    And the user uploads file "new-lorem.txt" using the webUI
    Then file "new-lorem.txt" should be listed on the webUI
    And as "Alice" file "simple-folder/new-lorem.txt" should exist in the server


  Scenario: creating a public link with "Editor" role makes it possible to upload a file inside a subdirectory with password set
    Given user "Alice" has created folder "simple-folder/simple-empty-folder" in the server
    And user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "pass123" in the server
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass123" in a new session
    And the user opens folder "simple-empty-folder" using the webUI
    And the user uploads file "new-lorem.txt" using the webUI
    Then file "new-lorem.txt" should be listed on the webUI
    And as "Alice" file "simple-folder/simple-empty-folder/new-lorem.txt" should exist in the server


  Scenario: creating a public link with "Editor" role makes it possible to upload a folder
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions in the server
    When the public uses the webUI to access the last public link created by user "Alice" in a new session
    And the user uploads folder "PARENT" using the webUI
    Then folder "PARENT" should be listed on the webUI
    And folder "CHILD" should be listed in the folder "PARENT" on the webUI
    And file "child.txt" should be listed in the folder "CHILD" on the webUI
    And as "Alice" file "simple-folder/PARENT/CHILD/child.txt" should exist in the server


  Scenario: creating a public link with "Editor" role makes it possible to upload a folder inside a subdirectory
    Given user "Alice" has created folder "simple-folder/simple-empty-folder" in the server
    And user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions in the server
    When the public uses the webUI to access the last public link created by user "Alice" in a new session
    And the user opens folder "simple-empty-folder" using the webUI
    And the user uploads folder "PARENT" using the webUI
    Then folder "PARENT" should be listed on the webUI
    And folder "CHILD" should be listed in the folder "PARENT" on the webUI
    And file "child.txt" should be listed in the folder "CHILD" on the webUI
    And as "Alice" file "simple-folder/simple-empty-folder/PARENT/CHILD/child.txt" should exist in the server


  Scenario: creating a public link with "Editor" role makes it possible to upload files via the link even with password set
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "pass123" in the server
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass123" in a new session
    And the user uploads file "new-lorem.txt" using the webUI
    Then file "new-lorem.txt" should be listed on the webUI
    And as "Alice" file "simple-folder/new-lorem.txt" should exist in the server


  Scenario: creating a public link with "Editor" role makes it possible to upload files inside a subdirectory
    Given user "Alice" has created folder "simple-folder/simple-empty-folder" in the server
    And user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions in the server
    When the public uses the webUI to access the last public link created by user "Alice" in a new session
    And the user opens folder "simple-empty-folder" using the webUI
    And the user uploads file "new-lorem.txt" using the webUI
    Then file "new-lorem.txt" should be listed on the webUI
    And as "Alice" file "simple-folder/simple-empty-folder/new-lorem.txt" should exist in the server


  Scenario: creating a public link with "Editor" role makes it possible to upload a folder even with password set
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "pass123" in the server
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass123" in a new session
    And the user uploads folder "PARENT" using the webUI
    Then folder "PARENT" should be listed on the webUI
    And folder "CHILD" should be listed in the folder "PARENT" on the webUI
    And file "child.txt" should be listed in the folder "CHILD" on the webUI
    And as "Alice" file "simple-folder/PARENT/CHILD/child.txt" should exist in the server


  Scenario: creating a public link with "Editor" role makes it possible to upload a folder inside a sub-directory even with password set
    Given user "Alice" has created folder "simple-folder/simple-empty-folder" in the server
    And user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "pass123" in the server
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass123" in a new session
    And the user opens folder "simple-empty-folder" using the webUI
    And the user uploads folder "PARENT" using the webUI
    Then folder "PARENT" should be listed on the webUI
    And folder "CHILD" should be listed in the folder "PARENT" on the webUI
    And file "child.txt" should be listed in the folder "CHILD" on the webUI
    And as "Alice" file "simple-folder/simple-empty-folder/PARENT/CHILD/child.txt" should exist in the server

  @issue-ocis-723
  Scenario: creating a public link with "Viewer" role makes it impossible to create files via the link even with password set
    Given user "Alice" has shared folder "simple-folder" with link with "read" permissions and password "pass123" in the server
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass123" in a new session
    Then the create button should not be visible on the webUI


  Scenario: creating a public link with "Uploader" role makes it possible to upload a file through files-drop page
    Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
    When the public uses the webUI to access the last public link created by user "Alice" in a new session
    And the public uploads file "new-lorem.txt" in files-drop page
    Then the following files should be listed on the files-drop page:
      | new-lorem.txt |
    And as "Alice" file "simple-folder/new-lorem.txt" should exist in the server


  Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page
    Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
    When the public uses the webUI to access the last public link created by user "Alice" in a new session
    And the public uploads file "'single'quotes.txt" in files-drop page
    And the public uploads file "new-lorem.txt" in files-drop page
    Then the following files should be listed on the files-drop page:
      | 'single'quotes.txt |
      | new-lorem.txt      |
    And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
    And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

  @issue-2443
  Scenario: creating a public link with "Uploader" role makes it possible to upload a folder
    Given user "Alice" has shared folder "simple-folder" with link with "create" permissions in the server
    When the public uses the webUI to access the last public link created by user "Alice" in a new session
    And the public uploads folder "FOLDER" in files-drop page
    Then the following files should be listed on the files-drop page:
      | FOLDER |
    And as "Alice" folder "simple-folder/FOLDER" should exist in the server

  @issue-ocis-723
  Scenario: creating a public link with "Uploader" role makes it possible to create files through files-drop page even with password set
    Given user "Alice" has shared folder "simple-folder" with link with "create" permissions and password "pass123" in the server
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass123" in a new session
    And the public uploads file "'single'quotes.txt" in files-drop page
    Then the following files should be listed on the files-drop page:
      | 'single'quotes.txt |
    And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"

  @issue-ocis-723
  Scenario: creating a public link with "Uploader" role makes it possible to upload multiple files via files-drop page even with password set
    Given user "Alice" has shared folder "simple-folder" with link with "create" permissions and password "pass123" in the server
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass123" in a new session
    And the public uploads file "'single'quotes.txt" in files-drop page
    And the public uploads file "new-lorem.txt" in files-drop page
    Then the following files should be listed on the files-drop page:
      | 'single'quotes.txt |
      | new-lorem.txt      |
    And as "Alice" the content of "simple-folder/'single'quotes.txt" in the server should be the same as the content of local file "'single'quotes.txt"
    And as "Alice" the content of "simple-folder/new-lorem.txt" in the server should be the same as the content of local file "new-lorem.txt"

  @issue-ocis-1328
  Scenario: user tries to create a public link with Viewer role without entering share password while enforce password on read only public share is enforced
    Given the setting "shareapi_enforce_links_password_read_only" of app "core" has been set to "yes" in the server
    And user "Alice" has logged in using the webUI
    When the user creates a new public link for folder "simple-folder" using the webUI
    And user "Alice" should not have created any shares in the server


  @issue-ocis-1328
  Scenario: user tries to create a public link with Contributor role without entering share password while enforce password on read-write public share is enforced
    Given the setting "shareapi_enforce_links_password_read_write" of app "core" has been set to "yes" in the server
    And user "Alice" has logged in using the webUI
    When the user creates a new public link for folder "simple-folder" using the webUI with
      | role | Contributor |
    And user "Alice" should not have created any shares in the server


  @issue-ocis-1328
  Scenario: user tries to create a public link with Editor Role without entering share password while enforce password on read-write public share is enforced
    Given the setting "shareapi_enforce_links_password_read_write_delete" of app "core" has been set to "yes" in the server
    And user "Alice" has logged in using the webUI
    When the user creates a new public link for folder "simple-folder" using the webUI with
      | role | Editor |
    And user "Alice" should not have created any shares in the server


  @issue-ocis-1328
  Scenario: user tries to create a public link with Uploader role without entering share password while enforce password on write only public share is enforced
    Given the setting "shareapi_enforce_links_password_write_only" of app "core" has been set to "yes" in the server
    And user "Alice" has logged in using the webUI
    When the user creates a new public link for folder "simple-folder" using the webUI with
      | role | Uploader |
    And user "Alice" should not have created any shares in the server


  @issue-ocis-1328
  Scenario: user creates a public link with Contributor Role without entering share password while enforce password on read only public share is enforced
    Given the setting "shareapi_enforce_links_password_read_only" of app "core" has been set to "yes" in the server
    And user "Alice" has logged in using the webUI
    When the user creates a new public link for folder "simple-folder" using the webUI with
      | role | Contributor |
    Then user "Alice" should have a share with these details in the server:
      | field       | value          |
      | share_type  | public_link    |
      | uid_owner   | Alice          |
      | permissions | read, create   |
      | path        | /simple-folder |
      | name        | Public link    |
