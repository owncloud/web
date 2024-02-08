Feature: create files
  As a user
  I want to create files
  So that I can organize my data

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files in the server
    And user "Alice" has created file "/lorem.txt" in the server
    And user "Alice" has logged in using the webUI
    And the user has browsed to the personal page


  Scenario: try to create a file that already exists
    When the user tries to create a file with already existing name "lorem.txt" using the webUI
    Then the error message "lorem.txt already exists" should be displayed on the webUI dialog prompt
    And the create file button should be disabled
