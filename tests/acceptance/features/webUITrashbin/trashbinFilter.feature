Feature: Filter files/folders

  As a user
  I would like to filter files/folders
  So that I can make the file/folder list more clear

  Background:
    Given user "user1" has been created with default attributes
    And user "user1" has logged in using the webUI
    And the user has created the following files
      | entry_name        |
      | testFile          |
      | .simpleHiddenFile |
      | .hiddenTestFile   |
    And the user has created the following folders
      | entry_name          |
      | testFolder          |
      | .simpleHiddenFolder |
    And the following files have been deleted by user "user1"
      | name                |
      | lorem.txt           |
      | simple-folder       |
      | .simpleHiddenFile   |
      | .simpleHiddenFolder |
      | testFile            |
      | .hiddenTestFile     |
      | testFolder          |
    And the user has browsed to the trashbin page

  Scenario: user filters files and folders using keyword when the files filter, folders filter, and hidden filter are enabled
    When the user enables file filter using the webUI
    And the user enables folder filter using the webUI
    And the user enables the setting to view hidden files on the webUI
    And the user filters the file list by "simple" on the webUI
    Then all trashbin files and folders containing pattern "simple" in their name should be listed on the webUI

  Scenario: user filters files and folders using keyword when the hidden filter is disabled
    When the user enables file filter using the webUI
    And the user enables folder filter using the webUI
    And the user filters the file list by "simple" on the webUI
    Then all trashbin files and folders containing pattern "simple" in their name should be listed on the webUI except for hidden elements

  Scenario: user filters files using keyword when the hidden filter and the folder filter are disabled
    When the user enables file filter using the webUI
    And the user disables folder filter using the webUI
    And the user filters the file list by "simple" on the webUI
    Then only trashbin files containing pattern "simple" in their name should be listed on the webUI except for hidden elements

  Scenario: user filters folders using keyword when the hidden filter and the file filter are disabled
    When the user disables file filter using the webUI
    And the user enables folder filter using the webUI
    And the user filters the file list by "simple" on the webUI
    Then only trashbin folders containing pattern "simple" in their name should be listed on the webUI except for hidden elements

  Scenario: user filters folders using keyword when the hidden filter and the folder filter are enabled
    When the user disables file filter using the webUI
    And the user enables folder filter using the webUI
    And the user enables the setting to view hidden folders on the webUI
    And the user filters the file list by "simple" on the webUI
    Then only trashbin folders containing pattern "simple" in their name should be listed on the webUI

  Scenario: user filters files using keyword when the hidden filter and the file filter are enabled
    When the user disables folder filter using the webUI
    And the user enables file filter using the webUI
    And the user enables the setting to view hidden folders on the webUI
    And the user filters the file list by "simple" on the webUI
    Then only trashbin files containing pattern "simple" in their name should be listed on the webUI

  Scenario: user filters files using keyword when the folder filter and file filter are disabled and hidden filter is enabled
    When the user disables folder filter using the webUI
    And the user disables file filter using the webUI
    And the user enables the setting to view hidden folders on the webUI
    And the user filters the file list by "simple" on the webUI
    Then there should be no files/folders listed on the webUI

  Scenario: user filters files using keyword when the folder filter, file filter and hidden filter are disabled
    When the user disables folder filter using the webUI
    And the user disables file filter using the webUI
    And the user filters the file list by "simple" on the webUI
    Then there should be no files/folders listed on the webUI
