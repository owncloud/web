Feature: Filter files/folders

  As a user
  I would like to filter files/folders
  So that I can make the file/folder list more clear

  Background:
    Given user "user1" has been created with default attributes
    And user "user1" has logged in using the webUI
    And the user has created file ".simpleHiddenFile"
    And the user has created folder ".simpleHiddenFolder"
    And the following files have been deleted by user "user1"
      | name                |
      | lorem.txt           |
      | simple-folder       |
      | .simpleHiddenFile   |
      | .simpleHiddenFolder |
    And the user has browsed to the trashbin page

  Scenario: user filters files and folders using keyword when the files filter, folders filter, and hidden filter are enabled
    When the user enables file filter using the webUI
    And the user enables folder filter using the webUI
    And the user enables the setting to view hidden files on the webUI
    And the user enters the keyword "simple" on the filter text-field
    Then all the files and folders containing pattern "simple" in their name should be listed in the trash
