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
    And "Alice" creates a public link of following resource using the sidebar panel
      | resource         | role     | password |
      | OpenDocument.odt | Can edit | %public% |
    And "Anonymous" opens the public link "Link"
    And "Anonymous" unlocks the public link with password "%public%"
    Then "Anonymous" should see the content "OpenDocument Content" in editor "Collabora"
    And "Anonymous" should be able to edit content of following resource
      | resource         | type         | content                     |
      | OpenDocument.odt | OpenDocument | Edited OpenDocument Content |
    When "Alice" edits the public link named "Link" of resource "OpenDocument.odt" changing role to "Can view"
    And "Anonymous" opens the public link "Link"
    And "Anonymous" unlocks the public link with password "%public%"
    Then "Anonymous" should not be able to edit content of following resource
      | resource         | type         | content                     |
      | OpenDocument.odt | OpenDocument | Edited OpenDocument Content |
    And "Alice" logs out


  Scenario: create a Microsoft Word file with OnlyOffice
    When "Alice" creates the following resources
      | resource           | type           | content                |
      | MicrosoftWord.docx | Microsoft Word | Microsoft Word Content |
    And "Alice" creates a public link of following resource using the sidebar panel
      | resource           | role     | password |
      | MicrosoftWord.docx | Can edit | %public% |
    And "Anonymous" opens the public link "Link"
    And "Anonymous" unlocks the public link with password "%public%"
    Then "Anonymous" should see the content "Microsoft Word Content" in editor "OnlyOffice"
    And "Anonymous" should be able to edit content of following resource
      | resource           | type           | content                       |
      | MicrosoftWord.docx | Microsoft Word | Edited Microsoft Word Content |
    When "Alice" edits the public link named "Link" of resource "MicrosoftWord.docx" changing role to "Can view"
    And "Anonymous" opens the public link "Link"
    And "Anonymous" unlocks the public link with password "%public%"
    Then "Anonymous" should not be able to edit content of following resource
      | resource           | type           | content                       |
      | MicrosoftWord.docx | Microsoft Word | Edited Microsoft Word Content |
    And "Alice" logs out


  Scenario: open a secure view file with Collabora
    Given "Admin" creates following users using API
      | id    |
      | Brian |
    When "Alice" creates the following resources
      | resource           | type         | content                 |
      | secureDocument.odt | OpenDocument | very important document |
    And "Alice" shares the following resources using the sidebar panel
      | resource           | recipient | type | role              |
      | secureDocument.odt | Brian     | user | Can view (secure) |
    And "Alice" logs out

    And "Brian" logs in
    And "Brian" navigates to the shared with me page
    When "Brian" opens the following file in Collabora
      | resource           |
      | secureDocument.odt |

    # we copy the contents of the file and compare the clipboard with the expected contents.
    # In case the user does not have download permissions and tries to copy file content, the clipboard should be set to “Copying from document disabled”.
    Then "Brian" should see the content "Copying from the document disabled" in editor "Collabora"
    And "Brian" logs out
