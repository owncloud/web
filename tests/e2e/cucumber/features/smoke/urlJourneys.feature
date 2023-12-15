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
    When "Alice" navigates to "versions" details panel of file "lorem.txt" through the URL
    And "Alice" restores following resources
      | resource  | to | version | openDetailsPanel |
      | lorem.txt | /  | 1       | false            |
    When "Alice" navigates to "sharing" details panel of file "lorem.txt" through the URL
    And "Alice" shares the following resource using the direct url navigation
      | resource  | recipient | type | role     | resourceType |
      | lorem.txt | Brian     | user | Can view | file         |
    When "Alice" opens the file "lorem.txt" directly in the browser
    And "Alice" enters the text "Hello world" in editor "TextEditor"
    And "Alice" saves the file viewer
    And "Alice" closes the file viewer
    When "Alice" opens the folder "FOLDER" directly in the browser
    And "Alice" opens the following file in texteditor
      | resource               |
      | file_inside_folder.txt |
    And "Alice" enters the text "Hello everyone" in editor "TextEditor"
    And "Alice" saves the file viewer
    And "Alice" closes the file viewer
    And "Alice" logs out
