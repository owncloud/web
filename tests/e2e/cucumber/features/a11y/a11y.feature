Feature: Accessibility

  As a user with limited accessibility 
  I want to be able to access all features of oCIS
  So that regardless of my abilities and circumstances, I can benefit from oCIS


  Background:
    Given the following users exist
      | id    |
      | Admin |
      | Alice |
    And the following files have been uploaded and tagged accordingly
      | file           | tag  |
      | lorem.txt      |      |
      | testavatar.png | test |
    # maybe also define which files have been shared with which user?

    
  Scenario: check accessibility of login page
    When the user goes to the login page
    Then the login page should not have any automatically detectable accessibility issues
    # maybe also check the infopage that follows after entering login credential, although that page is only visible for a few seconds...


  Scenario: check accessibility of app header functionalities
    When the user logs into oCIS
    # do we need to specify which user?
    Then the search bar should not have any automatically detectable accessibility issues

    When the user enters a search term (e.g. "lorem") into the searchbar
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
    When the user logs into oCIS
    Then the application sidebar should not have any automatically detectable accessibility issues

    When user colapses the application sidebar
    Then the collapsed sidebar should not have any automatically detectable accessibility issues
    

  Scenario: check accessibility of files view
    When the user logs into oCIS
    Then the files section in default table view should not have any automatically detectable accessibility issues

    When the user selects condensed table view
    Then the files section in condensed table view should not have any automatically detectable accessibility issues

    When the user selects tiles view
    Then the files section in tiles view should not have any automatically detectable accessibility issues
    And the user switches back to the default view

    When the user selects the display options
    Then the display options menu should not have any automatically detectable accessibility issues
    And the user closes the display options menu

    When the user opens the files context menu (right mouse click)
    Then files context menu should not have any automatically detectable accessibility issues
    And the user clicks again (left mouse click) to close the context menu

    When the user selects "new"
    Then the "new" context menu should not have any automatically detectable accessibility issues

    When the user selects "folder" within the options of "new" context menu
    Then the create new folder popup should not have any automatically detectable accessibility issues
    # only checking one option of this menu because all modal use the same template
    And the user cancels creating a new folder

    When the user selects "upload"
    Then the upload context menu should not have any automatically detectable accessibility issues
    And the user exits the upload menu
    
    When the user selects a file (selecting the corresponding checkbox)
    Then the file actions buttons (download, cut, copy, delete) for that file should not have any automatically detectable accessibility issues
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
    When the user logs into oCIS
    And the user selects a media file that allows preview
    Then the file preview should not have any automatically detectable accessibility issues
    And the user closes the file preview


  Scenario: check accessibility of shares
    # either define here which file is shared with whom, or do this in background?
    # only test "shared with me" as "shared with others" and "shared via link" seems to have the same set of functionalities or subset thereof
    When the user logs into oCIS
    And the user navigates to shares
    Then the shares view should not have any automatically detectable accessibility issues

    And the user selects share type 
    Then the share type popup menu should not have any automatically detectable accessibility issues
    # share type & shared by seem to have the same functionalities, therefore testing one of them is enough coverage
    # share details uses the same templates as file details, therefore no additional test coverage


  Scenario: check accessibility of spaces
  # it seems like there is no need to test spaces as it has the same features as personal space


  Scenario: check accessibility of deleted files
    When the user logs into oCIS
    And the user deletes a file
    And the user navigates to deleted files
    Then the deleted files view should not have any automatically detectable accessibility issues

    And the user selects a deleted file 
    Then the file actions buttons (delete, restore) for that file should not have any automatically detectable accessibility issues

    And the user clicks on "delete" (or "empty trashbin")
    Then the delete / empty trashbin popup should not have any automatically detectable accessibility issues
