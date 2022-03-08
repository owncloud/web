Feature: User can see the file or folder actions menu options
  As a user
  I want to be able to see the actions menu options of file or folder
  So that the menu options of the selected file type or folder are visible to me

  Background: prepare user and files
    Given user "Alice" has been created with default attributes and without skeleton files in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And user "Alice" has uploaded file "testavatar.png" to "testavatar.png" in the server
    And user "Alice" has logged in using the webUI
    And the user has browsed to the personal page

  Scenario: observe different actions menu options on selecting different file types
    Given user "Alice" has uploaded file with content "pdf file" to "lorem.pdf" in the server
    And the user has reloaded the current page of the webUI
    When the user opens the actions sidebar panel of file "lorem.txt" on the webUI
    Then the app-sidebar for file "lorem.txt" should be visible on the webUI
    And only the following items with default items should be visible in the actions menu on the webUI
      | items                  |
      | open in markdowneditor |
      | download               |
    When the user opens the actions sidebar panel of file "lorem.pdf" on the webUI
    Then the app-sidebar for file "lorem.pdf" should be visible on the webUI
    And only the following items with default items should be visible in the actions menu on the webUI
      | items           |
      | open in browser |
      | download        |
    When the user opens the actions sidebar panel of file "testavatar.png" on the webUI
    Then the app-sidebar for file "testavatar.png" should be visible on the webUI
    And only the following items with default items should be visible in the actions menu on the webUI
      | items               |
      | open in mediaviewer |
      | download            |

  @skipOnOC10
  Scenario: observe different actions menu options on selecting a folder
    When the user opens the actions sidebar panel of folder "simple-folder" on the webUI
    Then the app-sidebar for folder "simple-folder" should be visible on the webUI
    And only the following items with default items should be visible in the actions menu on the webUI
      | items       |
      | open folder |
      | download    |

  @skipOnOCIS
  Scenario: observe different actions menu options on selecting a folder
    When the user opens the actions sidebar panel of folder "simple-folder" on the webUI
    Then the app-sidebar for folder "simple-folder" should be visible on the webUI
    And only the following items with default items should be visible in the actions menu on the webUI
      | items       |
      | open folder |
