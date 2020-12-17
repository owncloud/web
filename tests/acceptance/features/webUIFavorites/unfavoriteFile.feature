@ocis-reva-issue-39 @skipOnIphoneResolution @ocis-web-issue-3968
Feature: Unmark file/folder as favorite

  As a user
  I would like to unmark any file/folder
  So that I can remove my favorite file/folder from favorite page

  Background:
    Given user "user1" has been created with default attributes
    And user "user1" has logged in using the webUI

  @smokeTest
  Scenario: unmark files as favorite from files page
    Given user "user1" has favorited element "data.zip"
    And user "user1" has favorited element "data.tar.gz"
    And user "user1" has favorited element "lorem.txt"
    And the user has browsed to the files page
    When the user unmarks the favorited file "data.zip" using the webUI
    Then as user "user1" file "data.zip" should not be marked as favorite
    And file "data.zip" should not be marked as favorite on the webUI
    But as user "user1" file "data.tar.gz" should be marked as favorite
    And file "data.tar.gz" should be marked as favorite on the webUI
    And as user "user1" file "lorem.txt" should be marked as favorite
    And file "lorem.txt" should be marked as favorite on the webUI
    When the user browses to the favorites page
    Then the count of files and folders shown on the webUI should be 2
    But file "data.zip" should not be listed on the webUI

  Scenario: unmark a folder as favorite from files page
    Given user "user1" has favorited element "simple-folder"
    And user "user1" has favorited element "simple-empty-folder"
    And user "user1" has favorited element "0"
    And the user has browsed to the files page
    When the user unmarks the favorited folder "simple-folder" using the webUI
    Then as user "user1" folder "simple-folder" should not be marked as favorite
    And folder "simple-folder" should not be marked as favorite on the webUI
    But as user "user1" folder "simple-empty-folder" should be marked as favorite
    And folder "simple-empty-folder" should be marked as favorite on the webUI
    And as user "user1" folder "0" should be marked as favorite
    And folder "0" should be marked as favorite on the webUI
    When the user browses to the favorites page
    Then the count of files and folders shown on the webUI should be 2
    But folder "simple-folder" should not be listed on the webUI

  @smokeTest
  Scenario: unmark a file as favorite from favorite page
    Given user "user1" has favorited element "data.zip"
    And user "user1" has favorited element "data.tar.gz"
    And user "user1" has favorited element "lorem.txt"
    And the user has browsed to the favorites page
    When the user unmarks the favorited file "data.zip" using the webUI
    Then file "data.zip" should be listed on the webUI
    And as user "user1" file "data.zip" should not be marked as favorite
    And file "data.zip" should not be marked as favorite on the webUI
    But file "data.tar.gz" should be listed on the webUI
    And file "lorem.txt" should be listed on the webUI

  Scenario: unmark a folder as favorite from favorite page
    Given user "user1" has favorited element "simple-folder"
    And user "user1" has favorited element "simple-empty-folder"
    And user "user1" has favorited element "0"
    And the user has browsed to the favorites page
    When the user unmarks the favorited folder "simple-folder" using the webUI
    Then folder "simple-folder" should be listed on the webUI
    And as user "user1" folder "simple-folder" should not be marked as favorite
    And folder "simple-folder" should not be marked as favorite on the webUI
    But folder "0" should be listed on the webUI
    And folder "simple-empty-folder" should be listed on the webUI

  Scenario: unmark files/folders as favorites using the sidebar
    Given user "user1" has favorited element "data.zip"
    And user "user1" has favorited element "simple-folder"
    And the user has browsed to the favorites page
    When the user unmarks the favorited folder "simple-folder" using the webUI sidebar
    And the user unmarks the favorited file "data.zip" using the webUI sidebar
    Then folder "simple-folder" should not be marked as favorite on the webUI
    And as user "user1" folder "simple-folder" should not be marked as favorite
    And file "data.zip" should not be marked as favorite on the webUI
    And as user "user1" file "data.zip" should not be marked as favorite

  @issue-1720
  Scenario: Try to unfavorite file and folder that used to exist but does not anymore
    Given user "user1" has favorited element "simple-folder"
    And user "user1" has favorited element "lorem.txt"
    And the user has browsed to the files page
    And the following files have been deleted by user "user1"
      | name          |
      | lorem.txt     |
      | simple-folder |
    When the user unmarks the favorited file "lorem.txt" using the webUI
    Then no message should be displayed on the webUI
    #    Then the error message with header 'Error while marking "lorem.txt" as favorite' should be displayed on the webUI
    And file "lorem.txt" should be marked as favorite on the webUI
    #    When the user clears all error message from the webUI
    When the user unmarks the favorited folder "simple-folder" using the webUI
    Then no message should be displayed on the webUI
    #    Then the error message with header 'Error while marking "simple-folder" as favorite' should be displayed on the webUI
    And folder "simple-folder" should be marked as favorite on the webUI
    And as "user1" file "lorem.txt" should not exist
    And as "user1" folder "simple-folder" should not exist
