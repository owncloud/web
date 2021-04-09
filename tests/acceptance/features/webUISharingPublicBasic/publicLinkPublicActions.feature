@public_link_share-feature-required @ocis-reva-issue-64
Feature: Access public link shares by public
  As a public
  I want to access links shared by a owncloud user
  So that I get access to files on owncloud

  Background:
    Given user "Alice" has been created with default attributes

  @issue-4858 @issue-276 @issue-ocis-reva-398
  Scenario: Thumbnails are loaded for known file types in public link file list
    Given user "Alice" has shared folder "simple-folder" with link with "read,create" permissions
    When the public uses the webUI to access the last public link created by user "Alice"
    And the user uploads file "new-lorem.txt" using the webUI
    Then the file "new-lorem.txt" should have a thumbnail displayed on the webUI

  @issue-276 @issue-ocis-reva-398
  Scenario: Thumbnails are not loaded for known file types in public link file list
    Given user "Alice" has shared folder "simple-folder" with link with "read,create" permissions
    When the public uses the webUI to access the last public link created by user "Alice"
    And the user uploads file "new-data.zip" using the webUI
    Then the file "new-data.zip" should have a file type icon displayed on the webUI

  Scenario: public should be able to access a public link with correct password
    Given user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "pass123"
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass123"
    Then file "lorem.txt" should be listed on the webUI


  Scenario: public should not be able to access a public link with wrong password
    Given user "Alice" has shared folder "simple-folder" with link with "read" permissions and password "pass123"
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass12"
    Then the public should not get access to the publicly shared file

  @yetToImplement
  Scenario: public should be able to access the shared file through public link
    Given user "Alice" has logged in using the webUI
    And user "Alice" has created a public link with following settings
      | path | lorem.txt   |
      | name | Public link |
    When the public uses the webUI to access the last public link created by user "Alice"
    Then file "lorem.txt" should be listed on the webUI
#    Then the text preview of the public link should contain "Lorem ipsum dolor sit amet, consectetur"
#    And the content of the file shared by the last public link should be the same as "lorem.txt"

  Scenario: public creates a folder in the public link
    Given user "Alice" has created a public link with following settings
      | path        | /simple-folder |
      | name        | public link    |
      | permissions | read, create   |
    When the public uses the webUI to access the last public link created by user "Alice"
    And the public creates a folder with the name "public-created-folder" using the webUI
    Then folder "public-created-folder" should be listed on the webUI
    When the public reloads the current page of the webUI
    Then folder "public-created-folder" should be listed on the webUI
    And as "Alice" folder "/simple-folder/public-created-folder" should exist

  @skipOnOC10 @issue-4582
  Scenario: public batch deletes resources in the public link
    Given user "Alice" has created a public link with following settings
      | path        | /simple-folder               |
      | name        | public link                  |
      | permissions | read, create, delete, update |
    When the public uses the webUI to access the last public link created by user "Alice"
    And the public marks these files for batch action using the webUI
      | name                |
      | lorem.txt           |
      | simple-empty-folder |
      | data.zip            |
    And the public batch deletes the marked files using the webUI
    Then file "data.zip" should not be listed on the webUI
    And folder "simple-folder" should not be listed on the webUI
    And file "lorem.txt" should not be listed on the webUI
    And as "Alice" folder "/simple-folder/simple-empty-folder" should not exist
    And as "Alice" file "/simple-folder/lorem.txt" should not exist
    And as "Alice" file "/simple-folder/data.zip" should not exist


  Scenario: files are not selected initially in the public share
    Given user "Alice" has created a public link with following settings
      | path | /simple-folder |
      | name | public link    |
    When the public uses the webUI to access the last public link created by user "Alice"
    Then these files should not be selected on the webUI
      | name                |
      | lorem.txt           |
      | simple-empty-folder |
      | data.zip            |


  Scenario: public selects files and clear the selection in the public share
    Given user "Alice" has created a public link with following settings
      | path | /simple-folder |
      | name | public link    |
    When the public uses the webUI to access the last public link created by user "Alice"
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
