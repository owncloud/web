@sse
Feature: server sent events

  Scenario: sse events when creating resources in the project space
    Given "Admin" creates following users using API
      | id    |
      | Alice |
      | Brian |
    And "Admin" assigns following roles to the users using API
      | id    | role        |
      | Alice | Space Admin |
    And "Alice" logs in
    And "Alice" creates the following project space using API
      | name      | id        |
      | Marketing | marketing |
    And "Alice" adds the following members to the space "Marketing" using API
      | user  | role     | shareType |
      | Brian | Can edit | space     |
    And "Alice" navigates to the project space "marketing"

    And "Brian" logs in
    And "Brian" navigates to the project space "marketing"

    # creating resouces
    When "Alice" creates the following folder in space "Marketing" using API
      | name     |
      | myfolder |
    Then "Alice" should get 'folder-created' SSE event
    And following resources should be displayed in the files list for user "Brian"
      | resource |
      | myfolder |

    And "Alice" creates the following file in space "Marketing" using API
      | name     | content     |
      | plan.txt | secret plan |
    Then "Brian" should get 'postprocessing-finished' SSE event
    And following resources should be displayed in the files list for user "Brian"
      | resource |
      | plan.txt |
    And "Brian" logs out
    And "Alice" logs out

