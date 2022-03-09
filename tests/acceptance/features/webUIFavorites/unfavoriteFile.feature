@ocis-reva-issue-39 @skipOnIphoneResolution @ocis-web-issue-3968
Feature: Unmark file/folder as favorite

  As a user
  I would like to unmark any file/folder
  So that I can remove my favorite file/folder from favorite page

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files in the server
    And user "Alice" has logged in using the webUI

  @smokeTest
  Scenario: unmark files as favorite from files page
    Given user "Alice" has uploaded file "data.tar.gz" to "data.tar.gz" in the server
    And user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has created file "lorem.txt" in the server
    And the user has reloaded the current page of the webUI
    And user "Alice" has favorited element "data.zip" in the server
    And user "Alice" has favorited element "data.tar.gz" in the server
    And user "Alice" has favorited element "lorem.txt" in the server
    And the user has browsed to the personal page
    When the user unmarks the favorited file "data.zip" using the webUI
    Then as user "Alice" file "data.zip" should not be marked as favorite in the server
    And file "data.zip" should not be marked as favorite on the webUI
    But as user "Alice" file "data.tar.gz" should be marked as favorite in the server
    And file "data.tar.gz" should be marked as favorite on the webUI
    And as user "Alice" file "lorem.txt" should be marked as favorite in the server
    And file "lorem.txt" should be marked as favorite on the webUI
    When the user browses to the favorites page
    Then the count of files and folders shown on the webUI should be 2
    But file "data.zip" should not be listed on the webUI


  Scenario: unmark a folder as favorite from files page
    Given user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has created folder "0" in the server
    And the user has reloaded the current page of the webUI
    And user "Alice" has favorited element "simple-folder" in the server
    And user "Alice" has favorited element "simple-empty-folder" in the server
    And user "Alice" has favorited element "0" in the server
    And the user has browsed to the personal page
    When the user unmarks the favorited folder "simple-folder" using the webUI
    Then as user "Alice" folder "simple-folder" should not be marked as favorite in the server
    And folder "simple-folder" should not be marked as favorite on the webUI
    But as user "Alice" folder "simple-empty-folder" should be marked as favorite in the server
    And folder "simple-empty-folder" should be marked as favorite on the webUI
    And as user "Alice" folder "0" should be marked as favorite in the server
    And folder "0" should be marked as favorite on the webUI
    When the user browses to the favorites page
    Then the count of files and folders shown on the webUI should be 2
    But folder "simple-folder" should not be listed on the webUI

  @smokeTest
  Scenario: unmark a file as favorite from favorite page
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "data.tar.gz" to "data.tar.gz" in the server
    And user "Alice" has created file "lorem.txt" in the server
    And the user has reloaded the current page of the webUI
    And user "Alice" has favorited element "data.zip" in the server
    And user "Alice" has favorited element "data.tar.gz" in the server
    And user "Alice" has favorited element "lorem.txt" in the server
    And the user has browsed to the favorites page
    When the user unmarks the favorited file "data.zip" using the webUI
    Then file "data.zip" should be listed on the webUI
    And as user "Alice" file "data.zip" should not be marked as favorite in the server
    And file "data.zip" should not be marked as favorite on the webUI
    But file "data.tar.gz" should be listed on the webUI
    And file "lorem.txt" should be listed on the webUI


  Scenario: unmark a folder as favorite from favorite page
    Given user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has created folder "0" in the server
    And the user has reloaded the current page of the webUI
    And user "Alice" has favorited element "simple-folder" in the server
    And user "Alice" has favorited element "simple-empty-folder" in the server
    And user "Alice" has favorited element "0" in the server
    And the user has browsed to the favorites page
    When the user unmarks the favorited folder "simple-folder" using the webUI
    Then folder "simple-folder" should be listed on the webUI
    And as user "Alice" folder "simple-folder" should not be marked as favorite in the server
    And folder "simple-folder" should not be marked as favorite on the webUI
    But folder "0" should be listed on the webUI
    And folder "simple-empty-folder" should be listed on the webUI


  Scenario: unmark files/folders as favorites using the sidebar
    Given user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And the user has reloaded the current page of the webUI
    And user "Alice" has favorited element "data.zip" in the server
    And user "Alice" has favorited element "simple-folder" in the server
    And the user has browsed to the favorites page
    When the user unmarks the favorited folder "simple-folder" using the webUI sidebar
    And the user unmarks the favorited file "data.zip" using the webUI sidebar
    Then folder "simple-folder" should not be marked as favorite on the webUI
    And as user "Alice" folder "simple-folder" should not be marked as favorite in the server
    And file "data.zip" should not be marked as favorite on the webUI
    And as user "Alice" file "data.zip" should not be marked as favorite in the server


  Scenario: Try to unfavorite file and folder that used to exist but does not anymore
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And the user has reloaded the current page of the webUI
    And user "Alice" has favorited element "simple-folder" in the server
    And user "Alice" has favorited element "lorem.txt" in the server
    And the user has browsed to the personal page
    And the following files have been deleted by user "Alice" in the server
      | name          |
      | lorem.txt     |
      | simple-folder |
    When the user unmarks the favorited file "lorem.txt" using the webUI
    Then the error message with header 'Failed to change favorite state of "lorem.txt"' should be displayed on the webUI
    And file "lorem.txt" should be marked as favorite on the webUI
    When the user clears all error message from the webUI
    And the user unmarks the favorited folder "simple-folder" using the webUI
    Then the error message with header 'Failed to change favorite state of "simple-folder"' should be displayed on the webUI
    And folder "simple-folder" should be marked as favorite on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" folder "simple-folder" should not exist in the server
