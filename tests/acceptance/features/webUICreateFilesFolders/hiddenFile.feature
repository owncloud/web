Feature: Hide file/folders

  As a user
  I would like to display hidden files/folders
  So that I can choose to see the files that I want.

  Background:
    Given user "user1" has been created with default attributes
    And user "user1" has logged in using the webUI
    And the user has browsed to the files page

  @smokeTest
  @issue-900
  Scenario: create a hidden folder
    When the user creates a folder with the name ".xyz" using the webUI
    Then folder ".xyz" should not be listed on the webUI
    When the user enables the setting to view hidden folders on the webUI
    Then folder ".xyz" should be listed on the webUI

  Scenario: create a hidden file
    When the user creates a file with the name ".hiddenFile.txt" using the webUI
    And the user browses to the files page
    Then file ".hiddenFile.txt" should not be listed on the webUI
    When the user enables the setting to view hidden files on the webUI
    Then file ".hiddenFile.txt" should be listed on the webUI
