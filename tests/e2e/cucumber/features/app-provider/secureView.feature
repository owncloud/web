Feature: Secure view
  As a user
  I want to share different docs using secure view role
  So that the recipient can only open documents in Collabora with watermarks applied
  Any actions for the recipient, such as editing, downloading, copying the document, are prohibited
  # To run this feature we need to run the external app-provider service along OnlyOffice, Collabora services

  Background:
    Given "Admin" creates following users using API
      | id    |
      | Alice |
      | Brian |
    And "Alice" logs in
    And "Alice" opens the "files" app


  Scenario: open a secure view file with Collabora
    Given "Alice" creates the following folder in personal space using API
      | name          |
      | shared folder |
    And "Alice" uploads the following local file into personal space using API
      | localFile                      | to                            |
      | filesForUpload/simple.pdf      | shared folder/simple.pdf      |
      | filesForUpload/testavatar.jpeg | shared folder/testavatar.jpeg |
      | filesForUpload/lorem.txt       | shared folder/lorem.txt       |
    And "Alice" creates the following resources
      | resource           | type         | content                 |
      | secureDocument.odt | OpenDocument | very important document |

    And "Alice" shares the following resources using the sidebar panel
      | resource           | recipient | type | role              |
      | secureDocument.odt | Brian     | user | Can view (secure) |
      | shared folder      | Brian     | user | Can view (secure) |
    And "Alice" logs out

    And "Brian" logs in
    And "Brian" navigates to the shared with me page
    When "Brian" opens the following file in Collabora
      | resource           |
      | secureDocument.odt |

    # we copy the contents of the file and compare the clipboard with the expected contents.
    # In case the user does not have download permissions and tries to copy file content, the clipboard should be set to “Copying from document disabled”.
    Then "Brian" should see the content "Copying from the document disabled" in editor "Collabora"
    And "Brian" closes the file viewer
    When "Brian" opens folder "shared folder"
    And "Brian" opens the following file in Collabora
      | resource   |
      | simple.pdf |
    Then "Brian" should see the content "Copying from the document disabled" in editor "Collabora"
    And "Brian" closes the file viewer
    And "Brian" opens the following file in Collabora
      | resource        |
      | testavatar.jpeg |
    Then "Brian" should see the content "Copying from the document disabled" in editor "Collabora"
    And "Brian" closes the file viewer
    And "Brian" opens the following file in Collabora
      | resource  |
      | lorem.txt |
    Then "Brian" should see the content "Copying from the document disabled" in editor "Collabora"
    And "Brian" logs out


  Scenario: check available actions for secure view file
    Given "Alice" creates the following folder in personal space using API
      | name          |
      | shared folder |
    And "Alice" uploads the following local file into personal space using API
      | localFile                      | to                             |
      | filesForUpload/simple.pdf      | shared folder/secure.pdf       |
      | filesForUpload/testavatar.jpeg | shared folder/securePhoto.jpeg |
      | filesForUpload/lorem.txt       | shared folder/secureFile.txt   |
    And "Alice" creates the following resources
      | resource           | type         | content                 |
      | secureDocument.odt | OpenDocument | very important document |
    And "Alice" shares the following resources using the sidebar panel
      | resource           | recipient | type | role              |
      | secureDocument.odt | Brian     | user | Can view (secure) |
      | shared folder      | Brian     | user | Can view (secure) |
    And "Alice" logs out

    And "Brian" logs in
    And "Brian" navigates to the shared with me page

    # .odt file
    Then "Brian" should see following actions for file "secureDocument.odt"
      | action            |
      | Open in Collabora |
    But "Brian" should not see following actions for file "secureDocument.odt"
      | action             |
      | Download           |
      | Copy               |
      | Open in OnlyOffice |
    And "Brian" should not see preview for file "secureDocument.odt"

    # folder
    Then "Brian" should not see following actions for folder "shared folder"
      | action   |
      | Download |
      | Copy     |
    When "Brian" opens folder "shared folder"

    # .pdf file
    Then "Brian" should see following actions for file "secure.pdf"
      | action            |
      | Open in Collabora |
    But "Brian" should not see following actions for file "secure.pdf"
      | action             |
      | Download           |
      | Copy               |
      | Open in PDF Viewer |
    And "Brian" should not see thumbnail and preview for file "secure.pdf"

    # .jpeg file
    Then "Brian" should see following actions for file "securePhoto.jpeg"
      | action            |
      | Open in Collabora |
    But "Brian" should not see following actions for file "securePhoto.jpeg"
      | action   |
      | Download |
      | Copy     |
      | Preview  |
    And "Brian" should not see thumbnail and preview for file "securePhoto.jpeg"

    # .txt file
    Then "Brian" should see following actions for file "secureFile.txt"
      | action            |
      | Open in Collabora |
    But "Brian" should not see following actions for file "secureFile.txt"
      | action              |
      | Download            |
      | Copy                |
      | Open in Text Editor |
      | Open in OnlyOffice  |
    And "Brian" should not see thumbnail and preview for file "secureFile.txt"

    # check available actions and files preview in the seach result page
    When "Brian" searches "secure" using the global search and the "all files" filter and presses enter
    Then following resources should be displayed in the files list for user "Brian"
      | resource           |
      | secureFile.txt     |
      | securePhoto.jpeg   |
      | secure.pdf         |
      | secureDocument.odt |

    # .txt file
    Then "Brian" should see following actions for file "secureFile.txt"
      | action            |
      | Open in Collabora |
    But "Brian" should not see following actions for file "secureFile.txt"
      | action              |
      | Download            |
      | Copy                |
      | Open in Text Editor |
      | Open in OnlyOffice  |
    And "Brian" should not see thumbnail and preview for file "secureFile.txt"

    # .jpeg file
    Then "Brian" should see following actions for file "securePhoto.jpeg"
      | action            |
      | Open in Collabora |
    But "Brian" should not see following actions for file "securePhoto.jpeg"
      | action   |
      | Download |
      | Copy     |
      | Preview  |
    And "Brian" should not see thumbnail and preview for file "securePhoto.jpeg"

    # .pdf file
    Then "Brian" should see following actions for file "secure.pdf"
      | action            |
      | Open in Collabora |
    But "Brian" should not see following actions for file "secure.pdf"
      | action             |
      | Download           |
      | Copy               |
      | Open in PDF Viewer |
    And "Brian" should not see preview for file "secure.pdf"

    # .odt file
    Then "Brian" should see following actions for file "secureDocument.odt"
      | action            |
      | Open in Collabora |
    But "Brian" should not see following actions for file "secureDocument.odt"
      | action             |
      | Download           |
      | Copy               |
      | Open in OnlyOffice |
    And "Brian" should not see preview for file "secureDocument.odt"
    And "Brian" logs out
