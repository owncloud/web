Feature: Integrate with online office suites like collabora and OnlyOffice
  As a user
  I want to work on different docs, sheets, slides etc.., using online office suites like collabora or OnlyOffice
  So that the collaboration is seamless

  # To run this feature we need to run the external app-provider service along with wopi, OnlyOffice, Collabora services
  # This is a minimal test for the integration of ocis with different online office suites like Collabora and OnlyOffice

  Background:
    Given "Admin" creates following users using API
      | id    |
      | Alice |


  Scenario: create an OpenDocument file with collabora
    When "Alice" logs in
    And "Alice" opens the "files" app
    And "Alice" navigates to the personal space page
    And "Alice" creates the following resources
      | resource         | type         | content              |
      | OpenDocument.odt | OpenDocument | OpenDocument Content |
    And "Alice" creates a public link for the resource "OpenDocument.odt" using the sidebar panel
    And "Alice" edits the public link named "Link" of resource "OpenDocument.odt" changing role to "Can edit"
    And "Anonymous" opens the public link "Link"
    And for "Anonymous" the content of the file "OpenDocument.odt" should be "OpenDocument Content" in editor "Collabora"
    And "Alice" logs out


  Scenario: create a Microsoft Word file with onlyoffice
    When "Alice" logs in
    And "Alice" opens the "files" app
    And "Alice" navigates to the personal space page
    And "Alice" creates the following resources
      | resource           | type           | content                |
      | MicrosoftWord.docx | Microsoft Word | Microsoft Word Content |
    And "Alice" creates a public link for the resource "MicrosoftWord.docx" using the sidebar panel
    And "Alice" edits the public link named "Link" of resource "MicrosoftWord.docx" changing role to "Can edit"
    And "Anonymous" opens the public link "Link"
    And for "Anonymous" the content of the file "MicrosoftWord.docx" should be "Microsoft Word Content" in editor "OnlyOffice"
    And "Alice" logs out
