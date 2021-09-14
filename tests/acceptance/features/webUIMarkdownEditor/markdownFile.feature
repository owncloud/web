Feature: create markdown files
  As a user
  I want to create markdown files
  So that I can organize my text data in formatted form

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files
    And user "Alice" has uploaded file with content "simple markdown file" to "simple.md"
    And user "Alice" has logged in using the webUI
    And the user has browsed to the files page

  @disablePreviews
  Scenario: create a new markdown file in the root directory
    When the user creates a markdown file with the name "simple_new.md" using the webUI
    Then the file "simple_new.md" should be displayed in the markdown editor webUI
    When the user closes the markdown editor using the webUI
    Then as "Alice" file "simple_new.md" should exist
    And file "simple_new.md" should be listed on the webUI

  @disablePreviews
  Scenario: update a markdown file with new content
    Given the user has opened file "simple.md" in the markdown editor webUI
    When the user inputs the content "updated content" in the markdown editor webUI
    And the user saves the file in the markdown editor webUI
    And the user closes the markdown editor using the webUI
    Then as "Alice" the file "simple.md" should have the content "updated content"

  @disablePreviews
  Scenario: append new content in a markdown file
    Given the user has opened file "simple.md" in the markdown editor webUI
    When the user appends the content " new content added" in the markdown editor webUI
    And the user saves the file in the markdown editor webUI
    And the user closes the markdown editor using the webUI
    Then as "Alice" the file "simple.md" should have the content "simple markdown file new content added"

  @disablePreviews
  Scenario: close the markdown editor without saving the updated content
    Given the user has opened file "simple.md" in the markdown editor webUI
    When the user inputs the content "updated content" in the markdown editor webUI
    And the user closes the markdown editor using the webUI
    And as "Alice" the file "simple.md" should have the content "simple markdown file"

  @disablePreviews
  Scenario: preview content of the file
    When the user opens file "simple.md" in the markdown editor webUI
    Then the file "simple.md" should be displayed in the markdown editor webUI
    And the preview panel should have the content "simple markdown file" on the webUI

  @disablePreviews
  Scenario: preview content of the file while editing
    Given the user has opened file "simple.md" in the markdown editor webUI
    When the user inputs the content "updating the file with new content" in the markdown editor webUI
    Then the preview panel should have the content "updating the file with new content" on the webUI

  @disablePreviews
  Scenario: open text file in markdown editor
    Given user "Alice" has uploaded file with content "test" to "lorem.txt"
    And the user has reloaded the current page of the webUI
    When the user opens file "lorem.txt" in the markdown editor webUI
    Then the file "lorem.txt" should be displayed in the markdown editor webUI

  @disablePreviews
  Scenario Outline: preview of files with markdown editor by clicking the action menu option
    Given user "Alice" has uploaded file with content "test" to "lorem.txt"
    And the user has reloaded the current page of the webUI
    When the user opens file "<file>" in the markdown editor using the action menu option on the webUI
    Then the file "<file>" should be displayed in the markdown editor webUI
    Examples:
      | file          |
      | simple.md     |
      | lorem.txt     |

  @disablePreviews
  Scenario Outline: Previewing text written in markdown format
    Given the user has opened file "simple.md" in the markdown editor webUI
    When the user inputs the content "<content>" in the markdown editor webUI
    Then the preview panel should have "<tagname>" element with text "<innertext>"
    Examples:
      | content         | innertext | tagname     |
      | `code`          | code      | p > code    |
      | # heading       | heading   | h1          |
      | ###### heading  | heading   | h6          |
      | - list1         | list1     | ul > li     |
      | [link]()        | link      | p > a       |
