Feature: Search
  As a user
  I want to do full text search
  So that I can find the files with the content I am looking for

  Scenario: search for content of file
    Given "Admin" creates following users using API
      | id    |
      | Alice |
      | Brian |
    And "Admin" assigns following roles to the users using API
      | id    | role        |
      | Brian | Space Admin |
    And "Alice" uploads the following local file into personal space using API
      | localFile                   | to              |
      | filesForUpload/textfile.txt | fileToShare.txt |
    And "Alice" adds the following tags for the following resources using API
      | resource        | tags      |
      | fileToShare.txt | alice tag |
    And "Alice" shares the following resource using API
      | resource        | recipient | type | role     | resourceType |
      | fileToShare.txt | Brian     | user | Can edit | file         |
    And "Brian" creates the following folder in personal space using API
      | name       |
      | testFolder |
    And "Brian" uploads the following local file into personal space using API
      | localFile                   | to                           |
      | filesForUpload/textfile.txt | textfile.txt                 |
      | filesForUpload/textfile.txt | fileWithTag.txt              |
      | filesForUpload/textfile.txt | withTag.txt                  |
      | filesForUpload/textfile.txt | testFolder/innerTextfile.txt |
    And "Brian" creates the following project spaces using API
      | name           | id               |
      | FullTextSearch | fulltextsearch.1 |
    And "Brian" creates the following folder in space "FullTextSearch" using API
      | name        |
      | spaceFolder |
    And "Brian" creates the following file in space "FullTextSearch" using API
      | name                          | content                   |
      | spaceFolder/spaceTextfile.txt | This is test file. Cheers |
    And "Brian" adds the following tags for the following resources using API
      | resource        | tags  |
      | fileWithTag.txt | tag 1 |
      | withTag.txt     | tag 1 |
    And "Brian" logs in
    When "Brian" searches "" using the global search and the "all files" filter and presses enter
    Then "Brian" should see the message "Search for files" on the search result

    When "Brian" selects tag "alice tag" from the search result filter chip
    Then following resources should be displayed in the files list for user "Brian"
      | resource        |
      | fileToShare.txt |

    When "Brian" clears tags filter
    And "Brian" selects tag "tag 1" from the search result filter chip
    Then following resources should be displayed in the files list for user "Brian"
      | resource        |
      | fileWithTag.txt |
      | withTag.txt     |

    When "Brian" searches "file" using the global search and the "all files" filter and presses enter
    Then following resources should be displayed in the files list for user "Brian"
      | resource        |
      | fileWithTag.txt |

    When "Brian" clears tags filter
    Then following resources should be displayed in the files list for user "Brian"
      | resource                      |
      | textfile.txt                  |
      | fileWithTag.txt               |
      | testFolder/innerTextfile.txt  |
      | fileToShare.txt               |
      | spaceFolder/spaceTextfile.txt |

    When "Brian" searches "Cheers" using the global search and the "all files" filter and presses enter
    Then following resources should be displayed in the files list for user "Brian"
      | resource                      |
      | textfile.txt                  |
      | testFolder/innerTextfile.txt  |
      | fileToShare.txt               |
      | fileWithTag.txt               |
      | withTag.txt                   |
      | spaceFolder/spaceTextfile.txt |
    When "Brian" opens the following file in texteditor
      | resource     |
      | textfile.txt |
    And "Brian" closes the file viewer
    Then following resources should be displayed in the files list for user "Brian"
      | resource                      |
      | textfile.txt                  |
      | testFolder/innerTextfile.txt  |
      | fileToShare.txt               |
      | fileWithTag.txt               |
      | withTag.txt                   |
      | spaceFolder/spaceTextfile.txt |
    And "Brian" logs out
