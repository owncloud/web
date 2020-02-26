Feature: Sort files/folders

  As a user
  I would like to sort files/folders
  So that I can make the file/folder list more clear

  Background:
    Given user "user1" has been created with default attributes
    And user "user1" has logged in using the webUI
    And the user has created folder "test_sort"
    And the user has created the following folders
      | entry_name       |
      | test_sort/a      |
      | test_sort/a 文件 |
      | test_sort/10     |
      | test_sort/1      |
      | test_sort/2      |
      | test_sort/z      |
    And the user has created the following files
      | entry_name                |
      | test_sort/a.txt           |
      | test_sort/a space.txt     |
      | test_sort/a space (2).txt |
      | test_sort/a space 文件    |
      | test_sort/a space 文件夹  |
      | test_sort/b1.txt          |
      | test_sort/b2.txt          |
      | test_sort/b10.txt         |
      | test_sort/z.txt           |

  Scenario: Folders are listed before files alphabetically by default and sorted using natural sort
    When the user has browsed to the files page
    Then these resources should be listed in the folder "test_sort" on the webUI
      | entry_name      |
      | a               |
      | a 文件          |
      | 1               |
      | 2               |
      | 10              |
      | z               |
      | a.txt           |
      | a space.txt     |
      | a space (2).txt |
      | a space 文件    |
      | a space 文件夹  |
      | b1.txt          |
      | b2.txt          |
      | b10.txt         |
      | z.txt           |

  Scenario: Resources can be sorted in reverse alphabetical order
    When the user has browsed to the files page
    And the user has set the sort order of the "Name" column to descending order
    Then these resources should be listed in the folder "test_sort" on the webUI
      | entry_name      |
      | z.txt           |
      | b10.txt         |
      | b2.txt          |
      | b1.txt          |
      | a space 文件夹  |
      | a space 文件    |
      | a space (2).txt |
      | a space.txt     |
      | a.txt           |
      | z               |
      | 10              |
      | 2               |
      | 1               |
      | a 文件          |
      | a               |

  Scenario: Resources can be sorted by updated time
    When the user has browsed to the files page
    And the user has set the sort order of the "Updated" column to ascending order
    Then these resources should be listed in the folder "test_sort" on the webUI
      | entry_name |
      | a          |
      | a 文件     |
      | 10         |
      | 1          |
      | 2          |
      | z          |
