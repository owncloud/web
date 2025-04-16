@predefined-users
Feature: access breadcrumb
  As a user
  I want to browse to parent folders using breadcrumb
  So that I can access resources with ease


  Scenario: breadcrumb navigation
    Given "Admin" creates following user using API
      | id    |
      | Alice |
    And "Alice" logs in
    And "Alice" creates the following resources
      | resource                       | type   |
      | parent/folder%2Fwith%2FSlashes | folder |
    And "Alice" opens folder "parent/folder%2Fwith%2FSlashes"
    And "Alice" creates the following resources
      | resource               | type   |
      | 'single-double quotes" | folder |
    And "Alice" opens folder "\'single-double quotes\""
    And "Alice" creates the following resources
      | resource              | type   |
      | "inner" double quotes | folder |
    And "Alice" opens folder "\"inner\" double quotes"
    And "Alice" creates the following resources
      | resource   | type   |
      | sub-folder | folder |
    And "Alice" opens folder "sub-folder"
    When "Alice" navigates to folder "\"inner\" double quotes" via breadcrumb
    And "Alice" navigates to folder "\'single-double quotes\"" via breadcrumb
    And "Alice" navigates to folder "folder%2Fwith%2FSlashes" via breadcrumb
    And "Alice" navigates to folder "parent" via breadcrumb
    And "Alice" logs out
