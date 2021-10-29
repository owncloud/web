Feature: share folder with file
  Alice shares folder with file to Brian with role "editor".
  I want to check that Brian can accept folder, download, move, copy and rename shared file

  Background:
    Given following users have been created
      | Alice |
      | Brian |
    And admin set the default folder for received shares to "Shares"

<<<<<<< HEAD
  Scenario: Alice shares folder with file to Brian
    Given "Alice" has logged in
    Then "Alice" opens the "files" app
    Then "Alice" navigates to the files page
    Then "Alice" creates following folders
      | folder_to_shared           |
      | folder_to_share1/subFolder |
    And "Alice" uploads following resources
      | resource  | to               |
      | lorem.txt | folder_to_shared |
    Then "Alice" moves following resources
      | resource                             | to                         |
      | folder_to_shared/lorem.txt           | folder_to_share1           |
      | folder_to_share1/lorem.txt           | folder_to_share1/subFolder |
      | folder_to_share1/subFolder/lorem.txt | folder_to_shared           |
    Then "Alice" copies following resources
      | resource                   | to                         |
      | folder_to_shared/lorem.txt | folder_to_share1           |
      | folder_to_share1/lorem.txt | folder_to_share1/subFolder |
    Then "Alice" shares following resources
      | resource         | user  | role   |
      | folder_to_shared | Brian | editor |
    Given "Brian" has logged in
    Then "Brian" opens the "files" app
    Then "Brian" accepts following resources
      | folder_to_shared |
    Then "Brian" renames following resource
      | resource                          | newName      |
      | Shares/folder_to_shared/lorem.txt | loremNew.txt |
    And "Brian" uploads following resources
      | resource   | to                      |
      | simple.pdf | Shares/folder_to_shared |
=======
Scenario: Alice shares folder with file to Brian
  Given "Alice" has logged in
  When "Alice" opens the "files" app
  And "Alice" navigates to the files page
  And "Alice" creates following folders
    | folder_to_shared |
  And "Alice" uploads following resources
    | resource  | to               |
    | lorem.txt | folder_to_shared | 
  Then "Alice" checks whether the following resources exist
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
  And "Brian" has logged out
  When "Alice" opens the "files" app
  Then "Alice" checks whether the following resources exist
    | folder_to_shared/lorem_new.txt |
    | folder_to_shared/simple.pdf    |
  When "Alice" creates new versions of the folowing files
    | resource   | to               |
    | simple.pdf | folder_to_shared |   
  Then "Alice" checks that new version exists
    | folder_to_shared/simple.pdf |
  When "Alice" removes following resources
    | folder_to_shared/lorem_new.txt |
    | folder_to_shared               |
  Given "Brian" has logged in
  When "Brian" opens the "files" app
  Then "Brian" checks whether the following resource not exist
    | Shares/folder_to_shared |
  
>>>>>>> 7e733127 (add remove step/add check that file exist/not exist)
