Feature: Group actions
  As a user
  I want to check group operations like:
  - sharing a resource by several users
  - accepting multiple shares by using a batch action

  Scenario: copy and move resources in personal space
    Given "Admin" creates following user using API
      | id    |
      | Alice |
      | Brian |
      | Carol |
      | David |
      | Edith |
    And "Admin" creates following group using API
      | id       |
      | sales    |
      | finance  |
      | security |
    And "Admin" adds user to the group using API
      | user  | group    |
      | Brian | sales    |
      | Brian | finance  |
      | Brian | security |
    And "Brian" logs in
    # disabling auto accepting to check accepting share
    And "Brian" disables auto-accepting using API

    And "Alice" creates the following folders in personal space using API
      | name                   |
      | sharedFolder           |
      | folder1                |
      | folder2                |
      | folder3                |
      | folder4                |
      | folder5                |
      | parentFolder/SubFolder |
    And "Alice" shares the following resource using API
      | resource     | recipient | type | role     |
      | folder1      | Brian     | user | Can edit |
      | folder2      | Brian     | user | Can edit |
      | folder3      | Brian     | user | Can edit |
      | folder4      | Brian     | user | Can edit |
      | folder5      | Brian     | user | Can edit |
      | parentFolder | Brian     | user | Can edit |
    And "Alice" logs in

    # multiple share
    And "Alice" shares the following resources using the sidebar panel
      | resource     | recipient | type  | role     |
      | sharedFolder | Brian     | user  | Can edit |
      | sharedFolder | Carol     | user  | Can edit |
      | sharedFolder | David     | user  | Can edit |
      | sharedFolder | Edith     | user  | Can edit |
      | sharedFolder | sales     | group | Can edit |
      | sharedFolder | finance   | group | Can edit |
      | sharedFolder | security  | group | Can edit |

    And "Brian" navigates to the shared with me page

    And "Brian" enables the sync for all shares using the batch actions
    And "Alice" logs out
    And "Brian" logs out
