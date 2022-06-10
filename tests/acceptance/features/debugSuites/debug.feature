Feature: File Upload

  As a user
  I would like to be able to upload files via the WebUI
  So that I can store files in ownCloud

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has uploaded file with content "initial content" to "lorem.txt" in the server
    And user "Alice" has uploaded file with content "initial content" to "simple-folder/lorem.txt" in the server
    And user "Alice" has logged in using the webUI

  @smokeTest @ocisSmokeTest
  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server

  Scenario: Upload of a folder inside a subdirectory
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And the user has reloaded the current page of the webUI
    When the user browses to the folder "simple-empty-folder" on the files page
    And the user uploads folder "PARENT" using the webUI
    Then no message should be displayed on the webUI
    And folder "PARENT" should be listed on the webUI
    When the user opens folder "PARENT" using the webUI
    Then the following resources should be listed on the webUI
      | entry_name |
      | parent.txt |
      | CHILD      |
    And as "Alice" folder "simple-empty-folder/PARENT" should exist in the server
    And as "Alice" file "simple-empty-folder/PARENT/parent.txt" should exist in the server
    And as "Alice" folder "simple-empty-folder/PARENT/CHILD" should exist in the server
