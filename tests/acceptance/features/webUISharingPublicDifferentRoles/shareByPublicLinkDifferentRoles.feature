@mailhog @public_link_share-feature-required
Feature: Share by public link with different roles
  As a user
  I want to share files through a publicly accessible link with different roles
  So that users who do not have an account on my ownCloud server can access them

  As an admin
  I want to limit the ability of a user to share files/folders through a publicly accessible link
  So that public sharing is limited according to organization policy

  Background:
    Given user "Alice" has been created with default attributes

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions
    When the public uses the webUI to access the last public link created by user "Alice"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI
    And the deleted elements should not be listed on the webUI after a page reload

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link even with password set
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "pass123"
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass123"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions
    When the public uses the webUI to access the last public link created by user "Alice"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI
    And the deleted elements should not be listed on the webUI after a page reload

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link even with password set
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "pass123"
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass123"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions
    When the public uses the webUI to access the last public link created by user "Alice"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI
    And the deleted elements should not be listed on the webUI after a page reload

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link even with password set
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "pass123"
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass123"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions
    When the public uses the webUI to access the last public link created by user "Alice"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI
    And the deleted elements should not be listed on the webUI after a page reload

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link even with password set
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "pass123"
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass123"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions
    When the public uses the webUI to access the last public link created by user "Alice"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI
    And the deleted elements should not be listed on the webUI after a page reload

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link even with password set
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "pass123"
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass123"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions
    When the public uses the webUI to access the last public link created by user "Alice"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI
    And the deleted elements should not be listed on the webUI after a page reload

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link even with password set
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "pass123"
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass123"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions
    When the public uses the webUI to access the last public link created by user "Alice"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI
    And the deleted elements should not be listed on the webUI after a page reload

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link even with password set
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "pass123"
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass123"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions
    When the public uses the webUI to access the last public link created by user "Alice"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI
    And the deleted elements should not be listed on the webUI after a page reload

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link even with password set
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "pass123"
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass123"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions
    When the public uses the webUI to access the last public link created by user "Alice"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI
    And the deleted elements should not be listed on the webUI after a page reload

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link even with password set
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "pass123"
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass123"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions
    When the public uses the webUI to access the last public link created by user "Alice"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI
    And the deleted elements should not be listed on the webUI after a page reload

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link even with password set
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "pass123"
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass123"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions
    When the public uses the webUI to access the last public link created by user "Alice"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI
    And the deleted elements should not be listed on the webUI after a page reload

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link even with password set
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "pass123"
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass123"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions
    When the public uses the webUI to access the last public link created by user "Alice"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI
    And the deleted elements should not be listed on the webUI after a page reload

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link even with password set
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "pass123"
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass123"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions
    When the public uses the webUI to access the last public link created by user "Alice"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI
    And the deleted elements should not be listed on the webUI after a page reload

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link even with password set
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "pass123"
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass123"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions
    When the public uses the webUI to access the last public link created by user "Alice"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI
    And the deleted elements should not be listed on the webUI after a page reload

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link even with password set
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "pass123"
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass123"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions
    When the public uses the webUI to access the last public link created by user "Alice"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI
    And the deleted elements should not be listed on the webUI after a page reload

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link even with password set
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "pass123"
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass123"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions
    When the public uses the webUI to access the last public link created by user "Alice"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI
    And the deleted elements should not be listed on the webUI after a page reload

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link even with password set
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "pass123"
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass123"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions
    When the public uses the webUI to access the last public link created by user "Alice"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI
    And the deleted elements should not be listed on the webUI after a page reload

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link even with password set
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "pass123"
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass123"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions
    When the public uses the webUI to access the last public link created by user "Alice"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI
    And the deleted elements should not be listed on the webUI after a page reload

  Scenario: creating a public link with "Editor" role makes it possible to delete files via the link even with password set
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "pass123"
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass123"
    And the user deletes the following elements using the webUI
      | name                                  |
      | simple-empty-folder                   |
      | lorem.txt                             |
      | strängé filename (duplicate #2 &).txt |
      | zzzz-must-be-last-file-in-folder.txt  |
    Then the deleted elements should not be listed on the webUI
