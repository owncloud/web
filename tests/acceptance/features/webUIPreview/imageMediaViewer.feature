Feature: display image in media viewer on the webUI

  Scenario: preview of image with media viewer is possible
    Given user "user1" has been created with default attributes
    And user "user1" has uploaded file "testavatar.jpg" to "testavatar.jpg"
    And user "user1" has logged in using the webUI
    When the user views the file "testavatar.jpg" in the mediaviewer using the webUI
    Then the file "testavatar.jpg" should be displayed in the mediaViewer
