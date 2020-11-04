Feature: User can view files inside a folder
  As a user
  I want to be able to view folder contents
  So that I can work with files and folders inside it

  Background:
    Given user "user1" has been created with default attributes
    And user "user1" has logged in using the webUI

  Scenario: Resources are listed
    When the user has browsed to the files page
    Then folder "simple-folder" should be listed on the webUI
    And file "textfile0.txt" should be listed on the webUI

  @issue-1910
  Scenario: Empty folders display no resources in the list
    When the user creates a folder with the name "empty-thing" using the webUI
    And the user opens folder "empty-thing" directly on the webUI
    Then there should be no resources listed on the webUI

  @issue-276 @issue-3264
  Scenario: Thumbnails are loaded for known file types
    When the user uploads file "new-lorem.txt" using the webUI
    Then the file "new-lorem.txt" should have a thumbnail displayed on the webUI

  @issue-276 @issue-3264
  Scenario: Thumbnails are loaded for paths containing special characters
    Given user "user1" has renamed folder "simple-folder" to "strängé folder name (duplicate #2 &)"
    When the user has browsed to the files page
    And the user opens folder "strängé folder name (duplicate #2 &)" directly on the webUI
    Then the file "strängé filename (duplicate #2 &).txt" should have a thumbnail displayed on the webUI

  @issue-276 @issue-3264
  Scenario: Thumbnails are not loaded for known file types
    When the user uploads file "new-data.zip" using the webUI
    Then the file "new-data.zip" should have a file type icon displayed on the webUI

  Scenario: All files list displays public link quick action
    When the user has browsed to the files page
    Then quick action "public link" should be displayed on the webUI
