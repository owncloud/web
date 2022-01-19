Feature: Locks
  As a user
  I would like to be able to see what locks are on files and folders
  So that I can understand who has which resources locked

  Background:
    #do not set email, see bugs in https://github.com/owncloud/core/pull/32250#issuecomment-434615887
    Given these users have been created with default attributes and without skeleton files in the server:
      | username       | displayname |
      | brand-new-user | New User    |
    And user "brand-new-user" has created folder "simple-folder" in the server
    And user "brand-new-user" has created folder "simple-empty-folder" in the server
    And user "brand-new-user" has created file "simple-folder/lorem.txt" in the server
    And user "brand-new-user" has created file "lorem.txt" in the server
    And user "brand-new-user" has uploaded file "data.zip" to "data.zip" in the server
    And user "brand-new-user" has uploaded file "data.zip" to "data.tar.gz" in the server
    And user "brand-new-user" has logged in using the webUI

  @issue-5417
  Scenario: setting a lock shows the lock symbols at the correct files/folders
    Given user "brand-new-user" has locked folder "simple-folder" setting the following properties in the server
      | lockscope | shared |
    And user "brand-new-user" has locked file "data.zip" setting the following properties in the server
      | lockscope | exclusive |
    When the user browses to the files page
    Then folder "simple-folder" should be marked as locked on the webUI
    And file "data.zip" should be marked as locked on the webUI
    But folder "simple-empty-folder" should not be marked as locked on the webUI
    And file "data.tar.gz" should not be marked as locked on the webUI

  @issue-5417
  Scenario: setting a lock shows the display name of a user in the locking details
    Given user "brand-new-user" has locked folder "simple-folder" setting the following properties in the server
      | lockscope | shared |
    And user "brand-new-user" has locked file "data.zip" setting the following properties in the server
      | lockscope | exclusive |
    When the user re-logs in as "brand-new-user" using the webUI
    Then folder "simple-folder" should be marked as locked by user "New User" in the locks tab of the details panel on the webUI
    And file "data.zip" should be marked as locked by user "New User" in the locks tab of the details panel on the webUI

  @issue-5417
  Scenario: setting a lock shows the current changed display name of a user in the locking details
    Given user "brand-new-user" has locked folder "simple-folder" setting the following properties in the server
      | lockscope | shared |
    And user "brand-new-user" has locked file "data.zip" setting the following properties in the server
      | lockscope | exclusive |
    And the administrator has changed the display name of user "brand-new-user" to "Old User"
    When the user re-logs in as "brand-new-user" using the webUI
    Then folder "simple-folder" should be marked as locked by user "Old User" in the locks tab of the details panel on the webUI
    And file "data.zip" should be marked as locked by user "Old User" in the locks tab of the details panel on the webUI

  @issue-5417
  Scenario: setting a lock shows the display name of a user in the locking details (user has set email address)
    Given these users have been created with default attributes and without skeleton files in the server:
      | username               | displayname   | email       |
      | user-with-display-name | My fancy name | mail@oc.org |
    And user "user-with-display-name" has locked folder "simple-folder" setting the following properties in the server
      | lockscope | shared |
    And user "user-with-display-name" has locked file "data.zip" setting the following properties in the server
      | lockscope | exclusive |
    When the user re-logs in as "user-with-display-name" using the webUI
    Then folder "simple-folder" should be marked as locked by user "My fancy name (mail@oc.org)" in the locks tab of the details panel on the webUI
    And file "data.zip" should be marked as locked by user "My fancy name (mail@oc.org)" in the locks tab of the details panel on the webUI

  @issue-5417
  Scenario: setting a lock shows the user name of a user in the locking details (user has set email address)
    Given these users have been created with default attributes and without skeleton files in the server:
      | username        | email       |
      | user-with-email | mail@oc.org |
    And user "user-with-email" has locked folder "simple-folder" setting the following properties in the server
      | lockscope | shared |
    And user "user-with-email" has locked file "data.zip" setting the following properties in the server
      | lockscope | exclusive |
    When the user re-logs in as "user-with-email" using the webUI
    Then folder "simple-folder" should be marked as locked by user "user-with-email (mail@oc.org)" in the locks tab of the details panel on the webUI
    And file "data.zip" should be marked as locked by user "user-with-email (mail@oc.org)" in the locks tab of the details panel on the webUI

  @issue-5417
  Scenario: setting a lock shows the lock symbols at the correct files/folders on the favorites page
    Given user "brand-new-user" has locked folder "simple-folder" setting the following properties in the server
      | lockscope | shared |
    And user "brand-new-user" has locked file "data.zip" setting the following properties in the server
      | lockscope | exclusive |
    When the user marks folder "simple-folder" as favorite using the webUI
    And the user marks folder "simple-empty-folder" as favorite using the webUI
    And the user marks file "data.zip" as favorite using the webUI
    And the user marks file "data.tar.gz" as favorite using the webUI
    And the user browses to the favorites page
    Then folder "simple-folder" should be marked as locked on the webUI
    And folder "simple-folder" should be marked as locked by user "brand-new-user" in the locks tab of the details panel on the webUI
    But folder "simple-empty-folder" should not be marked as locked on the webUI
    And file "data.zip" should be marked as locked on the webUI
    And file "data.zip" should be marked as locked by user "brand-new-user" in the locks tab of the details panel on the webUI
    But file "data.tar.gz" should not be marked as locked on the webUI

  @issue-5417
  Scenario: setting a lock shows the lock symbols at the correct files/folders on the shared-with-others page
    Given these users have been created with default attributes and without skeleton files in the server:
      | username |
      | receiver |
    And user "brand-new-user" has locked folder "simple-folder" setting the following properties in the server
      | lockscope | shared |
    And user "brand-new-user" has locked file "data.zip" setting the following properties in the server
      | lockscope | exclusive |
    And user "brand-new-user" has shared file "data.zip" with user "receiver" in the server
    And user "brand-new-user" has shared file "data.tar.gz" with user "receiver" in the server
    And user "brand-new-user" has shared folder "simple-folder" with user "receiver" in the server
    And user "brand-new-user" has shared folder "simple-empty-folder" with user "receiver" in the server
    When the user browses to the shared-with-others page
    Then folder "simple-folder" should be marked as locked on the webUI
    And folder "simple-folder" should be marked as locked on the webUIAnd folder "simple-folder" should be marked as locked by user "brand-new-user" in the locks tab of the details panel on the webUI
    And file "data.zip" should be marked as locked on the webUI
    And file "data.zip" should be marked as locked on the webUIAnd file "data.zip" should be marked as locked by user "brand-new-user" in the locks tab of the details panel on the webUI
    But folder "simple-empty-folder" should not be marked as locked on the webUI
    And file "data.tar.gz" should not be marked as locked on the webUI

  @issue-5417
  Scenario: setting a lock shows the lock symbols at the correct files/folders on the shared-by-link page
    Given user "brand-new-user" has locked folder "simple-folder" setting the following properties in the server
      | lockscope | shared |
    And user "brand-new-user" has locked file "data.zip" setting the following properties in the server
      | lockscope | exclusive |
    And user "brand-new-user" has created a public link with following settings in the server
      | path        | data.zip |
      | permissions | read     |
    And user "brand-new-user" has created a public link with following settings in the server
      | path        | data.tar.gz |
      | permissions | read        |
    And user "brand-new-user" has created a public link with following settings in the server
      | path        | simple-folder |
      | permissions | read          |
    And user "brand-new-user" has created a public link with following settings in the server
      | path        | simple-empty-folder |
      | permissions | read                |
    When the user browses to the shared-via-link page using the webUI
    Then folder "simple-folder" should be marked as locked on the webUI
    And folder "simple-folder" should be marked as locked by user "brand-new-user" in the locks tab of the details panel on the webUI
    But folder "simple-empty-folder" should not be marked as locked on the webUI
    And file "data.zip" should be marked as locked on the webUI
    And file "data.zip" should be marked as locked by user "brand-new-user" in the locks tab of the details panel on the webUI
    But file "data.tar.gz" should not be marked as locked on the webUI

  @issue-5417
  Scenario: setting a lock shows the lock symbols at the correct files/folders on the shared-with-you page
    Given these users have been created with default attributes and without skeleton files in the server:
      | username |
      | sharer   |
    And user "sharer" has created folder "simple-folder" in the server
    And user "sharer" has created folder "simple-empty-folder" in the server
    And user "sharer" has uploaded file "data.zip" to "data.zip" in the server
    And user "sharer" has uploaded file "data.zip" to "data.tar.gz" in the server
    And user "sharer" has locked folder "simple-folder" setting the following properties in the server
      | lockscope | shared |
    And user "sharer" has locked file "data.zip" setting the following properties in the server
      | lockscope | exclusive |
    And user "sharer" has shared file "data.zip" with user "brand-new-user" in the server
    And user "sharer" has shared file "data.tar.gz" with user "brand-new-user" in the server
    And user "sharer" has shared folder "simple-folder" with user "brand-new-user" in the server
    And user "sharer" has shared folder "simple-empty-folder" with user "brand-new-user" in the server
    When the user browses to the shared-with-me page
    Then folder "simple-folder (2)" should be marked as locked on the webUI
    And folder "simple-folder (2)" should be marked as locked by user "brand-new-user" in the locks tab of the details panel on the webUI
    But folder "simple-empty-folder (2)" should not be marked as locked on the webUI
    And file "data (2).zip" should be marked as locked on the webUI
    And file "data (2).zip" should be marked as locked by user "brand-new-user" in the locks tab of the details panel on the webUI
    But file "data.tar (2).gz" should not be marked as locked on the webUI

  @issue-5417
  Scenario: clicking other tabs does not change the lock symbol
    When the user opens the share dialog for folder "simple-folder" using the webUI
    Then folder "simple-folder" should not be marked as locked on the webUI

  @issue-5417
  Scenario: lock set on a shared file shows the lock information for all involved users
    Given these users have been created with default attributes and without skeleton files in the server:
      | username  |
      | sharer    |
      | receiver  |
      | receiver2 |
    And user "sharer" has uploaded file "data.zip" to "data.zip" in the server
    And user "sharer" has uploaded file "data.zip" to "data.tar.gz" in the server
    And group "receiver-group" has been created in the server
    And user "receiver2" has been added to group "receiver-group" in the server
    And user "sharer" has shared file "data.zip" with user "receiver" in the server
    And user "sharer" has shared file "data.tar.gz" with group "receiver-group" in the server
    And user "receiver" has shared file "data.zip" with user "brand-new-user" in the server
    And user "sharer" has locked file "data.zip" setting the following properties in the server
      | lockscope | shared |
    And user "receiver" has locked file "data.zip" setting the following properties in the server
      | lockscope | shared |
    And user "brand-new-user" has locked file "data (2).zip" setting the following properties in the server
      | lockscope | shared |
    And user "receiver2" has locked file "data.tar.gz" setting the following properties in the server
      | lockscope | shared |
    When the user browses to the files page
    Then file "data (2).zip" should be marked as locked on the webUI
    And file "data (2).zip" should be marked as locked by user "sharer" in the locks tab of the details panel on the webUI
    And file "data (2).zip" should be marked as locked by user "receiver" in the locks tab of the details panel on the webUI
    And file "data (2).zip" should be marked as locked by user "brand-new-user" in the locks tab of the details panel on the webUI
    But file "data.zip" should not be marked as locked on the webUI
    When the user re-logs in as "sharer" using the webUI
    Then file "data.zip" should be marked as locked on the webUI
    And file "data.zip" should be marked as locked by user "sharer" in the locks tab of the details panel on the webUI
    And file "data.zip" should be marked as locked by user "receiver" in the locks tab of the details panel on the webUI
    And file "data.zip" should be marked as locked by user "brand-new-user" in the locks tab of the details panel on the webUI
    And file "data.tar.gz" should be marked as locked on the webUI
    And file "data.tar.gz" should be marked as locked by user "receiver2" in the locks tab of the details panel on the webUI
    When the user re-logs in as "receiver2" using the webUI
    Then file "data.tar.gz" should be marked as locked on the webUI
    And file "data.tar.gz" should be marked as locked by user "receiver2" in the locks tab of the details panel on the webUI

  @issue-5417
  Scenario: setting a lock on a folder shows the symbols at the sub-elements
    Given user "brand-new-user" has created folder "simple-folder/simple-empty-folder" in the server
    And user "brand-new-user" has uploaded file "data.zip" to "simple-folder/data.zip" in the server
    And user "brand-new-user" has locked folder "simple-folder" setting the following properties in the server
      | lockscope | shared |
    When the user opens folder "simple-folder" using the webUI
    Then folder "simple-empty-folder" should be marked as locked on the webUI
    And folder "simple-empty-folder" should be marked as locked by user "brand-new-user" in the locks tab of the details panel on the webUI
    And file "data.zip" should be marked as locked on the webUI
    And file "data.zip" should be marked as locked by user "brand-new-user" in the locks tab of the details panel on the webUI

  @issue-5417
  Scenario: setting a depth:0 lock on a folder does not show the symbols at the sub-elements
    Given user "brand-new-user" has created folder "simple-folder/simple-empty-folder" in the server
    And user "brand-new-user" has uploaded file "data.zip" to "simple-folder/data.zip" in the server
    And user "brand-new-user" has locked folder "simple-folder" setting the following properties in the server
      | depth | 0 |
    When the user browses to the files page
    Then folder "simple-folder" should be marked as locked on the webUI
    When the user opens folder "simple-folder" using the webUI
    Then folder "simple-empty-folder" should not be marked as locked on the webUI
    And file "data.zip" should not be marked as locked on the webUI

  @issue-5417
  Scenario Outline: decline locked folder
    Given these users have been created with default attributes and without skeleton files in the server:
      | username |
      | sharer   |
    And user "sharer" has created folder "/to-share-folder" in the server
    And user "sharer" has locked folder "to-share-folder" setting the following properties in the server
      | lockscope | <lockscope> |
    And user "sharer" has shared folder "to-share-folder" with user "brand-new-user" in the server
    And the user has browsed to the shared-with-me page
    When the user declines share "to-share-folder" offered by user "sharer" using the webUI
    And the user browses to the files page
    Then folder "to-share-folder" should not be listed on the webUI
    When the user re-logs in as "sharer" using the webUI
    Then folder "to-share-folder" should be listed on the webUI
    And folder "to-share-folder" should be marked as locked on the webUI
    Examples:
      | lockscope |
      | exclusive |
      | shared    |

  @issue-5417
  Scenario Outline: accept previously declined locked folder
    Given these users have been created with default attributes and without skeleton files in the server:
      | username |
      | sharer   |
    And user "sharer" has created folder "/to-share-folder" in the server
    And user "sharer" has locked folder "to-share-folder" setting the following properties in the server
      | lockscope | <lockscope> |
    And user "sharer" has shared folder "to-share-folder" with user "brand-new-user" in the server
    And the user has browsed to the shared-with-me page
    When the user declines share "to-share-folder" offered by user "sharer" using the webUI
    And the user accepts share "to-share-folder" offered by user "sharer" using the webUI
    And the user browses to the files page
    Then folder "to-share-folder" should be marked as locked on the webUI
    And folder "to-share-folder" should be marked as locked by user "sharer" in the locks tab of the details panel on the webUI
    Examples:
      | lockscope |
      | exclusive |
      | shared    |

  @issue-5417
  Scenario Outline: accept previously declined locked folder but create a folder with same name in between
    Given these users have been created with default attributes and without skeleton files in the server:
      | username |
      | sharer   |
    And user "sharer" has created folder "/to-share-folder" in the server
    And user "sharer" has locked folder "to-share-folder" setting the following properties in the server
      | lockscope | <lockscope> |
    And user "sharer" has shared folder "to-share-folder" with user "brand-new-user" in the server
    And the user has browsed to the shared-with-me page
    When the user declines share "to-share-folder" offered by user "sharer" using the webUI
    And the user browses to the files page
    And the user creates a folder with the name "to-share-folder" using the webUI
    And the user browses to the shared-with-me page
    And the user accepts share "to-share-folder" offered by user "sharer" using the webUI
    And the user browses to the files page
    Then folder "to-share-folder (2)" should be marked as locked on the webUI
    And folder "to-share-folder (2)" should be marked as locked by user "sharer" in the locks tab of the details panel on the webUI
    But folder "to-share-folder" should not be marked as locked on the webUI
    Examples:
      | lockscope |
      | exclusive |
      | shared    |

  @issue-5417
  Scenario Outline: creating a subfolder structure that is the same as the structure of a declined & locked share
    Given these users have been created with default attributes and without skeleton files in the server:
      | username |
      | sharer   |
    And user "sharer" has created folder "/parent" in the server
    And user "sharer" has created folder "/parent/subfolder" in the server
    And user "sharer" has locked folder "parent" setting the following properties in the server
      | lockscope | <lockscope> |
    And user "sharer" has shared folder "parent" with user "brand-new-user" in the server
    And the user has browsed to the shared-with-me page
    When the user declines share "parent" offered by user "sharer" using the webUI
    And the user browses to the files page
    And the user creates a folder with the name "parent" using the webUI
    And the user opens folder "parent" using the webUI
    And the user creates a folder with the name "subfolder" using the webUI
    And the user browses to the files page
    Then folder "parent" should not be marked as locked on the webUI
    When the user opens folder "parent" using the webUI
    Then folder "subfolder" should not be marked as locked on the webUI
    Examples:
      | lockscope |
      | exclusive |
      | shared    |

  @issue-5417
  Scenario Outline: unsharing a locked file/folder
    Given these users have been created with default attributes and without skeleton files in the server:
      | username |
      | sharer   |
    And user "sharer" has created file "lorem.txt" in the server
    And user "sharer" has created folder "simple-folder" in the server
    And user "sharer" has locked file "lorem.txt" setting the following properties in the server
      | lockscope | <lockscope> |
    And user "sharer" has locked folder "simple-folder" setting the following properties in the server
      | lockscope | <lockscope> |
    And user "sharer" has shared file "lorem.txt" with user "brand-new-user" in the server
    And user "sharer" has shared folder "simple-folder" with user "brand-new-user" in the server
    When the user browses to the files page
    And the user deletes file "lorem (2).txt" using the webUI
    Then notifications should be displayed on the webUI with the text
      """
      Failed to delete "lorem (2).txt" - the file is locked
      """
    When the user deletes folder "simple-folder (2)" using the webUI
    Then notifications should be displayed on the webUI with the text
      """
      Failed to delete "simple-folder (2)" - the file is locked
      """
    And file "lorem (2).txt" should be listed on the webUI
    And folder "simple-folder (2)" should be listed on the webUI
    And folder "lorem (2).txt" should be marked as locked on the webUI
    And folder "simple-folder (2)" should be marked as locked on the webUI
    Examples:
      | lockscope |
      | exclusive |
      | shared    |
