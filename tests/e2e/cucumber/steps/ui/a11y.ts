import { Given, When, Then, DataTable } from '@cucumber/cucumber'
import { World } from '../../environment'
import { objects } from '../../../support'
// import { Space } from '../../../support/types'

import { api } from '../../../support'
// import { expect } from '@playwright/test'




import { test, expect } from '../../../support/utils/a11yAxeBuilder'



// Scenario: check accessibility of login page 
Given('the following users have been created using the API', async function (this: World, dataTable: any): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
  
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
Given('the following files have been uploaded and tagged accordingly', async function (this: World, dataTable: DataTable): Promise<void> {
    const user = this.usersEnvironment.getUser({ key: 'Alice' }) // 'Admin' 
    for (const info of dataTable.hashes()) {
        await api.dav.uploadFileInPersonalSpace({
            user,
            pathToFile: info.file, 
            content: '../../../filesForUpload/' + info.file // check if this works
        })
    }
    // add tags?
    // check if all files have been uploaded successfully?       
})

When('the user navigates to the login page', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
    
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
Then('the login page should not have any automatically detectable accessibility issues', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
// Scenario: check accessibility of app header functionalities
When('the user logs into oCIS', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
Then('the search bar should not have any automatically detectable accessibility issues', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
// When the user enters a search term (e.g. "lorem") into the searchbar
When('the user enters a searchterm into the searchbar', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
When('the user clicks on search', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
Then('the search view should not have any automatically detectable accessibility issues', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
When('the user clicks on notifications', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
Then('the notifications popup should not have any automatically detectable accessibility issues', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
  
When('the user clicks on my account', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})       

Then('the my account menu should not have any automatically detectable accessibility issues', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
// When the user selects the option "Preferences" in the my account menu
When('the user selects the option {string} in the my account menu', async function (this: World, string: any): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
Then('the account preference page should not have any automatically detectable accessibility issues', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
When('the user selects the application switcher', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
    
Then('the application switcher menu should not have any automatically detectable accessibility issues', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})       
       
Then('the user closes the application switcher menu', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
// Scenario: check accessibility of app sidebar       
Then('the application sidebar should not have any automatically detectable accessibility issues', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

When('the user collapses the application sidebar', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this

    // await applicationObject.closeSidebar()
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
Then('the collapsed sidebar should not have any automatically detectable accessibility issues', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

// Scenario: check accessibility of files view
Then('the files section in default table view should not have any automatically detectable accessibility issues', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
When('the user selects condensed table view', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})       

Then('the files section in condensed table view should not have any automatically detectable accessibility issues', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
When('the user selects tiles view', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
Then('the files section in tiles view should not have any automatically detectable accessibility issues', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
Then('the user switches back to the default view', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
When('the user selects the display options', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
Then('the display options menu should not have any automatically detectable accessibility issues', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
Then('the user closes the display options menu', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
When('the user opens the files context menu', async function (this: World): Promise<void> {
    // right mouse click
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
Then('the files context menu should not have any automatically detectable accessibility issues', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
Then('the user clicks again to close the context menu', async function (this: World): Promise<void> {
    // left (regular) mouse click
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
// When the user selects "new"
When('the user selects new', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
// Then the new context menu should not have any automatically detectable accessibility issues
Then('the new context menu should not have any automatically detectable accessibility issues', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
// When the user selects "folder" within the options of "new" context menu
When('the user selects {string} within the options of {string} context menu', async function (this: World, string: any, string2: any): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
Then('the create new folder popup should not have any automatically detectable accessibility issues', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
Then('the user cancels creating a new folder', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
// When the user selects "upload"
When('the user selects upload', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
Then('the upload context menu should not have any automatically detectable accessibility issues', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
Then('the user exits the upload menu', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
When('the user selects a file', async function (this: World): Promise<void> {
    // by selecting the corresponding checkbox
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
Then('the file actions buttons for that file should not have any automatically detectable accessibility issues', async function (this: World): Promise<void> {
    // download, cut, copy & delete buttons
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
Then('the user deselects the file', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
// When the user selects the "share" action of a file
When('the user selects the {string} action of a file', async function (this: World, string: any): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
Then('the file actions shares panel should not have any automatically detectable accessibility issues', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
When('the user searches for another user to share the file with within the shares panel', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
Then('the user search drop down in file actions shares panel should not have any automatically detectable accessibility issues', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
Then('the user exits the user search drop down', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
When('the user selects the view type option within the shares panel', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
Then('the view type drop down in file actions shares panel should not have any automatically detectable accessibility issues', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
Then('the user exits the view type option', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
Then('the user closes the shares panel', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
When('the user opens the file context menu of a file', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
Then('the file actions context menu for this file should not have any automatically detectable accessibility issues', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
// When the user selects the option "Details" in the file actions context menu
When('the user selects the option {string} in the file actions context menu', async function (this: World, string: any): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

Then('the file actions details panel should not have any automatically detectable accessibility issues', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
Then('the user closes the details panel', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

// Scenario: check accessibility of file preview 
When('the user selects a media file that allows preview', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
Then('the file preview should not have any automatically detectable accessibility issues', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
Then('the user closes the file preview', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

// Scenario: check accessibility of shares
When('the user navigates to shares', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

// from shares.ts
/*
When(
    '{string} navigates to the shared with me page',
    async function (this: World, stepUser: string): Promise<void> {
      const { page } = this.actorsEnvironment.getActor({ key: stepUser })
      const pageObject = new objects.applicationFiles.page.shares.WithMe({ page })
      await pageObject.navigate()
    }
  )
    */
       
Then('the shares view should not have any automatically detectable accessibility issues', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
Then('the user selects share type', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
Then('the share type popup menu should not have any automatically detectable accessibility issues', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

// Scenario: check accessibility of deleted files
When('the user deletes a file', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
When('the user navigates to deleted files', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
Then('the deleted files view should not have any automatically detectable accessibility issues', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
When('the user selects a deleted file', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
Then('the delete file actions buttons for that file should not have any automatically detectable accessibility issues', async function (this: World): Promise<void> {
    // delete & restore buttons
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
When('the user clicks on delete', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
Then('the delete popup should not have any automatically detectable accessibility issues', async function (this: World): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
