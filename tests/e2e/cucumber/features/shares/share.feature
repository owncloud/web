Feature: share

  Background:
    Given "Admin" creates following users using API
      | id    |
      | Alice |
      | Brian |

  @predefined-users
  Scenario: folder
    # disabling auto accepting to check accepting share
    Given "Brian" disables auto-accepting using API
    And "Alice" creates the following folder in personal space using API
      | name               |
      | folder_to_shared   |
      | folder_to_shared_2 |
      | shared_folder      |
    And "Alice" logs in
    And "Alice" uploads the following resource
      | resource      | to                 |
      | lorem.txt     | folder_to_shared   |
      | lorem-big.txt | folder_to_shared_2 |
    When "Alice" shares the following resource using the sidebar panel
      | resource           | recipient | type | role                      | resourceType |
      | folder_to_shared   | Brian     | user | Can edit without versions | folder       |
      | shared_folder      | Brian     | user | Can edit without versions | folder       |
      | folder_to_shared_2 | Brian     | user | Can edit without versions | folder       |

    And "Brian" logs in
    And "Brian" navigates to the shared with me page
    And "Brian" opens folder "folder_to_shared"
    # user should have access to unsynced shares
    Then following resources should be displayed in the files list for user "Brian"
      | resource  |
      | lorem.txt |
    When "Brian" navigates to the shared with me page
    And "Brian" enables the sync for the following shares
      | name               |
      | folder_to_shared   |
      | folder_to_shared_2 |
    Then "Brian" should not see a sync status for the folder "shared_folder"
    When "Brian" enables the sync for the following share using the context menu
      | name          |
      | shared_folder |
    And "Brian" disables the sync for the following share using the context menu
      | name          |
      | shared_folder |
    And "Brian" renames the following resource
      | resource                   | as            |
      | folder_to_shared/lorem.txt | lorem_new.txt |
    And "Brian" uploads the following resource
      | resource        | to                 |
      | simple.pdf      | folder_to_shared   |
      | testavatar.jpeg | folder_to_shared_2 |
    When "Brian" deletes the following resources using the sidebar panel
      | resource      | from               |
      | lorem-big.txt | folder_to_shared_2 |
    And "Alice" opens the "files" app
    And "Alice" uploads the following resource
      | resource          | to               | option  |
      | PARENT/simple.pdf | folder_to_shared | replace |
    And "Brian" should not see the version panel for the file
      | resource   | to               |
      | simple.pdf | folder_to_shared |
    And "Alice" removes following sharee
      | resource           | recipient |
      | folder_to_shared_2 | Brian     |
    When "Alice" deletes the following resources using the sidebar panel
      | resource         | from             |
      | lorem_new.txt    | folder_to_shared |
      | folder_to_shared |                  |
    And "Alice" logs out
    Then "Brian" should not be able to see the following shares
      | resource           | owner                    |
      | folder_to_shared_2 | %user_alice_displayName% |
      | folder_to_shared   | %user_alice_displayName% |
    And "Brian" logs out

  @predefined-users
  Scenario: file
    Given "Alice" logs in
    And "Alice" creates the following resources
      | resource         | type    | content   |
      | shareToBrian.txt | txtFile | some text |
      | shareToBrian.md  | mdFile  | readme    |
      | sharedFile.txt   | txtFile | some text |
    And "Alice" edits the following resources
      | resource         | content                   |
      | shareToBrian.txt | new content edited        |
      | shareToBrian.md  | new readme content edited |
    And "Alice" uploads the following resource
      | resource        |
      | simple.pdf      |
      | sampleGif.gif   |
      | testimage.mp3   |
      | sampleOgg.ogg   |
      | sampleWebm.webm |
      | test_video.mp4  |
      | testavatar.jpeg |
      | testavatar.png  |
    Then "Alice" should see thumbnail and preview for file "sampleGif.gif"
    And "Alice" should see thumbnail and preview for file "testavatar.jpeg"
    And "Alice" should see thumbnail and preview for file "testavatar.png"
    And "Alice" should see preview for file "shareToBrian.txt"
    When "Alice" opens a file "testavatar.png" in the media-viewer using the sidebar panel
    Then "Alice" is in a media-viewer
    When "Alice" closes the file viewer
    And "Alice" opens the following file in mediaviewer
      | resource        |
      | testavatar.jpeg |
    Then "Alice" is in a media-viewer
    When "Alice" navigates to the next media resource
    And "Alice" navigates to the previous media resource
    And "Alice" closes the file viewer
    And "Alice" opens the following file in mediaviewer
      | resource      |
      | sampleGif.gif |
    Then "Alice" is in a media-viewer
    When "Alice" closes the file viewer
    And "Alice" opens the following file in mediaviewer
      | resource      |
      | testimage.mp3 |
    Then "Alice" is in a media-viewer
    When "Alice" closes the file viewer
    And "Alice" opens the following file in mediaviewer
      | resource      |
      | sampleOgg.ogg |
    Then "Alice" is in a media-viewer
    When "Alice" closes the file viewer
    And "Alice" opens the following file in mediaviewer
      | resource        |
      | sampleWebm.webm |
    Then "Alice" is in a media-viewer
    When "Alice" closes the file viewer
    And "Alice" opens the following file in mediaviewer
      | resource       |
      | test_video.mp4 |
    Then "Alice" is in a media-viewer
    When "Alice" downloads the following resource using the preview topbar
      | resource       | type |
      | test_video.mp4 | file |
    And "Alice" closes the file viewer
    And "Alice" shares the following resource using the sidebar panel
      | resource         | recipient | type | role                      | resourceType |
      | shareToBrian.txt | Brian     | user | Can edit without versions | file         |
      | shareToBrian.md  | Brian     | user | Can edit without versions | file         |
      | testavatar.jpeg  | Brian     | user | Can view                  | file         |
      | simple.pdf       | Brian     | user | Can edit without versions | file         |
      | sharedFile.txt   | Brian     | user | Can edit without versions | file         |
    And "Alice" navigates to the shared with others page
    And "Alice" opens the following file in mediaviewer
      | resource        |
      | testavatar.jpeg |
    Then "Alice" is in a media-viewer
    When "Alice" closes the file viewer

    When "Brian" logs in
    And "Brian" navigates to the shared with me page
    And "Brian" disables the sync for the following share
      | name           |
      | sharedFile.txt |
    # user should have access to unsynced shares
    And "Brian" opens the following file in texteditor
      | resource       |
      | sharedFile.txt |
    And "Brian" closes the file viewer
    And "Brian" edits the following resources
      | resource         | content            |
      | shareToBrian.txt | new content        |
      | shareToBrian.md  | new readme content |
    And "Brian" opens the following file in mediaviewer
      | resource        |
      | testavatar.jpeg |
    Then "Brian" is in a media-viewer
    When "Brian" closes the file viewer
    And "Brian" opens the following file in pdfviewer
      | resource   |
      | simple.pdf |
    And "Brian" closes the file viewer
    And "Alice" navigates to the personal space page
    And "Alice" removes following sharee
      | resource         | recipient |
      | shareToBrian.txt | Brian     |
      | shareToBrian.md  | Brian     |
    And "Alice" logs out
    Then "Brian" should not be able to see the following shares
      | resource         | owner                    |
      | shareToBrian.txt | %user_alice_displayName% |
      | shareToBrian.md  | %user_alice_displayName% |
    And "Brian" logs out


  Scenario: share with expiration date
    Given "Admin" creates following group using API
      | id    |
      | sales |
    And "Admin" adds user to the group using API
      | user  | group |
      | Brian | sales |
    And "Alice" creates the following folder in personal space using API
      | name       |
      | myfolder   |
      | mainFolder |
    And "Alice" creates the following files into personal space using API
      | pathToFile           | content      |
      | new.txt              | some content |
      | mainFolder/lorem.txt | lorem epsum  |
    And "Alice" logs in
    When "Alice" shares the following resource using the sidebar panel
      | resource   | recipient | type  | role                      | resourceType | expirationDate |
      | new.txt    | Brian     | user  | Can edit without versions | file         | +5 days        |
      | myfolder   | sales     | group | Can view                  | folder       | +10 days       |
      | mainFolder | Brian     | user  | Can edit without versions | folder       |                |

    # set expirationDate to existing share
    And "Alice" sets the expiration date of share "mainFolder" of user "Brian" to "+5 days"
    And "Alice" checks the following access details of share "mainFolder" for user "Brian"
      | Name | %user_brian_displayName% |
      | Type | User                     |
    And "Alice" checks the following access details of share "mainFolder/lorem.txt" for user "Brian"
      | Name | %user_brian_displayName% |
      | Type | User                     |
    And "Alice" sets the expiration date of share "myfolder" of group "sales" to "+3 days"
    And "Alice" checks the following access details of share "myfolder" for group "sales"
      | Name | sales department |
      | Type | Group            |
    # remove share with group
    When "Alice" removes following sharee
      | resource | recipient | type  |
      | myfolder | sales     | group |
    And  "Alice" logs out

  @predefined-users
  Scenario: receive two shares with same name
    Given "Admin" creates following users using API
      | id    |
      | Carol |
    And "Alice" creates the following folder in personal space using API
      | name        |
      | test-folder |
    And "Alice" creates the following files into personal space using API
      | pathToFile   | content      |
      | testfile.txt | example text |
    And "Alice" logs in
    And "Alice" shares the following resource using the sidebar panel
      | resource     | recipient | type | role     |
      | testfile.txt | Brian     | user | Can view |
      | test-folder  | Brian     | user | Can view |
    And "Alice" logs out
    And "Carol" creates the following folder in personal space using API
      | name        |
      | test-folder |
    And "Carol" creates the following files into personal space using API
      | pathToFile   | content      |
      | testfile.txt | example text |
    And "Carol" logs in
    And "Carol" shares the following resource using the sidebar panel
      | resource     | recipient | type | role     |
      | testfile.txt | Brian     | user | Can view |
      | test-folder  | Brian     | user | Can view |
    And "Carol" logs out
    When "Brian" logs in
    And "Brian" navigates to the shared with me page
    Then following resources should be displayed in the Shares for user "Brian"
      | resource         |
      | testfile.txt     |
      | test-folder      |
      # https://github.com/owncloud/ocis/issues/8471
      | testfile (1).txt |
      | test-folder (1)  |
    And "Brian" logs out

  @predefined-users
  Scenario: check file with same name but different paths are displayed correctly in shared with others page
    Given "Admin" creates following users using API
      | id    |
      | Carol |
    And "Alice" creates the following folder in personal space using API
      | name        |
      | test-folder |
    And "Alice" creates the following files into personal space using API
      | pathToFile               | content      |
      | testfile.txt             | example text |
      | test-folder/testfile.txt | some text    |
    And "Alice" shares the following resource using API
      | resource                 | recipient | type | role                      | resourceType |
      | testfile.txt             | Brian     | user | Can edit without versions | file         |
      | test-folder/testfile.txt | Brian     | user | Can edit without versions | file         |
    And "Alice" logs in
    And "Alice" navigates to the shared with others page
    Then following resources should be displayed in the files list for user "Alice"
      | resource                 |
      | testfile.txt             |
      | test-folder/testfile.txt |
    And "Alice" logs out

  @predefined-users
  Scenario: share indication
    When "Alice" creates the following folders in personal space using API
      | name                  |
      | shareFolder/subFolder |
    And "Alice" shares the following resource using API
      | resource    | recipient | type | role                      | resourceType |
      | shareFolder | Brian     | user | Can edit without versions | folder       |
    And "Alice" logs in
    Then "Alice" should see user-direct indicator on the folder "shareFolder"
    When "Alice" opens folder "shareFolder"
    Then "Alice" should see user-indirect indicator on the folder "subFolder"
    And "Alice" logs out
