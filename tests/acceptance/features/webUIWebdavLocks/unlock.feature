Feature: Unlock locked files and folders
  As a user
  I would like to be able to unlock files and folders
  So that I can access files with locks that have not been cleared

  Background:
    #do not set email, see bugs in https://github.com/owncloud/core/pull/32250#issuecomment-434615887
    Given these users have been created with default attributes and without skeleton files in the server:
      | username       |
      | brand-new-user |
    And user "brand-new-user" has created folder "simple-folder" in the server
    And user "brand-new-user" has created folder "simple-empty-folder" in the server
    And user "brand-new-user" has created file "simple-folder/lorem.txt" in the server
    And user "brand-new-user" has created folder "simple-folder/simple-empty-folder" in the server
    And user "brand-new-user" has created file "lorem.txt" in the server
    And user "brand-new-user" has logged in using the webUI

  @issue-5417
  Scenario: unlocking file/folder deletes the lock symbols
    Given user "brand-new-user" has locked folder "simple-folder" setting the following properties in the server
      | lockscope | shared |
    And user "brand-new-user" has locked folder "lorem.txt" setting the following properties in the server
      | lockscope | shared |
    When user "brand-new-user" unlocks the lock of folder "simple-folder" using the webUI
    Then folder "simple-folder" should not be marked as locked on the webUI
    When user "brand-new-user" unlocks the lock of folder "lorem.txt" using the webUI
    Then folder "lorem.txt" should not be marked as locked on the webUI

  @issue-5417
  Scenario: unlocking file/folder after the display name has been changed deletes the lock symbols
    Given these users have been created with default attributes and without skeleton files in the server:
      | username               | displayname   |
      | user-with-display-name | My fancy name |
    And user "user-with-display-name" has locked folder "simple-folder" setting the following properties in the server
      | lockscope | shared |
    And user "user-with-display-name" has locked file "data.zip" setting the following properties in the server
      | lockscope | exclusive |
    And the administrator has changed the display name of user "user-with-display-name" to "An ordinary name"
    When user "user-with-display-name" unlocks the lock of folder "simple-folder" using the webUI
    Then folder "simple-folder" should not be marked as locked on the webUI
    But folder "data.zip" should be marked as locked on the webUI

  @issue-5417
  Scenario Outline: deleting the only remaining lock of a file/folder and reloading the page
    Given user "brand-new-user" has locked file "lorem.txt" setting the following properties in the server
      | lockscope | <lockscope> |
    And user "brand-new-user" has locked folder "simple-folder" setting the following properties in the server
      | lockscope | <lockscope> |
    And the user has browsed to the personal page
    When the user unlocks the lock no 1 of file "lorem.txt" on the webUI
    And the user unlocks the lock no 1 of folder "simple-folder" on the webUI
    Then file "lorem.txt" should not be marked as locked on the webUI
    And folder "simple-folder" should not be marked as locked on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be marked as locked on the webUI
    And folder "simple-folder" should not be marked as locked on the webUI
    Examples:
      | lockscope |
      | exclusive |
      | shared    |

  @issue-5417
  Scenario Outline: deleting the only remaining lock of a folder by deleting it from a file (inside the folder) and reloading the page
    Given user "brand-new-user" has locked folder "simple-folder" setting the following properties in the server
      | lockscope | <lockscope> |
    And the user has browsed to the personal page
    And the user has opened folder "simple-folder" using the webUI
    When the user unlocks the lock no 1 of file "lorem.txt" on the webUI
    Then file "lorem.txt" should not be marked as locked on the webUI
    And folder "simple-empty-folder" should not be marked as locked on the webUI
    When the user reloads the current page of the webUI
    Then file "lorem.txt" should not be marked as locked on the webUI
    And folder "simple-empty-folder" should not be marked as locked on the webUI
    When the user browses to the files page
    Then folder "simple-folder" should not be marked as locked on the webUI
    Examples:
      | lockscope |
      | exclusive |
      | shared    |

  @issue-5417
  Scenario: deleting the first lock of the multiple locks of shared file/folder
    Given these users have been created with default attributes and without skeleton files in the server:
      | username  |
      | receiver1 |
      | receiver2 |
    And user "brand-new-user" has created folder "/FOLDER_TO_SHARE" in the server
    And user "brand-new-user" has shared file "/lorem.txt" with user "receiver1" in the server
    And user "brand-new-user" has shared folder "/FOLDER_TO_SHARE" with user "receiver1" in the server
    And user "brand-new-user" has shared file "/lorem.txt" with user "receiver2" in the server
    And user "brand-new-user" has shared folder "/FOLDER_TO_SHARE" with user "receiver2" in the server
    And user "brand-new-user" has locked file "lorem.txt" setting the following properties in the server
      | lockscope | shared |
    And user "brand-new-user" has locked folder "FOLDER_TO_SHARE" setting the following properties in the server
      | lockscope | shared |
    And user "receiver1" has locked file "lorem.txt" setting the following properties in the server
      | lockscope | shared |
    And user "receiver1" has locked folder "FOLDER_TO_SHARE" setting the following properties in the server
      | lockscope | shared |
    And user "receiver2" has locked file "lorem.txt" setting the following properties in the server
      | lockscope | shared |
    And user "receiver2" has locked folder "FOLDER_TO_SHARE" setting the following properties in the server
      | lockscope | shared |
    And the user has browsed to the personal page
    When the user unlocks the lock no 1 of file "lorem.txt" on the webUI
    Then file "lorem.txt" should be marked as locked on the webUI
    And file "lorem.txt" should be marked as locked by user "receiver1" in the locks tab of the details panel on the webUI
    And file "lorem.txt" should be marked as locked by user "receiver2" in the locks tab of the details panel on the webUI
    When the user unlocks the lock no 1 of folder "FOLDER_TO_SHARE" on the webUI
    Then folder "FOLDER_TO_SHARE" should be marked as locked on the webUI
    And folder "FOLDER_TO_SHARE" should be marked as locked by user "receiver1" in the locks tab of the details panel on the webUI
    And folder "FOLDER_TO_SHARE" should be marked as locked by user "receiver2" in the locks tab of the details panel on the webUI

  @issue-5417
  Scenario: deleting the second lock of the multiple locks of shared file/folder
    Given these users have been created with default attributes and without skeleton files in the server:
      | username  |
      | receiver1 |
      | receiver2 |
    And user "brand-new-user" has created folder "/FOLDER_TO_SHARE" in the server
    And user "brand-new-user" has shared file "/lorem.txt" with user "receiver1" in the server
    And user "brand-new-user" has shared folder "/FOLDER_TO_SHARE" with user "receiver1" in the server
    And user "brand-new-user" has shared file "/lorem.txt" with user "receiver2" in the server
    And user "brand-new-user" has shared folder "/FOLDER_TO_SHARE" with user "receiver2" in the server
    And user "receiver1" has locked file "lorem.txt" setting the following properties in the server
      | lockscope | shared |
    And user "receiver1" has locked folder "FOLDER_TO_SHARE" setting the following properties in the server
      | lockscope | shared |
    And user "brand-new-user" has locked file "lorem.txt" setting the following properties in the server
      | lockscope | shared |
    And user "brand-new-user" has locked folder "FOLDER_TO_SHARE" setting the following properties in the server
      | lockscope | shared |
    And user "receiver2" has locked file "lorem.txt" setting the following properties in the server
      | lockscope | shared |
    And user "receiver2" has locked folder "FOLDER_TO_SHARE" setting the following properties in the server
      | lockscope | shared |
    And the user has browsed to the personal page
    When the user unlocks the lock no 2 of file "lorem.txt" on the webUI
    Then file "lorem.txt" should be marked as locked on the webUI
    And file "lorem.txt" should be marked as locked by user "receiver1" in the locks tab of the details panel on the webUI
    And file "lorem.txt" should be marked as locked by user "receiver2" in the locks tab of the details panel on the webUI
    When the user unlocks the lock no 2 of folder "FOLDER_TO_SHARE" on the webUI
    Then folder "FOLDER_TO_SHARE" should be marked as locked on the webUI
    And folder "FOLDER_TO_SHARE" should be marked as locked by user "receiver1" in the locks tab of the details panel on the webUI
    And folder "FOLDER_TO_SHARE" should be marked as locked by user "receiver2" in the locks tab of the details panel on the webUI

  @issue-5417
  Scenario: deleting the last lock of the multiple locks of shared file/folder
    Given these users have been created with default attributes and without skeleton files in the server:
      | username  |
      | receiver1 |
      | receiver2 |
    And user "brand-new-user" has created folder "/FOLDER_TO_SHARE" in the server
    And user "brand-new-user" has shared file "/lorem.txt" with user "receiver1" in the server
    And user "brand-new-user" has shared folder "/FOLDER_TO_SHARE" with user "receiver1" in the server
    And user "brand-new-user" has shared file "/lorem.txt" with user "receiver2" in the server
    And user "brand-new-user" has shared folder "/FOLDER_TO_SHARE" with user "receiver2" in the server
    And user "receiver1" has locked file "lorem (2).txt" setting the following properties in the server
      | lockscope | shared |
    And user "receiver1" has locked folder "FOLDER_TO_SHARE" setting the following properties in the server
      | lockscope | shared |
    And user "receiver2" has locked file "lorem (2).txt" setting the following properties in the server
      | lockscope | shared |
    And user "receiver2" has locked folder "FOLDER_TO_SHARE" setting the following properties in the server
      | lockscope | shared |
    And user "brand-new-user" has locked file "lorem.txt" setting the following properties in the server
      | lockscope | shared |
    And user "brand-new-user" has locked folder "FOLDER_TO_SHARE" setting the following properties in the server
      | lockscope | shared |
    And the user has browsed to the personal page
    When the user unlocks the lock no 3 of file "lorem.txt" on the webUI
    Then file "lorem.txt" should be marked as locked on the webUI
    And file "lorem.txt" should be marked as locked by user "receiver1" in the locks tab of the details panel on the webUI
    And file "lorem.txt" should be marked as locked by user "receiver2" in the locks tab of the details panel on the webUI
    When the user unlocks the lock no 3 of folder "FOLDER_TO_SHARE" on the webUI
    Then folder "FOLDER_TO_SHARE" should be marked as locked on the webUI
    And folder "FOLDER_TO_SHARE" should be marked as locked by user "receiver1" in the locks tab of the details panel on the webUI
    And folder "FOLDER_TO_SHARE" should be marked as locked by user "receiver2" in the locks tab of the details panel on the webUI

  @issue-5417
  Scenario Outline: deleting a lock that was created by an other user
    Given these users have been created with default attributes and without skeleton files in the server:
      | username  |
      | receiver1 |
    And user "brand-new-user" has shared file "/lorem.txt" with user "receiver1" in the server
    And user "receiver1" has locked file "lorem.txt" setting the following properties in the server
      | lockscope | <lockscope> |
    And the user has browsed to the personal page
    When the user unlocks the lock no 1 of file "lorem.txt" on the webUI
    Then notifications should be displayed on the webUI with the text
      """
      Could not unlock, please contact the lock owner receiver1
      """
    And file "lorem.txt" should be marked as locked on the webUI
    And file "lorem.txt" should be marked as locked by user "receiver1" in the locks tab of the details panel on the webUI
    Examples:
      | lockscope |
      | exclusive |
      | shared    |
