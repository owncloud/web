Feature: web can be navigated through urls


  Scenario: navigate web directly through urls
    Given "Admin" creates following user using API
      | id    |
      | Alice |
      | Brian |
    And "Admin" assigns following roles to the users using API
      | id    | role        |
      | Alice | Space Admin |
    And "Alice" creates the following folders in personal space using API
      | name   |
      | FOLDER |
    And "Alice" creates the following files into personal space using API
      | pathToFile                    | content      |
      | FOLDER/file_inside_folder.txt | example text |
    And "Alice" creates the following files into personal space using API
      | pathToFile | content      |
      | lorem.txt  | some content |
      | test.odt   | some content |
    And "Alice" creates the following files into personal space using API
      | pathToFile | content     |
      | lorem.txt  | new content |
    And "Alice" creates the following project space using API
      | name        | id     |
      | Development | team.1 |
    And "Alice" creates the following file in space "Development" using API
      | name              | content                   |
      | spaceTextfile.txt | This is test file. Cheers |
    And "Alice" logs in
    When "Alice" navigates to "versions" details panel of file "lorem.txt" of space "personal" through the URL
    Then "Alice" restores following resources version
      | resource  | to | version | openDetailsPanel |
      | lorem.txt | /  | 1       | false            |
    When "Alice" navigates to "sharing" details panel of file "lorem.txt" of space "personal" through the URL
    Then "Alice" shares the following resource using the direct url navigation
      | resource  | recipient | type | role     | resourceType |
      | lorem.txt | Brian     | user | Can view | file         |
    # file that has respective editor will open in the respective editor
    When "Alice" opens the file "lorem.txt" of space "personal" through the URL
    Then "Alice" is in a text-editor
    And "Alice" closes the file viewer
    # file without the respective editor will show the file in the file list
    When "Alice" opens the file "test.odt" of space "personal" through the URL
    Then following resources should be displayed in the files list for user "Alice"
      | resource  |
      | FOLDER    |
      | lorem.txt |
      | test.odt  |
    When "Alice" opens the folder "FOLDER" of space "personal" through the URL
    And "Alice" opens the following file in texteditor
      | resource               |
      | file_inside_folder.txt |
    Then "Alice" is in a text-editor
    And "Alice" closes the file viewer
    When "Alice" opens space "Development" through the URL
    And "Alice" opens the following file in texteditor
      | resource          |
      | spaceTextfile.txt |
    Then "Alice" is in a text-editor
    And "Alice" closes the file viewer
    And "Alice" logs out
