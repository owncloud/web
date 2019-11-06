@files_versions-app-required
Feature: Versions of a file

  As a user
  I would like to see different versions of a file and delete and restore them
  So that I can have more control over the files

  Background:
    Given these users have been created with default attributes:
      | username |
      | user0    |
      | user1    |

  Scenario: upload new file with same name to see if different versions are shown
    Given user "user0" has logged in using the webUI
    And the user has browsed to the files page
    And user "user0" has uploaded file with content "lorem content" to "lorem.txt"
    And user "user0" has uploaded file with content "new lorem content" to "lorem.txt"
    When the user browses to display the "versions" details of file "lorem.txt"
    Then the content of file "lorem.txt" for user "user0" should be "new lorem content"
    And the versions list should contain 2 entries

  Scenario: restoring file to old version changes the content of the file
    Given user "user0" has uploaded file with content "lorem content" to "lorem-file.txt"
    And user "user0" has uploaded file with content "new lorem content" to "lorem-file.txt"
    And user "user0" has logged in using the webUI
    And the user has browsed to the files page
    When the user browses to display the "versions" details of file "lorem-file.txt"
    And the user restores the file to last version using the webUI
    Then the content of file "lorem-file.txt" for user "user0" should be "lorem content"

  Scenario: sharee can see the versions of a file
    Given user "user0" has uploaded file with content "lorem content" to "lorem-file.txt"
    And user "user0" has uploaded file with content "lorem" to "lorem-file.txt"
    And user "user0" has uploaded file with content "new lorem content" to "lorem-file.txt"
    And user "user0" has shared file "lorem-file.txt" with user "user1"
    And user "user1" has logged in using the webUI
    When the user browses to display the "versions" details of file "lorem-file.txt"
    Then the content of file "lorem-file.txt" for user "user1" should be "new lorem content"
    And the versions list should contain 2 entries

  @skipOnStorage:ceph @files_primary_s3-issue-1
  Scenario: file versions cannot be seen in the webUI after deleting versions
    Given user "user0" has uploaded file with content "lorem content" to "lorem-file.txt"
    And user "user0" has uploaded file with content "lorem" to "lorem-file.txt"
    And user "user0" has uploaded file with content "new lorem content" to "lorem-file.txt"
    And user "user0" has logged in using the webUI
    And the administrator has cleared the versions for user "user0"
    When the user browses to display the "versions" details of file "lorem-file.txt"
    Then the versions list should contain 0 entries

  @skipOnStorage:ceph @files_primary_s3-issue-155
  Scenario: file versions cannot be seen in the webUI only for user whose versions is deleted
    Given user "user0" has uploaded file with content "lorem content" to "lorem-file.txt"
    And user "user0" has uploaded file with content "lorem" to "lorem-file.txt"
    And user "user1" has uploaded file with content "lorem content" to "lorem-file.txt"
    And user "user1" has uploaded file with content "lorem" to "lorem-file.txt"
    And user "user0" has logged in using the webUI
    And the administrator has cleared the versions for user "user0"
    When the user browses to display the "versions" details of file "lorem-file.txt"
    Then the versions list should contain 0 entries
    When the user re-logs in as "user1" using the webUI
    And the user browses to display the "versions" details of file "lorem-file.txt"
    Then the versions list should contain 1 entries

  @skipOnStorage:ceph @files_primary_s3-issue-155
  Scenario: file versions cannot be seen in the webUI for all users after deleting versions for all users
    Given user "user0" has uploaded file with content "lorem content" to "/lorem-file.txt"
    And user "user0" has uploaded file with content "lorem" to "/lorem-file.txt"
    And user "user1" has uploaded file with content "lorem content" to "/lorem-file.txt"
    And user "user1" has uploaded file with content "lorem" to "/lorem-file.txt"
    And user "user0" has logged in using the webUI
    And the administrator has cleared the versions for all users
    When the user browses to display the "versions" details of file "lorem-file.txt"
    Then the versions list should contain 0 entries
    When the user re-logs in as "user1" using the webUI
    And the user browses to display the "versions" details of file "lorem-file.txt"
    Then the versions list should contain 0 entries
