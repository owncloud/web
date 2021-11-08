Feature: share folder with file
  Alice shares folder with file to Brian with role "editor".
  I want to check that Brian can accept folder, download, move, copy and rename shared file

  Background:
    Given following users have been created
      | Alice |
      | Brian |
    And admin set the default folder for received shares to "Shares"
    And admin disables auto accepting

Scenario: Alice shares folder with file to Brian
  Given "Alice" has logged in
  When "Alice" opens the "files" app
  And "Alice" navigates to the files page
  And "Alice" creates following folders
    | folder_to_shared |
  And "Alice" uploads following resources
    | resource  | to               |
    | lorem.txt | folder_to_shared | 
  Then "Alice" ensures that the following resources exist
    | folder_to_shared/lorem.txt |
  And "Alice" shares following resources
    | resource         | user  | role   |
    | folder_to_shared | Brian | editor |
  Given "Brian" has logged in
  When "Brian" opens the "files" app
  And "Brian" accepts following resources
    | folder_to_shared |
  And "Brian" renames following resource
    | resource                          | as            |
    | Shares/folder_to_shared/lorem.txt | lorem_new.txt |
  And "Brian" uploads following resources
    | resource   | to                      |
    | simple.pdf | Shares/folder_to_shared | 
  And "Brian" copies following resources
    | resource                 | to        |
    | Shares/folder_to_shared  | All files |
  When "Alice" opens the "files" app
  Then "Alice" ensures that the following resources exist
    | folder_to_shared/lorem_new.txt |
    | folder_to_shared/simple.pdf    |
  When "Alice" creates new versions of the folowing files
    | resource   | to               |
    | simple.pdf | folder_to_shared |   
  Then "Alice" ensure that resource "folder_to_shared/simple.pdf" has 1 versions
  When "Alice" deletes following resources
    | folder_to_shared/lorem_new.txt |
    | folder_to_shared               |
  When "Brian" opens the "files" app
  Then "Brian" ensures that the following resource does not exist
    | Shares/folder_to_shared |
  
