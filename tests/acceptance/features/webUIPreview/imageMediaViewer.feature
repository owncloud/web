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
