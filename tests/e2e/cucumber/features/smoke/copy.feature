Feature: Copy
  As a user
  I want to copy resources
  So that I can work safely on a copy without changing the original

  Scenario: Copy resources in personal space
    Given "Admin" creates following users
      | id    |
      | Alice |
    And "Alice" logs in
    And "Alice" opens the "files" app
    And "Alice" creates the following resources
      | resource           | type   |
      | PARENTCopy/sidebar | folder |
      | PARENTCopy2        | folder |
    And "Alice" creates the following resources
      | resource                    | type    | content                             |
      | PARENT/menuCopy/example.txt | txtFile | example text                        |
      | KeyboardExample.txt         | txtFile | copy with the help of keyboard      |
      | DragDrop.txt                | txtFile | copy with the help of drag-drop     |
      | sidebar.txt                 | txtFile | copy with the help of sidebar panel |
    When "Alice" copies the following resource using the menu
      | resource                    | to                 |
      | PARENT/menuCopy/example.txt | PARENTCopy/sidebar |
    And "Alice" copies the following resource using the keyboard
      | resource            | to                 |
      | KeyboardExample.txt | PARENTCopy/sidebar |
    And "Alice" copies the following resource using the drag-drop
      | resource     | to          |
      | DragDrop.txt | PARENTCopy2 |
    And "Alice" copies the following resource using the sidebar panel
      | resource    | to                 |
      | sidebar.txt | PARENTCopy/sidebar |
