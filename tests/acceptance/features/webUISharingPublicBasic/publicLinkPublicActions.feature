@public_link_share-feature-required
Feature: Access public link shares by public
  As a public
  I want to access links shared by a owncloud user
  So that I get access to files on owncloud

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files in the server
    And user "Alice" has created folder "simple-folder" in the server








  Scenario: public should be able to access a public link with correct password
    Given user "Alice" has created file "simple-folder/lorem.txt" in the server
    And user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "pass123" in the server
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass123" in a new session
    Then file "lorem.txt" should be listed on the webUI


  Scenario: public should not be able to access a public link with wrong password
    Given user "Alice" has shared folder "simple-folder" with link with "read" permissions and password "pass123" in the server
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass12" in a new session
    Then the public should not get access to the publicly shared file


  Scenario: public creates a folder in the public link
    Given user "Alice" has created a public link with following settings in the server
      | path        | /simple-folder |
      | name        | public link    |
      | permissions | read, create   |
    When the public uses the webUI to access the last public link created by user "Alice" in a new session
    And the public creates a folder with the name "public-created-folder" using the webUI
    Then folder "public-created-folder" should be listed on the webUI
    When the public reloads the current page of the webUI
    Then folder "public-created-folder" should be listed on the webUI
    And as "Alice" folder "/simple-folder/public-created-folder" should exist in the server

  @skipOnOC10 @issue-4582
  Scenario: public batch deletes resources in the public link
    Given user "Alice" has uploaded file "data.zip" to "simple-folder/data.zip" in the server
    And user "Alice" has created folder "simple-folder/simple-empty-folder" in the server
    And user "Alice" has created file "simple-folder/lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | /simple-folder               |
      | name        | public link                  |
      | permissions | read, create, delete, update |
    When the public uses the webUI to access the last public link created by user "Alice" in a new session
    And the public marks these files for batch action using the webUI
      | name                |
      | lorem.txt           |
      | simple-empty-folder |
      | data.zip            |
    And the public batch deletes the marked files using the webUI
    Then file "data.zip" should not be listed on the webUI
    And folder "simple-empty-folder" should not be listed on the webUI
    And file "lorem.txt" should not be listed on the webUI
    And as "Alice" folder "/simple-folder/simple-empty-folder" should not exist in the server
    And as "Alice" file "/simple-folder/lorem.txt" should not exist in the server
    And as "Alice" file "/simple-folder/data.zip" should not exist in the server


  Scenario: files are not selected initially in the public share
    Given user "Alice" has uploaded file "data.zip" to "simple-folder/data.zip" in the server
    And user "Alice" has created folder "simple-folder/simple-empty-folder" in the server
    And user "Alice" has created file "simple-folder/lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path | /simple-folder |
      | name | public link    |
    When the public uses the webUI to access the last public link created by user "Alice" in a new session
    Then these files should not be selected on the webUI
      | name                |
      | lorem.txt           |
      | simple-empty-folder |
      | data.zip            |


  Scenario: public selects files and clear the selection in the public share
    Given user "Alice" has uploaded file "data.zip" to "simple-folder/data.zip" in the server
    And user "Alice" has created folder "simple-folder/simple-empty-folder" in the server
    And user "Alice" has created file "simple-folder/lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path | /simple-folder |
      | name | public link    |
    When the public uses the webUI to access the last public link created by user "Alice" in a new session
    And the public marks these files for batch action using the webUI
      | name                |
      | lorem.txt           |
      | simple-empty-folder |
      | data.zip            |
    Then these files should be selected on the webUI
      | name                |
      | lorem.txt           |
      | simple-empty-folder |
      | data.zip            |
    When the public clears the selection of files
    Then these files should not be selected on the webUI
      | name                |
      | lorem.txt           |
      | simple-empty-folder |
      | data.zip            |
