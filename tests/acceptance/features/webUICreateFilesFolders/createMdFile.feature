Feature: create files
  As a user
  I want to create md file
  So that I can organize my data

  Background:
    Given user "user1" has been created with default attributes
    And user "user1" has logged in using the webUI
    And the user has browsed to the files page
    And the user has created folder "parent-folder"

  Scenario: create a new md file
    When the user reloads the current page of the webUI
    When the user opens folder "parent-folder" using the webUI
    Then there should be no resources listed on the webUI
    When the user creates a md file with the name "sample.md" using the webUI
    And the user closes the text editor using the webUI
    # Then breadcrumb for folder "parent-folder" should be displayed on the webUI
    Then the user should be in the root directory on the webUI