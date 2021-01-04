Feature: display image in media viewer on the webUI

  Background:
    Given user "user1" has been created with default attributes

Scenario Outline: preview of image files with media viewer is possible
    Given user "user1" has uploaded file "<image-file>" to "<image-file>"
    And user "user1" has logged in using the webUI
    When the user views the file "<image-file>" in the media viewer using the webUI
    Then the file "<image-file>" should be displayed in the media viewer webUI
    Examples:
      | image-file      |
      | testavatar.jpg  |
      | testavatar.png  |
      | testavatar.jpeg |

  Scenario: preview of video with media viewer is possible
    Given user "user1" has uploaded file "test_video.mp4" to "test_video.mp4"
    And user "user1" has logged in using the webUI
    When the user views the file "test_video.mp4" in the media viewer using the webUI
    Then the file "test_video.mp4" should be displayed in the media viewer webUI


  Scenario: video playback in public share
    Given user "user1" has uploaded file "test_video.mp4" to "simple-empty-folder/test_video.mp4"
    And user "user1" has created a public link with following settings
      | path | simple-empty-folder |
    When the public uses the webUI to access the last public link created by user "user1"
    And the public views the file "test_video.mp4" in the media viewer using the webUI
    Then the file "test_video.mp4" should be displayed in the media viewer webUI

  @issue-4295
  Scenario: image preview in public share
    Given user "user1" has uploaded file "testavatar.jpg" to "simple-empty-folder/testavatar.jpg"
    And user "user1" has created a public link with following settings
      | path | simple-empty-folder |
    When the public uses the webUI to access the last public link created by user "user1"
    And the public views the file "testavatar.jpg" in the media viewer using the webUI
    Then the file "testavatar.jpg" should be displayed in the media viewer webUI


  Scenario Outline: navigate to next and previous media resource with media viewer is possible
    Given user "user1" has uploaded file "<resource-one>" to "<resource-one>"
    And user "user1" has uploaded file "<resource-two>" to "<resource-two>"
    And user "user1" has logged in using the webUI
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
    Given user "user1" has uploaded file "testavatar.jpg" to "testavatar.jpg"
    And user "user1" has logged in using the webUI
    And the user has viewed the file "testavatar.jpg" in the media viewer using the webUI
    When the user downloads the media resource using the webUI
    Then no message should be displayed on the webUI


  Scenario: closing media viewer is possible
    Given user "user1" has uploaded file "testavatar.jpg" to "testavatar.jpg"
    And user "user1" has logged in using the webUI
    And the user has viewed the file "testavatar.jpg" in the media viewer using the webUI
    When the user closes the media resource using the webUI
    Then the file "testavatar.jpg" should not be displayed in the media viewer webUI
    And the user should be in the root directory on the webUI


  Scenario: preview of image with media viewer by clicking on the file name
    Given user "user1" has uploaded file "testavatar.jpg" to "testavatar.jpg"
    And user "user1" has logged in using the webUI
    When the user views the file "testavatar.jpg" in the media viewer by clicking on the file name using the webUI
    Then the file "testavatar.jpg" should be displayed in the media viewer webUI


  Scenario: preview of mp3 file with media viewer by clicking on the file name
    Given user "user1" has uploaded file "testimage.mp3" to "testimage.mp3"
    And user "user1" has logged in using the webUI
    When the user views the file "testimage.mp3" in the media viewer by clicking on the file name using the webUI
    Then the file "testimage.mp3" should be displayed in the media viewer webUI


  Scenario: preview of mp3 file with media viewer is possible
    Given user "user1" has uploaded file "testimage.mp3" to "testimage.mp3"
    And user "user1" has logged in using the webUI
    When the user views the file "testimage.mp3" in the media viewer using the webUI
    Then the file "testimage.mp3" should be displayed in the media viewer webUI

  Scenario: preview of image in file list view
    Given user "user1" has uploaded file "testavatar.jpg" to "testavatar.jpg"
    And user "user1" has logged in using the webUI
    When the user browses to the files page
    Then the preview image of file "testavatar.jpg" should be displayed in the file list view on the webUI

  Scenario: preview of file in file list view when previews is disabled
    Given the property "disablePreviews" of "options" has been set to true in web config file
    And user "user1" has uploaded file "testavatar.jpg" to "testavatar.jpg"
    And user "user1" has logged in using the webUI
    When the user browses to the files page
    Then the preview image of file "testavatar.jpg" should not be displayed in the file list view on the webUI

  Scenario: file list view image preview in public share
    Given user "user1" has uploaded file "testavatar.jpg" to "simple-empty-folder/testavatar.jpg"
    And user "user1" has created a public link with following settings
      | path | simple-empty-folder |
    When the public uses the webUI to access the last public link created by user "user1"
    Then the preview image of file "testavatar.jpg" should be displayed in the file list view on the webUI

  Scenario: file list view image preview in public share when previews is disabled
    Given the property "disablePreviews" of "options" has been set to true in web config file
    And user "user1" has uploaded file "testavatar.jpg" to "simple-empty-folder/testavatar.jpg"
    And user "user1" has created a public link with following settings
      | path | simple-empty-folder |
    When the public uses the webUI to access the last public link created by user "user1"
    Then the preview image of file "testavatar.jpg" should not be displayed in the file list view on the webUI
