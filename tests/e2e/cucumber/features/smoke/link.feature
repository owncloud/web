Feature: link

  Background:
    Given "Admin" creates following user using API
      | id    |
      | Alice |


  Scenario: public link
    When "Alice" logs in
    And "Alice" opens the "files" app
    And "Alice" creates the following resources
      | resource     | type   |
      | folderPublic | folder |
    And "Alice" uploads the following resources
      | resource  | to           |
      | lorem.txt | folderPublic |
    And "Alice" creates a public link for the resource "folderPublic" using the sidebar panel
    And "Alice" renames the most recently created public link of resource "folderPublic" to "myPublicLink"
    And "Alice" edits the public link named "myPublicLink" of resource "folderPublic" changing role to "Secret File Drop"
    And "Alice" sets the expiration date of the public link named "myPublicLink" of resource "folderPublic" to "+5 days"
    And "Alice" sets the password of the public link named "myPublicLink" of resource "folderPublic" to "12345"
    When "Anonymous" opens the public link "myPublicLink"
    And "Anonymous" unlocks the public link with password "12345"
    And "Anonymous" drop uploads following resources
      | resource     |
      | textfile.txt |
    When "Alice" downloads the following resources using the batch action
      | resource     | from         | type |
      | lorem.txt    | folderPublic | file |
      | textfile.txt | folderPublic | file |
    And "Alice" edits the public link named "myPublicLink" of resource "folderPublic" changing role to "Can edit"
    And "Anonymous" refreshes the old link
    And "Anonymous" downloads the following public link resources using the sidebar panel
      | resource     | type |
      | lorem.txt    | file |
      | textfile.txt | file |
    And "Anonymous" uploads the following resources in public link page
      | resource      |
      | new-lorem.txt |
    And "Anonymous" renames the following public link resources
      | resource      | as               |
      | lorem.txt     | lorem_new.txt    |
      | textfile.txt  | textfile_new.txt |
      | new-lorem.txt | test.txt         |
    And "Alice" removes the public link named "myPublicLink" of resource "folderPublic"
    And "Anonymous" should not be able to open the old link "myPublicLink"
    And "Alice" logs out


  Scenario: Quick link
    Given "Alice" logs in
    And "Alice" creates the following folders in personal space using API
      | name         |
      | folderPublic |
    And "Alice" creates the following files into personal space using API
      | pathToFile             | content     |
      | folderPublic/lorem.txt | lorem ipsum |
    And "Alice" opens the "files" app
    When "Alice" copies quick link of the resource "folderPublic" from the context menu
    And "Anonymous" opens the public link "Link"
    And "Anonymous" downloads the following public link resources using the sidebar panel
      | resource  | type |
      | lorem.txt | file |
    And "Alice" logs out


  Scenario: public link for folder (by authenticated user)
    Given "Admin" creates following user using API
      | id    |
      | Brian |
    And "Alice" logs in
    And "Alice" creates the following resources
      | resource     | type   |
      | folderPublic | folder |
    And "Alice" shares the following resources using the sidebar panel
      | resource     | recipient | type | role     |
      | folderPublic | Brian     | user | Can edit |
    And "Alice" creates a public link for the resource "folderPublic" using the sidebar panel
    And "Alice" renames the most recently created public link of resource "folderPublic" to "folderLink"
    And "Alice" logs out
    And "Brian" logs in
    And "Brian" navigates to the shared with me page
    And "Brian" accepts the following share
      | name         |
      | folderPublic |
    When "Brian" opens the public link "folderLink"
    And "Brian" uploads the following resources
      | resource  |
      | lorem.txt |
    And "Brian" logs out
