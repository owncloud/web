Feature: Accessibility

  As a user with limited accessibility
  I want to be able to access all features of oCIS
  So that regardless of my abilities and circumstances, I can benefit from oCIS


  Scenario: check accessibility of files view
    Given "Admin" creates following users using API
      | id    |
      | Alice |
    And "Alice" uploads the following local file into personal space using API
      | localFile                     | to             |
      | filesForUpload/lorem.txt      | lorem.txt      |
      | filesForUpload/testavatar.jpg | testavatar.jpg |
    And "Alice" adds the following tags for the following resources using API
      | resource       | tags     |
      | lorem.txt      | test-tag |
      | testavatar.jpg | test-tag |

    When "Alice" logs in
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the files section in default table view

    When "Alice" switches to the condensed table view
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the files section in condensed table view

    When "Alice" switches to the tiles-view
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the files section in tiles view
    Given "Alice" switches to the default table view

    When "Alice" selects the display options
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the display options menu
    Given "Alice" closes the display options menu

    When "Alice" opens the files context menu
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the files context menu
    Given "Alice" exits the files context menu

    When "Alice" selects new
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the new context menu

    When "Alice" selects the folder option within the new context menu
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the create new folder popup
    Given "Alice" cancels creating a new folder

    When "Alice" selects upload
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the upload context menu
    Given "Alice" exits the upload menu

    When "Alice" selects a file by selecting the corresponding checkbox
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the file actions buttons for that file
    Given "Alice" deselects the file
