Feature: Sharing files and folders with internal groups
  As a user
  I want to share files and folders with groups
  So that those groups can access the files and folders

  Background:
    Given the administrator has set the default folder for received shares to "Shares" in the server
    And these users have been created with default attributes and without skeleton files in the server:
      | username |
      | Alice    |
      | Brian    |
      | Carol    |
    And group "grp1" has been created in the server
    And user "Alice" has been added to group "grp1" in the server
    And user "Brian" has been added to group "grp1" in the server


  Scenario: share a folder with multiple collaborators and check collaborator list order
    Given group "grp11" has been created in the server
    And user "Carol" has created folder "simple-folder" in the server
    And user "Carol" has logged in using the webUI
    When the user shares folder "simple-folder" with group "grp11" as "Viewer" using the webUI
    And the user shares folder "simple-folder" with user "Brian Murphy" as "Viewer" using the webUI
    And the user shares folder "simple-folder" with group "grp1" as "Viewer" using the webUI
    And the user shares folder "simple-folder" with user "Alice Hansen" as "Viewer" using the webUI
    Then the current collaborators list should have order "Alice Hansen,Brian Murphy,grp1,grp11"


  Scenario: user shares the file/folder with a group and delete the share with group
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has logged in using the webUI
    And user "Alice" has shared file "lorem.txt" with group "grp1" in the server
    When the user opens the share dialog for file "lorem.txt" using the webUI
    Then group "grp1" should be listed as "Can edit" in the collaborators list on the webUI
    When the user deletes "grp1" as collaborator for the current file using the webUI
    Then group "grp1" should not be listed in the collaborators list on the webUI
    And file "lorem.txt" should not be listed in shared-with-others page on the webUI
    And as "Brian" file "/Shares/lorem.txt" should not exist in the server
    And as "Brian" file "lorem (2).txt" should not exist in the server


  Scenario: user shares the file/folder with multiple internal users and delete the share with one user
    Given group "grp2" has been created in the server
    And user "Alice" has created file "lorem.txt" in the server
    And user "Carol" has been added to group "grp2" in the server
    And user "Alice" has logged in using the webUI
    And user "Alice" has shared file "lorem.txt" with group "grp1" in the server
    And user "Alice" has shared file "lorem.txt" with group "grp2" in the server
    When the user opens the share dialog for file "lorem.txt" using the webUI
    Then group "grp1" should be listed as "Can edit" in the collaborators list on the webUI
    And group "grp2" should be listed as "Can edit" in the collaborators list on the webUI
    When the user deletes "grp1" as collaborator for the current file using the webUI
    Then group "grp1" should not be listed in the collaborators list on the webUI
    And group "grp2" should be listed as "Can edit" in the collaborators list on the webUI
    And file "lorem.txt" should be listed in shared-with-others page on the webUI
    And as "Brian" file "/Shares/lorem.txt" should not exist in the server
    But as "Carol" file "/Shares/lorem.txt" should exist in the server


  Scenario: share a folder with other group and then it should be listed on Shared with Others page
    Given user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has logged in using the webUI
    And user "Alice" has shared folder "simple-folder" with user "Brian" in the server
    And user "Alice" has shared folder "simple-folder" with group "grp1" in the server
    When the user browses to the shared-with-others page
    Then the following resources should have the following collaborators
      | fileName      | expectedCollaborators |
      | simple-folder | Brian Murphy, grp1        |
