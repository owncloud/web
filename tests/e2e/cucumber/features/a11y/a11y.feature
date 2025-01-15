Feature: Accessibility

  As a user with limited accessibility 
  I want to be able to access all features of oCIS
  So that regardless of my abilities and circumstances, I can benefit from oCIS


  Background:
    Given "Admin" creates following users using API
      | id    |
      | Alice |
      | Brian |
    And "Alice" uploads the following local file into personal space using API
      | localFile                     | to             |
      | filesForUpload/lorem.txt      | lorem.txt      |
      | filesForUpload/testavatar.jpg | testavatar.jpg |
    And "Alice" adds the following tags for the following resources using API
      | resource       | tags     |
      | lorem.txt      | test-tag |
      | testavatar.jpg | test-tag |


  Scenario: check accessibility of login page
    When "Alice" navigates to the login page
    Then "Alice" should not encounter any automatically detectable accessibility issues on the login page 
    # maybe also check the infopage that follows after entering login credential, although that page is only visible for a few seconds...


  Scenario: check accessibility of app header functionalities
    When "Alice" logs in
    Then the search bar should not have any automatically detectable accessibility issues

    When the user enters a searchterm into the searchbar
    And the user clicks on search
    Then the search view should not have any automatically detectable accessibility issues
    # maybe also check filters in search?
    
    When the user clicks on notifications
    Then the notifications popup should not have any automatically detectable accessibility issues

    When the user clicks on my account
    Then the my account menu should not have any automatically detectable accessibility issues

    When the user selects the option "Preferences" in the my account menu
    Then the account preference page should not have any automatically detectable accessibility issues

    When the user selects the application switcher
    Then the application switcher menu should not have any automatically detectable accessibility issues 
    # if more tests for app switcher functionalities (text editor (creating new file), app store, admin settings for users, groups, spaces management) are added
    # there should be a separate scenario for this 
    And the user closes the application switcher menu

    
  Scenario: check accessibility of app sidebar
    When "Admin" logs in
    Then the application sidebar should not have any automatically detectable accessibility issues

    When the user collapses the application sidebar
    Then the collapsed sidebar should not have any automatically detectable accessibility issues
    

  Scenario: check accessibility of files view
    When "Admin" logs in
    Then the files section in default table view should not have any automatically detectable accessibility issues

    When the user selects condensed table view
    Then the files section in condensed table view should not have any automatically detectable accessibility issues

    When the user selects tiles view
    Then the files section in tiles view should not have any automatically detectable accessibility issues
    And the user switches back to the default view

    When the user selects the display options
    Then the display options menu should not have any automatically detectable accessibility issues
    And the user closes the display options menu

    When the user opens the files context menu 
    # right mouse click
    Then the files context menu should not have any automatically detectable accessibility issues
    And the user clicks again to close the context menu 
    # left mouse click

    When the user selects new
    Then the new context menu should not have any automatically detectable accessibility issues

    When the user selects "folder" within the options of "new" context menu
    Then the create new folder popup should not have any automatically detectable accessibility issues
    # only checking one option of this menu because all modal use the same template
    And the user cancels creating a new folder

    When the user selects upload
    Then the upload context menu should not have any automatically detectable accessibility issues
    And the user exits the upload menu
    
    When the user selects a file 
    # by selecting the corresponding checkbox
    Then the file actions buttons for that file should not have any automatically detectable accessibility issues 
    # download, cut, copy, delete buttons
    And the user deselects the file

    When the user selects the "share" action of a file 
    Then the file actions shares panel should not have any automatically detectable accessibility issues

    When the user searches for another user to share the file with within the shares panel
    Then the user search drop down in file actions shares panel should not have any automatically detectable accessibility issues
    # figure out how to test this...
    And the user exits the user search drop down
    
    When the user selects the view type option within the shares panel
    Then the view type drop down in file actions shares panel should not have any automatically detectable accessibility issues
    And the user exits the view type option
    And the user closes the shares panel

    When the user opens the file context menu of a file
    Then the file actions context menu for this file should not have any automatically detectable accessibility issues

    When the user selects the option "Details" in the file actions context menu
    Then the file actions details panel should not have any automatically detectable accessibility issues
    # make sure to test this with a file that has a tag
    # there would be more nested submenus within the details panel, but they are quite simple and it seems like all of them use the same template, 
    # maybe just check one? for example activity or actions (actions would have the rename model, which seems to use the same template as new folder though)
    And the user closes the details panel

    
  Scenario: check accessibility of file preview
    When "Admin" logs in
    And the user selects a media file that allows preview
    Then the file preview should not have any automatically detectable accessibility issues
    And the user closes the file preview


  Scenario: check accessibility of shares
    # either define here which file is shared with whom, or do this in background?
    # only test "shared with me" as "shared with others" and "shared via link" seems to have the same set of functionalities or subset thereof
    When "Admin" logs in
    And the user navigates to shares
    Then the shares view should not have any automatically detectable accessibility issues

    And the user selects share type 
    Then the share type popup menu should not have any automatically detectable accessibility issues
    # share type & shared by seem to have the same functionalities, therefore testing one of them is enough coverage
    # share details uses the same templates as file details, therefore no additional test coverage


  Scenario: check accessibility of spaces
  # it seems like there is no need to test spaces as it has the same features as personal space


  Scenario: check accessibility of deleted files
    When "Admin" logs in
    And the user deletes a file
    And the user navigates to deleted files
    Then the deleted files view should not have any automatically detectable accessibility issues

    When the user selects a deleted file 
    Then the delete file actions buttons for that file should not have any automatically detectable accessibility issues 
    # delete & restore buttons

    When the user clicks on delete 
    Then the delete popup should not have any automatically detectable accessibility issues
    #same for "empty trashbin"
