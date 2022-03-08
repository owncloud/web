Feature: create files
  As a user
  I want to create files
  So that I can organize my data

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files in the server
    And user "Alice" has created file "/lorem.txt" in the server
    And user "Alice" has logged in using the webUI
    And the user has browsed to the personal page

  @ocisSmokeTest
  Scenario: create a new file
    When the user creates a file with the name "sample.txt" using the webUI
    And the user browses to the files page
    Then file "sample.txt" should be listed on the webUI


  Scenario: try to create a file that already exists
    When the user tries to create a file with already existing name "lorem.txt" using the webUI
    Then the error message "lorem.txt already exists" should be displayed on the webUI dialog prompt
    And the create file button should be disabled


  Scenario: create file with name that contains commas
    When the user creates a file with the name "sample,1.txt" using the webUI
    And the user browses to the files page
    Then file "sample,1.txt" should be listed on the webUI

  @issue-2882
  Scenario: redirect to subfolder after closing the text editor
    Given user "Alice" has created folder "parent-folder" in the server
    When the user reloads the current page of the webUI
    And the user opens folder "parent-folder" using the webUI
    Then there should be no resources listed on the webUI
    When the user creates a markdown file with the name "sample.md" using the webUI
    And the user closes the text editor using the webUI
    Then breadcrumb for folder "parent-folder" should be displayed on the webUI
    And file "sample.md" should be listed on the webUI
