Feature: display image in media viewer on the webUI

  Background:
    Given user "user1" has been created with default attributes

  Scenario: preview of image with media viewer is possible
    Given user "user1" has uploaded file "testavatar.jpg" to "testavatar.jpg"
    And user "user1" has logged in using the webUI
    When the user views the file "testavatar.jpg" in the mediaviewer using the webUI
    Then the file "testavatar.jpg" should be displayed in the mediaViewer

  Scenario: preview of video with media viewer is possible
    Given user "user1" has uploaded file "test_video.mp4" to "test_video.mp4"
    And user "user1" has logged in using the webUI
    When the user views the file "test_video.mp4" in the mediaviewer using the webUI
    Then the file "test_video.mp4" should be displayed in the mediaViewer

  Scenario: video playback in public share
    Given user "user1" has uploaded file "test_video.mp4" to "simple-empty-folder/test_video.mp4"
    And user "user1" has created a public link with following settings
      | path | simple-empty-folder |
    When the public uses the webUI to access the last public link created by user "user1"
    And the public views the file "test_video.mp4" in the mediaviewer using the webUI
    Then the file "test_video.mp4" should be displayed in the mediaViewer

  Scenario: image preview in public share
    Given user "user1" has uploaded file "testavatar.jpg" to "simple-empty-folder/testavatar.jpg"
    And user "user1" has created a public link with following settings
      | path | simple-empty-folder |
    When the public uses the webUI to access the last public link created by user "user1"
    And the public views the file "testavatar.jpg" in the mediaviewer using the webUI
    Then the file "testavatar.jpg" should be displayed in the mediaViewer

  Scenario Outline: navigate to next and previous videos with media viewer is possible
    Given user "user1" has uploaded file "<resource-one>" to "<resource-one>"
    And user "user1" has uploaded file "<resource-two>" to "<resource-two>"
    And user "user1" has logged in using the webUI
    When the user views the file "<resource-one>" in the mediaviewer using the webUI
    And the user navigates to the next media resource using the webUI
    Then the file "<resource-two>" should be displayed in the mediaViewer
    When the user navigates to the previous media resource using the webUI
    Then the file "<resource-one>" should be displayed in the mediaViewer
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
    Then the file "testavatar.jpg" should not be displayed in the mediaViewer
    And the user should be in the root directory on the webUI
