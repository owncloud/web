Feature: Upload
  As a user
  I want to upload resources
  So that I can store them in owncloud

  Scenario: Upload resources in personal space
    Given "Admin" creates following user using API
      | id    |
      | Alice |
    And "Alice" logs in
    And "Alice" opens the "files" app
    And "Alice" creates the following resources
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
  #  currently upload folder feature is not available in playwright
  #  And "Alice" uploads the following resources
  #    | resource |
  #    | PARENT   |
    And "Alice" logs out
