Feature: accept/decline shares coming from internal users
  As a user
  I want to have control of which received shares I accept
  So that I can keep my file system clean

  Background:
    Given the administrator has set the default folder for received shares to "Shares" in the server
    And these users have been created with default attributes and without skeleton files in the server:
      | username |
      | Alice    |
      | Brian    |
    And user "Brian" has logged in using the webUI


  Scenario: User receives files when auto accept share is disabled - oCIS behavior
    Given user "Alice" has created file "toshare.txt" in the server
    And user "Alice" has uploaded file with content "test" to "toshare.txt" in the server
    And user "Alice" has shared file "toshare.txt" with user "Brian" in the server
    When the user browses to the shared-with-me page
    Then file "toshare.txt" shared by "Alice Hansen" should be in "Accepted" state on the webUI
    When the user browses to the files page
    Then file "toshare.txt" should not be listed on the webUI
    And folder "Shares" should not be listed on the webUI


  Scenario: receive shares with same name from different users
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "Carol" has created file "lorem.txt" in the server
    And user "Alice" has created file "lorem.txt" in the server
    And user "Carol" has shared file "lorem.txt" with user "Brian" in the server
    And user "Alice" has shared file "lorem.txt" with user "Brian" in the server
    When the user browses to the shared-with-me page
    Then file "lorem (1).txt" shared by "Alice Hansen" should be in "Accepted" state on the webUI
    And file "lorem.txt" shared by "Carol King" should be in "Accepted" state on the webUI

  @ocisSmokeTest
  Scenario: decline an offered (pending) share
    Given user "Alice" has created file "toshare.txt" in the server
    And user "Alice" has created file "anotherfile.txt" in the server
    And user "Alice" has uploaded file with content "test" to "toshare.txt" in the server
    And user "Alice" has uploaded file with content "test" to "anotherfile.txt" in the server
    And user "Alice" has shared file "toshare.txt" with user "Brian" in the server
    And user "Alice" has shared file "anotherfile.txt" with user "Brian" in the server
    When the user browses to the shared-with-me page in accepted shares view
    And the user declines share "toshare.txt" offered by user "Alice Hansen" using the webUI
    And the user browses to the shared-with-me page in declined shares view
    Then file "toshare.txt" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "anotherfile.txt" shared by "Alice Hansen" should be in "Accepted" state on the webUI
    When the user browses to the files page
    Then file "toshare.txt" should not be listed on the webUI
    And file "anotherfile.txt" should not be listed on the webUI

  @issue-3101 @issue-4102
  Scenario: Decline multiple accepted shares at once from shared with me page
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created file "data.zip" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has shared folder "simple-folder" with user "Brian" in the server
    And user "Alice" has shared file "lorem.txt" with user "Brian" in the server
    And user "Alice" has shared file "data.zip" with user "Brian" in the server
    When the user browses to the shared-with-me page in accepted shares view
    And the user batch declines these shares using the webUI
      | name          |
      | data.zip      |
      | lorem.txt     |
      | simple-folder |
    And the user browses to the shared-with-me page in declined shares view
    Then file "data.zip" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "lorem.txt" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI

  @issue-3859
  Scenario: receive shares with same name from different users, accept one by one
    Given user "Carol" has been created with default attributes and without skeleton files in the server
    And user "Carol" has created folder "/simple-folder" in the server
    And user "Carol" has created folder "/simple-folder/from_Carol" in the server
    And user "Carol" has shared folder "/simple-folder" with user "Brian" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has created folder "/simple-folder/from_Alice" in the server
    And user "Alice" has shared folder "/simple-folder" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Accepted" state on the webUI
    Then folder "simple-folder (2)" shared by "Carol King" should be in "Accepted" state on the webUI
    And as "Brian" folder "from_Alice" should exist inside folder "/Shares/simple-folder" in the server
    And as "Brian" folder "from_Carol" should exist inside folder "/Shares/simple-folder (2)" in the server
