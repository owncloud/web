@sse
Feature: server sent events
      events:
      | userlog-notification    |   |
      | postprocessing-finished |   |
      | file-locked             |   |
      | file-unlocked           |   |
      | file-touched            |   |
      | item-renamed            |   |
      | item-trashed            |   |
      | item-restored           |   |
      | item-moved              |   |
      | folder-created          | x |
      | space-member-added      | x |
      | space-member-removed    | x |
      | space-share-updated     | x |
      | share-created           | x |
      | share-removed           | x |
      | share-updated           | x |
      | link-created            | x |
      | link-removed            | x |
      | link-updated            | x |


  Background:
    Given "Admin" creates following user using API
      | id    |
      | Alice |
      | Brian |
      | Carol |

  Scenario: space sse events
    Given "Admin" assigns following roles to the users using API
      | id    | role        |
      | Alice | Space Admin |
    And "Brian" logs in
    And "Brian" navigates to the projects space page

    And "Alice" logs in
    And "Alice" creates the following project space using API
      | name      | id        |
      | Marketing | marketing |

    # space-member-added
    When "Alice" adds the following members to the space "Marketing" using API
      | user  | role     | shareType |
      | Brian | Can view | space     |
    Then "Alice" should get "space-member-added" SSE event
    And "Brian" should get "userlog-notification" SSE event
    And "Brian" should get "space-member-added" SSE event
    And "Brian" should see space "marketing"

    # folder-created
    When "Brian" navigates to the project space "marketing"
    And "Alice" creates the following folder in space "Marketing" using API
      | name         |
      | space-folder |
    Then "Alice" should get "folder-created" SSE event
    And "Brian" should get "folder-created" SSE event
    And following resources should be displayed in the files list for user "Brian"
      | resource     |
      | space-folder |
    And "Brian" should not be able to edit folder "space-folder"

    # space-share-updated
    When "Alice" navigates to the project space "marketing"
    And "Alice" changes the roles of the following users in the project space
      | user  | role     |
      | Brian | Can edit |
    Then "Alice" should get "space-share-updated" SSE event
    And "Brian" should get "space-share-updated" SSE event
    And "Brian" should be able to edit folder "space-folder"

    # share-created
    When "Alice" shares the following resource using the sidebar panel
      | resource     | recipient | type | role     |
      | space-folder | Carol     | user | Can view |
    Then "Alice" should get "share-created" SSE event
    And "Brian" should get "share-created" SSE event
    And "Brian" should see show invited people button on the folder "space-folder"

    # share-updated
    When "Alice" updates following sharee role
      | resource     | recipient | type | role     | resourceType |
      | space-folder | Carol     | user | Can view | folder       |
    Then "Alice" should get "share-updated" SSE event
    And "Brian" should get "share-updated" SSE event

    # link-created
    When "Alice" creates a public link creates a public link of following resource using the sidebar panel
      | resource     | password |
      | space-folder | %public% |
    Then "Alice" should get "link-created" SSE event
    Then "Brian" should get "link-created" SSE event
    And "Brian" should see show links button on the folder "space-folder"

    # link-updated
    When "Alice" renames the most recently created public link of resource "space-folder" to "myLink"
    Then "Alice" should get "link-updated" SSE event
    And "Brian" should get "link-updated" SSE event

    # share-removed
    When "Alice" removes following sharee
      | resource     | recipient |
      | space-folder | Carol     |
    Then "Alice" should get "share-removed" SSE event
    And "Brian" should get "share-removed" SSE event
    And "Brian" should not see show invited people button on the folder "space-folder"

    # link-removed
    When "Alice" removes the public link named "myLink" of resource "space-folder"
    Then "Alice" should get "link-removed" SSE event
    And "Brian" should get "link-removed" SSE event
    And "Brian" should not see show links button on the folder "space-folder"

    # space-member-removed
    When "Brian" navigates to the projects space page
    And "Alice" removes access to following users from the project space
      | user  |
      | Brian |
    Then "Alice" should get "space-member-removed" SSE event
    And "Brian" should get "space-member-removed" SSE event
    And "Brian" should not be able to see space "marketing"

    And "Brian" logs out
    And "Alice" logs out


  Scenario: share sse events
    When "Brian" logs in
    And "Brian" navigates to the shared with me page
    And "Alice" logs in
    And "Alice" creates the following folder in personal space using API
      | name                   |
      | sharedFolder/subFolder |
    
    # share-created
    When "Alice" shares the following resource using the sidebar panel
      | resource     | recipient | type | role     |
      | sharedFolder | Brian     | user | Can view |
    Then "Alice" should get "share-created" SSE event
    And "Brian" should get "share-created" SSE event
    And "Brian" should not be able to edit folder "sharedFolder"

    # share-updated
    When "Brian" opens folder "sharedFolder"
    And "Alice" updates following sharee role
      | resource     | recipient | type | role     | resourceType |
      | sharedFolder | Brian     | user | Can edit | folder       |
    Then "Alice" should get "share-updated" SSE event
    And "Brian" should get "share-updated" SSE event
    And "Brian" should be able to edit folder "subFolder"

    # share-removed
    When "Alice" removes following sharee
      | resource     | recipient |
      | sharedFolder | Brian     |
    Then "Alice" should get "share-removed" SSE event
    And "Brian" should get "share-removed" SSE event
    And "Brian" should see the message "Your access to this share has been revoked. Please navigate to another location." on the webUI

    And "Brian" logs out
    And "Alice" logs out
