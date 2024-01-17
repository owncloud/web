Feature: User can open the details panel for any file or folder
  As a user
  I want to be able to open the details panel of any file or folder
  So that the details of the file or folder are visible to me

  Background:
    Given these users have been created with default attributes and without skeleton files in the server:
      | username |
      | Alice    |
      | Brian    |
    And user "Alice" has logged in using the webUI

  @files_versions-app-required
  Scenario: View different areas of the app-sidebar for a file in files page
    Given user "Alice" has created file "lorem.txt" in the server
    And the user has browsed to the personal page
    When the user opens the sidebar for file "lorem.txt" on the webUI
    Then the app-sidebar should be visible
    And the "details" details panel should be visible
    And the "big" preview of thumbnail should be visible in the "details" panel
    When the user switches to "actions" panel in details panel using the webUI
    Then the "actions" details panel should be visible
    And the "small" preview of thumbnail should be visible in the "actions" panel
    When the user switches to "people" panel in details panel using the webUI
    Then the "people" details panel should be visible
    And the "small" preview of thumbnail should be visible in the "people" panel
    When the user switches to "versions" panel in details panel using the webUI
    Then the "versions" details panel should be visible
    And the "small" preview of thumbnail should be visible in the "versions" panel

  @files_versions-app-required
  Scenario: View different areas of the app-sidebar for a folder in files page
    Given user "Alice" has created folder "simple-folder" in the server
    And the user has browsed to the personal page
    When the user opens the sidebar for folder "simple-folder" on the webUI
    Then the app-sidebar should be visible
    And the "details" details panel should be visible
    And the "big" preview of thumbnail should be visible in the "details" panel
    When the user switches to "actions" panel in details panel using the webUI
    Then the "actions" details panel should be visible
    And the "small" preview of thumbnail should be visible in the "actions" panel
    When the user switches to "people" panel in details panel using the webUI
    Then the "people" details panel should be visible
    And the "small" preview of thumbnail should be visible in the "people" panel

  @ocis-reva-issue-106
  Scenario: without any share the shared-with-others page should be empty
    When the user browses to the shared-with-others page using the webUI
    Then there should be no resources listed on the webUI


  Scenario: without any share the shared-with-me page should be empty
    When the user browses to the shared-with-me page in accepted shares view
    Then there should be no resources listed on the webUI
    When the user browses to the shared-with-me page in declined shares view
    Then there should be no resources listed on the webUI


  Scenario: the sidebar is invisible after closing
    Given user "Alice" has created file "lorem.txt" in the server
    And the user has browsed to the personal page
    When the user opens the sidebar for file "lorem.txt" on the webUI
    Then the app-sidebar should be visible
    When the user closes the app-sidebar using the webUI
    Then the app-sidebar should be invisible

  @issue-4244
  Scenario: the sidebar is invisible after opening the selected folder
    Given user "Alice" has created file "simple-folder" in the server
    And the user has browsed to the personal page
    When the user opens folder "simple-folder" using the webUI
    Then the app-sidebar should be invisible
