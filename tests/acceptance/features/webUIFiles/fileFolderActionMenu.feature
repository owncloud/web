Feature: User can see the file or folder actions menu options
  As a user
  I want to be able to see the actions menu options of file or folder
  So that the menu options of the selected file type or folder are visible to me

Background: prepare user and files
    Given user "user1" has been created with default attributes
    And user "user1" has uploaded file with content "pdf file" to "lorem.pdf"
    And user "user1" has logged in using the webUI
    And the user has browsed to the files page
    
  Scenario: select folder to see actions menu options
    When the user picks the row of folder "simple-folder" in the webUI
    Then the app-sidebar for folder "simple-folder" should be visible on the webUI
    And the following items should be visible in the actions menu on the webUI
      | items            |
      | open folder      |
      | mark as favorite |
      | copy             |
      | move             |
      | rename           |
      | delete           |

  Scenario: select text file to see actions menu options
    When the user picks the row of file "lorem.txt" in the webUI
    Then the app-sidebar for file "lorem.txt" should be visible on the webUI
    And the following items should be visible in the actions menu on the webUI
      | items            |
      | download         |
      | mark as favorite |
      | copy             |
      | move             |
      | rename           |
      | delete           |
    And the following accordion items should be visible in the details dialog on the webUI
      | items            |
      | versions         |
  
  Scenario: select pdf file to see actions menu options
    When the user picks the row of file "lorem.pdf" in the webUI
    Then the app-sidebar for file "lorem.pdf" should be visible on the webUI
    And the following items should be visible in the actions menu on the webUI
      | items            |
      | open in browser  |
      | download         |
      | mark as favorite |
      | copy             |
      | move             |
      | rename           |
      | delete           |
    And the following accordion items should be visible in the details dialog on the webUI
      | items            |
      | versions         |

  Scenario: select folder while text file's action menu is open
    Given the app-sidebar for file "lorem.txt" is visible on the webUI
    When the user picks the row of folder "simple-folder" in the webUI
    Then the app-sidebar for folder "simple-folder" should be visible on the webUI
    And the following items should be visible in the actions menu on the webUI
    | items            |
    | open folder      |
    And the following items should not be visible in the actions menu on the webUI
    | items            |
    | download         |
    | open in browser  |
  
  Scenario: select file while text folder's action menu is open
    Given the app-sidebar for folder "simple-folder" is visible on the webUI
    When the user picks the row of folder "lorem.txt" in the webUI
    Then the app-sidebar for folder "lorem.txt" should be visible on the webUI
    And the following items should be visible in the actions menu on the webUI
    | items            |
    | download      |
    And the following items should not be visible in the actions menu on the webUI
    | items            |
    | open folder      |
    | open in browser  |
  
  Scenario: select pdf file while text folder's action menu is open
    Given the app-sidebar for folder "simple-folder" is visible on the webUI
    When the user picks the row of folder "lorem.pdf" in the webUI
    Then the app-sidebar for folder "lorem.pdf" should be visible on the webUI
    And the following items should be visible in the actions menu on the webUI
    | items            |
    | open in browser  |
    | download         |
    And the following items should not be visible in the actions menu on the webUI
    | items            |
    | open folder      |