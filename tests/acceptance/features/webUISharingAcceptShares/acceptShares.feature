Feature: accept/decline shares coming from internal users
  As a user
  I want to have control of which received shares I accept
  So that I can keep my file system clean

  Background:
    Given these users have been created with default attributes:
      | username |
      | user1    |
      | user2    |
    And user "user2" has logged in using the webUI

  Scenario: reject a share that you received as user and as group member
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And these groups have been created:
      | groupname |
      | grp1      |
    And user "user2" has been added to group "grp1"
    And user "user1" has shared folder "/simple-folder" with user "user2"
    And user "user1" has shared folder "/simple-folder" with group "grp1"
    And the user has browsed to the shared-with-me page
    When the user declines share "simple-folder" offered by user "User One" using the webUI
    Then folder "simple-folder" shared by "User One" should be in "Declined" state on the webUI
    When the user browses to the files page
    Then folder "simple-folder (2)" should not be listed on the webUI

  @issue-2512
  Scenario: reshare a share that you received to a group that you are member of
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And these groups have been created:
      | groupname |
      | grp1      |
    And user "user2" has been added to group "grp1"
    And user "user1" has shared folder "/simple-folder" with user "user2"
    And user "user2" has accepted the share "simple-folder" offered by user "user1"
    And the user has browsed to the files page
    When the user shares folder "simple-folder (2)" with group "grp1" as "Viewer" using the webUI
    And the user unshares folder "simple-folder (2)" using the webUI
    And the user browses to the shared-with-me page using the webUI
    Then folder "simple-folder" shared by "User One" should be in "Declined" state on the webUI
    And folder "simple-folder" shared by "User Two" should be in "Pending" state on the webUI
   # And folder "simple-folder" shared by "User Two" should not be listed in the webUI
    And folder "simple-folder (2)" should not be listed on the webUI

  @smokeTest
  Scenario: unshare an accepted share on the "All files" page
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And these groups have been created:
      | groupname |
      | grp1      |
    And user "user2" has been added to group "grp1"
    And user "user1" has shared folder "/simple-folder" with user "user2"
    And user "user1" has shared folder "/testimage.jpg" with group "grp1"
    And user "user2" has accepted the share "simple-folder" offered by user "user1"
    And user "user2" has accepted the share "testimage.jpg" offered by user "user1"
    And the user has browsed to the files page
    When the user unshares folder "simple-folder (2)" using the webUI
    And the user unshares file "testimage (2).jpg" using the webUI
    Then folder "simple-folder (2)" should not be listed on the webUI
    And file "testimage (2).jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page using the webUI
    Then folder "simple-folder" shared by "User One" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "User One" should be in "Declined" state on the webUI

  @smokeTest
  Scenario: Auto-accept shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes"
    And these groups have been created:
      | groupname |
      | grp1      |
    And user "user2" has been added to group "grp1"
    And user "user1" has shared folder "/simple-folder" with group "grp1"
    And user "user1" has shared folder "/testimage.jpg" with user "user2"
    When the user browses to the files page
    Then folder "simple-folder (2)" should be listed on the webUI
    And file "testimage (2).jpg" should be listed on the webUI
    When the user browses to the shared-with-me page using the webUI
    Then folder "simple-folder (2)" shared by "User One" should be in "Accepted" state on the webUI
    And file "testimage (2).jpg" shared by "User One" should be in "Accepted" state on the webUI

  Scenario: decline auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes"
    And these groups have been created:
      | groupname |
      | grp1      |
    And user "user2" has been added to group "grp1"
    And user "user1" has shared folder "/simple-folder" with group "grp1"
    And user "user1" has shared folder "/testimage.jpg" with user "user2"
    And the user has browsed to the files page
    When the user deletes folder "simple-folder (2)" using the webUI
    And the user deletes file "testimage (2).jpg" using the webUI
    Then folder "simple-folder (2)" should not be listed on the webUI
    And file "testimage (2).jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page using the webUI
    Then folder "simple-folder" shared by "User One" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "User One" should be in "Declined" state on the webUI

  Scenario: unshare auto-accepted shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes"
    And these groups have been created:
      | groupname |
      | grp1      |
    And user "user2" has been added to group "grp1"
    And user "user1" has shared folder "/simple-folder" with group "grp1"
    And user "user1" has shared folder "/testimage.jpg" with user "user2"
    And the user has browsed to the shared-with-me page
    When the user unshares folder "simple-folder (2)" using the webUI
    And the user unshares file "testimage (2).jpg" using the webUI
    And the user browses to the files page
    Then folder "simple-folder (2)" should not be listed on the webUI
    And file "testimage (2).jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page using the webUI
    Then folder "simple-folder" shared by "User One" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "User One" should be in "Declined" state on the webUI

  Scenario: unshare renamed shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes"
    And user "user1" has shared folder "simple-folder" with user "user2" with "create, read, share, update" permissions
    And user "user2" has renamed folder "simple-folder (2)" to "simple-folder-renamed"
    And the user has reloaded the current page of the webUI
    When the user unshares folder "simple-folder-renamed" using the webUI
    Then folder "simple-folder-renamed" should not be listed on the webUI
    When the user browses to the shared-with-me page using the webUI
    Then folder "simple-folder" shared by "User One" should be in "Declined" state on the webUI

  Scenario: unshare moved shares
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes"
    And user "user1" has shared folder "simple-folder" with user "user2" with "create, read, share, update" permissions
    And user "user2" has moved folder "/simple-folder (2)" to "/simple-folder/shared"
    And the user has reloaded the current page of the webUI
    When the user opens folder "simple-folder" using the webUI
    And the user unshares folder "shared" using the webUI
    Then folder "shared" should not be listed on the webUI
    When the user browses to the shared-with-me page using the webUI
    Then folder "simple-folder" shared by "User One" should be in "Declined" state on the webUI

  Scenario: unshare renamed shares, accept it again
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes"
    And user "user1" has shared folder "/simple-folder" with user "user2"
    And user "user2" has renamed folder "/simple-folder (2)" to "/simple-folder-renamed"
    And the user has reloaded the current page of the webUI
    When the user unshares folder "simple-folder-renamed" using the webUI
    And the user browses to the shared-with-me page using the webUI
    And the user accepts share "simple-folder" offered by user "User One" using the webUI
    Then folder "simple-folder-renamed" shared by "User One" should be in "Accepted" state on the webUI
    When the user browses to the files page
    Then folder "simple-folder-renamed" should be listed on the webUI

  @skip @yetToImplement
  Scenario: User-based accepting is disabled while global is enabled
    Given the setting "Automatically accept new incoming local user shares" in the section "Sharing" has been enabled
    And user "user1" has logged in using the webUI
    And the user has browsed to the personal sharing settings page
    When the user disables automatically accepting new incoming local shares
    And user "user2" shares folder "/simple-folder" with group "grp1" using the sharing API
    And user "user2" shares file "/testimage.jpg" with user "user1" using the sharing API
    And the user browses to the files page
    Then folder "simple-folder (2)" should not be listed on the webUI
    And file "testimage (2).jpg" should not be listed on the webUI
    But folder "simple-folder" should be listed in the shared-with-you page on the webUI
    And file "testimage.jpg" should be listed in the shared-with-you page on the webUI
    And folder "simple-folder" should be in state "Pending" in the shared-with-you page on the webUI
    And file "testimage.jpg" should be in state "Pending" in the shared-with-you page on the webUI

  @skip @yetToImplement
  Scenario: User-based accepting is enabled while global is enabled
    Given the setting "Automatically accept new incoming local user shares" in the section "Sharing" has been enabled
    And user "user1" has logged in using the webUI
    And the user has browsed to the personal sharing settings page
    When the user enables automatically accepting new incoming local shares
    And user "user2" shares folder "/simple-folder" with group "grp1" using the sharing API
    And user "user2" shares file "/testimage.jpg" with user "user1" using the sharing API
    And the user browses to the files page
    Then folder "simple-folder (2)" should be listed on the webUI
    And file "testimage (2).jpg" should be listed on the webUI
    And folder "simple-folder (2)" should be listed in the shared-with-you page on the webUI
    And file "testimage (2).jpg" should be listed in the shared-with-you page on the webUI
    And folder "simple-folder (2)" should be in state "" in the shared-with-you page on the webUI
    And file "testimage (2).jpg" should be in state "" in the shared-with-you page on the webUI

  @skip @yetToImplement
  Scenario: User-based accepting checkbox is not visible while global is disabled
    Given the setting "Automatically accept new incoming local user shares" in the section "Sharing" has been disabled
    And user "user1" has logged in using the webUI
    And the user has browsed to the personal sharing settings page
    Then User-based auto accepting checkbox should not be displayed on the personal sharing settings page in the webUI

  @skip @yetToImplement
  Scenario: Admin disables auto-accept setting again after user enabled personal auto-accept setting
    Given the setting "Automatically accept new incoming local user shares" in the section "Sharing" has been enabled
    And user "user1" has logged in using the webUI
    And the user has browsed to the personal sharing settings page
    When the user disables automatically accepting new incoming local shares
    And the user enables automatically accepting new incoming local shares
    And the administrator disables the setting "Automatically accept new incoming local user shares" in the section "Sharing"
    And user "user2" shares folder "/simple-folder" with group "grp1" using the sharing API
    And user "user2" shares file "/testimage.jpg" with user "user1" using the sharing API
    And the user browses to the files page
    Then folder "simple-folder (2)" should not be listed on the webUI
    And file "testimage (2).jpg" should not be listed on the webUI
    And folder "simple-folder" should be listed in the shared-with-you page on the webUI
    And file "testimage.jpg" should be listed in the shared-with-you page on the webUI
    And folder "simple-folder" should be in state "Pending" in the shared-with-you page on the webUI
    And file "testimage.jpg" should be in state "Pending" in the shared-with-you page on the webUI

  Scenario: User receives files when auto accept share is disabled
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And user "user1" has shared file "lorem.txt" with user "user2"
    When the user browses to the shared-with-me page using the webUI
    Then file "lorem.txt" shared by "User One" should be in "Pending" state on the webUI
    When the user browses to the files page
    Then file "lorem (2).txt" should not be listed on the webUI

  Scenario: shared file is in pending state when the Automatically accept incoming shares is disabled
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And user "user1" has shared file "lorem.txt" with user "user2"
    When the user browses to the shared-with-me page using the webUI
    Then file "lorem.txt" shared by "User One" should be in "Pending" state on the webUI
    When the user browses to the files page
    Then file "lorem (2).txt" should not be listed on the webUI

  Scenario: receive shares with same name from different users
    Given user "user3" has been created with default attributes
    And the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And user "user3" has shared file "lorem.txt" with user "user2"
    And user "user1" has shared file "lorem.txt" with user "user2"
    When the user browses to the shared-with-me page using the webUI
    Then file "lorem.txt" shared by "User One" should be in "Pending" state on the webUI
    And file "lorem.txt" shared by "User Three" should be in "Pending" state on the webUI

  Scenario: decline an offered (pending) share
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And user "user1" has shared file "lorem.txt" with user "user2"
    And user "user1" has shared file "testimage.jpg" with user "user2"
    And the user has browsed to the shared-with-me page
    When the user declines share "lorem.txt" offered by user "User One" using the webUI
    Then file "lorem.txt" shared by "User One" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "User One" should be in "Pending" state on the webUI
    When the user browses to the files page
    Then file "lorem (2).txt" should not be listed on the webUI
    And file "testimage (2).jpg" should not be listed on the webUI

  Scenario: accept an offered (pending) share
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And user "user1" has shared file "lorem.txt" with user "user2"
    And user "user1" has shared file "testimage.jpg" with user "user2"
    And the user has browsed to the shared-with-me page
    When the user accepts share "lorem.txt" offered by user "User One" using the webUI
    Then file "lorem (2).txt" shared by "User One" should be in "Accepted" state on the webUI
    And file "testimage.jpg" shared by "User One" should be in "Pending" state on the webUI
    And the file "lorem (2).txt" shared by "User One" should be in "Accepted" state on the webUI after a page reload
    And the file "testimage.jpg" shared by "User One" should be in "Pending" state on the webUI after a page reload
    When the user browses to the files page
    Then file "lorem (2).txt" should be listed on the webUI
    And file "testimage (2).jpg" should not be listed on the webUI

  Scenario: accept a previously declined share
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And user "user1" has shared file "lorem.txt" with user "user2"
    And user "user1" has shared file "testimage.jpg" with user "user2"
    And user "user2" has declined the share "lorem.txt" offered by user "user1"
    And the user has browsed to the shared-with-me page
    When the user accepts share "lorem.txt" offered by user "User One" using the webUI
    Then file "lorem (2).txt" shared by "User One" should be in "Accepted" state on the webUI
    And file "testimage.jpg" shared by "User One" should be in "Pending" state on the webUI
    When the user browses to the files page
    Then file "lorem (2).txt" should be listed on the webUI
    And file "testimage (2).jpg" should not be listed on the webUI

  Scenario: delete an accepted share
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And user "user1" has shared file "lorem.txt" with user "user2"
    And user "user1" has shared file "testimage.jpg" with user "user2"
    And the user has browsed to the shared-with-me page
    When the user accepts share "lorem.txt" offered by user "User One" using the webUI
    And the user browses to the files page
    And the user deletes file "lorem (2).txt" using the webUI
    Then file "lorem (2).txt" should not be listed on the webUI
    And file "testimage (2).jpg" should not be listed on the webUI
    When the user browses to the shared-with-me page using the webUI
    Then file "lorem.txt" shared by "User One" should be in "Declined" state on the webUI
    And file "testimage.jpg" shared by "User One" should be in "Pending" state on the webUI

  Scenario:  shared file status is changed to declined when user deletes the file
    Given user "user1" has shared file "lorem.txt" with user "user2"
    And the user has reloaded the current page of the webUI
    When the user deletes file "lorem (2).txt" using the webUI
    And the user browses to the shared-with-me page
    Then file "lorem.txt" shared by "User One" should be in "Declined" state on the webUI

  Scenario: the deleted shared file is restored back to all files list when accepted from the shared with me file list
    Given user "user1" has shared file "lorem.txt" with user "user2"
    And the following files have been deleted by user "user2"
      | name          |
      | lorem (2).txt |
    And the user has browsed to the shared-with-me page
    When the user accepts share "lorem.txt" offered by user "User One" using the webUI
    Then the file "lorem (2).txt" shared by "User One" should not be in "Declined" state
    When the user browses to the files page
    Then file "lorem (2).txt" should be listed on the webUI

  Scenario: receive shares with same name from different users, accept one by one
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And user "user3" has been created with default attributes
    And user "user3" has created folder "/simple-folder/from_user3"
    And user "user3" has shared folder "/simple-folder" with user "user2"
    And user "user1" has created folder "/simple-folder/from_user1"
    And user "user1" has shared folder "/simple-folder" with user "user2"
    And the user has browsed to the shared-with-me page
    When the user accepts share "simple-folder" offered by user "User One" using the webUI
    Then folder "simple-folder (2)" shared by "User One" should be in "Accepted" state on the webUI
    When the user accepts share "simple-folder" offered by user "User Three" using the webUI
    Then folder "simple-folder (3)" shared by "User Three" should be in "Accepted" state on the webUI
    And as "user2" file "from_user1" should exist inside folder "/simple-folder (2)"
    And as "user2" file "from_user3" should exist inside folder "/simple-folder (3)"

  Scenario: accept a share that you received as user and as group member
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no"
    And these groups have been created:
      | groupname |
      | grp1      |
    And user "user2" has been added to group "grp1"
    And user "user1" has shared folder "/simple-folder" with user "user2"
    And user "user1" has shared folder "/simple-folder" with group "grp1"
    And the user has browsed to the shared-with-me page
    When the user accepts share "simple-folder" offered by user "User One" using the webUI
    Then folder "simple-folder (2)" shared by "User One" should be in "Accepted" state on the webUI
    When the user browses to the files page
    Then folder "simple-folder (2)" should be listed on the webUI
