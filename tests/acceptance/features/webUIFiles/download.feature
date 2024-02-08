Feature: download files
  As a user
  I want to download files
  So that I can get files from my owncloud server

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files in the server


  Scenario: Try to download file and folder that used to exist but does not anymore
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user downloads file "lorem.txt" using the webUI
    Then  the "error" message with header 'Download failed' should be displayed on the webUI
    When the user clears all error message from the webUI
    And the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
