Feature: User can open the details panel for any file or folder
  As a user
  I want to be able to open the details panel of any file or folder
  So that the details of the file or folder are visible to me

  Background:
    Given these users have been created with default attributes and without skeleton files:
      | username |
      | Alice    |
      | Brian    |
    And user "Alice" has logged in using the webUI

  @files_versions-app-required
  Scenario: View different areas of the app-sidebar for a file in files page
    Given user "Alice" has created file "lorem.txt"
    And the user has browsed to the files page
    When the user picks the row of file "lorem.txt" in the webUI
    Then the app-sidebar should be visible
    And the thumbnail should be visible in the app-sidebar
    And the "actions" details panel should be visible
    When the user switches to "people" accordion item in details panel using the webUI
    Then the "people" details panel should be visible

  @files_versions-app-required
  Scenario: View different areas of the app-sidebar for a folder in files page
    Given user "Alice" has created folder "simple-folder"
    And the user has browsed to the files page
    When the user picks the row of folder "simple-folder" in the webUI
    Then the app-sidebar should be visible
    And the thumbnail should be visible in the app-sidebar
    And the "actions" details panel should be visible
    When the user switches to "people" accordion item in details panel using the webUI
    Then the "people" details panel should be visible
    When the user switches to "links" accordion item in details panel using the webUI
    Then the "links" details panel should be visible

  @files_versions-app-required @ocis-reva-issue-39
  Scenario: View different areas of the app-sidebar for a file in favorites page
    Given user "Alice" has created file "lorem.txt"
    And the user has browsed to the files page
    And user "Alice" has favorited element "lorem.txt"
    And the user has browsed to the favorites page
    When the user picks the row of file "lorem.txt" in the webUI
    Then the app-sidebar should be visible
    And the thumbnail should be visible in the app-sidebar
    And the "actions" details panel should be visible
    When the user switches to "people" accordion item in details panel using the webUI
    Then the "people" details panel should be visible

  @files_versions-app-required @ocis-reva-issue-39
  Scenario: View different areas of the app-sidebar for a folder in favorites page
    Given user "Alice" has created folder "simple-folder"
    And the user has browsed to the files page
    And user "Alice" has favorited element "simple-folder"
    And the user has browsed to the favorites page
    When the user picks the row of folder "simple-folder" in the webUI
    Then the app-sidebar should be visible
    And the thumbnail should be visible in the app-sidebar
    And the "actions" details panel should be visible
    When the user switches to "people" accordion item in details panel using the webUI
    Then the "people" details panel should be visible
    When the user switches to "links" accordion item in details panel using the webUI
    Then the "links" details panel should be visible

  @skip @yetToImplement @comments-app-required @public_link_share-feature-required
  Scenario: user shares a file through public link and then the details dialog should work in a Shared by link page
    Given user "Alice" has created folder "simple-folder"
    And the user has browsed to the files page
    And the user has created a new public link for folder "simple-folder" using the webUI
    When the user browses to the shared-by-link page
    Then folder "simple-folder" should be listed on the webUI
    When the user opens the file action menu of folder "simple-folder" in the webUI
    And the user clicks the details file action in the webUI
    Then the details dialog should be visible in the webUI
    And the thumbnail should be visible in the details panel
    When the user switches to "sharing" accordion item in details panel using the webUI
    Then the "sharing" details panel should be visible
    When the user switches to "comments" accordion item in details panel using the webUI
    Then the "comments" details panel should be visible

  @comments-app-required @ocis-reva-issue-64
  Scenario: user shares a file and then the details dialog should work in a Shared with others page
    Given user "Alice" has created folder "simple-folder"
    And the user has browsed to the files page
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    When the user browses to the shared-with-others page
    Then folder "simple-folder" should be listed on the webUI
    When the user picks the row of folder "simple-folder" in the webUI
    Then the app-sidebar should be visible
    And the thumbnail should be visible in the app-sidebar
    When the user switches to "people" accordion item in details panel using the webUI
    Then the "people" details panel should be visible
#    When the user switches to "comments" accordion item in details panel using the webUI
#    Then the "comments" details panel should be visible
    When the user switches to "links" accordion item in details panel using the webUI
    Then the "links" details panel should be visible

  @comments-app-required @ocis-reva-issue-64
  Scenario: user shares a folder via link and then the details dialog should work in a Shared with others page
    Given user "Alice" has created folder "simple-folder"
    And the user has browsed to the files page
    And user "Alice" has created a new public link for resource "simple-folder"
    When the user browses to the shared-with-others page
    Then folder "simple-folder" should be listed on the webUI
    When the user picks the row of folder "simple-folder" in the webUI
    Then the app-sidebar should be visible
    And the thumbnail should be visible in the app-sidebar
    When the user switches to "people" accordion item in details panel using the webUI
    Then the "people" details panel should be visible
#    When the user switches to "comments" accordion item in details panel using the webUI
#    Then the "comments" details panel should be visible
    When the user switches to "links" accordion item in details panel using the webUI
    Then the "links" details panel should be visible

  @comments-app-required @ocis-reva-issue-64
  Scenario: the recipient user should be able to view different areas of details panel in Shared with me page
    Given user "Alice" has created folder "simple-folder"
    And the user has browsed to the files page
    And user "Alice" has shared folder "simple-folder" with user "Brian"
    And the user re-logs in as "Brian" using the webUI
    When the user browses to the shared-with-me page
    Then folder "simple-folder" should be listed on the webUI
    When the user picks the row of folder "simple-folder" in the webUI
    Then the app-sidebar should be visible
    And the thumbnail should be visible in the app-sidebar
    When the user switches to "people" accordion item in details panel using the webUI
    Then the "people" details panel should be visible
#    When the user switches to "comments" accordion item in details panel using the webUI
#    Then the "comments" details panel should be visible
    When the user switches to "links" accordion item in details panel using the webUI
    Then the "links" details panel should be visible

  @ocis-reva-issue-106
  Scenario: without any share the shared-with-others page should be empty
    When the user browses to the shared-with-others page using the webUI
    Then there should be no resources listed on the webUI

  Scenario: without any share the shared-with-me page should be empty
    When the user browses to the shared-with-me page using the webUI
    Then there should be no resources listed on the webUI

  @skip @yetToImplement @comments-app-required
  Scenario: View different areas of details panel for the folder with given tag in Tags page
    Given user "Alice" has created folder "simple-folder"
    And the user has browsed to the files page
    Given user "Alice" has created a "normal" tag with name "simple"
    And user "Alice" has added tag "simple" to folder "simple-folder"
    When the user browses to the tags page
    And the user searches for tag "simple" using the webUI
    Then folder "simple-folder" should be listed on the webUI
    When the user opens the file action menu of folder "simple-folder" in the webUI
    And the user clicks the details file action in the webUI
    Then the details dialog should be visible in the webUI
    And the thumbnail should be visible in the details panel
    When the user switches to "sharing" accordion item in details panel using the webUI
    Then the "sharing" details panel should be visible
    When the user switches to "comments" accordion item in details panel using the webUI
    Then the "comments" details panel should be visible


  Scenario: the sidebar is invisible after closing
    Given user "Alice" has created file "lorem.txt"
    And the user has browsed to the files page
    When the user picks the row of file "lorem.txt" in the webUI
    Then the app-sidebar should be visible
    When the user closes the app-sidebar using the webUI
    Then the app-sidebar should be invisible

  @issue-4244
  Scenario: the sidebar is invisible after opening the selected folder
    Given user "Alice" has created file "simple-folder"
    And the user has browsed to the files page
    Given the app-sidebar for file "simple-folder" has been visible on the webUI
    When the user opens folder "simple-folder" using the webUI
    Then the app-sidebar should be invisible
