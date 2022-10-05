Feature: Locks
  As a user
  I would like to be able to use locks control upload of files and folders
  So that I can prevent files and folders being added to and changed while they are being used by another user

  Background:
    #do not set email, see bugs in https://github.com/owncloud/core/pull/32250#issuecomment-434615887
    Given these users have been created with default attributes and without skeleton files in the server:
      | username       |
      | brand-new-user |
    And user "brand-new-user" has created folder "simple-folder" in the server
    And user "brand-new-user" has uploaded file with content "file inside locked folder" to "simple-folder/lorem.txt" in the server
    And user "brand-new-user" has uploaded file with content "locked file" to "lorem.txt" in the server
    And user "brand-new-user" has logged in using the webUI

  @issue-5741 @issue-ocis-1284
  Scenario Outline: uploading a file, trying to overwrite a file in a locked folder in a public share
    Given user "brand-new-user" has locked folder "simple-folder" setting the following properties in the server
      | lockscope | <lockscope> |
    And user "brand-new-user" has created a public link with following settings in the server
      | path        | simple-folder                |
      | permissions | read, create, delete, update |
    When the public uses the webUI to access the last public link created by user "brand-new-user" in a new session
    And the user uploads overwriting file "lorem.txt" using the webUI
    Then notifications should be displayed on the webUI with the text
      """
      The file lorem.txt is currently locked, please try again later
      """
    And the content of file "simple-folder/lorem.txt" for user "brand-new-user" should be "file inside locked folder" in the server
    Examples:
      | lockscope |
      | exclusive |
      | shared    |
