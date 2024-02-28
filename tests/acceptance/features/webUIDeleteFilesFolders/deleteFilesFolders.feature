Feature: deleting files and folders
  As a user
  I want to delete files and folders
  So that I can keep my filing system clean and tidy

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files in the server


  Scenario Outline: Delete a file with problematic characters
    Given user "Alice" has created file <file_name> in the server
    And user "Alice" has logged in using the webUI
    When the user deletes file <file_name> using the webUI
    Then file <file_name> should not be listed on the webUI
    When the user reloads the current page of the webUI
    Then file <file_name> should not be listed on the webUI
    Examples:
      | file_name           |
      | "'single'"          |
      | "\"double\" quotes" |
      | "question?"         |
      | "&and#hash"         |


  Scenario: delete a file on a public share with problematic characters
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has renamed the following file in the server
      | from-name-parts | to-name-parts   |
      | lorem.txt       | simple-folder/  |
      |                 | 'single'        |
      |                 | "double" quotes |
      |                 | question?       |
      |                 | &and#hash       |
    And user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions in the server
    When the public uses the webUI to access the last public link created by user "Alice" in a new session
    And the user deletes the following file using the webUI
      | name-parts      |
      | 'single'        |
      | "double" quotes |
      | question?       |
      | &and#hash       |
    Then the following file should not be listed on the webUI
      | name-parts      |
      | 'single'        |
      | "double" quotes |
      | question?       |
      | &and#hash       |
    And no message should be displayed on the webUI
    When the user reloads the current page of the webUI
    Then the following file should not be listed on the webUI
      | name-parts      |
      | 'single'        |
      | "double" quotes |
      | question?       |
      | &and#hash       |



  Scenario: Delete folder with dot in the name
    Given user "Alice" has created the following folders in the server
      | folders  |
      | fo.      |
      | fo.1     |
      | fo...1.. |
      | fo.xyz   |
    And user "Alice" has logged in using the webUI
    When the user batch deletes these files using the webUI
      | folders  |
      | fo.      |
      | fo.1     |
      | fo...1.. |
      | fo.xyz   |
    Then as "Alice" these folders should not be listed on the webUI
      | folders  |
      | fo.      |
      | fo.1     |
      | fo...1.. |
      | fo.xyz   |
