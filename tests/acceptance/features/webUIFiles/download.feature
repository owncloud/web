Feature: download files
  As a user
  I want to download files
  So that I can get files from my owncloud server

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files
    And user "Alice" has logged in using the webUI


  Scenario: Try to download file and folder that used to exist but does not anymore
    Given user "Alice" has created file "lorem.txt"
    And the user has browsed to the files page
    And the following files have been deleted by user "Alice"
      | name      |
      | lorem.txt |
    When the user downloads file "lorem.txt" using the webUI
    Then the error message with header 'Download failed' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist


  Scenario: download file with comma in the filename
    Given user "Alice" has created file "sample,1.txt"
    When the user browses to the files page
    And the user downloads file "sample,1.txt" using the webUI
    Then no message should be displayed on the webUI
