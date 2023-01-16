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
      | shared_folder    | folder |
    And "Alice" uploads the following resource
      | resource  | to               |
      | lorem.txt | folder_to_shared |
    When "Alice" shares the following resource using the sidebar panel
      | resource         | recipient | type | role   |
      | folder_to_shared | Brian     | user | editor |
      | shared_folder    | Brian     | user | editor |
    And "Brian" logs in
    And "Brian" opens the "files" app
    And "Brian" navigates to the shared with me page
    Then "Brian" should not be able to open the folder "shared_folder"
    When "Brian" accepts the following share
      | name             |
      | folder_to_shared |
    And "Brian" declines the following share
      | name          |
      | shared_folder |
    Then "Brian" should not be able to open the folder "shared_folder"
    When "Brian" accepts the following share from the context menu
      | name          |
      | shared_folder |
    And "Brian" copies quick link of the resource "shared_folder" from the context menu
    And "Brian" declines the following share from the context menu
      | name          |
      | shared_folder |
    And "Brian" renames the following resource
      | resource                   | as            |
      | folder_to_shared/lorem.txt | lorem_new.txt |
    And "Brian" uploads the following resource
      | resource   | to               |
      | simple.pdf | folder_to_shared |
    When "Alice" opens the "files" app
    And "Alice" uploads the following resource
      | resource          | to               | option  |
      | PARENT/simple.pdf | folder_to_shared | replace |
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
      | sharedFile.txt      | txtFile    | some text |
    And "Alice" uploads the following resource
      | resource        |
      | testavatar.jpeg |
      | simple.pdf      |
    And "Alice" shares the following resource using the sidebar panel
      | resource         | recipient | type | role   |
      | shareToBrian.txt | Brian     | user | editor |
      | shareToBrian.md  | Brian     | user | editor |
      | testavatar.jpeg  | Brian     | user | viewer |
      | simple.pdf       | Brian     | user | viewer |
      | sharedFile.txt   | Brian     | user | editor |
    And "Alice" logs out

    When "Brian" logs in
    And "Brian" opens the "files" app
    And "Brian" navigates to the shared with me page
    Then "Brian" should not be able to open the file "shareToBrian.txt"
    When "Brian" accepts the following share
      | name             |
      | shareToBrian.txt |
      | shareToBrian.md  |
      | testavatar.jpeg  |
      | simple.pdf       |
    And "Brian" declines the following share
      | name           |
      | sharedFile.txt |
    Then "Brian" should not be able to open the file "sharedFile.txt"
    When "Brian" accepts the following share from the context menu
      | name           |
      | sharedFile.txt |
    And "Brian" copies quick link of the resource "sharedFile.txt" from the context menu
    And "Brian" declines the following share from the context menu
      | name           |
      | sharedFile.txt |
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
