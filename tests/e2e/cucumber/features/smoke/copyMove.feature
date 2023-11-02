Feature: Copy
  As a user
  I want to copy/move
  So that I can work safely on a copy or move resource to different location

  Scenario: Copy and move resources in personal space
    Given "Admin" creates following user using API
      | id    |
      | Alice |
    And "Alice" logs in
    And "Alice" creates the following folders in personal space using API
      | name                  |
      | PARENTCopy1           |
      | PARENTCopy2           |
      | PARENTMove            |
      | PARENTCopy3           |
      | PARENTCopy4/Sub1/Sub2 |
    And "Alice" creates the following files into personal space using API
      | pathToFile               | content                             |
      | PARENTCopy3/example1.txt | example text                        |
      | PARENTCopy3/example2.txt | example text                        |
      | KeyboardExample.txt      | copy with the help of keyboard      |
      | dragDrop.txt             | copy with the help of drag-drop     |
      | sidebar.txt              | copy with the help of sidebar panel |
    And "Alice" opens the "files" app

    When "Alice" copies the following resource using sidebar-panel
      | resource    | to          |
      | sidebar.txt | PARENTCopy2 |
    And "Alice" copies the following resource using dropdown-menu
      | resource                 | to          |
      | PARENTCopy3/example1.txt | PARENTCopy1 |
    And "Alice" copies the following resource using batch-action
      | resource                 | to          |
      | PARENTCopy3/example2.txt | PARENTCopy1 |
    And "Alice" copies the following resource using keyboard
      | resource            | to          |
      | KeyboardExample.txt | PARENTCopy3 |
    And "Alice" moves the following resource using drag-drop
      | resource     | to          |
      | dragDrop.txt | PARENTCopy2 |
    And "Alice" moves the following resource using dropdown-menu
      | resource                 | to         |
      | PARENTCopy1/example1.txt | PARENTMove |
    And "Alice" moves the following resource using batch-action
      | resource                 | to         |
      | PARENTCopy1/example2.txt | PARENTMove |
    And "Alice" moves the following resource using keyboard
      | resource    | to         |
      | PARENTCopy2 | PARENTMove |
    And "Alice" moves the following resource using sidebar-panel
      | resource    | to         |
      | PARENTCopy3 | PARENTMove |
    And "Alice" opens folder "PARENTCopy4"
    And "Alice" opens folder "Sub1"
    And "Alice" moves the following resource using drag-drop-breadcrumb
      | resource | to          |
      | Sub2     | PARENTCopy4 |
    And "Alice" logs out
