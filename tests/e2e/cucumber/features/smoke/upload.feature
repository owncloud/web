Feature: Upload
  As a user
  I want to upload resources
  So that I can store them in owncloud

  Background:
    Given "Admin" creates following user using API
      | id    |
      | Alice |
    And "Alice" logs in
    And "Alice" opens the "files" app


  Scenario: Upload resources in personal space
    Given "Alice" creates the following resources
      | resource          | type    | content             |
      | new-lorem-big.txt | txtFile | new lorem big file  |
      | lorem.txt         | txtFile | lorem file          |
      | textfile.txt      | txtFile | some random content |
    When "Alice" uploads the following resources
      | resource          | option    |
      | new-lorem-big.txt | replace   |
      | lorem.txt         | skip      |
      | textfile.txt      | keep both |
    And "Alice" creates the following resources
      | resource           | type    | content      |
      | PARENT/parent.txt  | txtFile | some text    |
      | PARENT/example.txt | txtFile | example text |
    And "Alice" uploads the following resources via drag-n-drop
        | resource       |
        | simple.pdf     |
        | testavatar.jpg |
  #  currently upload folder feature is not available in playwright
  #  And "Alice" uploads the following resources
  #    | resource |
  #    | PARENT   |
    And "Alice" logs out


  Scenario: upload multiple small files
    When "Alice" uploads 50 small files in personal space
    Then "Alice" should see the text "50 items with 600 B in total (50 files, 0 folders)" at the footer of the page
    And "Alice" should see 50 resources in the personal space files view
    And "Alice" logs out
