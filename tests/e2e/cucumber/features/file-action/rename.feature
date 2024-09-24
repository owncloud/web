Feature: rename
  As a user
  I want to rename resources
  So I can rename resources from different locations

  Scenario: rename resources
    Given "Admin" creates following user using API
      | id    |
      | Alice |
      | Brian |
    And "Alice" creates the following folders in personal space using API
      | name   |
      | folder |
    And "Alice" creates the following files into personal space using API
      | pathToFile         | content      |
      | folder/example.txt | example text |
    And "Alice" shares the following resource using API
      | resource | recipient | type | role     |
      | folder   | Brian     | user | Can edit |
    And "Alice" creates a public link of following resource using API
      | resource | role     | password |
      | folder   | Can edit | %public% |
    And "Brian" logs in
    And "Brian" navigates to the shared with me page
    And "Brian" opens folder "folder"

    # rename in the shares with me page
    When "Brian" renames the following resource
      | resource    | as                 |
      | example.txt | renamedByBrian.txt |
    And "Brian" logs out

    # rename in the public link
    When "Anonymous" opens the public link "Link"
    And "Anonymous" unlocks the public link with password "%public%"
    When "Anonymous" renames the following resource
      | resource           | as                     |
      | renamedByBrian.txt | renamedByAnonymous.txt |

    # rename in the shares with other page
    And "Alice" logs in
    And "Alice" navigates to the shared with others page
    And "Alice" opens folder "folder"
    When "Alice" renames the following resource
      | resource               | as             |
      | renamedByAnonymous.txt | renamedByAlice |
    And "Alice" logs out
