Feature: web can be navigated through urls


  Scenario: Alice can share this weeks meal plan with all parents
    Given "Admin" creates following user using API
      | id    |
      | Alice |
      | Brian |
    And "Alice" logs in
    And "Alice" creates the following folders in personal space using API
      | name   |
      | FOLDER |
    And "Alice" creates the following files into personal space using API
      | pathToFile | content      |
      | lorem.txt  | some content |
    And "Alice" creates the following files into personal space using API
      | pathToFile | content     |
      | lorem.txt  | new content |
    When "Alice" navigates to "versions" details panel of file "lorem.txt" through the URL
    And "Alice" restores following resources
      | resource  | to | version | isDirectUrlNavigation |
      | lorem.txt | /  | 1       | true                  |
    When "Alice" navigates to "sharing" details panel of file "lorem.txt" through the URL
    And "Alice" shares the following resource using the direct url navigation
      | resource  | recipient | type | role     | resourceType |
      | lorem.txt | Brian     | user | Can view | file         |

