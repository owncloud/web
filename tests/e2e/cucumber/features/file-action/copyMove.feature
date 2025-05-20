@predefined-users
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
      | name                        |
      | PARENTCopy1                 |
      | PARENTCopy2                 |
      | PARENTMove                  |
      | PARENTCopy3                 |
      | PARENTCopy4/Sub1/Sub2       |
      | PARENT                      |
      | PARENT/Sub1/Sub             |
      | PARENT/Sub2                 |
      | PARENT/Sub3                 |
      | PARENT/Sub4                 |
      | PARENT/Sub5                 |
      | Duplicate                   |
      | Duplicate/folderToDuplicate |
    And "Alice" creates the following files into personal space using API
      | pathToFile               | content                             |
      | PARENTCopy3/example1.txt | example text                        |
      | PARENTCopy3/example2.txt | example text                        |
      | KeyboardExample.txt      | copy with the help of keyboard      |
      | dragDrop.txt             | copy with the help of drag-drop     |
      | sidebar.txt              | copy with the help of sidebar panel |
      | duplicate.txt            | duplicate file                      |
      | Duplicate/duplicate.txt  | duplicate file                      |
      | PARENT/fileToCopy1.txt   | some content                        |
      | PARENT/fileToCopy2.txt   | some content                        |
      | PARENT/fileToCopy3.txt   | some content                        |
      | PARENT/fileToCopy4.txt   | some content                        |
      | PARENT/fileToCopy5.txt   | some content                        |

    When "Alice" duplicates the following resource using sidebar-panel
      | resource      |
      | duplicate.txt |
    And "Alice" duplicates the following resource using dropdown-menu
      | resource  |
      | Duplicate |
    Then following resources should be displayed in the files list for user "Alice"
      | resource          |
      | duplicate (1).txt |
      | Duplicate (1)     |
    And "Alice" opens folder "Duplicate"
    When "Alice" duplicates the following resource using batch-action
      | resource      |
      | duplicate.txt |
    And "Alice" duplicates the following resource at once using batch-action
      | resource          |
      | folderToDuplicate |
      | duplicate.txt     |
    And "Alice" duplicates the following resource at once using dropdown-menu
      | resource          |
      | folderToDuplicate |
      | duplicate.txt     |
    Then following resources should be displayed in the files list for user "Alice"
      | resource              |
      | duplicate (1).txt     |
      | duplicate (2).txt     |
      | duplicate (3).txt     |
      | folderToDuplicate (1) |
      | folderToDuplicate (2) |
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

    And "Alice" opens the "files" app
    And "Alice" opens folder "PARENT"
    And "Alice" copies the following resources to "PARENT/Sub1" at once using dropdown-menu
      | resource        |
      | fileToCopy1.txt |
      | fileToCopy2.txt |
      | fileToCopy3.txt |
      | fileToCopy4.txt |
      | fileToCopy5.txt |
      | Sub4            |
      | Sub5            |
    And "Alice" copies the following resources to "PARENT/Sub2" at once using batch-action
      | resource        |
      | fileToCopy1.txt |
      | fileToCopy2.txt |
      | fileToCopy3.txt |
      | fileToCopy4.txt |
      | fileToCopy5.txt |
      | Sub4            |
      | Sub5            |
    And "Alice" copies the following resources to "PARENT/Sub3" at once using keyboard
      | resource        |
      | fileToCopy1.txt |
      | fileToCopy2.txt |
      | fileToCopy3.txt |
      | fileToCopy4.txt |
      | fileToCopy5.txt |
      | Sub4            |
      | Sub5            |
    And "Alice" opens folder "Sub1"
    And "Alice" moves the following resources to "PARENT/Sub1/Sub" at once using dropdown-menu
      | resource        |
      | fileToCopy1.txt |
      | fileToCopy2.txt |
      | fileToCopy3.txt |
      | fileToCopy4.txt |
      | fileToCopy5.txt |
      | Sub4            |
      | Sub5            |
    And "Alice" opens folder "Sub"
    And "Alice" moves the following resources to "PARENT/Sub1" at once using batch-action
      | resource        |
      | fileToCopy1.txt |
      | fileToCopy2.txt |
      | fileToCopy3.txt |
      | fileToCopy4.txt |
      | fileToCopy5.txt |
      | Sub4            |
      | Sub5            |
    And "Alice" opens the "files" app
    And "Alice" opens folder "PARENT"
    And "Alice" moves the following resources to "Sub4" at once using drag-drop
      | resource        |
      | fileToCopy1.txt |
      | fileToCopy2.txt |
      | fileToCopy3.txt |
      | fileToCopy4.txt |
      | fileToCopy5.txt |
      | Sub1            |
      | Sub2            |
    And "Alice" opens folder "Sub4"
    And "Alice" moves the following resources to "PARENT" at once using drag-drop-breadcrumb
      | resource        |
      | fileToCopy1.txt |
      | fileToCopy2.txt |
      | fileToCopy3.txt |
      | fileToCopy4.txt |
      | fileToCopy5.txt |
      | Sub1            |
      | Sub2            |
    And "Alice" opens the "files" app
    And "Alice" opens folder "PARENT"
    And "Alice" moves the following resources to "PARENT/Sub4" at once using keyboard
      | resource        |
      | fileToCopy1.txt |
      | fileToCopy2.txt |
      | fileToCopy3.txt |
      | fileToCopy4.txt |
      | fileToCopy5.txt |
      | Sub1            |
      | Sub2            |
    And "Alice" logs out


  Scenario: Copy and move resources with same name in personal space
    Given "Admin" creates following user using API
      | id    |
      | Alice |
    And "Alice" logs in
    And "Alice" creates the following folders in personal space using API
      | name         |
      | sub          |
      | folder1      |
      | sub/folder1  |
      | sub1/folder1 |
    And "Alice" creates the following files into personal space using API
      | pathToFile                | content                 |
      | example1.txt              | personal space location |
      | folder1/example1.txt      | folder1 location        |
      | sub/folder1/example1.txt  | sub/folder1 location    |
      | sub1/folder1/example1.txt | sub1/folder1 location   |

    # copy and move file
    When "Alice" copies the following resource using sidebar-panel
      | resource     | to      | option    |
      | example1.txt | folder1 | keep both |
      | example1.txt | folder1 | replace   |
    And "Alice" moves the following resource using sidebar-panel
      | resource             | to          | option    |
      | example1.txt         | sub/folder1 | keep both |
      | folder1/example1.txt | sub/folder1 | replace   |

    # copy and move folder
    And "Alice" copies the following resource using sidebar-panel
      | resource | to  | option    |
      | folder1  | sub | keep both |
      # issue https://github.com/owncloud/web/issues/10515
      | folder1  | sub | replace   |
    And "Alice" moves the following resource using sidebar-panel
      | resource     | to  | option    |
      | folder1      | sub | keep both |
      # issue https://github.com/owncloud/web/issues/10515
      | sub1/folder1 | sub | replace   |
    And "Alice" logs out
