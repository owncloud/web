Feature: link

  Scenario: public link
    Given "Admin" creates following user using API
      | id    |
      | Alice |
    When "Alice" logs in
    And "Alice" opens the "files" app
    And "Alice" creates the following resources
      | resource     | type   |
      | folderPublic | folder |
    And "Alice" uploads the following resources
      | resource  | to           |
      | lorem.txt | folderPublic |
    #Then "Alice" should see the following resource
    #  | folderPublic/lorem.txt |
    And "Alice" creates a public link for the resource "folderPublic" using the sidebar panel
    And "Alice" renames the most recently created public link of resource "folderPublic" to "myPublicLink"
    And "Alice" edits the public link named "myPublicLink" of resource "folderPublic" changing role to "uploader"
    And "Alice" sets the expiration date of the public link named "myPublicLink" of resource "folderPublic" to "+5 days"
    And "Alice" sets the password of the public link named "myPublicLink" of resource "folderPublic" to "12345"
    #Then "Alice" should see 1 public link
    When "Anonymous" opens the public link "myPublicLink"
    And "Anonymous" unlocks the public link with password "12345"
    #Then the public should not see the following resource
    #  | lorem.txt |
    And "Anonymous" drop uploads following resources
      | resource     |
      | textfile.txt |
    #Then the public should see the following files on the files-drop page
    #  | textfile.txt |
    #Then the public should not see the following files on the files-drop page
    #  | textfile.txt |
    When "Alice" downloads the following resources using the batch action
      | resource     | from         | type |
      | lorem.txt    | folderPublic | file |
      | textfile.txt | folderPublic | file |
    And "Alice" edits the public link named "myPublicLink" of resource "folderPublic" changing role to "editor"
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
    And "Anonymous" logs out
    And "Alice" logs out


  Scenario: Quick link
    Given "Admin" creates following user using API
      | id    |
      | Alice |
    And "Alice" creates the following folders in personal space using API
      | name         |
      | folderPublic |
    And "Alice" creates the following files into personal space using API
      | pathToFile             | content     |
      | folderPublic/lorem.txt | lorem ipsum |
    And "Alice" logs in
    And "Alice" opens the "files" app
    When "Alice" copies quick link of the resource "folderPublic" from the context menu
    And "Anonymous" opens the public link "Link"
    And "Anonymous" downloads the following public link resources using the single share view
      | resource  | type |
      | lorem.txt | file |
    And "Anonymous" logs out
    And "Alice" logs out
