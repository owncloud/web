Feature: Integrate with online office suites like Collabora and OnlyOffice
  As a user
  I want to work on different docs, sheets, slides etc.., using online office suites like Collabora or OnlyOffice
  So that the collaboration is seamless
  # To run this feature we need to run the external app-provider service along with wopi, OnlyOffice, Collabora services
  # This is a minimal test for the integration of ocis with different online office suites like Collabora and OnlyOffice

  Background:
    Given "Admin" creates following users using API
      | id    |
      | Alice |
    And "Alice" logs in
    And "Alice" opens the "files" app

  Scenario: create an OpenDocument file with Collabora
    When "Alice" creates the following resources
      | resource         | type         | content              |
      | OpenDocument.odt | OpenDocument | OpenDocument Content |
    And "Alice" creates a public link for the resource "OpenDocument.odt" using the sidebar panel
    And "Alice" edits the public link named "Link" of resource "OpenDocument.odt" changing role to "Can edit"
    And "Alice" logs out
    And "Anonymous" opens the public link "Link"
    Then "Anonymous" should see the content "OpenDocument Content" in editor "Collabora"


  Scenario: create a Microsoft Word file with OnlyOffice
    When "Alice" creates the following resources
      | resource           | type           | content                |
      | MicrosoftWord.docx | Microsoft Word | Microsoft Word Content |
    And "Alice" creates a public link for the resource "MicrosoftWord.docx" using the sidebar panel
    And "Alice" edits the public link named "Link" of resource "MicrosoftWord.docx" changing role to "Can edit"
    And "Alice" logs out
    And "Anonymous" opens the public link "Link"
    Then "Anonymous" should see the content "Microsoft Word Content" in editor "OnlyOffice"
