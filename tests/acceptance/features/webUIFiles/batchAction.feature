Feature: Visibility of the batch actions menu
  As a user
  I want to see the batch action menu options
  So that the batch action menu options of the selected file or folder are visible to me

  Background:
    Given these users have been created with default attributes and without skeleton files in the server:
      | username |
      | Alice    |
      | Brian    |
    And user "Alice" has created folder "simple-folder" in the server


  Scenario: View batch action menu for a folder on the personal page
    Given user "Alice" has logged in using the webUI
    When the user marks the folder "simple-folder" using the webUI
    Then the following batch action buttons should be visible
      | buttonName |
      | Move       |
      | Copy       |
      | Delete     |


  Scenario: View batch action menu for a file on the personal page
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has logged in using the webUI
    When the user marks the file "lorem.txt" using the webUI
    Then the following batch action buttons should be visible
      | buttonName |
      | Download   |
      | Delete     |
      | Move       |
      | Copy       |


  Scenario: View batch action menu when selecting both file and folder on the personal page
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has logged in using the webUI
    When the user marks these files for batch action using the webUI
      | name          |
      | lorem.txt     |
      | simple-folder |
    Then the following batch action buttons should be visible
      | buttonName |
      | Delete     |
      | Move       |
      | Copy       |

  @skipOnOCIS
  Scenario: View batch action menu for a folder on the favorites page
    Given user "Alice" has logged in using the webUI
    And user "Alice" has favorited element "simple-folder" in the server
    And the user has browsed to the favorites page
    When the user marks the folder "simple-folder" using the webUI
    Then the following batch action buttons should not be visible
      | buttonName |
      | Delete     |
      | Remove     |
      | Copy       |


  Scenario: View batch action menu for a folder on the shared with me page (Pending Share)
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no" in the server
    And the administrator has set the default folder for received shares to "Shares" in the server
    And user "Alice" has shared folder "simple-folder" with user "Brian" in the server
    And user "Brian" has logged in using the webUI
    And the user has browsed to the shared-with-me page
    When the user marks the folder "simple-folder" using the webUI
    Then the following batch action buttons should be visible
      | buttonName |
      | Accept     |
      | Decline    |


  Scenario: View batch action menu for a folder on the shared with me page (Accepted Share)
    Given the setting "shareapi_auto_accept_share" of app "core" has been set to "no" in the server
    And the administrator has set the default folder for received shares to "Shares" in the server
    And user "Alice" has shared folder "simple-folder" with user "Brian" in the server
    And user "Brian" has accepted the share "Shares/simple-folder" offered by user "Alice" in the server
    And user "Brian" has logged in using the webUI
    And the user has browsed to the shared-with-me page
    When the user marks the folder "simple-folder" using the webUI
    Then the following batch action buttons should be visible
      | buttonName |
      | Decline    |


  Scenario: View batch action menu for a folder on the shared with others page
    Given user "Alice" has logged in using the webUI
    And user "Alice" has shared folder "simple-folder" with user "Brian" in the server
    And the user has browsed to the shared-with-others page
    When the user marks the folder "simple-folder" using the webUI
    Then the following batch action buttons should not be visible
      | buttonName |
      | Delete     |
      | Move       |
      | Copy       |


  Scenario: View batch action menu for a folder on the shared via link page
    Given user "Alice" has created a public link with following settings in the server
      | path | /simple-folder |
    And user "Alice" has logged in using the webUI
    And the user has browsed to the shared-via-link page
    When the user marks the folder "simple-folder" using the webUI
    Then the following batch action buttons should not be visible
      | buttonName |
      | Delete     |
      | Move       |
      | Copy       |


  Scenario: View batch action menu for a folder on the trashbin page
    Given the following folders have been deleted by user "Alice" in the server
      | name          |
      | simple-folder |
    And user "Alice" has logged in using the webUI
    And the user has browsed to the trashbin page
    When the user marks the folder "simple-folder" using the webUI
    Then the following batch action buttons should be visible
      | buttonName |
      | Restore    |
      | Delete     |
