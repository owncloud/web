@public_link_share-feature-required
Feature: Create public link shares
  As a user
  I want to share files through a publicly accessible link
  So that users who do not have an account on my ownCloud server can access them

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files in the server

  @smokeTest @ocisSmokeTest @issue-ocis-reva-383
  Scenario: simple folder sharing by public link
    Given user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created file "simple-folder/lorem.txt" in the server
    And user "Alice" has logged in using the webUI
    When the user creates a new public link for resource "simple-folder" using the webUI
    Then user "Alice" should have a share with these details in the server:
      | field       | value          |
      | share_type  | public_link    |
      | uid_owner   | Alice          |
      | permissions | read           |
      | path        | /simple-folder |
      | name        | Link           |
    And a link named "Link" should be listed with role "Anyone with the link can view" in the public link list of resource "simple-folder" on the webUI
    When the public uses the webUI to access the last public link created by user "Alice" in a new session
    Then file "lorem.txt" should be listed on the webUI

  @skipOnOC10 @smokeTest @ocisSmokeTest @issue-ocis-reva-383
  Scenario: simple file sharing by public link
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has logged in using the webUI
    When the user creates a new public link for resource "lorem.txt" using the webUI
    Then user "Alice" should have a share with these details in the server:
      | field       | value       |
      | share_type  | public_link |
      | uid_owner   | Alice       |
      | permissions | read        |
      | path        | /lorem.txt  |
      | name        | Link        |
    And a link named "Link" should be listed with role "Anyone with the link can view" in the public link list of resource "lorem.txt" on the webUI
    When the public uses the webUI to access the last public link created by user "Alice" in a new session
    And the user closes the text editor using the webUI
    Then file "lorem.txt" should be listed on the webUI as single share

  @skipOnOC10 @issue-ocis-reva-383
  # When this issue is fixed delete this scenario and use the one above
  Scenario: simple folder sharing by public link (ocis bug demonstration)
    Given user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created file "simple-folder/lorem.txt" in the server
    And user "Alice" has logged in using the webUI
    When the user creates a new public link for resource "simple-folder" using the webUI
    Then user "Alice" should have a share with these details in the server:
      | field       | value          |
      | share_type  | public_link    |
      | uid_owner   | Alice          |
      | permissions | read           |
      | path        | /simple-folder |
    When the public uses the webUI to access the last public link created by user "Alice" in a new session
    Then file "lorem.txt" should be listed on the webUI

  @skipOnOC10 @issue-ocis-reva-383
  # When this issue is fixed delete this scenario and use the one above
  Scenario: simple file sharing by public link (ocis bug demonstration)
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has logged in using the webUI
    When the user creates a new public link for resource "lorem.txt" using the webUI
    Then user "Alice" should have a share with these details in the server:
      | field       | value       |
      | share_type  | public_link |
      | uid_owner   | Alice       |
      | permissions | read        |
      | path        | /lorem.txt  |
    When the public uses the webUI to access the last public link created by user "Alice" in a new session
    And the user closes the text editor using the webUI
    Then file "lorem.txt" should be listed on the webUI as single share

  @issue-ocis-reva-389
  Scenario: user shares a public link with folder longer than 64 chars and shorter link name
    Given user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created file "simple-folder/lorem.txt" in the server
    And user "Alice" has renamed folder "simple-folder" to "aquickbrownfoxjumpsoveraverylazydogaquickbrownfoxjumpsoveralazydog" in the server
    And user "Alice" has logged in using the webUI
    When the user creates a new public link for folder "aquickbrownfoxjumpsoveraverylazydogaquickbrownfoxjumpsoveralazydog" using the webUI
    And the public uses the webUI to access the last public link created by user "Alice" in a new session
    Then file "lorem.txt" should be listed on the webUI


  Scenario: share two files with same name but different paths by public link
    Given user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created file "simple-folder/lorem.txt" in the server
    And user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has logged in using the webUI
    When the user creates a new public link for file "lorem.txt" using the webUI
    And the user opens folder "simple-folder" using the webUI
    And the user creates a new public link for file "lorem.txt" using the webUI
    # using the webui to navigate creates a problem because "successfully created link" notifications block the nav
    And the user has browsed to the shared-via-link page
    Then file with path "lorem.txt" should be listed on the webUI
    And file with path "simple-folder/lorem.txt" should be listed on the webUI


  Scenario: user creates a multiple public link of a file and delete the first link
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path | lorem.txt  |
      | name | first-name |
    And user "Alice" has created a public link with following settings in the server
      | path | lorem.txt   |
      | name | second-name |
    And user "Alice" has created a public link with following settings in the server
      | path | lorem.txt  |
      | name | third-name |
    And user "Alice" has logged in using the webUI
    When the user removes the public link named "first-name" of file "lorem.txt" using the webUI
    Then public link named "first-name" should not be listed on the public links list on the webUI
    And a link named "second-name" should be listed with role "Anyone with the link can view" in the public link list of file "lorem.txt" on the webUI
    And a link named "third-name" should be listed with role "Anyone with the link can view" in the public link list of folder "lorem.txt" on the webUI


  Scenario: user creates a multiple public link of a file and delete the second link
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path | lorem.txt  |
      | name | first-name |
    And user "Alice" has created a public link with following settings in the server
      | path | lorem.txt   |
      | name | second-name |
    And user "Alice" has created a public link with following settings in the server
      | path | lorem.txt  |
      | name | third-name |
    And user "Alice" has logged in using the webUI
    When the user removes the public link named "second-name" of file "lorem.txt" using the webUI
    Then public link named "second-name" should not be listed on the public links list on the webUI
    And a link named "first-name" should be listed with role "Anyone with the link can view" in the public link list of file "lorem.txt" on the webUI
    And a link named "third-name" should be listed with role "Anyone with the link can view" in the public link list of folder "lorem.txt" on the webUI


  Scenario: user creates a multiple public link of a file and delete the third link
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path | lorem.txt  |
      | name | first-name |
    And user "Alice" has created a public link with following settings in the server
      | path | lorem.txt   |
      | name | second-name |
    And user "Alice" has created a public link with following settings in the server
      | path | lorem.txt  |
      | name | third-name |
    And user "Alice" has logged in using the webUI
    When the user removes the public link named "third-name" of file "lorem.txt" using the webUI
    Then public link named "third-name" should not be listed on the public links list on the webUI
    And a link named "first-name" should be listed with role "Anyone with the link can view" in the public link list of file "lorem.txt" on the webUI
    And a link named "second-name" should be listed with role "Anyone with the link can view" in the public link list of folder "lorem.txt" on the webUI


  Scenario Outline: user creates multiple public links with same name for the same file/folder
    Given user "Alice" has created <element> "<name>" in the server
    And user "Alice" has logged in using the webUI
    When the user creates a new public link for <element> "<name>" using the webUI
    And the user creates a new public link for <element> "<name>" using the webUI
    Then the tokens should be unique for each public links on the webUI
    Examples:
      | element | name          |
      | folder  | simple-folder |
      | file    | lorem.txt     |


  Scenario: User can create a public link via quick action
    Given user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has logged in using the webUI
    When the user creates a public link via quick action for resource "simple-folder" using the webUI
    Then user "Alice" should have a share with these details in the server:
      | field       | value          |
      | share_type  | public_link    |
      | uid_owner   | Alice          |
      | permissions | read           |
      | path        | /simple-folder |
      | name        | Link           |
    And the following success message should be displayed on the webUI
      """
      The link has been copied to your clipboard.
      """
