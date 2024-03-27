Feature: display image in preview app on the webUI

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files in the server

  @ocisSmokeTest
  Scenario Outline: preview of image files with preview app is possible
    Given user "Alice" has uploaded file "<image-file>" to "<image-file>" in the server
    And user "Alice" has logged in using the webUI
    When the user views the file "<image-file>" in the preview app using the webUI
    Then the file "<image-file>" should be displayed in the preview app webUI
    Examples:
      | image-file      |
      | testavatar.jpg  |
      | testavatar.png  |
      | testavatar.jpeg |

  Scenario: preview of video with preview app is possible
    Given user "Alice" has uploaded file "test_video.mp4" to "test_video.mp4" in the server
    And user "Alice" has logged in using the webUI
    When the user views the file "test_video.mp4" in the preview app using the webUI
    Then the file "test_video.mp4" should be displayed in the preview app webUI


  Scenario: video playback in public share
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has uploaded file "test_video.mp4" to "simple-empty-folder/test_video.mp4" in the server
    And user "Alice" has created a public link with following settings in the server
      | path | simple-empty-folder |
    When the public uses the webUI to access the last public link created by user "Alice" in a new session
    And the public views the file "test_video.mp4" in the preview app using the webUI
    Then the file "test_video.mp4" should be displayed in the preview app webUI


  Scenario: image preview in public share
    Given user "Alice" has created folder "simple-empty-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "simple-empty-folder/testavatar.jpg" in the server
    And user "Alice" has created a public link with following settings in the server
      | path | simple-empty-folder |
    When the public uses the webUI to access the last public link created by user "Alice" in a new session
    And the public views the file "testavatar.jpg" in the preview app using the webUI
    Then the file "testavatar.jpg" should be displayed in the preview app webUI


  Scenario Outline: navigate to next and previous media resource with preview app is possible
    Given user "Alice" has uploaded file "<resource-one>" to "<resource-one>" in the server
    And user "Alice" has uploaded file "<resource-two>" to "<resource-two>" in the server
    And user "Alice" has logged in using the webUI
    When the user views the file "<resource-one>" in the preview app using the webUI
    And the user navigates to the next media resource using the webUI
    Then the file "<resource-two>" should be displayed in the preview app webUI
    When the user navigates to the previous media resource using the webUI
    Then the file "<resource-one>" should be displayed in the preview app webUI
    Examples:
      | resource-one    | resource-two    |
      | test_video0.mp4 | test_video1.mp4 |
      | testavatar.jpg  | testavatar.png  |


  Scenario: preview of mp3 file with preview app by clicking on the file name
    Given user "Alice" has uploaded file "testimage.mp3" to "testimage.mp3" in the server
    And user "Alice" has logged in using the webUI
    When the user views the file "testimage.mp3" in the preview app by clicking on the file name using the webUI
    Then the file "testimage.mp3" should be displayed in the preview app webUI


  Scenario: preview of mp3 file with preview app is possible
    Given user "Alice" has uploaded file "testimage.mp3" to "testimage.mp3" in the server
    And user "Alice" has logged in using the webUI
    When the user views the file "testimage.mp3" in the preview app using the webUI
    Then the file "testimage.mp3" should be displayed in the preview app webUI


  Scenario: preview of image in file list view for .jpeg format file
    Given user "Alice" has uploaded file "testavatar.jpeg" to "testavatar.jpeg" in the server
    And user "Alice" has logged in using the webUI
    When the user browses to the files page
    When the user views the file "testavatar.jpeg" in the preview app using the webUI
    Then the file "testavatar.jpeg" should be displayed in the preview app webUI

  @issue-ocis-1490 @issue-4667
  Scenario: preview of image in file list view for .ogg format file
    Given user "Alice" has uploaded file "sampleOgg.ogg" to "sampleOgg.ogg" in the server
    And user "Alice" has logged in using the webUI
    When the user browses to the files page
    When the user views the file "sampleOgg.ogg" in the preview app using the webUI
    Then the file "sampleOgg.ogg" should be displayed in the preview app webUI

  @issue-ocis-1490
  Scenario: preview of image in file list view for .gif format file
    Given user "Alice" has uploaded file "sampleGif.gif" to "sampleGif.gif" in the server
    And user "Alice" has logged in using the webUI
    When the user browses to the files page
    When the user views the file "sampleGif.gif" in the preview app using the webUI
    Then the file "sampleGif.gif" should be displayed in the preview app webUI

  @issue-ocis-1490 @issue-4667
  Scenario: preview of image in file list view for .webm format file
    Given user "Alice" has uploaded file "sampleWebm.webm" to "sampleWebm.webm" in the server
    And user "Alice" has logged in using the webUI
    When the user browses to the files page
    When the user views the file "sampleWebm.webm" in the preview app using the webUI
    Then the file "sampleWebm.webm" should be displayed in the preview app webUI


  Scenario Outline: preview of image files with extensions in UpperCase with preview app
    Given user "Alice" has uploaded file "<image-file>" to "<to-file-name>" in the server
    And user "Alice" has logged in using the webUI
    When the user browses to the files page
    When the user views the file "<to-file-name>" in the preview app by clicking on the file name using the webUI
    Then the file "<to-file-name>" should be displayed in the preview app webUI
    Examples:
      | image-file      | to-file-name    |
      | testavatar.jpg  | testavatar.JPG  |
      | testavatar.png  | testavatar.PNG  |
      | testavatar.jpeg | testavatar.JPEG |


  Scenario: Open jpeg file with preview app in shared-with-others page
    Given user "Brian" has been created with default attributes and without skeleton files in the server
    And user "Brian" has uploaded file "testavatar.jpeg" to "testavatar.jpeg" in the server
    And user "Brian" has shared file "testavatar.jpeg" with user "Alice" with "all" permissions in the server
    And user "Brian" has logged in using the webUI
    And the user browses to the shared-with-others page
    When the user views the file "testavatar.jpeg" in the preview app by clicking on the file name using the webUI
    Then the file "testavatar.jpeg" should be displayed in the preview app webUI


  Scenario: Open jpeg file with preview app in shared-with-me page
    Given user "Brian" has been created with default attributes and without skeleton files in the server
    And user "Brian" has uploaded file "testavatar.jpeg" to "testavatar.jpeg" in the server
    And user "Brian" has shared file "testavatar.jpeg" with user "Alice" with "all" permissions in the server
    And user "Alice" has logged in using the webUI
    And the user browses to the shared-with-me page
    When the user views the file "testavatar.jpeg" in the preview app by clicking on the file name using the webUI
    Then the file "testavatar.jpeg" should be displayed in the preview app webUI
