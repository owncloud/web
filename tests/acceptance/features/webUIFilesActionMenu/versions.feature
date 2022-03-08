@files_versions-app-required
Feature: Versions of a file

  As a user
  I would like to see different versions of a file and delete and restore them
  So that I can have more control over the files

  Background:
    Given these users have been created with default attributes and without skeleton files in the server:
      | username |
      | user0    |
      | Alice    |

  @disablePreviews @issue-5853
  Scenario: upload new file with same name to see if different versions are shown
    Given user "user0" has logged in using the webUI
    And user "user0" has uploaded file "lorem.txt" to "lorem.txt" in the server
    And the user has browsed to the personal page
    And user "user0" has uploaded file with content "lorem content" to "lorem.txt" in the server
    And user "user0" has uploaded file with content "new lorem content" to "lorem.txt" in the server
    When the user browses to display the "versions" details of file "lorem.txt"
    Then the content of file "lorem.txt" for user "user0" should be "new lorem content" in the server
    And the versions list should contain 2 entries


  Scenario: restoring file to old version changes the content of the file
    Given user "user0" has uploaded file with content "lorem content" to "lorem-file.txt" in the server
    And user "user0" has uploaded file with content "new lorem content" to "lorem-file.txt" in the server
    And user "user0" has logged in using the webUI
    And the user has browsed to the personal page
    When the user browses to display the "versions" details of file "lorem-file.txt"
    And the user restores the file to last version using the webUI
    Then the content of file "lorem-file.txt" for user "user0" should be "lorem content" in the server

  @ocis-reva-issue-110
  @skipOnStorage:ceph @files_primary_s3-issue-1
  Scenario: file versions cannot be seen on the webUI after deleting versions
    Given user "user0" has uploaded file with content "lorem content" to "lorem-file.txt" in the server
    And user "user0" has uploaded file with content "lorem" to "lorem-file.txt" in the server
    And user "user0" has uploaded file with content "new lorem content" to "lorem-file.txt" in the server
    And user "user0" has logged in using the webUI
    And the administrator has cleared the versions for user "user0" in the server
    When the user browses to display the "versions" details of file "lorem-file.txt"
    Then the versions list should contain 0 entries

  @ocis-reva-issue-110
  @skipOnStorage:ceph @files_primary_s3-issue-155
  Scenario: file versions cannot be seen on the webUI only for user whose versions is deleted
    Given user "user0" has uploaded file with content "lorem content" to "lorem-file.txt" in the server
    And user "user0" has uploaded file with content "lorem" to "lorem-file.txt" in the server
    And user "Alice" has uploaded file with content "lorem content" to "lorem-file.txt" in the server
    And user "Alice" has uploaded file with content "lorem" to "lorem-file.txt" in the server
    And user "user0" has logged in using the webUI
    And the administrator has cleared the versions for user "user0" in the server
    When the user browses to display the "versions" details of file "lorem-file.txt"
    Then the versions list should contain 0 entries
    When the user re-logs in as "Alice" using the webUI
    And the user browses to display the "versions" details of file "lorem-file.txt"
    Then the versions list should contain 1 entries

  @ocis-reva-issue-110
  @skipOnStorage:ceph @files_primary_s3-issue-155
  Scenario: file versions cannot be seen on the webUI for all users after deleting versions for all users
    Given user "user0" has uploaded file with content "lorem content" to "/lorem-file.txt" in the server
    And user "user0" has uploaded file with content "lorem" to "/lorem-file.txt" in the server
    And user "Alice" has uploaded file with content "lorem content" to "/lorem-file.txt" in the server
    And user "Alice" has uploaded file with content "lorem" to "/lorem-file.txt" in the server
    And user "user0" has logged in using the webUI
    And the administrator has cleared the versions for all users in the server
    When the user browses to display the "versions" details of file "lorem-file.txt"
    Then the versions list should contain 0 entries
    When the user re-logs in as "Alice" using the webUI
    And the user browses to display the "versions" details of file "lorem-file.txt"
    Then the versions list should contain 0 entries

  @issue-ocis-2319
  Scenario: change the file content of a received shared file
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no" in the server
    And the administrator has set the default folder for received shares to "Shares" in the server
    And user "Brian" has been created with default attributes and without skeleton files in the server
    And user "Brian" has created folder "simple-folder" in the server
    And user "Brian" has uploaded file with content "a text file" to "simple-folder/lorem.txt" in the server
    And user "Brian" has shared folder "simple-folder" with user "Alice" with "all" permissions in the server
    And user "Alice" has accepted the share "simple-folder" offered by user "Brian" in the server
    And user "Alice" has logged in using the webUI
    And the user has opened folder "Shares"
    And the user has opened folder "simple-folder"
    When the user uploads overwriting file "lorem.txt" using the webUI
    And the user browses to display the "versions" details of file "lorem.txt"
    Then the versions list should contain 1 entries

  @issue-ocis-1328 @disablePreviews
  Scenario: sharee can see the versions of a file
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "yes" in the server
    And user "user0" has uploaded file with content "lorem content" to "lorem-file.txt" in the server
    And user "user0" has uploaded file with content "lorem" to "lorem-file.txt" in the server
    And user "user0" has uploaded file with content "new lorem content" to "lorem-file.txt" in the server
    And user "user0" has shared file "lorem-file.txt" with user "Alice" in the server
    And user "Alice" has logged in using the webUI
    When the user browses to display the "versions" details of file "lorem-file.txt"
    Then the content of file "lorem-file.txt" for user "Alice" should be "new lorem content" in the server
    And the versions list should contain 2 entries


  Scenario: user downloads a previous version of the file
    Given user "Alice" has uploaded file with content "lorem" to "lorem.txt" in the server
    And user "Alice" has uploaded file with content "lorem content" to "lorem.txt" in the server
    And user "Alice" has logged in using the webUI
    And the user browses to display the "versions" details of file "lorem.txt"
    When the user downloads a previous version of the file using the webUI
    Then no message should be displayed on the webUI
