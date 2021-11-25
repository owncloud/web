Feature: debug tests


  Background:
    Given user "Alice" has been created with default attributes and without skeleton files
    And user "Alice" has logged in using the webUI
    And the user reloads the current page of the webUI
    Given user "Alice" has created folder "simple-folder"
    And user "Alice" has created file "lorem.txt"
    And the user has browsed to the files page
    And the following files have been deleted by user "Alice"
      | name          |
      | lorem.txt     |
      | simple-folder |

  Scenario: Try to delete file and folder that used to exist but does not anymore
    When the user deletes file "lorem.txt" using the webUI
    Then the error message with header 'Error while deleting "lorem.txt"' should be displayed on the webUI
    When the user clears all error message from the webUI
    And the user deletes folder "simple-folder" using the webUI
    Then the error message with header 'Error while deleting "simple-folder"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And folder "simple-folder" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist
    And as "Alice" folder "simple-folder" should not exist
  

  Scenario: Try to delete file and folder that used to exist but does not anymore
    When the user deletes file "lorem.txt" using the webUI
    Then the error message with header 'Error while deleting "lorem.txt"' should be displayed on the webUI
    When the user clears all error message from the webUI
    And the user deletes folder "simple-folder" using the webUI
    Then the error message with header 'Error while deleting "simple-folder"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And folder "simple-folder" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist
    And as "Alice" folder "simple-folder" should not exist
  
  Scenario: Try to delete file and folder that used to exist but does not anymore
    When the user deletes file "lorem.txt" using the webUI
    Then the error message with header 'Error while deleting "lorem.txt"' should be displayed on the webUI
    When the user clears all error message from the webUI
    And the user deletes folder "simple-folder" using the webUI
    Then the error message with header 'Error while deleting "simple-folder"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And folder "simple-folder" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist
    And as "Alice" folder "simple-folder" should not exist
  
  Scenario: Try to delete file and folder that used to exist but does not anymore
    When the user deletes file "lorem.txt" using the webUI
    Then the error message with header 'Error while deleting "lorem.txt"' should be displayed on the webUI
    When the user clears all error message from the webUI
    And the user deletes folder "simple-folder" using the webUI
    Then the error message with header 'Error while deleting "simple-folder"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And folder "simple-folder" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist
    And as "Alice" folder "simple-folder" should not exist
  
  Scenario: Try to delete file and folder that used to exist but does not anymore
    When the user deletes file "lorem.txt" using the webUI
    Then the error message with header 'Error while deleting "lorem.txt"' should be displayed on the webUI
    When the user clears all error message from the webUI
    And the user deletes folder "simple-folder" using the webUI
    Then the error message with header 'Error while deleting "simple-folder"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And folder "simple-folder" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist
    And as "Alice" folder "simple-folder" should not exist
  
  Scenario: Try to delete file and folder that used to exist but does not anymore
    When the user deletes file "lorem.txt" using the webUI
    Then the error message with header 'Error while deleting "lorem.txt"' should be displayed on the webUI
    When the user clears all error message from the webUI
    And the user deletes folder "simple-folder" using the webUI
    Then the error message with header 'Error while deleting "simple-folder"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And folder "simple-folder" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist
    And as "Alice" folder "simple-folder" should not exist
  
  Scenario: Try to delete file and folder that used to exist but does not anymore
    When the user deletes file "lorem.txt" using the webUI
    Then the error message with header 'Error while deleting "lorem.txt"' should be displayed on the webUI
    When the user clears all error message from the webUI
    And the user deletes folder "simple-folder" using the webUI
    Then the error message with header 'Error while deleting "simple-folder"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And folder "simple-folder" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist
    And as "Alice" folder "simple-folder" should not exist
  
  Scenario: Try to delete file and folder that used to exist but does not anymore
    When the user deletes file "lorem.txt" using the webUI
    Then the error message with header 'Error while deleting "lorem.txt"' should be displayed on the webUI
    When the user clears all error message from the webUI
    And the user deletes folder "simple-folder" using the webUI
    Then the error message with header 'Error while deleting "simple-folder"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And folder "simple-folder" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist
    And as "Alice" folder "simple-folder" should not exist
  
  Scenario: Try to delete file and folder that used to exist but does not anymore
    When the user deletes file "lorem.txt" using the webUI
    Then the error message with header 'Error while deleting "lorem.txt"' should be displayed on the webUI
    When the user clears all error message from the webUI
    And the user deletes folder "simple-folder" using the webUI
    Then the error message with header 'Error while deleting "simple-folder"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And folder "simple-folder" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist
    And as "Alice" folder "simple-folder" should not exist
  
  Scenario: Try to delete file and folder that used to exist but does not anymore
    When the user deletes file "lorem.txt" using the webUI
    Then the error message with header 'Error while deleting "lorem.txt"' should be displayed on the webUI
    When the user clears all error message from the webUI
    And the user deletes folder "simple-folder" using the webUI
    Then the error message with header 'Error while deleting "simple-folder"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And folder "simple-folder" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist
    And as "Alice" folder "simple-folder" should not exist
  
  Scenario: Try to delete file and folder that used to exist but does not anymore
    When the user deletes file "lorem.txt" using the webUI
    Then the error message with header 'Error while deleting "lorem.txt"' should be displayed on the webUI
    When the user clears all error message from the webUI
    And the user deletes folder "simple-folder" using the webUI
    Then the error message with header 'Error while deleting "simple-folder"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And folder "simple-folder" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist
    And as "Alice" folder "simple-folder" should not exist
  
  Scenario: Try to delete file and folder that used to exist but does not anymore
    When the user deletes file "lorem.txt" using the webUI
    Then the error message with header 'Error while deleting "lorem.txt"' should be displayed on the webUI
    When the user clears all error message from the webUI
    And the user deletes folder "simple-folder" using the webUI
    Then the error message with header 'Error while deleting "simple-folder"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And folder "simple-folder" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist
    And as "Alice" folder "simple-folder" should not exist
  
  Scenario: Try to delete file and folder that used to exist but does not anymore
    When the user deletes file "lorem.txt" using the webUI
    Then the error message with header 'Error while deleting "lorem.txt"' should be displayed on the webUI
    When the user clears all error message from the webUI
    And the user deletes folder "simple-folder" using the webUI
    Then the error message with header 'Error while deleting "simple-folder"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And folder "simple-folder" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist
    And as "Alice" folder "simple-folder" should not exist
  
  Scenario: Try to delete file and folder that used to exist but does not anymore
    When the user deletes file "lorem.txt" using the webUI
    Then the error message with header 'Error while deleting "lorem.txt"' should be displayed on the webUI
    When the user clears all error message from the webUI
    And the user deletes folder "simple-folder" using the webUI
    Then the error message with header 'Error while deleting "simple-folder"' should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And folder "simple-folder" should not be listed on the webUI
    And as "Alice" file "lorem.txt" should not exist
    And as "Alice" folder "simple-folder" should not exist
  
 