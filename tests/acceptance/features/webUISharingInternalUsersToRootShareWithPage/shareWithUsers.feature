@notToImplementOnOCIS
Feature: Shares in share-with pages
  As a user
  I want to check share-with pages
  So that I can know what is shared with me and by me

  Background:
    Given these users have been created with default attributes and without skeleton files:
      | username |
      | Alice    |
      | Brian    |
    And user "Alice" has created folder "simple-folder"

  Scenario: share a folder with other user and then it should be listed on Shared with You for other user
    Given user "Alice" has created file "lorem.txt"
    And user "Alice" has renamed folder "simple-folder" to "new-simple-folder"
    And user "Alice" has renamed file "lorem.txt" to "ipsum.txt"
    And user "Alice" has shared file "ipsum.txt" with user "Brian"
    And user "Alice" has shared folder "new-simple-folder" with user "Brian"
    And user "Brian" has logged in using the webUI
    When the user browses to the shared-with-me page
    Then file "ipsum.txt" should be listed on the webUI
    And folder "new-simple-folder" should be listed on the webUI


  Scenario: share a folder with other user and then it should be listed on Shared with Others page
    Given user "Carol" has been created with default attributes and without skeleton files
    And user "Alice" has created file "lorem.txt"
    And user "Alice" has logged in using the webUI
    And user "Alice" has shared file "lorem.txt" with user "Brian"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Alice" has shared folder "simple-folder" with user "Carol"
    When the user browses to the shared-with-others page
    Then the following resources should have the following collaborators
      | fileName      | expectedCollaborators     |
      | lorem.txt     | Brian Murphy              |
      | simple-folder | Brian Murphy, Carol King  |

  @issue-2480
  Scenario: check file with same name but different paths are displayed correctly in shared with others page
    Given user "Alice" has created file "lorem.txt"
    And user "Alice" has created file "simple-folder/lorem.txt"
    And user "Alice" has shared file "lorem.txt" with user "Brian"
    And user "Alice" has shared file "simple-folder/lorem.txt" with user "Brian"
    And user "Alice" has logged in using the webUI
    When the user browses to the shared-with-others page
    Then file "lorem.txt" should be listed on the webUI
#    Then file "lorem.txt" with path "" should be listed in the shared with others page on the webUI
#    And file "lorem.txt" with path "/simple-folder" should be listed in the shared with others page on the webUI


  Scenario: send share shows up on shared-with-others page
    Given user "Alice" has uploaded file "data.zip" to "data.zip"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Alice" has logged in using the webUI
    When the user browses to the shared-with-others page using the webUI
    Then folder "simple-folder" should be listed on the webUI
    But file "data.zip" should not be listed on the webUI


  Scenario: received share shows up on shared-with-me page
    Given user "Alice" has uploaded file "data.zip" to "data.zip"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has logged in using the webUI
    When the user browses to the shared-with-me page
    Then folder "simple-folder" should be listed on the webUI
    But file "data.zip" should not be listed on the webUI


  Scenario: clicking a folder on shared-with-me page jumps to the main file list inside the folder
    Given user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Alice" has created file "simple-folder/collaborate-on-this.txt"
    And user "Brian" has logged in using the webUI
    When the user browses to the shared-with-me page
    And the user opens folder "simple-folder" using the webUI
    Then file "collaborate-on-this.txt" should be listed on the webUI


  Scenario: unsharing an entry on the shared-with-me page results in declined share
    Given user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has logged in using the webUI
    When the user browses to the shared-with-me page in accepted shares view
    And the user unshares folder "simple-folder" using the webUI
    And the user closes the app-sidebar using the webUI
    And the user browses to the shared-with-me page in declined shares view
    Then folder "simple-folder" shared by "Alice Hansen" should be in "Declined" state on the webUI
    And as "Brian" folder "simple-folder" should not exist

  @issue-2898
  Scenario: see resource owner for direct shares in "shared with me"
    Given user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has logged in using the webUI
    When the user browses to the shared-with-me page
    And the user opens the share dialog for folder "simple-folder" using the webUI
    Then user "Alice Hansen" should be listed as "Owner" in the collaborators list on the webUI

  @issue-3040
  Scenario: see resource owner of parent shares in "shared with others" and "favorites" list
    Given user "Carol" has been created with default attributes and without skeleton files
    And user "Alice" has created folder "simple-folder/simple-empty-folder"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Brian" has shared folder "simple-folder/simple-empty-folder" with user "Carol"
    And user "Brian" has favorited element "simple-folder/simple-empty-folder"
    And user "Brian" has logged in using the webUI
    When the user browses to the shared-with-others page
    And the user opens the share dialog for folder "simple-empty-folder" using the webUI
    Then user "Alice Hansen" should be listed as "Owner" via "simple-folder" in the collaborators list on the webUI
    When the user browses to the favorites page using the webUI
    And the user opens the share dialog for folder "simple-folder/simple-empty-folder" using the webUI
    Then user "Alice Hansen" should be listed as "Owner" via "simple-folder" in the collaborators list on the webUI

  @skipOnOC10 @issue-4582
  Scenario: deleting multiple entries on the shared-with-me page
    Given user "Alice" has created file "lorem.txt"
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And user "Alice" has shared file "lorem.txt" with user "Brian"
    And user "Brian" has logged in using the webUI
    And the user browses to the shared-with-me page
    When the user batch unshares these files using the webUI
      | name              |
      | simple-folder     |
      | lorem.txt         |
    Then the unshared elements should be in declined state on the webUI
