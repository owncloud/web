Feature: url stability for mobile and desktop client
  As a user
  I want to work on different docs, sheets, slides etc.., using online office suites like Collabora or OnlyOffice
  To make sure that the file can be opened from the mobile and desktop client
  # To run this feature we need to run the external app-provider service along with wopi, OnlyOffice, Collabora services
  # This is a minimal test for the integration of ocis with different online office suites like Collabora and OnlyOffice
  # Check that the file can be opened in collabora or onlyoffice using the url. https://github.com/owncloud/web/issues/9897

  
  Scenario: open office suite files with Collabora and onlyOffice
    Given "Admin" creates following users using API
      | id    |
      | Alice |
    And "Alice" logs in
    And "Alice" creates the following files into personal space using API
      | pathToFile          | content                 |
      | OpenDocument.odt    | OpenDocument Content    |
    And "Alice" creates the following resources
      | resource           | type           | content                |
      | MicrosoftWord.docx | Microsoft Word | Microsoft Word Content |
    And "Alice" opens the "files" app

    # desktop feature
    When "Alice" opens the file "OpenDocument.odt" of space "personal" in Collabora through the URL for desktop client
    Then "Alice" should see the content "OpenDocument Content" in editor "Collabora"
    When "Alice" opens the file "MicrosoftWord.docx" of space "personal" in OnlyOffice through the URL for desktop client
    Then "Alice" should see the content "Microsoft Word Content" in editor "OnlyOffice"

    # mobile feature
    When "Alice" opens the file "OpenDocument.odt" of space "personal" in Collabora through the URL for mobile client
    Then "Alice" should see the content "OpenDocument Content" in editor "Collabora"
    When "Alice" opens the file "MicrosoftWord.docx" of space "personal" in OnlyOffice through the URL for mobile client
    Then "Alice" should see the content "Microsoft Word Content" in editor "OnlyOffice"
    And "Alice" logs out
