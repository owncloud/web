Feature: debug tests


  Background:
    Given user "Alice" has been created with default attributes and without skeleton files
    And user "Alice" has created folder "simple-folder"
    And user "Alice" has created folder "simple-empty-folder"
    And user "Alice" has uploaded file "lorem.txt" to "lorem.txt"
    And user "Alice" has logged in using the webUI
    And the user has browsed to the files page
    Given the user has browsed to the files page
    And the following files have been deleted by user "Alice"
      | name          |
      | simple-folder |

  Scenario: debug scenario
    When the user tries to rename folder "simple-folder" to "new-simple-folder" using the webUI
    Then the error message with header 'Error while renaming "simple-folder" to "new-simple-folder"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then folder "simple-folder" should not be listed on the webUI
    And folder "new-simple-folder" should not be listed on the webUI
    And as "Alice" folder "simple-folder" should not exist
    And as "Alice" folder "new-simple-folder" should not exist

  Scenario: debug scenario
    When the user tries to rename folder "simple-folder" to "new-simple-folder" using the webUI
    Then the error message with header 'Error while renaming "simple-folder" to "new-simple-folder"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then folder "simple-folder" should not be listed on the webUI
    And folder "new-simple-folder" should not be listed on the webUI
    And as "Alice" folder "simple-folder" should not exist
    And as "Alice" folder "new-simple-folder" should not exist

  Scenario: debug scenario
    When the user tries to rename folder "simple-folder" to "new-simple-folder" using the webUI
    Then the error message with header 'Error while renaming "simple-folder" to "new-simple-folder"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then folder "simple-folder" should not be listed on the webUI
    And folder "new-simple-folder" should not be listed on the webUI
    And as "Alice" folder "simple-folder" should not exist
    And as "Alice" folder "new-simple-folder" should not exist

  Scenario: debug scenario
    When the user tries to rename folder "simple-folder" to "new-simple-folder" using the webUI
    Then the error message with header 'Error while renaming "simple-folder" to "new-simple-folder"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then folder "simple-folder" should not be listed on the webUI
    And folder "new-simple-folder" should not be listed on the webUI
    And as "Alice" folder "simple-folder" should not exist
    And as "Alice" folder "new-simple-folder" should not exist

  Scenario: debug scenario
    When the user tries to rename folder "simple-folder" to "new-simple-folder" using the webUI
    Then the error message with header 'Error while renaming "simple-folder" to "new-simple-folder"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then folder "simple-folder" should not be listed on the webUI
    And folder "new-simple-folder" should not be listed on the webUI
    And as "Alice" folder "simple-folder" should not exist
    And as "Alice" folder "new-simple-folder" should not exist

  Scenario: debug scenario
    When the user tries to rename folder "simple-folder" to "new-simple-folder" using the webUI
    Then the error message with header 'Error while renaming "simple-folder" to "new-simple-folder"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then folder "simple-folder" should not be listed on the webUI
    And folder "new-simple-folder" should not be listed on the webUI
    And as "Alice" folder "simple-folder" should not exist
    And as "Alice" folder "new-simple-folder" should not exist

  Scenario: debug scenario
    When the user tries to rename folder "simple-folder" to "new-simple-folder" using the webUI
    Then the error message with header 'Error while renaming "simple-folder" to "new-simple-folder"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then folder "simple-folder" should not be listed on the webUI
    And folder "new-simple-folder" should not be listed on the webUI
    And as "Alice" folder "simple-folder" should not exist
    And as "Alice" folder "new-simple-folder" should not exist

  Scenario: debug scenario
    When the user tries to rename folder "simple-folder" to "new-simple-folder" using the webUI
    Then the error message with header 'Error while renaming "simple-folder" to "new-simple-folder"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then folder "simple-folder" should not be listed on the webUI
    And folder "new-simple-folder" should not be listed on the webUI
    And as "Alice" folder "simple-folder" should not exist
    And as "Alice" folder "new-simple-folder" should not exist

  Scenario: debug scenario
    When the user tries to rename folder "simple-folder" to "new-simple-folder" using the webUI
    Then the error message with header 'Error while renaming "simple-folder" to "new-simple-folder"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then folder "simple-folder" should not be listed on the webUI
    And folder "new-simple-folder" should not be listed on the webUI
    And as "Alice" folder "simple-folder" should not exist
    And as "Alice" folder "new-simple-folder" should not exist

  Scenario: debug scenario
    When the user tries to rename folder "simple-folder" to "new-simple-folder" using the webUI
    Then the error message with header 'Error while renaming "simple-folder" to "new-simple-folder"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then folder "simple-folder" should not be listed on the webUI
    And folder "new-simple-folder" should not be listed on the webUI
    And as "Alice" folder "simple-folder" should not exist
    And as "Alice" folder "new-simple-folder" should not exist

  Scenario: debug scenario
    When the user tries to rename folder "simple-folder" to "new-simple-folder" using the webUI
    Then the error message with header 'Error while renaming "simple-folder" to "new-simple-folder"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then folder "simple-folder" should not be listed on the webUI
    And folder "new-simple-folder" should not be listed on the webUI
    And as "Alice" folder "simple-folder" should not exist
    And as "Alice" folder "new-simple-folder" should not exist

  Scenario: debug scenario
    When the user tries to rename folder "simple-folder" to "new-simple-folder" using the webUI
    Then the error message with header 'Error while renaming "simple-folder" to "new-simple-folder"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then folder "simple-folder" should not be listed on the webUI
    And folder "new-simple-folder" should not be listed on the webUI
    And as "Alice" folder "simple-folder" should not exist
    And as "Alice" folder "new-simple-folder" should not exist

  Scenario: debug scenario
    When the user tries to rename folder "simple-folder" to "new-simple-folder" using the webUI
    Then the error message with header 'Error while renaming "simple-folder" to "new-simple-folder"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then folder "simple-folder" should not be listed on the webUI
    And folder "new-simple-folder" should not be listed on the webUI
    And as "Alice" folder "simple-folder" should not exist
    And as "Alice" folder "new-simple-folder" should not exist

  Scenario: debug scenario
    When the user tries to rename folder "simple-folder" to "new-simple-folder" using the webUI
    Then the error message with header 'Error while renaming "simple-folder" to "new-simple-folder"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then folder "simple-folder" should not be listed on the webUI
    And folder "new-simple-folder" should not be listed on the webUI
    And as "Alice" folder "simple-folder" should not exist
    And as "Alice" folder "new-simple-folder" should not exist

  Scenario: debug scenario
    When the user tries to rename folder "simple-folder" to "new-simple-folder" using the webUI
    Then the error message with header 'Error while renaming "simple-folder" to "new-simple-folder"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then folder "simple-folder" should not be listed on the webUI
    And folder "new-simple-folder" should not be listed on the webUI
    And as "Alice" folder "simple-folder" should not exist
    And as "Alice" folder "new-simple-folder" should not exist

  Scenario: debug scenario
    When the user tries to rename folder "simple-folder" to "new-simple-folder" using the webUI
    Then the error message with header 'Error while renaming "simple-folder" to "new-simple-folder"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then folder "simple-folder" should not be listed on the webUI
    And folder "new-simple-folder" should not be listed on the webUI
    And as "Alice" folder "simple-folder" should not exist
    And as "Alice" folder "new-simple-folder" should not exist

  Scenario: debug scenario
    When the user tries to rename folder "simple-folder" to "new-simple-folder" using the webUI
    Then the error message with header 'Error while renaming "simple-folder" to "new-simple-folder"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then folder "simple-folder" should not be listed on the webUI
    And folder "new-simple-folder" should not be listed on the webUI
    And as "Alice" folder "simple-folder" should not exist
    And as "Alice" folder "new-simple-folder" should not exist

  Scenario: debug scenario
    When the user tries to rename folder "simple-folder" to "new-simple-folder" using the webUI
    Then the error message with header 'Error while renaming "simple-folder" to "new-simple-folder"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then folder "simple-folder" should not be listed on the webUI
    And folder "new-simple-folder" should not be listed on the webUI
    And as "Alice" folder "simple-folder" should not exist
    And as "Alice" folder "new-simple-folder" should not exist

  Scenario: debug scenario
    When the user tries to rename folder "simple-folder" to "new-simple-folder" using the webUI
    Then the error message with header 'Error while renaming "simple-folder" to "new-simple-folder"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then folder "simple-folder" should not be listed on the webUI
    And folder "new-simple-folder" should not be listed on the webUI
    And as "Alice" folder "simple-folder" should not exist
    And as "Alice" folder "new-simple-folder" should not exist

  Scenario: debug scenario
    When the user tries to rename folder "simple-folder" to "new-simple-folder" using the webUI
    Then the error message with header 'Error while renaming "simple-folder" to "new-simple-folder"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then folder "simple-folder" should not be listed on the webUI
    And folder "new-simple-folder" should not be listed on the webUI
    And as "Alice" folder "simple-folder" should not exist
    And as "Alice" folder "new-simple-folder" should not exist


