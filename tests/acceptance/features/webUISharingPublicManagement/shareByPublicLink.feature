@mailhog @public_link_share-feature-required
Feature: Public link share management
  As a user
  I want to check different options available in public shares
  So that I can manage and organize the shares

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files
    And user "Alice" has created folder "/simple-folder"

  @ocisSmokeTest
  Scenario: public link share shows up on shared-with-others page
    Given user "Alice" has logged in using the webUI
    And user "Alice" has shared folder "simple-folder" with link with "read" permissions
    When the user browses to the shared-with-others page using the webUI
    Then the resource "simple-folder" should have the token of last link in the people column on the webUI


  Scenario: opening public-link page of the files-drop link protected with password should redirect to files-drop page
    Given user "Alice" has shared folder "simple-folder" with link with "create" permissions and password "pass123"
    When the public uses the webUI to access the last public link created by user "Alice" with password "pass123"
    Then the user should be redirected to the files-drop page


  Scenario: opening public-link page of the files-drop link without password set should redirect to files-drop page
    Given user "Alice" has shared folder "simple-folder" with link with "create" permissions
    When the public uses the webUI to access the last public link created by user "Alice"
    Then the user should be redirected to the files-drop page

  @issue-5321
  Scenario: mount public link
    Given user "Brian" has been created with default attributes and without skeleton files
    And user "Alice" has uploaded file with content "Alice file" to "simple-folder/lorem.txt"
    And user "Alice" has created a public link with following settings
      | path        | simple-folder                |
      | name        | Public-link                  |
      | permissions | read, update, create, delete |
    When the public uses the webUI to access the last public link created by user "Alice"
    And the public adds the public link to "%remote_server%" as user "Brian" with password "%alt2%" using the webUI
    Then folder "simple-folder" should be listed on the webUI
    When the user opens folder "simple-folder" using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And the content of file "simple-folder/lorem.txt" for user "Brian" should be "Alice file"
    When the user uploads overwriting file "lorem.txt" using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And as "Brian" the content of "simple-folder/lorem.txt" should be the same as the content of local file "lorem.txt"

  @issue-ocis-1328
  Scenario: user shares a file through public link and then it appears in a shared-with-others page
    Given the setting "shareapi_allow_public_notification" of app "core" has been set to "yes"
    And user "Alice" has created a public link with following settings
      | path        | simple-folder                |
      | name        | link-editor                  |
      | permissions | read, update, create, delete |
    And user "Alice" has created a public link with following settings
      | path        | simple-folder |
      | name        | link-viewer   |
      | permissions | read          |
    And user "Alice" has logged in using the webUI
    When the user browses to the shared-with-others page
    Then folder "simple-folder" should be listed on the webUI
    And the following resources should have the following collaborators
      | fileName      | expectedCollaborators    |
      | simple-folder | link-editor, link-viewer |


  Scenario: user cancel removes operation for the public link of a file
    Given user "Alice" has created file "lorem.txt"
    And user "Alice" has logged in using the webUI
    And user "Alice" has created a public link with following settings
      | path        | lorem.txt   |
      | name        | Public-link |
      | permissions | read        |
    When the user cancels remove the public link named "Public-link" of file "lorem.txt" using the webUI
    Then user "Alice" should have some public shares

  @ocisSmokeTest
  Scenario: user browses to public link share using copy link button
    Given user "Alice" has created file "simple-folder/lorem.txt"
    And user "Alice" has created a public link with following settings
      | path        | simple-folder |
      | name        | Public-link   |
      | permissions | read          |
    And user "Alice" has logged in using the webUI
    When the user copies the url of public link named "Public-link" of folder "simple-folder" using the webUI
    And the user navigates to the copied public link using the webUI
    Then file "lorem.txt" should be listed on the webUI

  @issue-2090
  Scenario: access details dialog of public share and check the tabs displayed
    Given user "Alice" has created file "simple-folder/lorem.txt"
    And user "Alice" has logged in using the webUI
    When the user creates a new public link for folder "simple-folder" using the webUI with
      | role | Editor |
    And the public uses the webUI to access the last public link created by user "Alice"
    And the user opens the sidebar for file "lorem.txt" on the webUI
    Then the following panels should be visible in the details dialog on the webUI
      | name     |
      | versions |
      | links    |
      | people   |
#    Then the following tabs should not be visible in the details dialog
#      | name          |
#      | links         |
#      | people        |

  @issue-2897
  Scenario: sharing details of indirect items inside a shared folder
    Given user "Alice" has created folder "/simple-folder/sub-folder"
    And user "Alice" has uploaded file with content "test" to "/simple-folder/textfile.txt"
    And user "Alice" has created a public link with following settings
      | path | /simple-folder |
      | name | Public Link    |
    And user "Alice" has logged in using the webUI
    When the user opens folder "simple-folder" using the webUI
    Then a link named "Public Link" should be listed with role "Viewer" in the public link list of resource "sub-folder" via "simple-folder" on the webUI

  @issue-2897
  Scenario: sharing details of multiple indirect public link shares
    Given user "Alice" has created folder "/simple-folder/sub-folder"
    And user "Alice" has uploaded file with content "test" to "/simple-folder/sub-folder/textfile.txt"
    And user "Alice" has created a public link with following settings
      | path | /simple-folder |
      | name | Public Link    |
    And user "Alice" has created a public link with following settings
      | path | /simple-folder/sub-folder      |
      | name | strängé लिंक नाम (#2 &).नेपाली |
    And user "Alice" has logged in using the webUI
    When the user opens folder "simple-folder/sub-folder" directly on the webUI
    Then a link named "Public Link" should be listed with role "Viewer" in the public link list of resource "textfile.txt" via "simple-folder" on the webUI
    And a link named "strängé लिंक नाम (#2 &).नेपाली" should be listed with role "Viewer" in the public link list of resource "textfile.txt" via "sub-folder" on the webUI

  @issue-3040 @issue-3841 @issue-ocis-reva-372
  Scenario: sharing details of indirect link share in "favorites" file lists
    Given user "Alice" has created folder "/simple-folder/simple-empty-folder"
    And user "Alice" has created a public link with following settings
      | path | /simple-folder |
      | name | Public Link    |
    And user "Alice" has created a public link with following settings
      | path | /simple-folder/simple-empty-folder |
      | name | Public Link Sub                    |
    And user "Alice" has favorited element "simple-folder/simple-empty-folder"
    And user "Alice" has logged in using the webUI
    When the user browses to the shared-with-others page
    And the user opens the share dialog for folder "simple-empty-folder" using the webUI
    Then a link named "Public Link" should be listed with role "Viewer" in the public link list of resource "simple-empty-folder" via "simple-folder" on the webUI
    And a link named "Public Link Sub" should be listed with role "Viewer" in the public link list of resource "simple-empty-folder" on the webUI
    When the user browses to the favorites page using the webUI
    Then a link named "Public Link" should be listed with role "Viewer" in the public link list of resource "simple-folder/simple-empty-folder" via "simple-folder" on the webUI

  @issue-ocis-reva-243
  Scenario: token is shown for links without a name
    When user "Alice" has created a public link with following settings
      | path | /simple-folder |
    And user "Alice" logs in using the webUI
    Then a public link with the last created link share token as name should be listed for resource "simple-folder" on the webUI

  @issue-product-130
  Scenario: User can attempt to upload a file in public link
    Given user "Alice" has created file "lorem.txt"
    And user "Alice" has created a public link with following settings
      | path        | lorem.txt   |
      | name        | public link |
      | permissions | read        |
    When the public uses the webUI to access the last public link created by user "Alice"
    Then file "lorem.txt" should be listed on the webUI
    And it should not be possible to create files using the webUI


  Scenario: Shared via link page is displayed
    Given user "Alice" has created file "lorem.txt"
    And user "Alice" has created a public link with following settings
      | path        | lorem.txt             |
      | name        | Public-link           |
    And user "Alice" has logged in using the webUI
    When the user browses to the shared-via-link page using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And the following resources should have the following collaborators
      | fileName  | expectedCollaborators |
      | lorem.txt | Public-link           |
