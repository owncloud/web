Feature: Locks
  As a user
  I would like to be able to use locks control moving and renaming of files and folders
  So that I can prevent files and folders being changed while they are being used by another user

  Background:
    #do not set email, see bugs in https://github.com/owncloud/core/pull/32250#issuecomment-434615887
    Given these users have been created with default attributes and without skeleton files in the server:
      | username       |
      | brand-new-user |
    And user "brand-new-user" has created folder "simple-folder" in the server
    And user "brand-new-user" has created folder "simple-empty-folder" in the server
    And user "brand-new-user" has created file "simple-folder/lorem.txt" in the server
    And user "brand-new-user" has created file "lorem.txt" in the server
    And user "brand-new-user" has logged in using the webUI

  @issue-5417
  Scenario Outline: moving a locked file
    Given user "brand-new-user" has locked file "lorem.txt" setting the following properties in the server
      | lockscope | <lockscope> |
    And the user has browsed to the personal page
    When the user tries to move file "lorem.txt" into folder "simple-empty-folder" using the webUI
    Then notifications should be displayed on the webUI with the text
      """
      Failed to move "lorem.txt"
      """
    When the user browses to the files page
    Then file "lorem.txt" should be listed on the webUI
    And file "lorem.txt" should be marked as locked on the webUI
    And file "lorem.txt" should be marked as locked by user "brand-new-user" in the locks tab of the details panel on the webUI
    When the user opens folder "simple-empty-folder" using the webUI
    Then file "lorem.txt" should not be listed on the webUI
    Examples:
      | lockscope |
      | exclusive |
      | shared    |

  @issue-5417
  Scenario Outline: moving a file trying to overwrite a locked file
    Given user "brand-new-user" has locked file "/simple-folder/lorem.txt" setting the following properties in the server
      | lockscope | <lockscope> |
    And the user has browsed to the personal page
    When the user tries to move file "lorem.txt" into folder "simple-folder" using the webUI
    Then notifications should be displayed on the webUI with the text
      """
      Failed to move "lorem.txt"
      """
    When the user browses to the files page
    Then file "lorem.txt" should be listed on the webUI
    And file "lorem.txt" should not be marked as locked on the webUI
    When the user opens folder "simple-folder" using the webUI
    Then file "lorem.txt" should be marked as locked on the webUI
    And file "lorem.txt" should be marked as locked by user "brand-new-user" in the locks tab of the details panel on the webUI
    Examples:
      | lockscope |
      | exclusive |
      | shared    |


  @issue-5417
  Scenario Outline: moving a file into a locked folder
    Given user "brand-new-user" has locked file "/simple-empty-folder" setting the following properties in the server
      | lockscope | <lockscope> |
    And the user has browsed to the personal page
    When the user tries to move file "lorem.txt" into folder "simple-empty-folder" using the webUI
    Then notifications should be displayed on the webUI with the text
      """
      Failed to move "lorem.txt"
      """
    When the user browses to the files page
    Then file "lorem.txt" should be listed on the webUI
    And file "lorem.txt" should not be marked as locked on the webUI
    And file "simple-empty-folder" should be marked as locked on the webUI
    And file "simple-empty-folder" should be marked as locked by user "brand-new-user" in the locks tab of the details panel on the webUI
    When the user opens folder "simple-empty-folder" using the webUI
    Then file "lorem.txt" should not be listed on the webUI
    Examples:
      | lockscope |
      | exclusive |
      | shared    |

  @issue-5417
  Scenario Outline: renaming of a locked file
    Given user "brand-new-user" has locked file "lorem.txt" setting the following properties in the server
      | lockscope | <lockscope> |
    And the user has browsed to the personal page
    When the user tries to rename file "lorem.txt" to "a-renamed-file.txt" using the webUI
    Then notifications should be displayed on the webUI with the text
      """
      Failed to move "lorem.txt" to "a-renamed-file.txt" - the file is locked
      """
    When the user closes rename dialog
    And the user reloads the current page of the webUI
    Then file "lorem.txt" should be listed on the webUI
    And file "a-renamed-file.txt" should not be listed on the webUI
    And file "lorem.txt" should be marked as locked on the webUI
    And file "lorem.txt" should be marked as locked by user "brand-new-user" in the locks tab of the details panel on the webUI
    Examples:
      | lockscope |
      | exclusive |
      | shared    |


  @issue-ocis-1284
  Scenario Outline: renaming a file in a public share of a locked folder
    Given user "brand-new-user" has locked folder "simple-folder" setting the following properties in the server
      | lockscope | <lockscope> |
    And user "brand-new-user" has created a public link with following settings in the server
      | path        | simple-folder                |
      | permissions | read, create, delete, update |
    When the public uses the webUI to access the last public link created by user "brand-new-user" in a new session
    And the user tries to rename file "lorem.txt" to "a-renamed-file.txt" using the webUI
    Then notifications should be displayed on the webUI with the text
      """
      Failed to rename "lorem.txt" to "a-renamed-file.txt" - the file is locked
      """
    When the user closes rename dialog
    And the user reloads the current page of the webUI
    Then file "lorem.txt" should be listed on the webUI
    And file "a-renamed-file.txt" should not be listed on the webUI
    Examples:
      | lockscope |
      | exclusive |
      | shared    |

  @issue-ocis-1284
  Scenario Outline: moving a locked file into an other folder in a public share
    Given user "brand-new-user" has created folder "simple-folder/simple-empty-folder" in the server
    And user "brand-new-user" has locked file "simple-folder/lorem.txt" setting the following properties in the server
      | lockscope | <lockscope> |
    And user "brand-new-user" has created a public link with following settings in the server
      | path        | simple-folder                |
      | permissions | read, create, delete, update |
    When the public uses the webUI to access the last public link created by user "brand-new-user" in a new session
    And the user tries to move file "lorem.txt" into folder "simple-empty-folder" using the webUI
    Then notifications should be displayed on the webUI with the text
      """
      Failed to move "lorem.txt"
      """
    When the user navigates to the root of the last public link
    Then file "lorem.txt" should be listed on the webUI
    When the user opens folder "simple-empty-folder" using the webUI
    Then file "lorem.txt" should not be listed on the webUI
    Examples:
      | lockscope |
      | exclusive |
      | shared    |
