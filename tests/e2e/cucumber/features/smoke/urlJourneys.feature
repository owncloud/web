Feature: web can be navigated through urls


  Scenario: Alice can share this weeks meal plan with all parents
    Given "Admin" creates following user using API
      | id    |
      | Alice |
    And "Alice" logs in
    And "Alice" creates the following folders in personal space using API
      | name   |
      | FOLDER |
    And "Alice" creates the following files into personal space using API
      | file.txt | some content |
    When "Alice" navigates to "versions" details panel of file "files.txt" through the URL
