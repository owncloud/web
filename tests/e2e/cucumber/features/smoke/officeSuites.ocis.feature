Feature: Integrate with online office suites like collabora and OnlyOffice
  As a user
  I want to work on different docs, sheets, slides and so on using online office suites like collabora or OnlyOffice
  So that the collaboration is seamless

  Background:
    Given "Admin" creates following users using API
      | id    |
      | Alice |

  Scenario: create a docs with collabora
    When "Alice" logs in
    And "Alice" opens the "files" app
    And "Alice" navigates to the personal space page
    And "Alice" creates the following resources using collabora
      | resource        | type         | content              |
      | myFirstDocs.odt | OpenDocument | OpenDocument Content |
