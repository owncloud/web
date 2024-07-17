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
    And "Alice" uploads the following resource
      | resource        | to            |
      | simple.pdf      | shared folder |
      | testavatar.jpeg | shared folder |
      | lorem.txt       | shared folder |
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
    And "Alice" uploads the following resource
      | resource        | to            |
      | simple.pdf      | shared folder |
      | testavatar.jpeg | shared folder |
      | lorem.txt       | shared folder |
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
    Then "Brian" should see following actions for file "secureDocument.odt"
      | action            |
      | Open in Collabora |
    But "Brian" should not see following actions for file "secureDocument.odt"
      | action             |
      | Download           |
      | Copy               |
      | Open in OnlyOffice |
    And "Brian" should not see following actions for folder "shared folder"
      | action   |
      | Download |
      | Copy     |
    When "Brian" opens folder "shared folder"
    Then "Brian" should see following actions for file "simple.pdf"
      | action            |
      | Open in Collabora |
    But "Brian" should not see following actions for file "simple.pdf"
      | action             |
      | Download           |
      | Copy               |
      | Open in PDF Viewer |
    And "Brian" should see following actions for file "testavatar.jpeg"
      | action            |
      | Open in Collabora |
    But "Brian" should not see following actions for file "testavatar.jpeg"
      | action   |
      | Download |
      | Copy     |
      | Preview  |
    And "Brian" should see following actions for file "lorem.txt"
      | action            |
      | Open in Collabora |
    But "Brian" should not see following actions for file "lorem.txt"
      | action              |
      | Download            |
      | Copy                |
      | Open in Text Editor |
      | Open in OnlyOffice  |

    # check available actions in the seach result puge
    When "Brian" searches "lorem" using the global search and the "all files" filter and presses enter
    Then following resources should be displayed in the files list for user "Brian"
      | resource  |
      | lorem.txt |
    And "Brian" should see following actions for file "lorem.txt"
      | action            |
      | Open in Collabora |
    # please enable again after fixing https://github.com/owncloud/ocis/issues/9608
    # But "Brian" should not see following actions for file "lorem.txt"
    #   | action              |
    #   | Download            |
    #   | Copy                |
    #   | Open in Text Editor |
    #   | Open in OnlyOffice  |

    And "Brian" logs out
