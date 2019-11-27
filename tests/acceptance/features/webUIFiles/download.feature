Feature: download files
  As a user
  I want to download files
  So that I can get files from my owncloud server

  Background:
    Given user "user1" has been created with default attributes
    And user "user1" has logged in using the webUI
    And the user has browsed to the files page

  Scenario: Try to download file and folder that used to exist but does not anymore
    Given the following files have been deleted by user "user1"
      | name          |
      | lorem.txt     |
    When the user downloads file "lorem.txt" using the webUI
    Then the error message 'Download failed' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And as "user1" file "lorem.txt" should not exist
