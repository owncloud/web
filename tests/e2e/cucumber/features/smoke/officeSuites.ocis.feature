Feature: Integrate with online office suites like collabora and OnlyOffice
  As a user
  I want to work on different docs, sheets, slides and so on using online office suites like collabora or OnlyOffice
  So that the collaboration is seamless

  Background:
    Given "Admin" creates following users using API
      | id    |
      | Alice |

  Scenario: create a OpenDocument file with collabora
    When "Alice" logs in
    And "Alice" opens the "files" app
    And "Alice" navigates to the personal space page
    And "Alice" creates the following resources
      | resource        | type         | content              |
      | myFirstDocs.odt | OpenDocument | OpenDocument Content |
    And "Alice" creates a public link for the resource "myFirstDocs.odt" using the sidebar panel
    And "Alice" edits the public link named "Link" of resource "myFirstDocs.odt" changing role to "Can edit"
    And "Anonymous" opens the public link "Link"
    And "Anonymous" opens the following resource using Collabora should have
      | resource        | content              |
      | myFirstDocs.odt | OpenDocument Content |
    And "Alice" logs out


  Scenario: create a OpenDocument file with onlyoffice
    When "Alice" logs in
    And "Alice" opens the "files" app
    And "Alice" navigates to the personal space page
    And "Alice" creates the following resources
      | resource         | type           | content                |
      | myFirstDocs.docx | Microsoft Word | Microsoft Word Content |
    And "Alice" creates a public link for the resource "myFirstDocs.docx" using the sidebar panel
    And "Alice" edits the public link named "Link" of resource "myFirstDocs.docx" changing role to "Can edit"
    And "Anonymous" opens the public link "Link"
    And "Anonymous" opens the following resource using OnlyOffice should have
      | resource         | content                |
      | myFirstDocs.docx | Microsoft Word Content |
    And "Alice" logs out
