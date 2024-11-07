@ocm
Feature: federation management
  As a user
  I want to establish connection between multiple oCIS instance
  So that I share resource

  Scenario: user creates a federated share
    Given using "LOCAL" server
    And "Admin" creates following user using API
      | id    |
      | Alice |
    And "Alice" creates the following folders in personal space using API
      | name         |
      | folderPublic |
    And "Alice" uploads the following local file into personal space using API
      | localFile                     | to                      |
      | filesForUpload/simple.pdf     | folderPublic/simple.pdf |
      | filesForUpload/testavatar.jpg | testavatar.jpg          |
      | filesForUpload/sampleGif.gif  | sampleGif.gif           |
    And "Alice" logs in
    And "Alice" opens the "open-cloud-mesh" app
    And "Alice" generates invitation token for the federation share

    Given using "FEDERATED" server
    And "Admin" creates following user using API
      | id    |
      | Brian |
    And "Brian" logs in
    And "Brian" opens the "open-cloud-mesh" app
    When "Brian" accepts federated share invitation by local user "Alice"
    Then "Brian" should see the following federated connections:
      | user         | email             |
      | Alice Hansen | alice@example.org |

    And using "LOCAL" server
    When "Alice" reloads the page
    Then "Alice" should see the following federated connections:
      | user         | email             |
      | Brian Murphy | brian@example.org |
    And "Alice" opens the "files" app
    And "Alice" shares the following resource using the sidebar panel
      | resource       | recipient | type | role     | resourceType | shareType |
      | folderPublic   | Brian     | user | Can edit | folder       | external  |
      | sampleGif.gif  | Brian     | user | Can edit | file         | external  |
      | testavatar.jpg | Brian     | user | Can view | file         | external  |
    And "Alice" logs out

    And using "FEDERATED" server
    And "Brian" opens the "files" app
    When "Brian" navigates to the shared with me page

    Then "Brian" should see thumbnail and preview for file "testavatar.jpg"
    And "Brian" should see thumbnail and preview for file "sampleGif.gif"
    When "Brian" opens the following file in mediaviewer
      | resource       |
      | testavatar.jpg |
    Then "Brian" is in a media-viewer
    When "Brian" closes the file viewer

    And "Brian" downloads the following resources using the sidebar panel
      | resource       | type   |
      | folderPublic   | folder |
      | sampleGif.gif  | file   |
      | testavatar.jpg | file   |
    And "Brian" logs out
