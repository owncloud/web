Feature: share

  Background:
    Given "Admin" creates following users
      | id    |
      | Alice |
      | Brian |

  Scenario: folder
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
    And "Brian" logs in
    And "Brian" opens the "files" app
    And "Brian" navigates to the shared with me page
    And "Brian" accepts the following share
      | name             |
      | folder_to_shared |
    And "Brian" renames the following resource
      | resource                   | as            |
      | folder_to_shared/lorem.txt | lorem_new.txt |
    And "Brian" uploads the following resource
      | resource   | to               |
      | simple.pdf | folder_to_shared |
    When "Alice" opens the "files" app
    And "Alice" uploads the following resource
      | resource          | to               | create_version |
      | PARENT/simple.pdf | folder_to_shared | true           |
    And "Brian" downloads old version of the following resource
      | resource   | to               |
      | simple.pdf | folder_to_shared |
    When "Brian" restores following resources
      | resource   | to               | version |
      | simple.pdf | folder_to_shared | 1       |
    When "Alice" deletes the following resources
      | resource                       |
      | folder_to_shared/lorem_new.txt |
      | folder_to_shared               |
    And "Alice" logs out
    And "Brian" logs out


  Scenario: file
    When "Alice" logs in
    And "Alice" opens the "files" app
    And "Alice" creates the following resources
      | resource            | type       | content   |
      | shareToBrian.txt    | txtFile    | some text |
      | shareToBrian.md     | mdFile     | readme    |
      | shareToBrian.drawio | drawioFile |           |
    And "Alice" uploads the following resource
      | resource        |
      | testavatar.jpeg |
      | simple.pdf      |
    And "Alice" shares the following resource using the sidebar panel
      | resource            | recipient | type | role   |
      | shareToBrian.txt    | Brian     | user | editor |
      | shareToBrian.md     | Brian     | user | editor |
      | testavatar.jpeg     | Brian     | user | viewer |
      | simple.pdf          | Brian     | user | viewer |
    And "Alice" logs out

    When "Brian" logs in
    And "Brian" opens the "files" app
    And "Brian" navigates to the shared with me page
    And "Brian" accepts the following share
      | name             |
      | shareToBrian.txt |
      | shareToBrian.md  |
      | testavatar.jpeg  |
      | simple.pdf       |
    And "Brian" edits the following resources
      | resource         | content            |
      | shareToBrian.txt | new content        |
      | shareToBrian.md  | new readme content |
    And "Brian" opens the following file in mediaviewer
      | resource        |
      | testavatar.jpeg |
    And "Brian" opens the following file in pdfviewer
      | resource   |
      | simple.pdf |
    And "Brian" logs out