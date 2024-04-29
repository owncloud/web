Feature: lock
  As a user
  I can see that a file is locked if it is opened by a user with edit permissions,
  and I am restricted in some actions such as moving deleting renaming a locked file


  Scenario: file lock indication
    Given "Admin" creates following users using API
      | id    |
      | Alice |
      | Brian |
      | Carol |
    And "Alice" logs in
    And "Alice" creates the following files into personal space using API
      | pathToFile | content      |
      | test.odt   | some content |
    And "Alice" creates the following folder in personal space using API
      | name   |
      | folder |
    And "Alice" shares the following resource using API
      | resource | recipient | type | role     |
      | test.odt | Brian     | user | Can edit |

    And "Brian" logs in
    And "Brian" navigates to the shared with me page
    When "Brian" opens the following file in Collabora
      | resource |
      | test.odt |
    Then "Brian" should see the content "some content" in editor "Collabora"

    When "Alice" opens the "files" app
    Then for "Alice" file "test.odt" should be locked

    # checking that sharing/unsharing and creating link of the locked file is possible
    And "Alice" creates a public link of following resource using the sidebar panel
      | resource | password |
      | test.odt | %public% |
    And "Alice" shares the following resource using the sidebar panel
      | resource | recipient | type | role     | resourceType |
      | test.odt | Carol     | user | Can view | file         |
    # unsharing should remove lock https://github.com/owncloud/ocis/issues/8273
    # And "Alice" removes following sharee
    #   | resource | recipient |
    #   | test.odt | Brian     |
    And "Brian" logs out

    When "Alice" reloads the page
    Then for "Alice" file "test.odt" should not be locked
    And "Alice" logs out
