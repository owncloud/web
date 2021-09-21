Feature: display image in media viewer on the webUI

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files

@ocisSmokeTest
Scenario Outline: preview of image files with media viewer is possible
    Given user "Alice" has uploaded file "<image-file>" to "<image-file>"
    And user "Alice" has logged in using the webUI
    When the user views the file "<image-file>" in the media viewer using the webUI
    Then the file "<image-file>" should be displayed in the media viewer webUI
    Examples:
      | image-file      |
      | testavatar.jpg  |
      | testavatar.png  |
      | testavatar.jpeg |

  Scenario: preview of video with media viewer is possible
    Given user "Alice" has uploaded file "test_video.mp4" to "test_video.mp4"
    And user "Alice" has logged in using the webUI
    When the user views the file "test_video.mp4" in the media viewer using the webUI
    Then the file "test_video.mp4" should be displayed in the media viewer webUI


  Scenario: video playback in public share
    Given user "Alice" has created folder "simple-empty-folder"
    And user "Alice" has uploaded file "test_video.mp4" to "simple-empty-folder/test_video.mp4"
    And user "Alice" has created a public link with following settings
      | path | simple-empty-folder |
    When the public uses the webUI to access the last public link created by user "Alice"
    And the public views the file "test_video.mp4" in the media viewer using the webUI
    Then the file "test_video.mp4" should be displayed in the media viewer webUI


  Scenario: image preview in public share
    Given user "Alice" has created folder "simple-empty-folder"
    And user "Alice" has uploaded file "testavatar.jpg" to "simple-empty-folder/testavatar.jpg"
    And user "Alice" has created a public link with following settings
      | path | simple-empty-folder |
    When the public uses the webUI to access the last public link created by user "Alice"
    And the public views the file "testavatar.jpg" in the media viewer using the webUI
    Then the file "testavatar.jpg" should be displayed in the media viewer webUI


  Scenario Outline: navigate to next and previous media resource with media viewer is possible
    Given user "Alice" has uploaded file "<resource-one>" to "<resource-one>"
    And user "Alice" has uploaded file "<resource-two>" to "<resource-two>"
    And user "Alice" has logged in using the webUI
    When the user views the file "<resource-one>" in the media viewer using the webUI
    And the user navigates to the next media resource using the webUI
    Then the file "<resource-two>" should be displayed in the media viewer webUI
    When the user navigates to the previous media resource using the webUI
    Then the file "<resource-one>" should be displayed in the media viewer webUI
    Examples:
      | resource-one    | resource-two    |
      | test_video0.mp4 | test_video1.mp4 |
      | testavatar.jpg  | testavatar.png  |


  Scenario: downloading media resource is possible
    Given user "Alice" has uploaded file "testavatar.jpg" to "testavatar.jpg"
    And user "Alice" has logged in using the webUI
    And the user has viewed the file "testavatar.jpg" in the media viewer using the webUI
    When the user downloads the media resource using the webUI
    Then no message should be displayed on the webUI


  Scenario: closing media viewer is possible
    Given user "Alice" has uploaded file "testavatar.jpg" to "testavatar.jpg"
    And user "Alice" has logged in using the webUI
    And the user has viewed the file "testavatar.jpg" in the media viewer using the webUI
    When the user closes the media resource using the webUI
    Then the file "testavatar.jpg" should not be displayed in the media viewer webUI
    And the user should be in the root directory on the webUI


  Scenario: preview of image with media viewer by clicking on the file name
    Given user "Alice" has uploaded file "testavatar.jpg" to "testavatar.jpg"
    And user "Alice" has logged in using the webUI
    When the user views the file "testavatar.jpg" in the media viewer by clicking on the file name using the webUI
    Then the file "testavatar.jpg" should be displayed in the media viewer webUI


  Scenario: preview of mp3 file with media viewer by clicking on the file name
    Given user "Alice" has uploaded file "testimage.mp3" to "testimage.mp3"
    And user "Alice" has logged in using the webUI
    When the user views the file "testimage.mp3" in the media viewer by clicking on the file name using the webUI
    Then the file "testimage.mp3" should be displayed in the media viewer webUI


  Scenario: preview of mp3 file with media viewer is possible
    Given user "Alice" has uploaded file "testimage.mp3" to "testimage.mp3"
    And user "Alice" has logged in using the webUI
    When the user views the file "testimage.mp3" in the media viewer using the webUI
    Then the file "testimage.mp3" should be displayed in the media viewer webUI


  Scenario: preview of image in file list view
    Given user "Alice" has uploaded file "testavatar.jpg" to "testavatar.jpg"
    And user "Alice" has logged in using the webUI
    When the user browses to the files page
    Then the preview image of file "testavatar.jpg" should be displayed in the file list view on the webUI


  Scenario: preview of file in file list view when previews is disabled
    Given the property "disablePreviews" of "options" has been set to true in web config file
    And user "Alice" has uploaded file "testavatar.jpg" to "testavatar.jpg"
    And user "Alice" has logged in using the webUI
    When the user browses to the files page
    Then the preview image of file "testavatar.jpg" should not be displayed in the file list view on the webUI

  @issue-4856
  Scenario: file list view image preview in public share
    Given user "Alice" has created folder "simple-empty-folder"
    And user "Alice" has uploaded file "testavatar.jpg" to "simple-empty-folder/testavatar.jpg"
    And user "Alice" has created a public link with following settings
      | path | simple-empty-folder |
    When the public uses the webUI to access the last public link created by user "Alice"
    Then the preview image of file "testavatar.jpg" should be displayed in the file list view on the webUI


  Scenario: file list view image preview in public share when previews is disabled
    Given user "Alice" has created folder "simple-empty-folder"
    And the property "disablePreviews" of "options" has been set to true in web config file
    And user "Alice" has uploaded file "testavatar.jpg" to "simple-empty-folder/testavatar.jpg"
    And user "Alice" has created a public link with following settings
      | path | simple-empty-folder |
    When the public uses the webUI to access the last public link created by user "Alice"
    Then the preview image of file "testavatar.jpg" should not be displayed in the file list view on the webUI


  Scenario: preview of image in file list view for .jpeg format file
    Given user "Alice" has uploaded file "testavatar.jpeg" to "testavatar.jpeg"
    And user "Alice" has logged in using the webUI
    When the user browses to the files page
    Then the preview image of file "testavatar.jpeg" should be displayed in the file list view on the webUI
    When the user views the file "testavatar.jpeg" in the media viewer using the webUI
    Then the file "testavatar.jpeg" should be displayed in the media viewer webUI

  @issue-ocis-1490 @issue-4667
  Scenario: preview of image in file list view for .ogg format file
    Given user "Alice" has uploaded file "sampleOgg.ogg" to "sampleOgg.ogg"
    And user "Alice" has logged in using the webUI
    When the user browses to the files page
    Then the preview image of file "sampleOgg.ogg" should be displayed in the file list view on the webUI
    When the user views the file "sampleOgg.ogg" in the media viewer using the webUI
    Then the file "sampleOgg.ogg" should be displayed in the media viewer webUI

  @issue-ocis-1490
  Scenario: preview of image in file list view for .gif format file
    Given user "Alice" has uploaded file "sampleGif.gif" to "sampleGif.gif"
    And user "Alice" has logged in using the webUI
    When the user browses to the files page
    Then the preview image of file "sampleGif.gif" should be displayed in the file list view on the webUI
    When the user views the file "sampleGif.gif" in the media viewer using the webUI
    Then the file "sampleGif.gif" should be displayed in the media viewer webUI

  @issue-ocis-1490 @issue-4667
  Scenario: preview of image in file list view for .webm format file
    Given user "Alice" has uploaded file "sampleWebm.webm" to "sampleWebm.webm"
    And user "Alice" has logged in using the webUI
    When the user browses to the files page
    Then the preview image of file "sampleWebm.webm" should be displayed in the file list view on the webUI
    When the user views the file "sampleWebm.webm" in the media viewer using the webUI
    Then the file "sampleWebm.webm" should be displayed in the media viewer webUI


  Scenario Outline: preview of image files with extensions in UpperCase with media viewer
    Given user "Alice" has uploaded file "<image-file>" to "<to-file-name>"
    And user "Alice" has logged in using the webUI
    When the user browses to the files page
    Then the preview image of file "<to-file-name>" should be displayed in the file list view on the webUI
    When the user views the file "<to-file-name>" in the media viewer by clicking on the file name using the webUI
    Then the file "<to-file-name>" should be displayed in the media viewer webUI
    Examples:
      | image-file      | to-file-name    |
      | testavatar.jpg  | testavatar.JPG  |
      | testavatar.png  | testavatar.PNG  |
      | testavatar.jpeg | testavatar.JPEG |

  @issue-5324
  Scenario: Open jpeg file with media viewer in shared-with-others page
    Given user "Brian" has uploaded file "testavatar.jpeg" to "testavatar.jpeg"
    And user "Brian" has shared file "testavatar.jpeg" with user "Alice" with "all" permissions
    And user "Brian" has logged in using the webUI
    And the user browses to the shared-with-others page
    When the user views the file "testavatar.jpeg" in the media viewer by clicking on the file name using the webUI
    Then the file "testavatar.jpeg" should be displayed in the media viewer webUI

  @issue-5324
  Scenario: Open jpeg file with media viewer in shared-with-me page
    Given user "Brian" has uploaded file "testavatar.jpeg" to "testavatar.jpeg"
    And user "Brian" has shared file "testavatar.jpeg" with user "Alice" with "all" permissions
    And user "Alice" has accepted the share "testavatar.jpeg" offered by user "Brian"
    And user "Alice" has logged in using the webUI
    And the user browses to the shared-with-me page
    When the user views the file "testavatar.jpeg" in the media viewer by clicking on the file name using the webUI
    Then the file "testavatar.jpeg" should be displayed in the media viewer webUI
