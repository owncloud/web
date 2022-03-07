Feature: link

  Scenario: public link
    Given "Admin" creates following users
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
    And "Alice" creates a public link for the following resource using the sidebar panel
      | resource     | name         | role     | dateOfExpiration | password |
      | folderPublic | myPublicLink | uploader | +5 days          | 12345    |
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
    #When the public reloads the public link pages
    #Then the public should not see the following files on the files-drop page
    #  | textfile.txt |
    And "Anonymous" logs out
    When "Alice" downloads the following files using the batch action
      | resource     | from         |
      | lorem.txt    | folderPublic |
      | textfile.txt | folderPublic |
    And "Alice" logs out
