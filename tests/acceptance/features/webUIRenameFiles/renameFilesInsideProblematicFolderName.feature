Feature: Renaming files inside a folder with problematic name
  As a user
  I want to rename a file
  So that I can recognize my file easily

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files in the server


  Scenario Outline: Rename the existing file inside a problematic folder
    Given user "Alice" has created folder "<folder>" in the server
    And user "Alice" has uploaded file "lorem.txt" to "<folder>/lorem.txt" in the server
    And user "Alice" has logged in using the webUI
    When the user opens folder "<folder>" using the webUI
    And the user renames file "lorem.txt" to "???.txt" using the webUI
    Then file "???.txt" should be listed on the webUI
    When the user reloads the current page of the webUI
    Then file "???.txt" should be listed on the webUI
    Examples:
      | folder           |
      | 0              |
      | 'single'quotes |


  Scenario Outline: Rename the existing file inside a problematic folder
    Given user "Alice" has created folder "<folder>" in the server
    And user "Alice" has uploaded file "lorem.txt" to "<folder>/lorem.txt" in the server
    And user "Alice" has logged in using the webUI
    When the user opens folder "<folder>" using the webUI
    And the user renames file "lorem.txt" to "???.txt" using the webUI
    Then file "???.txt" should be listed on the webUI
    When the user reloads the current page of the webUI
    Then file "???.txt" should be listed on the webUI
    Examples:
      | folder                  |
      | strängé नेपाली folder |
