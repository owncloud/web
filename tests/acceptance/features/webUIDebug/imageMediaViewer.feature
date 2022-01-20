Feature: display image in media viewer on the webUI

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files in the server

  Scenario: navigate to next and previous media resource with media viewer is possible
    Given user "Alice" has uploaded file "testavatar.jpg" to "testavatar.jpg" in the server
    And user "Alice" has uploaded file " testavatar.png" to " testavatar.png" in the server
    And user "Alice" has logged in using the webUI
    When the user views the file "testavatar.jpg" in the media viewer using the webUI
    And the user navigates to the next media resource using the webUI
    Then the file " testavatar.png" should be displayed in the media viewer webUI
    When the user navigates to the previous media resource using the webUI
    Then the file "testavatar.jpg" should be displayed in the media viewer webUI

  Scenario: navigate to next and previous media resource with media viewer is possible
    Given user "Alice" has uploaded file "testavatar.jpg" to "testavatar.jpg" in the server
    And user "Alice" has uploaded file " testavatar.png" to " testavatar.png" in the server
    And user "Alice" has logged in using the webUI
    When the user views the file "testavatar.jpg" in the media viewer using the webUI
    And the user navigates to the next media resource using the webUI
    Then the file " testavatar.png" should be displayed in the media viewer webUI
    When the user navigates to the previous media resource using the webUI
    Then the file "testavatar.jpg" should be displayed in the media viewer webUI

  Scenario: navigate to next and previous media resource with media viewer is possible
    Given user "Alice" has uploaded file "testavatar.jpg" to "testavatar.jpg" in the server
    And user "Alice" has uploaded file " testavatar.png" to " testavatar.png" in the server
    And user "Alice" has logged in using the webUI
    When the user views the file "testavatar.jpg" in the media viewer using the webUI
    And the user navigates to the next media resource using the webUI
    Then the file " testavatar.png" should be displayed in the media viewer webUI
    When the user navigates to the previous media resource using the webUI
    Then the file "testavatar.jpg" should be displayed in the media viewer webUI

  Scenario: navigate to next and previous media resource with media viewer is possible
    Given user "Alice" has uploaded file "testavatar.jpg" to "testavatar.jpg" in the server
    And user "Alice" has uploaded file " testavatar.png" to " testavatar.png" in the server
    And user "Alice" has logged in using the webUI
    When the user views the file "testavatar.jpg" in the media viewer using the webUI
    And the user navigates to the next media resource using the webUI
    Then the file " testavatar.png" should be displayed in the media viewer webUI
    When the user navigates to the previous media resource using the webUI
    Then the file "testavatar.jpg" should be displayed in the media viewer webUI

  Scenario: navigate to next and previous media resource with media viewer is possible
    Given user "Alice" has uploaded file "testavatar.jpg" to "testavatar.jpg" in the server
    And user "Alice" has uploaded file " testavatar.png" to " testavatar.png" in the server
    And user "Alice" has logged in using the webUI
    When the user views the file "testavatar.jpg" in the media viewer using the webUI
    And the user navigates to the next media resource using the webUI
    Then the file " testavatar.png" should be displayed in the media viewer webUI
    When the user navigates to the previous media resource using the webUI
    Then the file "testavatar.jpg" should be displayed in the media viewer webUI

  Scenario: navigate to next and previous media resource with media viewer is possible
    Given user "Alice" has uploaded file "testavatar.jpg" to "testavatar.jpg" in the server
    And user "Alice" has uploaded file " testavatar.png" to " testavatar.png" in the server
    And user "Alice" has logged in using the webUI
    When the user views the file "testavatar.jpg" in the media viewer using the webUI
    And the user navigates to the next media resource using the webUI
    Then the file " testavatar.png" should be displayed in the media viewer webUI
    When the user navigates to the previous media resource using the webUI
    Then the file "testavatar.jpg" should be displayed in the media viewer webUI
