Feature: access breadcrumb
  As a user
  I want to browse to parent folders using breadcrumb
  So that I can access resources with ease

  Background:
    Given user "user1" has been created with default attributes

  @issue-2538
  Scenario: Check breadCrumb for folder one level below the root folder when rootFolder is set
    Given the property "rootFolder" has been set to "" in phoenix config file
    And user "user1" has logged in using the webUI
    When the user opens folder "simple-folder" using the webUI
    #    Then breadcrumb for folder "simple-folder" should be displayed on the webUI
    Then there should be no breadcrumb displayed on the webUI
    When the user opens folder "simple-empty-folder" using the webUI
    Then breadcrumb for folder "simple-empty-folder" should be displayed on the webUI

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
    And user "user1" has logged in using the webUI
    When the user opens folder "folder%2Fwith%2FSlashes" using the webUI
    And the user browses to folder "folder%2Fwith%2FSlashes" using the breadcrumb on the webUI
    Then the error message "Loading folder failed…" should be displayed on the webUI
#    Then no message should be displayed on the webUI

  @issue-1883
  Scenario: Reload webUI inside the problamatic folder
    Given user "user1" has created folder "folder%2Fwith%2FSlashes"
    And user "user1" has logged in using the webUI
    When the user opens folder "folder%2Fwith%2FSlashes" using the webUI
    And the user reloads the current page of the webUI
    Then the error message "Loading folder failed…" should be displayed on the webUI
#    Then no message should be displayed on the webUI
