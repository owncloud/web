@sse
Feature: server sent events
      events:
      | userlog-notification    | x |
      | postprocessing-finished | x |
      | file-locked             | x | checked in the app-provider/lock.feature
      | file-unlocked           | x | checked in the app-provider/lock.feature
      | file-touched            | x |
      | item-renamed            | x |
      | item-trashed            | x |
      | item-restored           | x |
      | item-moved              | x |
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
      | Brian | Can view | user      |
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
    And "Brian" should see user-direct indicator on the folder "space-folder"

    # share-updated
    When "Alice" updates following sharee role
      | resource     | recipient | type | role     | resourceType |
      | space-folder | Carol     | user | Can view | folder       |
    Then "Alice" should get "share-updated" SSE event
    And "Brian" should get "share-updated" SSE event

    # link-created
    When "Alice" creates a public link of following resource using the sidebar panel
      | resource     | password |
      | space-folder | %public% |
    Then "Alice" should get "link-created" SSE event
    Then "Brian" should get "link-created" SSE event
    And "Brian" should see link-direct indicator on the folder "space-folder"

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
    And "Brian" should not see user-direct indicator on the folder "space-folder"

    # link-removed
    When "Alice" removes the public link named "myLink" of resource "space-folder"
    Then "Alice" should get "link-removed" SSE event
    And "Brian" should get "link-removed" SSE event
    And "Brian" should not see link-direct indicator on the folder "space-folder"

    # space-member-removed
    When "Brian" navigates to the projects space page
    And "Alice" navigates to the project space "marketing"
    And "Alice" removes access to following users from the project space
      | user  |
      | Brian |
    Then "Alice" should get "space-member-removed" SSE event
    And "Brian" should get "space-member-removed" SSE event
    And "Brian" should not see space "marketing"

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


  Scenario: sse events on file operations
    Given "Admin" assigns following roles to the users using API
      | id    | role        |
      | Alice | Space Admin |
    And "Alice" logs in
    And "Alice" creates the following project space using API
      | name      | id        |
      | Marketing | marketing |
    And "Alice" adds the following members to the space "Marketing" using API
      | user  | role     | shareType |
      | Brian | Can edit | user      |
    And "Alice" creates the following folder in space "Marketing" using API
      | name         |
      | space-folder |
    When "Alice" navigates to the project space "marketing"
    And "Brian" logs in
    And "Brian" navigates to the project space "marketing"

    # postprocessing-finished - upload file
    When "Brian" uploads the following resources
      | resource   |
      | simple.pdf |
    Then "Brian" should get "postprocessing-finished" SSE event
    And "Alice" should get "postprocessing-finished" SSE event
    And following resources should be displayed in the files list for user "Alice"
      | resource   |
      | simple.pdf |

    # postprocessing-finished - create file
    # file-touched -create file
    When "Alice" creates the following resources
      | resource    | type    | content   |
      | example.txt | txtFile | some text |
    Then "Alice" should get "postprocessing-finished" SSE event
    And "Alice" should get "file-touched" SSE event
    And "Brian" should get "postprocessing-finished" SSE event
    And "Brian" should get "file-touched" SSE event
    And following resources should be displayed in the files list for user "Brian"
      | resource    |
      | example.txt |

    # item-renamed
    When "Brian" renames the following resource
      | resource   | as                 |
      | simple.pdf | simple-renamed.pdf |
    Then "Brian" should get "item-renamed" SSE event
    And "Alice" should get "item-renamed" SSE event
    And following resources should be displayed in the files list for user "Alice"
      | resource           |
      | simple-renamed.pdf |

    # item-trashed
    When "Alice" deletes the following resource using the sidebar panel
      | resource    |
      | example.txt |
    Then "Alice" should get "item-trashed" SSE event
    And "Brian" should get "item-trashed" SSE event
    And following resources should not be displayed in the files list for user "Brian"
      | resource    |
      | example.txt |

    # item-restored
    When "Brian" navigates to the trashbin of the project space "marketing"
    And "Brian" restores the following resources from trashbin
      | resource    |
      | example.txt |
    Then "Brian" should get "item-restored" SSE event
    And "Alice" should get "item-restored" SSE event
    And following resources should be displayed in the files list for user "Alice"
      | resource    |
      | example.txt |

    # item-moved
    When "Brian" navigates to the project space "marketing"
    And "Brian" opens folder "space-folder"
    And "Alice" moves the following resource using drag-drop
      | resource           | to           |
      | simple-renamed.pdf | space-folder |
    Then "Alice" should get "item-moved" SSE event
    And "Brian" should get "item-moved" SSE event
    And following resources should be displayed in the files list for user "Brian"
      | resource           |
      | simple-renamed.pdf |

    And "Brian" logs out
    And "Alice" logs out
