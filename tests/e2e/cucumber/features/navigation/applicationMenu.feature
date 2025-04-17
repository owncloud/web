@predefined-users
Feature: Application menu
  As a user
  I want to open the editor via the application menu
  So that I have instant access

  Scenario: Open text editor via application menu
    Given "Admin" creates following user using API
      | id    |
      | Alice |
    And "Alice" logs in
    When "Alice" opens the "text-editor" app
    And "Alice" enters the text "Hello world" in editor "TextEditor"
    And "Alice" saves the file viewer
    And "Alice" closes the file viewer
    Then following resources should be displayed in the files list for user "Alice"
      | resource     |
      | New file.txt |
    And "Alice" logs out
