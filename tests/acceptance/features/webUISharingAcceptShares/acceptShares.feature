Feature: accept/decline shares coming from internal users
  As a user
  I want to have control of which received shares I accept
  So that I can keep my file system clean

  Background:
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And the administrator has set the default folder for received shares to "Shares"
    And these users have been created with default attributes and without skeleton files:
      | username |
      | Alice    |
      | Brian    |
    And user "Brian" has logged in using the webUI

 @issue-ocis-1950
  Scenario: reject a share that you received as user and as group member
    Given these groups have been created:
      | groupname |
      | grp1      |
    And user "Alice" has created folder "/simple-folder"
    And user "Brian" has been added to group "grp1"
    And user "Alice" has shared folder "/simple-folder" with user "Brian"
    And user "Alice" has shared folder "/simple-folder" with group "grp1"
    And the user has browsed to the shared-with-me page
    When the user declines share "simple-folder" offered by user "Alice Hansen" using the webUI
    And the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    When the user browses to the files page
    Then folder "/Shares" should not be listed on the webUI

  @issue-2512 @issue-4102
  Scenario: reshare a share that you received to a group that you are member of
    Given these groups have been created:
      | groupname |
      | grp1      |
    And user "Alice" has created folder "/simple-folder"
    And user "Brian" has been added to group "grp1"
    And user "Alice" has shared folder "/simple-folder" with user "Brian"
    And user "Brian" has accepted the share "Shares/simple-folder" offered by user "Alice"
    And the user has browsed to the files page
    And the user opens folder "Shares" using the webUI
    When the user shares folder "simple-folder" with group "grp1" as "Viewer" using the webUI
    And the user deletes folder "simple-folder" using the webUI
    And the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And folder "simple-folder" shared by "Brian Murphy" should not be listed on the webUI
    And folder "simple-folder" should not be listed on the webUI

  @issue-4102 @issue-5531
  Scenario: unshare accepted shares from "All files" page
    Given these groups have been created:
      | groupname |
      | grp1      |
    And user "Alice" has uploaded file "testavatar.jpg" to "testimage.jpg"
    And user "Alice" has created folder "/simple-folder"
    And user "Brian" has been added to group "grp1"
    And user "Alice" has shared folder "/simple-folder" with user "Brian"
    And user "Alice" has shared file "/testimage.jpg" with group "grp1"
    And user "Brian" has accepted the share "Shares/simple-folder" offered by user "Alice"
    And user "Brian" has accepted the share "Shares/testimage.jpg" offered by user "Alice"
    And the user has browsed to the files page
    When the user opens folder "Shares" using the webUI
    And the user deletes folder "simple-folder" using the webUI
    And the user deletes file "testimage.jpg" using the webUI
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI


  Scenario: User receives files when auto accept share is disabled
    Given user "Alice" has created file "toshare.txt"
    And user "Alice" has uploaded file with content "test" to "toshare.txt"
    And user "Alice" has shared file "toshare.txt" with user "Brian"
    When the user browses to the shared-with-me page
    Then file "toshare.txt" shared by "Alice Hansen" should be in "Pending" state on the webUI
    When the user browses to the files page
    Then file "toshare.txt" should not be listed on the webUI
    And folder "Shares" should not be listed on the webUI


  Scenario: receive shares with same name from different users
    Given user "Carol" has been created with default attributes and without skeleton files
    And user "Carol" has created file "lorem.txt"
    And user "Alice" has created file "lorem.txt"
    And user "Carol" has shared file "lorem.txt" with user "Brian"
    And user "Alice" has shared file "lorem.txt" with user "Brian"
    When the user browses to the shared-with-me page
    Then file "lorem.txt" shared by "Alice Hansen" should be in "Pending" state on the webUI
    And file "lorem.txt" shared by "Carol King" should be in "Pending" state on the webUI

  @ocisSmokeTest
  Scenario: decline an offered (pending) share
    Given user "Alice" has created file "toshare.txt"
    And user "Alice" has created file "anotherfile.txt"
    And user "Alice" has uploaded file with content "test" to "toshare.txt"
    And user "Alice" has uploaded file with content "test" to "anotherfile.txt"
    And user "Alice" has shared file "toshare.txt" with user "Brian"
    And user "Alice" has shared file "anotherfile.txt" with user "Brian"
    When the user browses to the shared-with-me page in accepted shares view
    And the user declines share "toshare.txt" offered by user "Alice Hansen" using the webUI
    And the user browses to the shared-with-me page in declined shares view
    Then file "toshare.txt" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "anotherfile.txt" shared by "Alice Hansen" should be in "Pending" state on the webUI
    When the user browses to the files page
    Then file "toshare.txt" should not be listed on the webUI
    And file "anotherfile.txt" should not be listed on the webUI

  @ocisSmokeTest
  Scenario: accept an offered (pending) share
    Given user "Alice" has created file "toshare.txt"
    And user "Alice" has created file "anotherfile.txt"
    And user "Alice" has uploaded file with content "test" to "toshare.txt"
    And user "Alice" has uploaded file with content "test" to "anotherfile.txt"
    And user "Alice" has shared file "toshare.txt" with user "Brian"
    And user "Alice" has shared file "anotherfile.txt" with user "Brian"
    And the user has browsed to the shared-with-me page
    When the user accepts share "toshare.txt" offered by user "Alice Hansen" using the webUI
    Then file "toshare.txt" shared by "Alice Hansen" should be in "Accepted" state on the webUI
    And file "anotherfile.txt" shared by "Alice Hansen" should be in "Pending" state on the webUI
    When the user browses to the files page
    And the user opens folder "Shares" using the webUI
    Then file "toshare.txt" should be listed on the webUI
    And file "anotherfile.txt" should not be listed on the webUI



  Scenario: accept a previously declined share
    Given user "Alice" has created file "lorem.txt"
    And user "Alice" has uploaded file "testavatar.jpg" to "testimage.jpg"
    And user "Alice" has shared file "lorem.txt" with user "Brian"
    And user "Alice" has shared file "testimage.jpg" with user "Brian"
    And user "Brian" has declined the share "Shares/lorem.txt" offered by user "Alice"
    When the user browses to the shared-with-me page in declined shares view
    And the user accepts share "lorem.txt" offered by user "Alice Hansen" using the webUI
    When the user browses to the shared-with-me page in accepted shares view
    Then file "lorem.txt" shared by "Alice Hansen" should be in "Accepted" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Pending" state on the webUI
    When the user browses to the files page
    And the user opens folder "Shares" using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI

  @issue-4102 @issue-5531
  Scenario: delete an accepted share
    Given user "Alice" has created file "lorem.txt"
    And user "Alice" has uploaded file "testavatar.jpg" to "testimage.jpg"
    And user "Alice" has shared file "lorem.txt" with user "Brian"
    And user "Alice" has shared file "testimage.jpg" with user "Brian"
    And the user has browsed to the shared-with-me page
    When the user accepts share "lorem.txt" offered by user "Alice Hansen" using the webUI
    And the user browses to the files page
    And the user opens folder "Shares" using the webUI
    And the user deletes file "lorem.txt" using the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then file "lorem.txt" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Pending" state on the webUI

  @issue-3101 @issue-4102
  Scenario: Decline multiple accepted shares at once from shared with me page
    Given user "Alice" has created file "lorem.txt"
    And user "Alice" has created file "data.zip"
    And user "Alice" has created folder "simple-folder"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Alice" has shared file "lorem.txt" with user "Brian"
    And user "Alice" has shared file "data.zip" with user "Brian"
    And user "Brian" has accepted the share "Shares/data.zip" offered by user "Alice"
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Alice"
    And user "Brian" has accepted the share "Shares/simple-folder" offered by user "Alice"
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

  @issue-4102 @issue-5531
  Scenario: shared file status is changed to declined when user deletes the file
    Given user "Alice" has created file "lorem.txt"
    And user "Alice" has shared file "lorem.txt" with user "Brian"
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Alice"
    And the user has reloaded the current page of the webUI
    And the user opens folder "Shares" using the webUI
    When the user deletes file "lorem.txt" using the webUI
    And the user browses to the shared-with-me page in declined shares view
    Then file "lorem.txt" shared by "Alice Hansen" should be in "Declined" state on the webUI

  @ocis-issue-714 @issue-5532
  Scenario: the deleted shared file is restored back to all files list when accepted from the shared with me file list
    Given user "Alice" has created file "lorem.txt"
    And user "Alice" has shared file "lorem.txt" with user "Brian"
    And user "Brian" has accepted the share "Shares/lorem.txt" offered by user "Alice"
    And the following files have been deleted by user "Brian"
      | name             |
      | Shares/lorem.txt |
    When the user browses to the shared-with-me page in declined shares view
    And the user accepts share "lorem.txt" offered by user "Alice Hansen" using the webUI
    And the user browses to the shared-with-me page in accepted shares view
    Then file "lorem.txt" shared by "Alice Hansen" should be in "Accepted" state on the webUI
    When the user browses to the files page
    And the user opens folder "Shares" using the webUI
    Then file "lorem.txt" should be listed on the webUI

  @ocis-issue-713
  Scenario: receive shares with same name from different users, accept one by one
    Given user "Carol" has been created with default attributes and without skeleton files
    And user "Carol" has created folder "/simple-folder"
    And user "Carol" has created folder "/simple-folder/from_Carol"
    And user "Carol" has shared folder "/simple-folder" with user "Brian"
    And user "Alice" has created folder "/simple-folder"
    And user "Alice" has created folder "/simple-folder/from_Alice"
    And user "Alice" has shared folder "/simple-folder" with user "Brian"
    And the user has browsed to the shared-with-me page
    When the user accepts share "simple-folder" offered by user "Alice Hansen" using the webUI
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Accepted" state on the webUI
    When the user accepts share "simple-folder" offered by user "Carol King" using the webUI
    Then folder "simple-folder (2)" shared by "Carol King" should be in "Accepted" state on the webUI
    And as "Brian" folder "from_Alice" should exist inside folder "/Shares/simple-folder"
    And as "Brian" folder "from_Carol" should exist inside folder "/Shares/simple-folder (2)"

  @issue-ocis-1950
  Scenario: accept a share that you received as user and as group member
    Given these groups have been created:
      | groupname |
      | grp1      |
    And user "Alice" has created folder "/simple-folder"
    And user "Brian" has been added to group "grp1"
    And user "Alice" has shared folder "/simple-folder" with user "Brian"
    And user "Alice" has shared folder "/simple-folder" with group "grp1"
    And the user has browsed to the shared-with-me page
    When the user accepts share "simple-folder" offered by user "Alice Hansen" using the webUI
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Accepted" state on the webUI
    When the user browses to the files page
    And the user opens folder "Shares" using the webUI
    Then folder "simple-folder" should be listed on the webUI
