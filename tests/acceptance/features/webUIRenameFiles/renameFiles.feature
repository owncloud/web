Feature: rename files
  As a user
  I want to rename files
  So that I can organise my data structure

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "data.zip" to "data.zip" in the server
    And user "Alice" has uploaded file "lorem-big.txt" to "lorem-big.txt" in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server

  Scenario: User tries to rename a file that used to exist but does not anymore
    Given user "Alice" has logged in using the webUI
    And the following files have been deleted by user "Alice" in the server
      | name      |
      | lorem.txt |
    When the user tries to rename file "lorem.txt" to "new-lorem.txt" using the webUI
    Then the error message with header 'Failed to rename "lorem.txt" to "new-lorem.txt"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "new-lorem.txt" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist in the server
    And as "Alice" file "new-lorem.txt" should not exist in the server
