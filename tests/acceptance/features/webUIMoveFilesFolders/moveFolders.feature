Feature: move folders
  As a user
  I want to move folders
  So that I can organise my data structure

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server


  Scenario: An attempt to move a folder into a sub-folder using rename is not allowed
    Given user "Alice" has logged in using the webUI
    And the user has browsed to the personal page
    When the user tries to rename folder "simple-empty-folder" to "simple-folder/simple-empty-folder" using the webUI
    Then the error message 'The name cannot contain "/"' should be displayed on the webUI dialog prompt
    And folder "simple-empty-folder" should be listed on the webUI

  @smokeTest @ocisSmokeTest
  Scenario: move a folder into another folder
    Given user "Alice" has created folder "strängé नेपाली folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user moves folder "simple-folder" into folder "simple-empty-folder" using the webUI
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And folder "simple-folder" should be listed on the webUI
    When the user browses to the files page
    And the user moves folder "strängé नेपाली folder" into folder "simple-empty-folder" using the webUI
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And folder "strängé नेपाली folder" should be listed on the webUI


  Scenario: move a folder into another folder where a folder with the same name already exists
    Given user "Alice" has created folder "simple-folder/simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has browsed to the personal page
    When the user tries to move folder "simple-empty-folder" into folder "simple-folder" using the webUI
    Then the error message with header 'Failed to move "simple-empty-folder"' should be displayed on the webUI

  @smokeTest
  Scenario: Move multiple folders at once
    Given user "Alice" has created folder "strängé नेपाली folder" in the server
    And user "Alice" has logged in using the webUI
    And the user has reloaded the current page of the webUI
    When the user batch moves these folders into folder "simple-empty-folder" using the webUI
      | name                  |
      | simple-folder         |
      | strängé नेपाली folder |
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And the following folders should be listed on the webUI
      | folders               |
      | simple-folder         |
      | strängé नेपाली folder |


  Scenario Outline: move a folder into another folder (problematic characters)
    Given user "Alice" has logged in using the webUI
    And the user has browsed to the personal page
    When the user renames folder "simple-folder" to <folder_name> using the webUI
    And the user renames folder "simple-empty-folder" to <target_name> using the webUI
    And the user moves folder <folder_name> into folder <target_name> using the webUI
    Then breadcrumb for folder <target_name> should be displayed on the webUI
    And folder <folder_name> should be listed on the webUI
    Examples:
      | folder_name | target_name                    |
      | "'single'"  | "target-folder-with-'single'"  |
      # | "\"double\" quotes" | "target-folder-with\"double\" quotes" | FIXME: Needs a way to access breadcrumbs with double quotes issue-3734
      | "question?" | "target-folder-with-question?" |
      | "&and#hash" | "target-folder-with-&and#hash" |

  @issue-ocis-1328
  Scenario: move a folder into another folder with no change permission
    Given user "Brian" has been created with default attributes and without skeleton files in the server
    And user "Brian" has created folder "/simple-folder" in the server
    And user "Brian" has shared folder "simple-folder" with user "Alice" with "read" permissions in the server
    And user "Alice" has logged in using the webUI
    When the user tries to move folder "simple-empty-folder" into folder "simple-folder (2)" using the webUI
    Then as "Alice" folder "simple-folder (2)/simple-empty-folder" should not exist in the server


  Scenario: move a folder into the same folder
    Given user "Alice" has logged in using the webUI
    When the user tries to move folder "simple-empty-folder" into folder "simple-empty-folder" using the webUI
    Then the error message with header 'Failed to move "simple-empty-folder"' should be displayed on the webUI
    And as "Alice" folder "simple-empty-folder/simple-empty-folder" should not exist in the server


  Scenario: move a folder into another folder with same name
    Given user "Alice" has created folder "simple-folder/simple-empty-folder" in the server
    And user "Alice" has logged in using the webUI
    When the user moves folder "simple-empty-folder" into folder "simple-folder/simple-empty-folder" using the webUI
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI
    And folder "simple-empty-folder" should be listed on the webUI
    And as "Alice" folder "simple-folder/simple-empty-folder/simple-empty-folder" should exist in the server
    And as "Alice" folder "simple-empty-folder" should not exist in the server
