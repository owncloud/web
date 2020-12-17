Feature: move folders
  As a user
  I want to move folders
  So that I can organise my data structure

  Background:
    Given user "user1" has been created with default attributes

  Scenario: An attempt to move a folder into a sub-folder using rename is not allowed
    Given user "user1" has logged in using the webUI
    And the user has browsed to the files page
    When the user tries to rename folder "simple-empty-folder" to "simple-folder/simple-empty-folder" using the webUI
    Then the error message 'The name cannot contain "/"' should be displayed on the webUI dialog prompt
    And folder "simple-empty-folder" should be listed on the webUI

  @smokeTest
  Scenario: move a folder into another folder
    Given user "user1" has logged in using the webUI
    And the user has browsed to the files page
    When the user moves folder "simple-folder" into folder "simple-empty-folder" using the webUI
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And folder "simple-folder" should be listed on the webUI
    When the user browses to the files page
    And the user moves folder "strängé नेपाली folder" into folder "strängé नेपाली folder empty" using the webUI
    Then breadcrumb for folder "strängé नेपाली folder empty" should be displayed on the webUI
    And folder "strängé नेपाली folder" should be listed on the webUI

  Scenario: move a folder into another folder where a folder with the same name already exists
    Given user "user1" has logged in using the webUI
    And the user has browsed to the files page
    When the user moves folder "simple-empty-folder" into folder "simple-folder" using the webUI
    Then the error message with header 'An error occurred while moving simple-empty-folder' should be displayed on the webUI

  @smokeTest
  Scenario: Move multiple folders at once
    Given user "user1" has logged in using the webUI
    And the user has browsed to the files page
    When the user batch moves these folders into folder "simple-empty-folder" using the webUI
      | name                 |
      | simple-folder        |
      | strängé नेपाली folder |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following folders should be listed on the webUI
      | folders               |
      | simple-folder         |
      | strängé नेपाली folder |

  Scenario Outline: move a folder into another folder (problematic characters)
    Given user "user1" has logged in using the webUI
    And the user has browsed to the files page
    When the user renames folder "simple-folder" to <folder_name> using the webUI
    And the user renames folder "simple-empty-folder" to <target_name> using the webUI
    And the user moves folder <folder_name> into folder <target_name> using the webUI
    Then breadcrumb for folder <target_name> should be displayed on the webUI
    And file <folder_name> should be listed on the webUI
    Examples:
      | folder_name         | target_name                      |
      | "'single'"          | "target-folder-with-'single'"           |
      # | "\"double\" quotes" | "target-folder-with\"double\" quotes" | FIXME: Needs a way to access breadcrumbs with double quotes issue-3734
      | "question?"         | "target-folder-with-question?"          |
      | "&and#hash"         | "target-folder-with-&and#hash"          |

  @issue-ocis-reva-243
  Scenario: move a folder into another folder with no change permission
    Given user "user2" has been created with default attributes
    And user "user2" has shared folder "simple-folder" with user "user1" with "read" permissions
    And user "user1" has logged in using the webUI
    When the user tries to move folder "simple-empty-folder" into folder "simple-folder (2)" using the webUI
    Then it should not be possible to move into folder "simple-folder (2)" using the webUI

  Scenario: move a folder into the same folder
    And user "user1" has logged in using the webUI
    When the user tries to move folder "simple-empty-folder" into folder "simple-empty-folder" using the webUI
    Then it should not be possible to move into folder "simple-empty-folder" using the webUI

  Scenario: move a folder into another folder with same name
    And user "user1" has logged in using the webUI
    When the user moves folder "simple-empty-folder" into folder "folder with space/simple-empty-folder" using the webUI
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And folder "simple-empty-folder" should be listed on the webUI
    And as "user1" folder "folder with space/simple-empty-folder/simple-empty-folder" should exist
    And as "user1" folder "simple-empty-folder" should not exist
