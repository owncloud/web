Feature: share folder with file
Alice shares folder with file to Brian with role "editor".
I want to check that Brian can accept folder, download, move, copy and rename shared file

Background:
  Given following users have been created
    | Alice |
    | Brian |
  And admin set the default folder for received shares to "Shares"

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
    | folder_to_shared/lorem.txt           | folder_to_share1/subFolder |
    | folder_to_share1/subFolder/lorem.txt | All files                  |
    | lorem.txt                            | folder_to_shared           |
  Then "Alice" copies following resources
    | resource                             | to                         |
    | folder_to_shared/lorem.txt           | folder_to_share1/subFolder |
    | folder_to_share1/subFolder/lorem.txt | All files                  |
    | lorem.txt                            | folder_to_share1           |
  Then "Alice" shares following resources
    | resource         | user  | role   |
    | folder_to_shared | Brian | editor |
  Given "Brian" has logged in
  Then "Brian" opens the "files" app
  Then "Brian" accepts following resources
    | folder_to_shared |
  Then "Brian" renames following resource
    | resource                              | as                   |
    | Shares/folder_to_shared               | folder_to_shared_new |
    | Shares/folder_to_shared_new/lorem.txt | loremNew.txt         |
  And "Brian" uploads following resources
    | resource   | to                          |
    | simple.pdf | Shares/folder_to_shared_new | 
