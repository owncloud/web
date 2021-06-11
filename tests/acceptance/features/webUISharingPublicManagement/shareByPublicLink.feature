@mailhog @public_link_share-feature-required @ocis-reva-issue-64
Feature: Public link share management
  As a user
  I want to check different opitions available in public shares
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

  @skip @yetToImplement
  Scenario: mount public link
    Given using server "REMOTE"
    And user "Brian" has been created with default attributes
    When the user creates a new public link for folder "simple-folder" using the webUI
    And the user logs out of the webUI
    And the public accesses the last created public link using the webUI
    And the public adds the public link to "%remote_server%" as user "Brian" with password "%alt2%" using the webUI
    And the user accepts the offered remote shares using the webUI
    Then folder "simple-folder (2)" should be listed on the webUI
    When the user opens folder "simple-folder (2)" using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And the content of "lorem.txt" on the remote server should be the same as the original "simple-folder/lorem.txt"
    And it should not be possible to delete file "lorem.txt" using the webUI

  @skip @yetToImplement
  Scenario: mount public link and overwrite file
    Given using server "REMOTE"
    And user "Brian" has been created with default attributes
    When the user creates a new public link for folder "simple-folder" using the webUI with
      | permission | read-write |
    And the user logs out of the webUI
    And the public accesses the last created public link using the webUI
    And the public adds the public link to "%remote_server%" as user "Brian" with password "%alt2%" using the webUI
    And the user accepts the offered remote shares using the webUI
    Then folder "simple-folder (2)" should be listed on the webUI
    When the user opens folder "simple-folder (2)" using the webUI
    Then file "lorem.txt" should be listed on the webUI
    And the content of "lorem.txt" on the remote server should be the same as the original "simple-folder/lorem.txt"
    When the user uploads overwriting file "lorem.txt" using the webUI and retries if the file is locked
    Then file "lorem.txt" should be listed on the webUI
    And the content of "lorem.txt" on the remote server should be the same as the local "lorem.txt"

  @issue-ocis-reva-41
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

  @skip @yetToImplement
  Scenario: user cancel removes operation for the public link of a file
    Given user "Alice" has created file "lorem.txt"
    And the user has created a new public link for file "lorem.txt" using the webUI
    When the user tries to remove the public link of file "lorem.txt" but later cancels the remove dialog using webUI
    And the public accesses the last created public link using the webUI
    Then the content of the file shared by the last public link should be the same as "lorem.txt"

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
    And the user picks the row of file "lorem.txt" in the webUI
    Then the following accordion items should be visible in the details dialog on the webUI
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

  @skipOnOC10 @issue-product-130
  # When this issue is fixed delete this scenario and use the one above
  Scenario: User can attempt to upload a file in public link (ocis bug demonstration)
    Given user "Alice" has created file "lorem.txt"
    And user "Alice" has created a public link with following settings
      | path        | lorem.txt   |
      | name        | public link |
      | permissions | read        |
    When the public uses the webUI to access the last public link created by user "Alice"
    Then file "lorem.txt" should be listed on the webUI
    And it should be possible to create files using the webUI
#    And it should not be possible to create files using the webUI
    When the public uploads file "textfile.txt" using the webUI
    Then the following error message should be displayed on the webUI
      """
      File upload failed…
      Unknown error
      """


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
