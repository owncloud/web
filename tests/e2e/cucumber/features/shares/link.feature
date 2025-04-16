@predefined-users
Feature: link

  Background:
    Given "Admin" creates following user using API
      | id    |
      | Alice |


  Scenario: public link
    Given "Admin" creates following user using API
      | id    |
      | Brian |
    And "Alice" creates the following folders in personal space using API
      | name                   |
      | folderPublic           |
      | folderPublic/SubFolder |
    And "Alice" creates the following files into personal space using API
      | pathToFile             | content     |
      | folderPublic/lorem.txt | lorem ipsum |

    When "Alice" logs in
    And "Alice" creates a public link of following resource using the sidebar panel
      | resource     | role             | password |
      | folderPublic | Secret File Drop | %public% |
    And "Alice" renames the most recently created public link of resource "folderPublic" to "myPublicLink"
    And "Alice" edits the public link named "myPublicLink" of resource "folderPublic" changing role to "Secret File Drop"
    And "Alice" sets the expiration date of the public link named "myPublicLink" of resource "folderPublic" to "+5 days"
    When "Anonymous" opens the public link "myPublicLink"
    And "Anonymous" unlocks the public link with password "%public%"
    And "Anonymous" drop uploads following resources
      | resource     |
      | textfile.txt |

    # authenticated user
    When "Brian" logs in
    And "Brian" opens the public link "myPublicLink"
    And "Brian" unlocks the public link with password "%public%"
    And "Brian" drop uploads following resources
      | resource   |
      | simple.pdf |


    When "Alice" opens folder "folderPublic"
    Then following resources should be displayed in the files list for user "Alice"
      | resource     |
      | textfile.txt |
      | simple.pdf   |
    And "Alice" opens the "files" app
    And "Alice" edits the public link named "myPublicLink" of resource "folderPublic" changing role to "Can edit"

    And "Brian" refreshes the old link
    Then following resources should be displayed in the files list for user "Brian"
      | resource     |
      | textfile.txt |
      | simple.pdf   |
      | SubFolder    |
      | lorem.txt    |
    And "Brian" deletes the following resources from public link using sidebar panel
      | resource   |
      | simple.pdf |
    And "Brian" logs out

    And "Anonymous" refreshes the old link
    And "Anonymous" downloads the following public link resources using the sidebar panel
      | resource     | type |
      | lorem.txt    | file |
      | textfile.txt | file |
    And "Anonymous" uploads the following resources in public link page
      | resource      | option  |
      | new-lorem.txt |         |
      | lorem.txt     | replace |
    And "Anonymous" creates the following resources
      | resource       | type   |
      | myfolder/child | folder |
    And "Anonymous" uploads the following resources in public link page
      | resource | type   |
      | PARENT   | folder |
    And "Anonymous" moves the following resource using drag-drop
      | resource      | to        |
      | new-lorem.txt | SubFolder |
    And "Anonymous" copies the following resource using sidebar-panel
      | resource  | to       |
      | lorem.txt | myfolder |
    And "Anonymous" renames the following public link resources
      | resource     | as               |
      | lorem.txt    | lorem_new.txt    |
      | textfile.txt | textfile_new.txt |
    And "Anonymous" deletes the following resources from public link using batch action
      | resource  | from     |
      | lorem.txt | myfolder |
      | child     | myfolder |
    And "Alice" removes the public link named "myPublicLink" of resource "folderPublic"
    And "Anonymous" should not be able to open the old link "myPublicLink"
    And "Alice" logs out


  Scenario: public link for folder and file (by authenticated user)
    Given "Admin" creates following user using API
      | id    |
      | Brian |
      | Carol |
    And "Alice" logs in
    And "Alice" creates the following folders in personal space using API
      | name         |
      | folderPublic |
    And "Alice" creates the following files into personal space using API
      | pathToFile                    | content   |
      | folderPublic/shareToBrian.txt | some text |
      | folderPublic/shareToBrian.md  | readme    |
    And "Alice" uploads the following local file into personal space using API
      | localFile                     | to             |
      | filesForUpload/simple.pdf     | simple.pdf     |
      | filesForUpload/testavatar.jpg | testavatar.jpg |
      | filesForUpload/test_video.mp4 | test_video.mp4 |
    And "Alice" shares the following resource using API
      | resource       | recipient | type | role     |
      | folderPublic   | Brian     | user | Can edit |
      | simple.pdf     | Brian     | user | Can edit |
      | testavatar.jpg | Brian     | user | Can edit |

    And "Alice" opens the "files" app
    And "Alice" creates a public link of following resource using the sidebar panel
      | resource     | password |
      | folderPublic | %public% |
    And "Alice" renames the most recently created public link of resource "folderPublic" to "folderLink"
    And "Alice" creates a public link of following resource using the sidebar panel
      | resource                      | password |
      | folderPublic/shareToBrian.txt | %public% |
    And "Alice" renames the most recently created public link of resource "folderPublic/shareToBrian.txt" to "textLink"
    And "Alice" creates a public link of following resource using the sidebar panel
      | resource                     | password |
      | folderPublic/shareToBrian.md | %public% |
    And "Alice" renames the most recently created public link of resource "folderPublic/shareToBrian.md" to "markdownLink"
    And "Alice" creates a public link of following resource using the sidebar panel
      | resource   | password |
      | simple.pdf | %public% |
    And "Alice" renames the most recently created public link of resource "simple.pdf" to "pdfLink"
    And "Alice" creates a public link of following resource using the sidebar panel
      | resource       | password |
      | testavatar.jpg | %public% |
    And "Alice" renames the most recently created public link of resource "testavatar.jpg" to "imageLink"
    And "Alice" creates a public link of following resource using the sidebar panel
      | resource       | password |
      | test_video.mp4 | %public% |
    And "Alice" renames the most recently created public link of resource "test_video.mp4" to "videoLink"
    And "Alice" logs out

    # authenticated user with access to resources. should be redirected to shares with me page
    And "Brian" logs in
    When "Brian" opens the public link "folderLink"
    And "Brian" unlocks the public link with password "%public%"
    And "Brian" downloads the following public link resources using the sidebar panel
      | resource         | type |
      | shareToBrian.txt | file |
    And "Brian" uploads the following resources
      | resource  |
      | lorem.txt |
    When "Brian" opens the public link "textLink"
    And "Brian" unlocks the public link with password "%public%"
    Then "Brian" is in a text-editor
    And "Brian" closes the file viewer
    When "Brian" opens the public link "markdownLink"
    And "Brian" unlocks the public link with password "%public%"
    Then "Brian" is in a text-editor
    And "Brian" closes the file viewer
    And "Brian" downloads the following public link resources using the single share view
      | resource        | type |
      | shareToBrian.md | file |
    When "Brian" opens the public link "pdfLink"
    And "Brian" unlocks the public link with password "%public%"
    Then "Brian" is in a pdf-viewer
    And "Brian" closes the file viewer
    And "Brian" downloads the following public link resources using the single share view
      | resource   | type |
      | simple.pdf | file |
    When "Brian" opens the public link "imageLink"
    And "Brian" unlocks the public link with password "%public%"
    # https://github.com/owncloud/ocis/issues/8602
    Then "Brian" is in a media-viewer
    And "Brian" closes the file viewer
    And "Brian" downloads the following public link resources using the single share view
      | resource       | type |
      | testavatar.jpg | file |
    And "Brian" logs out

    # authenticated user without access to resources. should be redirected to the public links page
    And "Carol" logs in
    When "Carol" opens the public link "folderLink"
    And "Carol" unlocks the public link with password "%public%"
    # https://github.com/owncloud/web/issues/10473
    And "Carol" downloads the following public link resources using the sidebar panel
      | resource  | type |
      | lorem.txt | file |
    When "Carol" opens the public link "textLink"
    And "Carol" unlocks the public link with password "%public%"
    Then "Carol" is in a text-editor
    And "Carol" closes the file viewer
    When "Carol" opens the public link "markdownLink"
    And "Carol" unlocks the public link with password "%public%"
    Then "Carol" is in a text-editor
    And "Carol" closes the file viewer
    And "Carol" downloads the following public link resources using the single share view
      | resource        | type |
      | shareToBrian.md | file |
    When "Carol" opens the public link "pdfLink"
    And "Carol" unlocks the public link with password "%public%"
    Then "Carol" is in a pdf-viewer
    And "Carol" closes the file viewer
    And "Carol" downloads the following public link resources using the single share view
      | resource   | type |
      | simple.pdf | file |
    When "Carol" opens the public link "imageLink"
    And "Carol" unlocks the public link with password "%public%"
    # https://github.com/owncloud/ocis/issues/8602
    Then "Carol" is in a media-viewer
    And "Carol" closes the file viewer
    And "Carol" downloads the following public link resources using the single share view
      | resource       | type |
      | testavatar.jpg | file |
    And "Carol" logs out

    # Anonymous user
    When "Anonymous" opens the public link "folderLink"
    And "Anonymous" unlocks the public link with password "%public%"
    And "Anonymous" downloads the following public link resources using the sidebar panel
      | resource  | type |
      | lorem.txt | file |
    When "Anonymous" opens the public link "textLink"
    And "Anonymous" unlocks the public link with password "%public%"
    Then "Anonymous" is in a text-editor
    And "Anonymous" closes the file viewer
    When "Anonymous" opens the public link "markdownLink"
    And "Anonymous" unlocks the public link with password "%public%"
    Then "Anonymous" is in a text-editor
    And "Anonymous" closes the file viewer
    And "Anonymous" downloads the following public link resources using the single share view
      | resource        | type |
      | shareToBrian.md | file |
    When "Anonymous" opens the public link "pdfLink"
    And "Anonymous" unlocks the public link with password "%public%"
    Then "Anonymous" is in a pdf-viewer
    And "Anonymous" closes the file viewer
    And "Anonymous" downloads the following public link resources using the single share view
      | resource   | type |
      | simple.pdf | file |
    When "Anonymous" opens the public link "imageLink"
    And "Anonymous" unlocks the public link with password "%public%"
    # https://github.com/owncloud/ocis/issues/8602
    Then "Anonymous" is in a media-viewer
    And "Anonymous" closes the file viewer
    And "Anonymous" downloads the following public link resources using the single share view
      | resource       | type |
      | testavatar.jpg | file |
    When "Anonymous" opens the public link "videoLink"
    And "Anonymous" unlocks the public link with password "%public%"
    Then "Anonymous" is in a media-viewer
    And "Anonymous" closes the file viewer


  Scenario: add banned password for public link
    When "Alice" logs in
    And "Alice" creates the following files into personal space using API
      | pathToFile | content   |
      | lorem.txt  | some text |

    And "Alice" opens the "files" app
    And "Alice" creates a public link of following resource using the sidebar panel
      | resource  | password |
      | lorem.txt | %public% |
    When "Alice" tries to sets a new password "ownCloud-1" of the public link named "Unnamed link" of resource "lorem.txt"
    Then "Alice" should see an error message
      """
      Unfortunately, your password is commonly used. please pick a harder-to-guess password for your safety
      """
    And "Alice" closes the public link password dialog box
    When "Alice" tries to sets a new password "ownCloud-1" of the public link named "Unnamed link" of resource "lorem.txt"
    Then "Alice" should see an error message
      """
      Unfortunately, your password is commonly used. please pick a harder-to-guess password for your safety
      """
    And "Alice" reveals the password of the public link
    And "Alice" hides the password of the public link
    And "Alice" generates the password for the public link
    And "Alice" copies the password of the public link
    And "Alice" sets the password of the public link
    And "Anonymous" opens the public link "Unnamed link"
    And "Anonymous" unlocks the public link with password "%copied_password%"
    And "Alice" logs out


  Scenario: edit password of the public link
    When "Alice" logs in
    And "Alice" creates the following folders in personal space using API
      | name         |
      | folderPublic |
    And "Alice" creates the following files into personal space using API
      | pathToFile             | content     |
      | folderPublic/lorem.txt | lorem ipsum |
    And "Alice" opens the "files" app
    And "Alice" creates a public link of following resource using the sidebar panel
      | resource     | role     | password |
      | folderPublic | Can edit | %public% |
    And "Alice" renames the most recently created public link of resource "folderPublic" to "myPublicLink"
    When "Anonymous" opens the public link "myPublicLink"
    And "Anonymous" unlocks the public link with password "%public%"
    And "Alice" changes the password of the public link named "myPublicLink" of resource "folderPublic" to "new-strongPass1"
    And "Anonymous" refreshes the old link
    And "Anonymous" unlocks the public link with password "new-strongPass1"
    And "Anonymous" downloads the following public link resources using the sidebar panel
      | resource  | type |
      | lorem.txt | file |
    And "Alice" logs out


  Scenario: link indication
    When "Alice" logs in
    And "Alice" creates the following folders in personal space using API
      | name         |
      | folderPublic |
    And "Alice" creates the following files into personal space using API
      | pathToFile             | content     |
      | folderPublic/lorem.txt | lorem ipsum |
    And "Alice" opens the "files" app
    And "Alice" creates a public link of following resource using the sidebar panel
      | resource     | role     | password |
      | folderPublic | Can edit | %public% |
    When "Alice" opens the "files" app
    And "Alice" closes the sidebar
    Then "Alice" should see link-direct indicator on the folder "folderPublic"
    When "Alice" opens folder "folderPublic"
    Then "Alice" should see link-indirect indicator on the file "lorem.txt"

    And "Alice" navigates to the shared via link page
    Then following resources should be displayed in the files list for user "Alice"
      | resource     |
      | folderPublic |

    # check copy link to clipboard button
    When "Alice" opens the "files" app
    And "Alice" copies the link "Unnamed link" of resource "folderPublic"
    And "Alice" opens the "%clipboard%" url
    And "Alice" unlocks the public link with password "%public%"
    Then following resources should be displayed in the files list for user "Alice"
      | resource  |
      | lorem.txt |
    And "Alice" logs out
