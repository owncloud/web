@notToImplementOnOCIS
Feature: accept/decline shares coming from internal users
  As a user
  I want to have control of which received shares I accept
  So that I can keep my file system clean

  Background:
    Given these users have been created with default attributes and without skeleton files:
      | username |
      | Alice    |
      | Brian    |
    And user "Brian" has logged in using the webUI

  Scenario: reject a share that you received as user and as group member
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And user "Alice" has created folder "/simple-folder"
    And these groups have been created:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1"
    And user "Alice" has shared folder "/simple-folder" with user "Brian"
    And user "Alice" has shared folder "/simple-folder" with group "grp1"
    When the user browses to the shared-with-me page in accepted shares view
    And the user declines share "simple-folder" offered by user "Alice Hansen" using the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    When the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI

  @issue-2512
  Scenario: reshare a share that you received to a group that you are member of
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And user "Alice" has created folder "/simple-folder"
    And user "Brian" has created folder "/simple-folder"
    And these groups have been created:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1"
    And user "Alice" has shared folder "/simple-folder" with user "Brian"
    And user "Brian" has accepted the share "simple-folder" offered by user "Alice"
    And the user has browsed to the files page
    When the user shares folder "simple-folder (2)" with group "grp1" as "Viewer" using the webUI
    And the user deletes folder "simple-folder (2)" using the webUI
    And the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder (2)" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And folder "simple-folder" shared by "Brian Murphy" should not be listed on the webUI
    And folder "simple-folder" should not be listed on the webUI

  @smokeTest
  Scenario: unshare an accepted share on the "All files" page
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And user "Alice" has created folder "/simple-folder"
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg"
    And these groups have been created:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1"
    And user "Alice" has shared folder "/simple-folder" with user "Brian"
    And user "Alice" has shared folder "/testimage.jpg" with group "grp1"
    And user "Brian" has accepted the share "simple-folder" offered by user "Alice"
    And user "Brian" has accepted the share "testimage.jpg" offered by user "Alice"
    And the user has browsed to the files page
    When the user deletes folder "simple-folder" using the webUI
    And the user deletes file "testimage.jpg" using the webUI
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI

  @smokeTest
  Scenario: Auto-accept shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes"
    And user "Alice" has created folder "/simple-folder"
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg"
    And these groups have been created:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1"
    And user "Alice" has shared folder "/simple-folder" with group "grp1"
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian"
    When the user reloads the current page of the webUI
    Then folder "simple-folder" should be listed on the webUI
    And file "testimage.jpg" should be listed on the webUI
    When the user browses to the shared-with-me page in accepted shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Accepted" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Accepted" state on the webUI

  Scenario: decline auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes"
    And user "Alice" has created folder "/simple-folder"
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg"
    And these groups have been created:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1"
    And user "Alice" has shared folder "/simple-folder" with group "grp1"
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian"
    And the user has browsed to the files page
    When the user deletes folder "simple-folder" using the webUI
    And the user deletes file "testimage.jpg" using the webUI
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI

  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes"
    And user "Alice" has created folder "/simple-folder"
    And user "Alice" has uploaded file "testavatar.jpg" to "/testimage.jpg"
    And these groups have been created:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1"
    And user "Alice" has shared folder "/simple-folder" with group "grp1"
    And user "Alice" has shared folder "/testimage.jpg" with user "Brian"
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder" using the webUI
    And the user unshares file "testimage.jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Declined" state on the webUI

  Scenario: unshare renamed shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes"
    And user "Alice" has created folder "/simple-folder"
    And user "Alice" has shared folder "simple-folder" with user "Brian" with "create, read, share, update" permissions
    And user "Brian" has renamed folder "simple-folder" to "simple-folder-renamed"
    And the user has reloaded the current page of the webUI
    When the user deletes folder "simple-folder-renamed" using the webUI
    Then folder "simple-folder-renamed" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder-renamed" shared by "Alice Hansen" should be in "Declined" state on the webUI

  Scenario: unshare moved shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes"
    And user "Alice" has created folder "/simple-folder"
    And user "Brian" has created folder "/simple-folder"
    And user "Brian" has created folder "/simple-folder/shared"
    And user "Alice" has shared folder "simple-folder" with user "Brian" with "create, read, share, update" permissions
    And user "Brian" has moved folder "/simple-folder (2)" to "/simple-folder/shared"
    And the user has reloaded the current page of the webUI
    When the user opens folder "simple-folder" using the webUI
    And the user deletes folder "shared" using the webUI
    Then folder "shared" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then folder "shared" shared by "Alice Hansen" should be in "Declined" state on the webUI

  Scenario: unshare renamed shares, accept it again
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes"
    And user "Alice" has created folder "/simple-folder"
    And user "Alice" has shared folder "/simple-folder" with user "Brian"
    And user "Brian" has renamed folder "/simple-folder" to "/simple-folder-renamed"
    And the user has reloaded the current page of the webUI
    When the user deletes folder "simple-folder-renamed" using the webUI
    And the user browses to the shared-with-me page in declined shares view
    And the user accepts share "simple-folder-renamed" offered by user "Alice Hansen" using the webUI
    When the user browses to the shared-with-me page in accepted shares view
    Then folder "simple-folder-renamed" shared by "Alice Hansen" should be in "Accepted" state on the webUI
    When the user browses to the files page
    Then folder "simple-folder-renamed" should be listed on the webUI

  Scenario: User receives files when auto accept share is disabled
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And user "Alice" has created file "lorem.txt"
    And user "Alice" has shared file "lorem.txt" with user "Brian"
    When the user browses to the shared-with-me page
    Then file "lorem.txt" shared by "Alice Hansen" should be in "Pending" state on the webUI
    When the user browses to the files page
    Then file "lorem.txt" should not be listed on the webUI

  Scenario: shared file is in pending state when the Automatically accept incoming shares is disabled
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And user "Alice" has created file "lorem.txt"
    And user "Alice" has shared file "lorem.txt" with user "Brian"
    When the user browses to the shared-with-me page
    Then file "lorem.txt" shared by "Alice Hansen" should be in "Pending" state on the webUI
    When the user browses to the files page
    Then file "lorem.txt" should not be listed on the webUI

  Scenario: receive shares with same name from different users
    Given user "Carol" has been created with default attributes and without skeleton files
    And the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And user "Alice" has created file "lorem.txt"
    And user "Carol" has created file "lorem.txt"
    And user "Carol" has shared file "lorem.txt" with user "Brian"
    And user "Alice" has shared file "lorem.txt" with user "Brian"
    When the user browses to the shared-with-me page
    Then file "lorem.txt" shared by "Alice Hansen" should be in "Pending" state on the webUI
    And file "lorem.txt" shared by "Carol King" should be in "Pending" state on the webUI

  Scenario: decline an offered (pending) share
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And user "Alice" has created file "lorem.txt"
    And user "Alice" has created file "testimage.jpg"
    And user "Alice" has shared file "lorem.txt" with user "Brian"
    And user "Alice" has shared file "testimage.jpg" with user "Brian"
    When the user browses to the shared-with-me page in accepted shares view
    And the user declines share "lorem.txt" offered by user "Alice Hansen" using the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then file "lorem.txt" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Pending" state on the webUI
    When the user browses to the files page
    Then file "lorem.txt" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI

  Scenario: accept an offered (pending) share
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And user "Alice" has created file "lorem.txt"
    And user "Alice" has created file "testimage.jpg"
    And user "Alice" has shared file "lorem.txt" with user "Brian"
    And user "Alice" has shared file "testimage.jpg" with user "Brian"
    When the user browses to the shared-with-me page in accepted shares view
    And the user accepts share "lorem.txt" offered by user "Alice Hansen" using the webUI
    Then file "lorem.txt" shared by "Alice Hansen" should be in "Accepted" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Pending" state on the webUI
    When the user browses to the files page
    Then file "lorem.txt" should be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI

  Scenario: accept a previously declined share
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And user "Alice" has created file "lorem.txt"
    And user "Alice" has created file "testimage.jpg"
    And user "Alice" has shared file "lorem.txt" with user "Brian"
    And user "Alice" has shared file "testimage.jpg" with user "Brian"
    And user "Brian" has declined the share "lorem.txt" offered by user "Alice"
    When the user browses to the shared-with-me page in declined shares view
    And the user accepts share "lorem.txt" offered by user "Alice Hansen" using the webUI
    And the user browses to the shared-with-me page in accepted shares view
    Then file "lorem.txt" shared by "Alice Hansen" should be in "Accepted" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Pending" state on the webUI
    When the user browses to the files page
    Then file "lorem.txt" should be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI

  Scenario: delete an accepted share
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And user "Alice" has created file "lorem.txt"
    And user "Alice" has created file "testimage.jpg"
    And user "Alice" has shared file "lorem.txt" with user "Brian"
    And user "Alice" has shared file "testimage.jpg" with user "Brian"
    And the user has browsed to the shared-with-me page
    When the user accepts share "lorem.txt" offered by user "Alice Hansen" using the webUI
    And the user browses to the files page
    And the user deletes file "lorem.txt" using the webUI
    Then file "lorem.txt" should not be listed on the webUI
    And file "testimage.jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then file "lorem.txt" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "Alice Hansen" should be in "Pending" state on the webUI

  @issue-3101
  Scenario: Decline multiple accepted shares at once from shared with me page
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And user "Alice" has been created with default attributes and without skeleton files
    And user "Alice" has created file "lorem.txt"
    And user "Alice" has created file "data.zip"
    And user "Alice" has created file "simple-folder"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Alice" has shared file "lorem.txt" with user "Brian"
    And user "Alice" has shared file "data.zip" with user "Brian"
    And user "Brian" has accepted the share "data.zip" offered by user "Alice"
    And user "Brian" has accepted the share "lorem.txt" offered by user "Alice"
    And user "Brian" has accepted the share "simple-folder" offered by user "Alice"
    When the user browses to the shared-with-me page in accepted shares view
    And the user batch declines these shares using the webUI
      | name          |
      | data.zip      |
      | lorem.txt     |
      | simple-folder |
    When the user browses to the shared-with-me page in declined shares view
    Then file "data.zip" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And file "lorem.txt" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI

  Scenario: shared file status is changed to declined when user deletes the file
    Given user "Alice" has created file "lorem.txt"
    And user "Alice" has shared file "lorem.txt" with user "Brian"
    And the user has reloaded the current page of the webUI
    When the user deletes file "lorem.txt" using the webUI
    And the user browses to the shared-with-me page in declined shares view
    Then file "lorem.txt" shared by "Alice Hansen" should be in "Declined" state on the webUI

  Scenario: the deleted shared file is restored back to all files list when accepted from the shared with me file list
    Given user "Alice" has created file "lorem.txt"
    And user "Alice" has shared file "lorem.txt" with user "Brian"
    And the following files have been deleted by user "Brian"
      | name          |
      | lorem.txt |
    When the user browses to the shared-with-me page in declined shares view
    And the user accepts share "lorem.txt" offered by user "Alice Hansen" using the webUI
    When the user browses to the shared-with-me page in accepted shares view
    Then file "lorem.txt" shared by "Alice Hansen" should be in "Accepted" state on the webUI
    When the user browses to the files page
    Then file "lorem.txt" should be listed on the webUI

  Scenario: receive shares with same name from different users, accept one by one
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And user "Carol" has been created with default attributes and without skeleton files
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
    And as "Brian" folder "from_Alice" should exist inside folder "/simple-folder"
    And as "Brian" folder "from_Carol" should exist inside folder "/simple-folder (2)"

  Scenario: accept a share that you received as user and as group member
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And  user "Alice" has created folder "/simple-folder"
    And these groups have been created:
      | groupname |
      | grp1      |
    And user "Brian" has been added to group "grp1"
    And user "Alice" has shared folder "/simple-folder" with user "Brian"
    And user "Alice" has shared folder "/simple-folder" with group "grp1"
    And the user has browsed to the shared-with-me page
    When the user accepts share "simple-folder" offered by user "Alice Hansen" using the webUI
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Accepted" state on the webUI
    When the user browses to the files page
    Then folder "simple-folder" should be listed on the webUI
