@ocis-reva-issue-39 @skipOnIphoneResolution @ocis-web-issue-3968
Feature: Mark file as favorite

  As a user
  I would like to mark any file/folder as favorite
  So that I can find my favorite file/folder easily

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files
    And user "Alice" has logged in using the webUI
    And the user has browsed to the files page

  @smokeTest
  Scenario: mark files as favorites
    Given user "Alice" has uploaded file "data.tar.gz" to "data.tar.gz"
    And user "Alice" has uploaded file "data.zip" to "data.zip"
    And the user has reloaded the current page of the webUI
    When the user marks file "data.tar.gz" as favorite using the webUI
    And the user marks file "data.zip" as favorite using the webUI
    Then as user "Alice" file "data.tar.gz" should be marked as favorite
    And file "data.tar.gz" should be marked as favorite on the webUI
    And as user "Alice" file "data.zip" should be marked as favorite
    And file "data.zip" should be marked as favorite on the webUI
    When the user browses to the favorites page
    Then the count of files and folders shown on the webUI should be 2
    And file "data.zip" should be listed on the webUI
    And file "data.tar.gz" should be listed on the webUI


  Scenario: mark folders as favorites
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has created folder "strängé नेपाली folder"
    And the user has reloaded the current page of the webUI
    When the user marks folder "simple-folder" as favorite using the webUI
    And the user marks folder "strängé नेपाली folder" as favorite using the webUI
    Then as user "Alice" folder "simple-folder" should be marked as favorite
    And folder "simple-folder" should be marked as favorite on the webUI
    And as user "Alice" folder "strängé नेपाली folder" should be marked as favorite
    And folder "strängé नेपाली folder" should be marked as favorite on the webUI
    When the user browses to the favorites page
    Then the count of files and folders shown on the webUI should be 2
    And folder "simple-folder" should be listed on the webUI
    And folder "strängé नेपाली folder" should be listed on the webUI


  Scenario: mark files/folders as favorites using the sidebar
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has uploaded file "data.zip" to "data.zip"
    And the user has reloaded the current page of the webUI
    When the user marks folder "simple-folder" as favorite using the webUI sidebar
    And the user marks file "data.zip" as favorite using the webUI sidebar
    Then folder "simple-folder" should be marked as favorite on the webUI
    And as user "Alice" folder "simple-folder" should be marked as favorite
    And file "data.zip" should be marked as favorite on the webUI
    And as user "Alice" file "data.zip" should be marked as favorite


  Scenario: navigate to an empty favorites page
    When the user browses to the favorites page
    Then the files table should be displayed
    And no message should be displayed on the webUI
    And there should be no resources listed on the webUI


  Scenario: navigate to the favorites page using the menu
    Given user "Alice" has uploaded file "data.zip" to "data.zip"
    And the user has reloaded the current page of the webUI
    And user "Alice" has favorited element "data.zip"
    When the user browses to the favorites page using the webUI
    Then the count of files and folders shown on the webUI should be 1
    And file "data.zip" should be listed on the webUI


  Scenario: navigate to the favorites page and back to files page using the menu
    Given the user has browsed to the favorites page using the webUI
    When the user browses to the files page using the webUI
    Then the count of files and folders shown on the webUI should be 1

  @issue-1910
  Scenario: favorites list appears empty when no favorites are defined
    When the user has browsed to the favorites page using the webUI
    Then there should be no resources listed on the webUI


  Scenario: mark files with same name and different path as favorites and list them in favourites page
    Given user "Alice" has created file "lorem.txt"
    And user "Alice" has created folder "simple-empty-folder"
    And user "Alice" has created folder "simple-folder"
    And user "Alice" has created file "simple-folder/lorem.txt"
    And user "Alice" has created folder "simple-folder/simple-empty-folder"
    And user "Alice" has created folder "strängé नेपाली folder"
    And user "Alice" has created file "strängé नेपाली folder/lorem.txt"
    And the user has reloaded the current page of the webUI
    When the user marks file "lorem.txt" as favorite using the webUI
    And the user marks folder "simple-empty-folder" as favorite using the webUI
    And the user opens folder "simple-folder" using the webUI
    And the user marks file "lorem.txt" as favorite using the webUI
    And the user marks folder "simple-empty-folder" as favorite using the webUI
    And the user browses to the files page
    And the user opens folder "strängé नेपाली folder" using the webUI
    And the user marks file "lorem.txt" as favorite using the webUI
    And the user browses to the favorites page
    Then file with path "lorem.txt" should be listed in the favorites page on the webUI
    And file with path "simple-folder/lorem.txt" should be listed in the favorites page on the webUI
    And folder with path "simple-empty-folder" should be listed in the favorites page on the webUI
    And folder with path "simple-folder/simple-empty-folder" should be listed in the favorites page on the webUI
    And file with path "strängé नेपाली folder/lorem.txt" should be listed in the favorites page on the webUI

  @issue-1720
  Scenario: Try to favorite file and folder that used to exist but does not anymore
    Given user "Alice" has created file "lorem.txt"
    And user "Alice" has created folder "simple-folder"
    And the user has browsed to the files page
    And the following files have been deleted by user "Alice"
      | name          |
      | lorem.txt     |
      | simple-folder |
    When the user marks file "lorem.txt" as favorite using the webUI
    Then no message should be displayed on the webUI
    # Then the error message with header 'Error while marking "lorem.txt" as favorite' should be displayed on the webUI
    And file "lorem.txt" should not be marked as favorite on the webUI
    # When the user clears all error message from the webUI
    When the user marks folder "simple-folder" as favorite using the webUI
    Then no message should be displayed on the webUI
    # Then the error message with header 'Error while marking "simple-folder" as favorite' should be displayed on the webUI
    And folder "simple-folder" should not be marked as favorite on the webUI
    And as "Alice" file "lorem.txt" should not exist
    And as "Alice" folder "simple-folder" should not exist


  Scenario: Favourite files and folders with comma in the names
    Given user "Alice" has created file "sample,1.txt"
    And user "Alice" has created folder "Sample,Folder,With,Comma"
    And the user has reloaded the current page of the webUI
    When the user marks file "sample,1.txt" as favorite using the webUI
    And the user marks folder "Sample,Folder,With,Comma" as favorite using the webUI
    Then as user "Alice" file "sample,1.txt" should be marked as favorite
    And file "sample,1.txt" should be marked as favorite on the webUI
    And as user "Alice" folder "Sample,Folder,With,Comma" should be marked as favorite
    And folder "Sample,Folder,With,Comma" should be marked as favorite on the webUI
    When the user browses to the favorites page
    Then the count of files and folders shown on the webUI should be 2
    And folder "Sample,Folder,With,Comma" should be listed on the webUI
    And file "sample,1.txt" should be listed on the webUI
