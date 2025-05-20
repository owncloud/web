@predefined-users
Feature: Different file viewers


  Scenario: file viewers
    Given "Admin" creates following user using API
      | id    |
      | Alice |
    And "Alice" logs in
    When "Alice" creates the following resources
      | resource  | type    | content   |
      | lorem.txt | txtFile | some text |
      | lorem.md  | mdFile  | readme    |
    And "Alice" edits the following resources
      | resource  | content                   |
      | lorem.txt | new content edited        |
      | lorem.md  | new readme content edited |
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
    And "Alice" closes the file viewer
    And "Alice" logs out