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
