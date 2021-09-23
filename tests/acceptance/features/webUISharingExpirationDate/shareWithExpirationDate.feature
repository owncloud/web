@smokeTest
Feature: Sharing files and folders with internal users with expiry date
  As a user
  I want to be able to set an expiry date on my shares
  So that I don't have to remember to unshare

  Background:
    Given these users have been created with default attributes and without skeleton files:
      | username |
      | Alice    |
      | Brian    |

  @notToImplementOnOCIS @skipOnOCIS
  Scenario: share a file with another internal user which should expire after 2 days
    Given user "Alice" has uploaded file "testavatar.jpg" to "testimage.jpg"
    And user "Alice" has logged in using the webUI
    When the user shares file "testimage.jpg" with user "Brian Murphy" which expires in "+2" days using the webUI
    Then user "Brian" should have received a share with target "testimage.jpg" and expiration date in 2 days
  
  @issue-4169
  Scenario: share a file with another internal user which should expire after 2 days with shares mounted in "Shares"
    Given the administrator has set the default folder for received shares to "Shares"
    And user "Alice" has uploaded file "testavatar.jpg" to "testimage.jpg"
    And user "Alice" has logged in using the webUI
    When the user shares file "testimage.jpg" with user "Brian Murphy" which expires in "+2" days using the webUI
    Then user "Brian" should have received a share with target "Shares/testimage.jpg" and expiration date in 2 days
