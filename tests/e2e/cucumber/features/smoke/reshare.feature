Feature: reshare

  Background:
    Given "Admin" disables share auto accepting

  Scenario: re-sharing
    Given "Admin" creates following users
      | id    |
      | Alice |
      | Brian |
      | Carol |
    And "Admin" creates following group using API
      | id      |
      | sales   |
      | finance |
    And "Admin" adds user to the group using API
      | user  | group |
      | Carol | sales |
    And "Alice" creates the following folder in personal space using API
      | name             |
      | folder_to_shared |
    And "Alice" shares the following resource using API
      | resource         | recipient | type | role   |
      | folder_to_shared | Brian     | user | editor |
    And "Brian" accepts the following share using API
      | name             |
      | folder_to_shared |

    And "Brian" logs in
    And "Brian" opens the "files" app
    And "Brian" navigates to the shared with me page
    And "Brian" reshares the following resource
      | resource         | recipient | type  | role   | resourceType |
      | folder_to_shared | sales     | group | viewer | folder       |

    And "Carol" logs in
    And "Carol" opens the "files" app
    And "Carol" navigates to the shared with me page
    And "Carol" accepts the following share
      | name             |
      | folder_to_shared |
    And "Carol" reshares the following resource
      | resource         | recipient | type | role   | resourceType |
      | folder_to_shared | Alice     | user | viewer | folder       |

    And "Alice" logs in
    And "Alice" opens the "files" app
    And "Alice" navigates to the personal space page
    Then "Alice" should see the following recipients
      | resource         | recipient | type  | role   |
      | folder_to_shared | Brian     | user  | editor |
      | folder_to_shared | sales     | group | viewer |
    And "Alice" logs out

    When "Brian" updates following sharee role
      | resource         | recipient | type  | role                    | resourceType |
      | folder_to_shared | sales     | group | custom_permissions:read | folder       |
    And "Brian" logs out

    And "Carol" navigates to the shared with me page
    Then "Carol" should not be able to reshare the following resource
      | resource         |
      | folder_to_shared |
    And "Carol" logs out
