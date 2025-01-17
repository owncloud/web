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
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
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
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
When('{string} clicks on notifications', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the notifications popup', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
  
When('{string} clicks on my account', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})       

Then('{string} should not encounter any automatically detectable accessibility issues concerning the my account menu', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
// When the user selects the option "Preferences" in the my account menu
When('{string} selects the Preferences option in the my account menu', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the account preference page', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

When('{string} selects the application switcher', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the application switcher menu', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})       

Then('{string} closes the application switcher menu', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
// Scenario: check accessibility of app sidebar      
Then('{string} should not encounter any automatically detectable accessibility issues concerning the application sidebar', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
    // await page.locator('#web-nav-sidebar').waitFor()

    // EXAMPLE FOR LOCATOR
    // await page.locator(requestExportButton).waitFor()

    /*
    const a11yResult = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .include('#web-nav-sidebar')
        .analyze()

    expect(a11yResult.violations).toEqual([])
    */
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

When('{string} collapses the application sidebar', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this

    // await applicationObject.closeSidebar()
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
Then('{string} should not encounter any automatically detectable accessibility issues concerning the collapsed application sidebar', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

// Scenario: check accessibility of files view
Then('{string} should not encounter any automatically detectable accessibility issues concerning the files section in default table view', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

When('{string} selects condensed table view', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the files section in condensed table view', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

When('{string} selects tiles view', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the files section in tiles view', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

Then('{string} switches back to the default view', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

When('{string} selects the display options', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the display options menu', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

Then('{string} closes the display options menu', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

When('{string} opens the files context menu', async function (this: World, stepUser: string): Promise<void> {
    // right mouse click
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the files context menu', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

Then('{string} clicks again to close the context menu', async function (this: World, stepUser: string): Promise<void> {
    // left (regular) mouse click
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
// When the user selects "new"
When('{string} selects new', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
// Then the new context menu should not have any automatically detectable accessibility issues
Then('{string} should not encounter any automatically detectable accessibility issues concerning the new context menu', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

When('{string} selects the Folder option within the new context menu', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the create new folder popup', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

Then('{string} cancels creating a new folder', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
// When the user selects "upload"
When('{string} selects upload', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the upload context menu', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

Then('{string} exits the upload menu', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

When('{string} selects a file', async function (this: World, stepUser: string): Promise<void> {
    // by selecting the corresponding checkbox
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the file actions buttons for that file', async function (this: World, stepUser: string): Promise<void> {
    // download, cut, copy & delete buttons
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

Then('{string} deselects the file', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
// When the user selects the "share" action of a file
When('{string} selects the share action of a file', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the file actions shares panel', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

When('{string} searches for another user to share the file with within the shares panel', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the user search drop down in file actions shares panel', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

Then('{string} exits the user search drop down', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
      
When('{string} selects the view type option within the shares panel', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the view type drop down in file actions shares panel', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

Then('{string} exits the view type option', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

Then('{string} closes the shares panel', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

When('{string} opens the file context menu of a file', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the file actions context menu for this file', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})
       
// When the user selects the option "Details" in the file actions context menu
When('{string} selects the Details option in the file actions context menu', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

Then('{string} should not encounter any automatically detectable accessibility issues concerning the file actions details panel', async function (this: World, stepUser: string): Promise<void> {
    const { feature, actorsEnvironment, usersEnvironment, filesEnvironment } = this
       
    await new Promise(resolve => setTimeout(resolve, 10))
})

Then('{string} closes the details panel', async function (this: World, stepUser: string): Promise<void> {
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
       
