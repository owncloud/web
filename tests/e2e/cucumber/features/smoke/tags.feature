Feature: Users can use web to organize tags

  Background:
    Given "Admin" creates following users
      | id    |
      | Alice |
      | Brian |

    Scenario: Manage tags
      When "Alice" logs in
      And "Alice" opens the "files" app
      And "Alice" logs out

    Scenario: Tags visibility
      When "Alice" logs in
      And "Alice" opens the "files" app
      And "Alice" creates the following resources
        | resource         | type   |
        | folder_to_shared | folder |
      And "Alice" uploads the following resource
        | resource  | to               |
        | lorem.txt | folder_to_shared |
      When "Alice" shares the following resource using the sidebar panel
        | resource         | recipient | type | role   |
        | folder_to_shared | Brian     | user | editor |
      And "Alice" logs out
      And "Brian" logs in
      And "Brian" logs out
