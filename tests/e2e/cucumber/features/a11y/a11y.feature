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
    # check if the existing step below does the same
    # When "Admin" navigates to the app store
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the application switcher menu 
    # if more tests for app switcher functionalities (text editor (creating new file), app store, admin settings for users, groups, spaces management) are added
    # there should be a separate scenario for this 
    And "Alice" closes the application switcher menu
    And "Alice" logs out

    
  Scenario: check accessibility of app sidebar
    When "Alice" logs in
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the application sidebar 

    When "Alice" collapses the application sidebar
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the collapsed application sidebar 
    And "Alice" logs out
    

  Scenario: check accessibility of files view
    When "Alice" logs in
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the files section in default table view 

    When "Alice" switches to the condensed table view
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the files section in condensed table view 

    When "Alice" switches to the tiles-view
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the files section in tiles view 
    And "Alice" switches to the default table view

    When "Alice" selects the display options
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the display options menu 
    And "Alice" closes the display options menu

    When "Alice" opens the files context menu 
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the files context menu 
    And "Alice" exits the files context menu

    When "Alice" selects new
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the new context menu 

    When "Alice" selects the folder option within the new context menu
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the create new folder popup 
    # checking only one option of this menu because all modal use the same template
    And "Alice" cancels creating a new folder

    When "Alice" selects upload
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the upload context menu 
    And "Alice" exits the upload menu
    
    When "Alice" selects a file by selecting the corresponding checkbox
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the file actions buttons for that file 
    And "Alice" deselects the file

    When "Alice" opens the file context menu of a file
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the file actions context menu for this file
    
    When "Alice" navigates to "details" details panel of file "lorem.txt" of space "personal" through the URL
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the file actions details panel
    And "Alice" closes the sidebar

    When "Alice" navigates to "actions" details panel of file "lorem.txt" of space "personal" through the URL
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the file actions actions panel
    And "Alice" closes the sidebar

    When "Alice" navigates to "sharing" details panel of file "lorem.txt" of space "personal" through the URL
    And "Alice" shares the following resource using the sidebar panel
      | resource   | recipient | type | role     | resourceType |
      | lorem.txt  | Brian     | user | Can view | file         |
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the file actions shares panel 

    # When "Alice" searches for another user to share the file with within the shares panel
    # Then "Alice" should not encounter any automatically detectable accessibility issues concerning the user search drop down in file actions shares panel 
    # this would be about testing the search of a user and immediate preview while typing...
    
    When "Alice" selects the view type option of the sharee within the shares panel
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the view type drop down in file actions shares panel
    And "Alice" exits the view type drop down
    And "Alice" closes the sidebar

    When "Alice" navigates to "versions" details panel of file "lorem.txt" of space "personal" through the URL
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the file actions versions panel 
    And "Alice" closes the sidebar

    When "Alice" navigates to "activities" details panel of file "lorem.txt" of space "personal" through the URL
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the file actions activities panel 
    And "Alice" closes the sidebar
    And "Alice" logs out

    
  Scenario: check accessibility of file preview (of image and text?)
    When "Alice" logs in
    And "Alice" selects a media file that allows preview
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the media file preview
    And "Alice" closes the file preview

    # maybe also check text editor on surface level?
    # When "Alice" opens the file "lorem.txt" of space "personal" through the URL
    # Then "Alice" is in a text-editor
    # Then "Alice" should not encounter any automatically detectable accessibility issues concerning the text editor
    # And "Alice" closes the file viewer
    
    And "Alice" logs out


  Scenario: check accessibility of shares
    # either define here which file is shared with whom, or do this in background?
    # only test "shared with me" as "shared with others" and "shared via link" seems to have the same set of functionalities or subset thereof
    When "Alice" logs in
    And "Alice" shares the following resource using API
      | resource  | recipient | type | role     |
      | lorem.txt | Brian     | user | Can edit |
    And "Alice" logs out
    And "Brian" logs in

    # And "Alice" navigates to shares
    And "Brian" navigates to the shared with me page
    Then "Brian" should not encounter any automatically detectable accessibility issues concerning the shares view

    And "Brian" selects share type 
    Then "Brian" should not encounter any automatically detectable accessibility issues concerning the share type popup menu
    # share type & shared by seem to have the same functionalities, therefore testing one of them is enough coverage
    # share details uses the same templates as file details, therefore no additional test coverage
    And "Brian" logs out


  Scenario: check accessibility of spaces
  # it seems like there is no need to test spaces as it has the same features as personal space


  Scenario: check accessibility of deleted files
    When "Alice" logs in
    And "Alice" deletes the following resource using the sidebar panel
      | resource  |
      | lorem.txt | 
    And "Alice" navigates to the trashbin
    # deleted files page seems to be called trashbin in trashbinDelete.feature
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the deleted files view

    When "Alice" selects the deleted file 
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the delete file action buttons
    # delete & restore buttons

    When "Alice" clicks on delete 
    Then "Alice" should not encounter any automatically detectable accessibility issues concerning the delete popup
    # same for "empty trashbin"
    And "Alice" confirms the delete action
    And "Alice" logs out

