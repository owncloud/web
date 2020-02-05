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

