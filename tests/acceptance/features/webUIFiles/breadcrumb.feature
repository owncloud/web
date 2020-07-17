Feature: access breadcrumb
  As a user
  I want to browse to parent folders using breadcrumb
  So that I can access resources with ease

  Background:
    Given user "user1" has been created with default attributes

  Scenario: Check breadCrumb for folder one level below the root folder when rootFolder is set with no value
    Given the property "rootFolder" has been set to "" in phoenix config file
    And user "user1" has logged in using the webUI
    When the user opens folder "simple-folder" using the webUI
    Then breadcrumb for folder "simple-folder" should be displayed on the webUI

  Scenario: Breadcrumb navigation should not happen on last segment
    Given the property "rootFolder" has been set to "" in phoenix config file
    And user "user1" has created folder "simple-folder/subfolder"
    And user "user1" has logged in using the webUI
    When the user opens folder "simple-folder" using the webUI
    And the user opens folder "subfolder" using the webUI
    Then clickable breadcrumb for folder "simple-folder" should be displayed on the webUI
    And non-clickable breadcrumb for folder "subfolder" should be displayed on the webUI

  @ocis-reva-issue-106
  Scenario: Change rootFolder to simple-folder and check for the displayed files
    Given the property "rootFolder" has been set to "simple-folder" in phoenix config file
    And user "user1" has logged in using the webUI
    When the user browses to the files page
    Then folder "0" should not be listed on the webUI
    But as "user1" folder "0" should exist
    And file "lorem.txt" should be listed on the webUI

  @issue-1883
  Scenario: Select breadcrumb inside folder with problematic name
    Given the property "rootFolder" has been deleted in phoenix config file
    And user "user1" has created folder "folder%2Fwith%2FSlashes"
    And user "user1" has created folder "folder%2Fwith%2FSlashes/subfolder"
    And user "user1" has logged in using the webUI
    When the user opens folder "folder%2Fwith%2FSlashes" using the webUI
    And the user opens folder "subfolder" using the webUI
    And the user browses to folder "folder%2Fwith%2FSlashes" using the breadcrumb on the webUI
    Then no message should be displayed on the webUI

  @issue-1883
  Scenario: Reload webUI inside the problematic folder
    Given user "user1" has created folder "folder%2Fwith%2FSlashes"
    And user "user1" has logged in using the webUI
    When the user opens folder "folder%2Fwith%2FSlashes" using the webUI
    And the user reloads the current page of the webUI
    Then the error message with header "Loading folder failed…" should be displayed on the webUI
#    Then no message should be displayed on the webUI

  Scenario: breadcrumb for double quotes
    Given user "user1" has created folder "\'single-double quotes\""
    And user "user1" has created folder "\'single-double quotes\"/\"inner\" double quotes"
    And user "user1" has logged in using the webUI
    When the user opens folder "\'single-double quotes\"" using the webUI
    And the user opens folder "\"inner\" double quotes" using the webUI
    Then clickable breadcrumb for folder "\'single-double quotes\"" should be displayed on the webUI
    And non-clickable breadcrumb for folder "\"inner\" double quotes" should be displayed on the webUI
