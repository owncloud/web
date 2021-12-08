@notToImplementOnOCIS
Feature: accept/decline shares coming from internal users
  As a user
  I want to have control of which received shares I accept
  So that I can keep my file system clean

  Background:
    Given these users have been created with default attributes and without skeleton files in the server:
      | username |
      | Alice    |
      | Brian    |
    And user "Brian" has logged in using the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "/simple-folder" in the server
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg" in the server
    And these groups have been created in the server:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1" in the server
    And user "Alice" has shared folder "/simple-folder" with group "grp1" in the server
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian" in the server
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI
