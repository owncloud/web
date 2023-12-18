Feature: web can be navigated through urls


  Scenario: navigate web directly through urls
    Given "Admin" creates following user using API
      | id    |
      | Alice |
      | Brian |
    And "Alice" logs in
    And "Alice" creates the following folders in personal space using API
      | name   |
      | FOLDER |
    And "Alice" creates the following files into personal space using API
      | pathToFile                    | content      |
      | FOLDER/file_inside_folder.txt | example text |
    And "Alice" creates the following files into personal space using API
      | pathToFile | content      |
      | lorem.txt  | some content |
    And "Alice" creates the following files into personal space using API
      | pathToFile | content     |
      | lorem.txt  | new content |
    When "Alice" navigates to "versions" details panel of file "lorem.txt" of space "personal" through the URL
    Then "Alice" restores following resources
      | resource  | to | version | openDetailsPanel |
      | lorem.txt | /  | 1       | false            |
    When "Alice" navigates to "sharing" details panel of file "lorem.txt" of space "personal" through the URL
    Then "Alice" shares the following resource using the direct url navigation
      | resource  | recipient | type | role     | resourceType |
      | lorem.txt | Brian     | user | Can view | file         |
    When "Alice" opens the file "lorem.txt" of space "personal" through the URL
    Then "Alice" is in a text-editor
    And "Alice" closes the file viewer
    When "Alice" opens the folder "FOLDER" of space "personal" through the URL
    And "Alice" opens the following file in texteditor
      | resource               |
      | file_inside_folder.txt |
    Then "Alice" is in a text-editor
    And "Alice" closes the file viewer
    Then "Alice" logs out
    When "Admin" assigns following roles to the users using API
      | id    | role        |
      | Alice | Space Admin |
    And "Alice" creates the following project space using API
      | name        | id     |
      | Development | team.1 |
    And "Alice" creates the following file in space "Development" using API
      | name              | content                   |
      | spaceTextfile.txt | This is test file. Cheers |
    When "Alice" logs in
    And "Alice" opens space "Development" through the URL
    And "Alice" opens the following file in texteditor
      | resource          |
      | spaceTextfile.txt |
    Then "Alice" is in a text-editor
    And "Alice" closes the file viewer
    Then "Alice" logs out
