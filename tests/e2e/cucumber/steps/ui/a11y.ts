import { Given, When, Then } from '@cucumber/cucumber'
import { World } from '../../environment'
import { objects } from '../../../support'
import { config } from '../../../config'

// import { Space } from '../../../support/types'

import { api } from '../../../support'
// import { expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'





import { test, expect } from '../../../support/utils/a11yAxeBuilder'


const a11yUser = 'admin'

// check if this function is needed (copied from session.ts)
async function createNewSession(world: World, stepUser: string) {
    const { page } = await world.actorsEnvironment.createActor({
      key: stepUser,
      namespace: world.actorsEnvironment.generateNamespace(world.feature.name, stepUser)
    })
    return new objects.runtime.Session({ page })
  }


// Scenario: check accessibility of login page 
When('{string} navigates to the login page', async function (this: World, stepUser: string): Promise<void>{
    // const { page } = this.actorsEnvironment.getActor({ key: stepUser }) // fails because "actor with key 'Alice' not found"
    // const pageObject = new objects.login.Login({ page })
    // await pageObject.navigate()   

    // workaround, check why code above is not working
    await createNewSession(this, stepUser)
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    await page.goto('https://host.docker.internal:9200')
    await page.locator('.oc-login-bg').waitFor()
    // console.log(await page.locator('.oc-login-bg').innerHTML())
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the login page', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yResult = await new AxeBuilder({ page })
        .include('.oc-login-form')
        .exclude('#oc-login-username') // autocomplete attribute is incorrectly formatted
        .exclude('#oc-login-password') // autocomplete attribute is incorrectly formatted
        .analyze()

    expect(a11yResult.violations).toEqual([])
})
       
// Scenario: check accessibility of app header functionalities
Then('{string} should not encounter any automatically detectable accessibility issues concerning the search bar', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yResult = await new AxeBuilder({ page })
        .include('.')
        .exclude('#') //
        .exclude('#') // 
        .analyze()

    expect(a11yResult.violations).toEqual([])       
})
       
// When the user enters a search term (e.g. "lorem") into the searchbar
When('{string} enters a searchterm into the searchbar', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
When('{string} clicks on search', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
Then('{string} should not encounter any automatically detectable accessibility issues concerning the search view', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yResult = await new AxeBuilder({ page })
        .include('.')
        .exclude('#') //
        .exclude('#') // 
        .analyze()

    expect(a11yResult.violations).toEqual([])     
})
       
When('{string} clicks on notifications', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the notifications popup', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yResult = await new AxeBuilder({ page })
        .include('.')
        .exclude('#') //
        .exclude('#') // 
        .analyze()

    expect(a11yResult.violations).toEqual([])     
})
  
When('{string} clicks on my account', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})       

Then('{string} should not encounter any automatically detectable accessibility issues concerning the my account menu', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yResult = await new AxeBuilder({ page })
        .include('.')
        .exclude('#') //
        .exclude('#') // 
        .analyze()

    expect(a11yResult.violations).toEqual([])     
})
       
// When the user selects the option "Preferences" in the my account menu
When('{string} selects the Preferences option in the my account menu', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the account preference page', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yResult = await new AxeBuilder({ page })
        .include('.')
        .exclude('#') //
        .exclude('#') // 
        .analyze()

    expect(a11yResult.violations).toEqual([])     
})

When('{string} selects the application switcher', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the application switcher menu', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yResult = await new AxeBuilder({ page })
        .include('.')
        .exclude('#') //
        .exclude('#') // 
        .analyze()

    expect(a11yResult.violations).toEqual([])     
})       

Then('{string} closes the application switcher menu', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
// Scenario: check accessibility of app sidebar      
Then('{string} should not encounter any automatically detectable accessibility issues concerning the application sidebar', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yResult = await new AxeBuilder({ page })
        .include('#web-nav-sidebar')
        .analyze()

    expect(a11yResult.violations).toEqual([])     
})

When('{string} collapses the application sidebar', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    // ensure sidebar is visible
    await page.locator('#web-nav-sidebar').waitFor()
    // collapse sidebar
    await page.locator('.toggle-sidebar-button').click()
    await page.locator('.oc-app-navigation-collapsed').waitFor()
})
       
Then('{string} should not encounter any automatically detectable accessibility issues concerning the collapsed application sidebar', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yResult = await new AxeBuilder({ page })
        .include('.oc-app-navigation-collapsed')
        .analyze()

    expect(a11yResult.violations).toEqual([])     
})

// Scenario: check accessibility of files view
Then('{string} should not encounter any automatically detectable accessibility issues concerning the files section in default table view', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yResult = await new AxeBuilder({ page })
        .include('#files') 
        .exclude('.resource-table-edit-name') // buttons must have discernible text
        .exclude('.oc-resource-icon-link') // buttons/links must have discernible text 
        .analyze()

    expect(a11yResult.violations).toEqual([])     
})

When('{string} switches to the condensed table view', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    // ensure files is visible
    await page.locator('#files').waitFor()
    // switch to condensed table view
    await page.locator('.resource-table-condensed').click()
    await page.locator('#files-space-table.condensed').waitFor()
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the files section in condensed table view', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yResult = await new AxeBuilder({ page })
        .include('#files-space-table.condensed')
        .exclude('.resource-table-edit-name') // buttons must have discernible text
        .exclude('.oc-resource-icon-link') // buttons/links must have discernible text 
        .analyze()

    expect(a11yResult.violations).toEqual([])     
})

When('{string} switches to the tiles view', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    // ensure files section is visible
    await page.locator('#files').waitFor()
    // switch to tiles table view
    await page.locator('.resource-tiles').click() 
    await page.locator('.oc-tiles-controls').waitFor()
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the files section in tiles view', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yResult = await new AxeBuilder({ page })
        .include('#tiles-view') 
        .exclude('.oc-card-media-top') // issue with tiles with picture preview, element has focusable descendants
        .analyze()

    expect(a11yResult.violations).toEqual([])     
})

// currently this function is not used (replaced with an existing function)
Then('{string} switches to the default table view', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    // ensure files section is visible
    await page.locator('#files').waitFor()
    // switch to default table view
    await page.locator('.resource-table').click()
    await page.locator('#files-space-table').waitFor()
})

When('{string} selects the display options', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    // ensure files section is visible
    await page.locator('#files').waitFor()
    // select display options
    await page.locator('#files-view-options-btn').click() 
    await page.locator('#files-app-bar-controls-right .tippy-content').last().waitFor() // first element contains the invisible state, last the visible state
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the display options menu', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yResult = await new AxeBuilder({ page })
        .include('#files-app-bar-controls-right .tippy-content')
        .analyze()

    expect(a11yResult.violations).toEqual([])     
})

Then('{string} closes the display options menu', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    // click on display options (again)
    await page.locator('#files-view-options-btn').click() 
})

When('{string} opens the files context menu', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    // ensure files section is visible
    await page.locator('#files').waitFor()
    // right click to get context menu with "new folder" and "details" context menu
    await page.locator('#web-content-main').click({ button: 'right' })
    await page.locator('#context-menu-drop-whitespace').waitFor() 
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the files context menu', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yResult = await new AxeBuilder({ page })
        .include('#context-menu-drop-whitespace')
        .analyze()

    expect(a11yResult.violations).toEqual([])     
})

Then('{string} exits the files context menu', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    // ensure files section is visible
    await page.locator('#files').waitFor()
    // left (regular) mouse click
    await page.locator('#web-content-main').click()  
})
       
When('{string} selects new', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    
    // ensure files section is visible
    await page.locator('#files').waitFor()    
    // click on "+ new" button
    await page.locator('#new-file-menu-btn').click()
    await page.locator('.files-app-bar-actions .tippy-content').waitFor() 
})
       
Then('{string} should not encounter any automatically detectable accessibility issues concerning the new context menu', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yResult = await new AxeBuilder({ page })
        .include('.files-app-bar-actions .tippy-content')
        .analyze()

    expect(a11yResult.violations).toEqual([])     
})

When('{string} selects the folder option within the new context menu', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    // ensure that the context menu is visible
    await page.locator('.files-app-bar-actions .tippy-content').waitFor() 
    // click on "folder"
    await page.locator('#new-folder-btn').click()
    await page.locator('.oc-modal').waitFor()
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the create new folder popup', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yResult = await new AxeBuilder({ page })
        .include('.oc-modal')
        .analyze()

    expect(a11yResult.violations).toEqual([])     
})

Then('{string} cancels creating a new folder', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    await page.locator('.oc-modal-body-actions-cancel').click()
})
       
When('{string} selects upload', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    // ensure files section is visible
    await page.locator('#files').waitFor()    
    // click on "upload" button
    await page.locator('#upload-menu-btn').click()
    await page.locator('.files-app-bar-actions .tippy-content').waitFor() 
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the upload context menu', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yResult = await new AxeBuilder({ page })
        .include('.files-app-bar-actions .tippy-content')
        .analyze()

    expect(a11yResult.violations).toEqual([])     
})

// same as "exits the files context menu"
Then('{string} exits the upload menu', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    // ensure files section is visible
    await page.locator('#files').waitFor()
    // left (regular) mouse click
    await page.locator('#web-content-main').click()  
})

When('{string} selects a file by selecting the corresponding checkbox', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    // ensure files section is visible
    await page.locator('#files').waitFor()    
    // check checkbox of the first file in the list
    await page.locator('#files-space-table .oc-checkbox').first().check() 
    await page.locator('#oc-appbar-batch-actions').waitFor()
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the file actions buttons for that file', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    // check a11y of download, cut, copy & delete buttons
    const a11yResult = await new AxeBuilder({ page })
        .include('#oc-appbar-batch-actions')
        .analyze()

    expect(a11yResult.violations).toEqual([])     
})

Then('{string} deselects the file', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    await page.locator('#files').waitFor()    
    // check checkbox of the first file in the list
    await page.locator('#files-space-table .oc-checkbox').first().uncheck() 
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the file actions shares panel', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    // ensure shares panel is visible
    await page.locator('#sidebar-panel-sharing').waitFor()

    const a11yResult = await new AxeBuilder({ page })
        .include('#sidebar-panel-sharing')
        .exclude('#files-file-link-add') // insufficient color contrast for "add link"
        .analyze()

    expect(a11yResult.violations).toEqual([])     
})
      
When('{string} selects the view type option of the sharee within the shares panel', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    // ensure shares panel is visible
    await page.locator('#files-collaborators-list').waitFor()
    // select view type of sharee 
    await page.locator('button[aria-label="Edit permission"]').click() 
    await page.locator('.files-collaborators-collaborator-role .tippy-content').last().waitFor()
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the view type drop down in file actions shares panel', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yResult = await new AxeBuilder({ page })
        .include('.files-collaborators-collaborator-role .tippy-content') 
        .analyze()

    expect(a11yResult.violations).toEqual([])     
})

// same as "exits the files context menu"
Then('{string} exits the view type drop down', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    // ensure files section is visible
    await page.locator('#files').waitFor()
    // left (regular) mouse click
    await page.locator('#web-content-main').click() 
})

When('{string} opens the file context menu of a file', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    // ensure files section is visible
    await page.locator('#files').waitFor()    
    // click on the context menu of the first file in the list
    await page.locator('.resource-table-btn-action-dropdown').first().click() 
    await page.locator('.resource-table-actions .tippy-content').last().waitFor() // first element contains the invisible state, second (last) the visible state
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the file actions context menu for this file', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yResult = await new AxeBuilder({ page })
        .include('.resource-table-actions .tippy-content')
        .analyze()

    expect(a11yResult.violations).toEqual([])     
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the file actions details panel', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    // ensure details panel is visible
    await page.locator('#sidebar-panel-details').waitFor()

    const a11yResult = await new AxeBuilder({ page })
        .include('#sidebar-panel-details')
        .analyze()

    expect(a11yResult.violations).toEqual([])     
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the file actions actions panel', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    // ensure versions panel is visible
    await page.locator('#sidebar-panel-actions').waitFor()

    const a11yResult = await new AxeBuilder({ page })
        .include('#sidebar-panel-actions')
        .analyze()

    expect(a11yResult.violations).toEqual([])     
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the file actions versions panel', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    // ensure versions panel is visible
    await page.locator('#sidebar-panel-versions').waitFor()

    const a11yResult = await new AxeBuilder({ page })
        .include('#sidebar-panel-versions')
        .analyze()

    expect(a11yResult.violations).toEqual([])     
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the file actions activities panel', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    // ensure activities panel is visible
    await page.locator('#sidebar-panel-activities').waitFor()

    const a11yResult = await new AxeBuilder({ page })
        .include('#sidebar-panel-activities')
        .analyze()

    expect(a11yResult.violations).toEqual([])     
})

// Scenario: check accessibility of file preview 
When('{string} selects a media file that allows preview', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
     
Then('{string} should not encounter any automatically detectable accessibility issues concerning the file preview', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yResult = await new AxeBuilder({ page })
        .include('.')
        .exclude('#') //
        .exclude('#') // 
        .analyze()

    expect(a11yResult.violations).toEqual([])     
})

Then('{string} closes the file preview', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

// Scenario: check accessibility of shares     
Then('{string} should not encounter any automatically detectable accessibility issues concerning the shares view', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yResult = await new AxeBuilder({ page })
        .include('.')
        .exclude('#') //
        .exclude('#') // 
        .analyze()

    expect(a11yResult.violations).toEqual([])     
})

Then('{string} selects share type', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the share type popup menu', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yResult = await new AxeBuilder({ page })
        .include('.')
        .exclude('#') //
        .exclude('#') // 
        .analyze()

    expect(a11yResult.violations).toEqual([])     
})

// Scenario: check accessibility of deleted files 
Then('{string} should not encounter any automatically detectable accessibility issues concerning the deleted files view', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yResult = await new AxeBuilder({ page })
        .include('#files-view')
        .exclude('#files-breadcrumb') // aria-hidden elements should not be focusable nor contain focusable elements 
                                      // (error is triggered by some element in the breadcrumb)
        .analyze()

    expect(a11yResult.violations).toEqual([])     
})

When('{string} selects the deleted file', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    await page.locator('#files-space-table .oc-checkbox').first().check() 
    await page.locator('#oc-appbar-batch-actions').waitFor()
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the delete file action buttons', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yResult = await new AxeBuilder({ page })
        .include('#oc-appbar-batch-actions')
        .analyze()

    expect(a11yResult.violations).toEqual([])     
})

When('{string} clicks on delete', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    await page.locator('.oc-files-actions-delete-permanent-trigger').click()
    await page.locator('.oc-modal-danger').waitFor()
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the delete popup', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    const a11yResult = await new AxeBuilder({ page })
        .include('.oc-modal-danger')
        .analyze()

    expect(a11yResult.violations).toEqual([])     
})

Then('{string} confirms the delete action', async function (this: World, stepUser: string): Promise<void> {
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })

    await page.locator('.oc-modal-body-actions-confirm').click()
})


/* logging a particular HTML element for inspection 

console.log(await page.locator('').innerHTML())
await page.waitForTimeout(3000)

// first element contains the invisible state, second (last) the visible state

*/

/* code snipped for printing details of violations to find accessibility issues

    // print violations to console
    console.log('violation details:')
    var count = 0
    for (var o of a11yResult.violations) {
      console.log(o)
      count ++
    }
    console.log('total number of violations: ' + count)

*/
