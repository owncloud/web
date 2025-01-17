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
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the login page 
    # maybe also check the infopage that follows after entering login credential, although that page is only visible for a few seconds...


  Scenario: check accessibility of app header functionalities
    When "Alice" logs in
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the search bar 

    When "Alice" enters a searchterm into the searchbar
    And "Alice" clicks on search
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the search view 
    # maybe also check filters in search?
    
    When "Alice" clicks on notifications
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the notifications popup 

    When "Alice" clicks on my account
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the my account menu

    When "Alice" selects the Preferences option in the my account menu
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the account preference page 

    When "Alice" selects the application switcher
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the application switcher menu 
    # if more tests for app switcher functionalities (text editor (creating new file), app store, admin settings for users, groups, spaces management) are added
    # there should be a separate scenario for this 
    And "Alice" closes the application switcher menu

    
  Scenario: check accessibility of app sidebar
    When "Alice" logs in
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the application sidebar 

    When "Alice" collapses the application sidebar
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the collapsed application sidebar 
    

  Scenario: check accessibility of files view
    When "Alice" logs in
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the files section in default table view 

    When "Alice" selects condensed table view
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the files section in condensed table view 

    When "Alice" selects tiles view
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the files section in tiles view 
    And "Alice" switches back to the default view

    When "Alice" selects the display options
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the display options menu 
    And "Alice" closes the display options menu

    When "Alice" opens the files context menu 
    # right mouse click
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the files context menu 
    And "Alice" clicks again to close the context menu 
    # left mouse click

    When "Alice" selects new
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the new context menu 

    When "Alice" selects the Folder option within the new context menu
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the create new folder popup 
    # only checking one option of this menu because all modal use the same template
    And "Alice" cancels creating a new folder

    When "Alice" selects upload
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the upload context menu 
    And "Alice" exits the upload menu
    
    When "Alice" selects a file 
    # by selecting the corresponding checkbox
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the file actions buttons for that file 
    # download, cut, copy, delete buttons
    And "Alice" deselects the file

    When "Alice" selects the share action of a file 
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the file actions shares panel 

    When "Alice" searches for another user to share the file with within the shares panel
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the user search drop down in file actions shares panel 
    # figure out how to test this...
    And "Alice" exits the user search drop down
    
    When "Alice" selects the view type option within the shares panel
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the view type drop down in file actions shares panel
    And "Alice" exits the view type option
    And "Alice" closes the shares panel

    When "Alice" opens the file context menu of a file
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the file actions context menu for this file

    When "Alice" selects the Details option in the file actions context menu
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the file actions details panel
    # make sure to test this with a file that has a tag
    # there would be more nested submenus within the details panel, but they are quite simple and it seems like all of them use the same template, 
    # maybe just check one? for example activity or actions (actions would have the rename model, which seems to use the same template as new folder though)
    And "Alice" closes the details panel

    
  Scenario: check accessibility of file preview
    When "Alice" logs in
    And "Alice" selects a media file that allows preview
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the file preview
    And "Alice" closes the file preview


  Scenario: check accessibility of shares
    # either define here which file is shared with whom, or do this in background?
    # only test "shared with me" as "shared with others" and "shared via link" seems to have the same set of functionalities or subset thereof
    When "Alice" logs in
    And "Alice" navigates to shares
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the shares view

    And "Alice" selects share type 
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the share type popup menu
    # share type & shared by seem to have the same functionalities, therefore testing one of them is enough coverage
    # share details uses the same templates as file details, therefore no additional test coverage


  Scenario: check accessibility of spaces
  # it seems like there is no need to test spaces as it has the same features as personal space


  Scenario: check accessibility of deleted files
    When "Alice" logs in
    And "Alice" deletes a file
    And "Alice" navigates to deleted files
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the deleted files view

    When "Alice" selects a deleted file 
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the delete file action buttons for that file
    # delete & restore buttons

    When "Alice" clicks on delete 
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the delete popup
    #same for "empty trashbin"
