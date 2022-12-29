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
      | resource                | type    | content                             |
      | PARENTCopy1             | folder  |                                     |
      | PARENTCopy2             | folder  |                                     |
      | PARENTMove              | folder  |                                     |
      | PARENTCopy3/example.txt | txtFile | example text                        |
      | KeyboardExample.txt     | txtFile | copy with the help of keyboard      |
      | dragDrop.txt            | txtFile | copy with the help of drag-drop     |
      | sidebar.txt             | txtFile | copy with the help of sidebar panel |
    And "Alice" copies the following resource using sidebar panel
      | resource    | to          |
      | sidebar.txt | PARENTCopy2 |
    When "Alice" copies the following resource
      | resource                | to          |
      | PARENTCopy3/example.txt | PARENTCopy1 |
    And "Alice" copies the following resource using keyboard
      | resource            | to          |
      | KeyboardExample.txt | PARENTCopy3 |
    And "Alice" moves the following resource using drag-drop
      | resource     | to          |
      | dragDrop.txt | PARENTCopy2 |
    And "Alice" moves the following resource
      | resource                | to         |
      | PARENTCopy1/example.txt | PARENTMove |
    And "Alice" moves the following resource using keyboard
      | resource    | to         |
      | PARENTCopy2 | PARENTMove |
    And "Alice" moves the following resource using sidebar panel
      | resource    | to         |
      | PARENTCopy3 | PARENTMove |
    And "Alice" logs out
