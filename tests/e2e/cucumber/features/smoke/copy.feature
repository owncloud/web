Feature: Upload
  As a user
  I want to upload resources
  So that I can store them in owncloud

  Scenario: Copy resources in personal space
    Given "Admin" creates following users
      | id    |
      | Alice |
    And "Alice" logs in
    And "Alice" opens the "files" app
    And "Alice" creates the following resources
      | resource                 | type    | content                         |
      | PARENTCopy/sidebar       | folder  |                                 |
      | PARENTCopy2              | folder  |                                 |
      | PARENT/apple/example.txt | txtFile | example text                    |
      | KeyboardExample.txt      | txtFile | copy with the help of keyboard  |
      | DragDrop.txt             | txtFile | copy with the help of drag-drop |
    When "Alice" copies the following resource using the sidebar panel
      | resource                 | to                 |
      | PARENT/apple/example.txt | PARENTCopy/sidebar |

    And "Alice" copies the following resource using the keyboard
      | resource            | to                 |
      | KeyboardExample.txt | PARENTCopy/sidebar |

    And "Alice" copies the following resource using the drag-drop
      | resource     | to          |
      | DragDrop.txt | PARENTCopy2 |
