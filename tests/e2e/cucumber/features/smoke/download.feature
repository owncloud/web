Feature: Download
  As a user
  I want to download resources


  Background:
    Given "Admin" creates following user using API
      | id    |
      | Alice |
      | Brian |


  Scenario: download resources
    When "Alice" logs in
    And "Alice" creates the following folders in personal space using API
      | name         |
      | folderPublic |
      | emptyFolder  |
    And "Alice" creates the following files into personal space using API
      | pathToFile             | content     |
      | folderPublic/lorem.txt | lorem ipsum |
    And "Alice" uploads the following local file into personal space using API
      | localFile                     | to             |
      | filesForUpload/testavatar.jpg | testavatar.jpg |
    And "Alice" shares the following resource using API
      | resource       | recipient | type | role     |
      | folderPublic   | Brian     | user | Can edit |
      | emptyFolder    | Brian     | user | Can edit |
      | testavatar.jpg | Brian     | user | Can edit |

    When "Alice" opens the "files" app
    And "Alice" downloads the following resources using the batch action
      | resource       | type   |
      | folderPublic   | folder |
      | emptyFolder    | folder |
      | testavatar.jpg | file   |
    And "Alice" opens the following file in mediaviewer
      | resource        |
      | testavatar.jpg |
    And "Alice" downloads the following image from the mediaviewer
      | resource       |
      | testavatar.jpg |
    And "Alice" closes the file viewer
    And "Alice" logs out

    And "Brian" logs in
    And "Brian" navigates to the shared with me page
    And "Brian" downloads the following resources using the batch action
      | resource       | type   |
      | folderPublic   | folder |
      | emptyFolder    | folder |
      | testavatar.jpg | file   |
    And "Brian" downloads the following resources using the sidebar panel
      | resource       | from         | type   |
      | lorem.txt      | folderPublic | file   |
      | testavatar.jpg |              | file   |
      | folderPublic   |              | folder |
      | emptyFolder    |              | folder |
    And "Brian" opens the following file in mediaviewer
      | resource        |
      | testavatar.jpg |
    And "Brian" downloads the following image from the mediaviewer
      | resource       |
      | testavatar.jpg |
    And "Brian" logs out
