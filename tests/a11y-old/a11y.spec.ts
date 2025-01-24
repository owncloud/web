import { test, expect } from './axeBuilder'

test.describe('Accessibility', () => {
  test.describe('login page', () => {
    test('should not have any automatically detectable accessibility issues', async ({ page, baseURL, makeAxeBuilder } ) => {
      await page.goto(`${baseURL}`)
      await page.locator('.oc-login-bg').waitFor()

      const a11yResult = await makeAxeBuilder()
        .include('.oc-login-form')
        .exclude('#oc-login-username') // autocomplete attribute is incorrectly formatted
        .exclude('#oc-login-password') // autocomplete attribute is incorrectly formatted
        .analyze()

      expect(a11yResult.violations).toEqual([])
    })
  }),
  test.describe('app header', () => {
    test.skip('application switcher should not have any automatically detectable accessibility issues', async ({ page, baseURL, makeAxeBuilder } ) => {
      // maybe add tests later for the follwing items in the application switcher:
      // text editor (creating new file), app store, admin settings for users, groups, spaces management
    }),
    test.skip('search bar should not have any automatically detectable accessibility issues', async ({ page, baseURL, makeAxeBuilder } ) => {
      // test search by entering a search term that matches with some of the files that have been previousy uploaded 
      // test accessability of search peek preview and list filter type
    }),
    test.skip('notifications should not have any automatically detectable accessibility issues', async ({ page, baseURL, makeAxeBuilder } ) => {
      // test accessibility of notifications "popup" that appears when clicking on the corresponding icon (#oc-notifications-bell button)
    }),
    test.skip('my account popup should not have any automatically detectable accessibility issues', async ({ page, baseURL, makeAxeBuilder } ) => {
      // test accessibiity of my account "popup" that appears when clicking on #_userMenuButton button
    }),
    test.skip('account preferences page should not have any automatically detectable accessibility issues', async ({ page, baseURL, makeAxeBuilder } ) => {
      // test accessibiity of my account page that appears when clicking on preferences (#oc-topbar-account-manage) in the popup above
    })
  }),
  test.describe('sidebar', () => {
    test('full sidebar should not have any automatically detectable accessibility issues', async ({ page, baseURL, makeAxeBuilder } ) => {
      await page.goto(`${baseURL}`)
      await page.fill('#oc-login-username', 'admin')
      await page.fill('#oc-login-password', 'admin')
      await page.click("button[type='submit']")
      await page.locator('#web-nav-sidebar').waitFor()

      const a11yResult = await makeAxeBuilder()
        .include('#web-nav-sidebar')
        .analyze()

      expect(a11yResult.violations).toEqual([])
    }),
    test('collapsed sidebar should not have any automatically detectable accessibility issues', async ({ page, baseURL, makeAxeBuilder } ) => {
      await page.goto(`${baseURL}`)
      await page.fill('#oc-login-username', 'admin')
      await page.fill('#oc-login-password', 'admin')
      await page.click("button[type='submit']")
      await page.locator('#web-nav-sidebar').waitFor()
      // collapse sidebar
      await page.locator('.toggle-sidebar-button').click()
      await page.locator('.oc-app-navigation-collapsed').waitFor()

      const a11yResult = await makeAxeBuilder()
        .include('#web-nav-sidebar')
        .analyze()

      expect(a11yResult.violations).toEqual([])
    })
  }),
  test.describe('personal space page', () => {
    // precondition for the following tests: 
    // there should be some files uploaded, and some tags have been added to some of these files
    // at least one file should have been shared with another user

    test('files section in default table view should not have any automatically detectable accessibility issues', async ({ page, baseURL, makeAxeBuilder } ) => {  
      await page.goto(`${baseURL}`)
      await page.fill('#oc-login-username', 'admin')
      await page.fill('#oc-login-password', 'admin')
      await page.click("button[type='submit']")
      await page.locator('#files').waitFor()

      const a11yResult = await makeAxeBuilder()
        .include('#files') //
        .exclude('.resource-table-edit-name') // buttons must have discernible text
        .exclude('.oc-resource-icon-link') // buttons/links must have discernible text 
        .analyze()

      expect(a11yResult.violations).toEqual([])
    }),
    test('files section in condensed table view should not have any automatically detectable accessibility issues', async ({ page, baseURL, makeAxeBuilder } ) => {
      await page.goto(`${baseURL}`)
      await page.fill('#oc-login-username', 'admin')
      await page.fill('#oc-login-password', 'admin')
      await page.click("button[type='submit']")
      await page.locator('#files').waitFor()
      // switch view
      await page.locator('.resource-table-condensed').click()
      await page.locator('#files-space-table.condensed').waitFor()

      const a11yResult = await makeAxeBuilder()
        .include('#files-space-table') //
        .exclude('.resource-table-edit-name') // buttons must have discernible text
        .exclude('.oc-resource-icon-link') // buttons/links must have discernible text 
        .analyze()

      expect(a11yResult.violations).toEqual([])
    }),
    test('files section in tiles view should not have any automatically detectable accessibility issues', async ({ page, baseURL, makeAxeBuilder } ) => {
      await page.goto(`${baseURL}`)
      await page.fill('#oc-login-username', 'admin')
      await page.fill('#oc-login-password', 'admin')
      await page.click("button[type='submit']")
      await page.locator('#files').waitFor()
      // switch view
      await page.locator('.resource-tiles').click() 
      await page.locator('.oc-tiles-controls').waitFor()

      const a11yResult = await makeAxeBuilder()
        .include('#tiles-view') //
        .exclude('.oc-card-media-top') // issue with tiles with picture preview, element has focusable descendants
        .analyze()

      expect(a11yResult.violations).toEqual([])
    }),
    test('"new" context menu should not have any automatically detectable accessibility issues', async ({ page, baseURL, makeAxeBuilder } ) => {
      await page.goto(`${baseURL}`)
      await page.fill('#oc-login-username', 'admin')
      await page.fill('#oc-login-password', 'admin')
      await page.click("button[type='submit']")
      await page.locator('#files').waitFor()    
      // click on "+ new" button
      await page.locator('#new-file-menu-btn').click()
      await page.locator('.files-app-bar-actions .tippy-content').waitFor() 

      const a11yResult = await makeAxeBuilder()
        .include('.files-app-bar-actions .tippy-content')
        .analyze()

      expect(a11yResult.violations).toEqual([])
    }),
    test('"upload" context menu should not have any automatically detectable accessibility issues', async ({ page, baseURL, makeAxeBuilder } ) => {
      await page.goto(`${baseURL}`)
      await page.fill('#oc-login-username', 'admin')
      await page.fill('#oc-login-password', 'admin')
      await page.click("button[type='submit']")
      await page.locator('#files').waitFor()    
      // click on "+ new" button
      await page.locator('#upload-menu-btn').click()
      await page.locator('.files-app-bar-actions .tippy-content').waitFor() 

      const a11yResult = await makeAxeBuilder()
        .include('.files-app-bar-actions .tippy-content')
        .analyze()

      expect(a11yResult.violations).toEqual([])
    }),
    test('create new folder popup should not have any automatically detectable accessibility issues', async ({ page, baseURL, makeAxeBuilder } ) => {
      await page.goto(`${baseURL}`)
      await page.fill('#oc-login-username', 'admin')
      await page.fill('#oc-login-password', 'admin')
      await page.click("button[type='submit']")
      await page.locator('#files').waitFor()    
      // click on "+ new" button
      await page.locator('#new-file-menu-btn').click()
      await page.locator('.files-app-bar-actions .tippy-content').waitFor() 
      // click on "folder"
      await page.locator('#new-folder-btn').click()
      await page.locator('.oc-modal').waitFor()

      const a11yResult = await makeAxeBuilder()
        .include('.oc-modal')
        .analyze()

      expect(a11yResult.violations).toEqual([])
    }),
    test('files context menu should not have any automatically detectable accessibility issues', async ({ page, baseURL, makeAxeBuilder } ) => {
      await page.goto(`${baseURL}`)
      await page.fill('#oc-login-username', 'admin')
      await page.fill('#oc-login-password', 'admin')
      await page.click("button[type='submit']")
      await page.locator('#files').waitFor()    
      // right click to get "new folder" and "details" context menu
      await page.locator('#web-content-main').click({ button: 'right' })
      await page.locator('.tippy-content').waitFor() 

      const a11yResult = await makeAxeBuilder()
        .include('.tippy-content')
        .analyze()

      expect(a11yResult.violations).toEqual([])
    }),
    //Select file
    test('file actions buttons for specific file should not have any automatically detectable accessibility issues', async ({ page, baseURL, makeAxeBuilder } ) => {
      await page.goto(`${baseURL}`)
      await page.fill('#oc-login-username', 'admin')
      await page.fill('#oc-login-password', 'admin')
      await page.click("button[type='submit']")
      await page.locator('#files').waitFor()    
      // check checkbox of the first file in the list
      await page.locator('#files-space-table .oc-checkbox').first().check() 
      await page.locator('#oc-appbar-batch-actions').waitFor()

      const a11yResult = await makeAxeBuilder()
        .include('#oc-appbar-batch-actions')
        .analyze()

      expect(a11yResult.violations).toEqual([])
    }),
    test('file actions context menu for specific file should not have any automatically detectable accessibility issues', async ({ page, baseURL, makeAxeBuilder } ) => {
      await page.goto(`${baseURL}`)
      await page.fill('#oc-login-username', 'admin')
      await page.fill('#oc-login-password', 'admin')
      await page.click("button[type='submit']")
      await page.locator('#files').waitFor()    
      // click on the context menu of the first file in the list
      await page.locator('.resource-table-btn-action-dropdown').first().click() 
      await page.locator('.tippy-content').last().waitFor() // first element contains the invisible state, second (last) the visible state

      const a11yResult = await makeAxeBuilder()
        .include('.tippy-content')
        .analyze()

      expect(a11yResult.violations).toEqual([])
    }),
    test('file actions details panel should not have any automatically detectable accessibility issues', async ({ page, baseURL, makeAxeBuilder } ) => {
      await page.goto(`${baseURL}`)
      await page.fill('#oc-login-username', 'admin')
      await page.fill('#oc-login-password', 'admin')
      await page.click("button[type='submit']")
      await page.locator('#files').waitFor()    
      // click on the context menu of the first file in the list
      await page.locator('.resource-table-btn-action-dropdown').first().click() 
      await page.locator('.tippy-content').last().waitFor() // first element contains the invisible state, second (last) the visible state
      // select "details"
      await page.locator('#oc-files-context-actions-sidebar').click() 
      await page.locator('#sidebar-panel-details').waitFor()

      const a11yResult = await makeAxeBuilder()
        .include('#sidebar-panel-details')
        .analyze()

      expect(a11yResult.violations).toEqual([])
    }),
    test('file actions share panel should not have any automatically detectable accessibility issues', async ({ page, baseURL, makeAxeBuilder } ) => {
      await page.goto(`${baseURL}`)
      await page.fill('#oc-login-username', 'admin')
      await page.fill('#oc-login-password', 'admin')
      await page.click("button[type='submit']")
      await page.locator('#files').waitFor()
      // select quick file actions share
      await page.locator('.files-quick-action-show-shares').first().click() 
      await page.locator('#sidebar-panel-sharing').waitFor()

      const a11yResult = await makeAxeBuilder()
        .include('#sidebar-panel-sharing')
        .exclude('#files-file-link-add') // insufficient color contrast for "add link"
        .analyze()

      expect(a11yResult.violations).toEqual([])
    }),
    // selecting user from combobox (search dropdown) should also be tested, however test code below is not working
    test.skip('user drop down in file actions share panel should not have any automatically detectable accessibility issues', async ({ page, baseURL, makeAxeBuilder } ) => {
      await page.goto(`${baseURL}`)
      await page.fill('#oc-login-username', 'admin')
      await page.fill('#oc-login-password', 'admin')
      await page.click("button[type='submit']")
      await page.locator('#files').waitFor()
      // select quick file actions share
      await page.locator('.files-quick-action-show-shares').first().click() 
      await page.locator('#sidebar-panel-sharing').waitFor()
      // select user with whom the file shouldbe shared 
      await page.fill('#files-share-invite-input', 'einstein')
      await page.locator('.vs__dropdown-toggle').last().waitFor() // first instance contains tags, second (last) instance contains search 
      await page.locator('.vs__dropdown-toggle').last().click() 
      //await page.locator('#new-collaborators-form').waitFor()
      //await page.locator('.files-share-invite-recipient').waitFor()

      //console.log(await page.locator('#new-collaborators-form ul').innerHTML())
      console.log(await page.locator('#new-collaborators-form').innerHTML())

      const a11yResult = await makeAxeBuilder()
        .include('#new-collaborators-form')
        //.exclude('#files-file-link-add') // insufficient color contrast for "add link"
        .analyze()

      expect(a11yResult.violations).toEqual([])
    }),
    test('view type drop down in file actions share panel should not have any automatically detectable accessibility issues', async ({ page, baseURL, makeAxeBuilder } ) => {
      await page.goto(`${baseURL}`)
      await page.fill('#oc-login-username', 'admin')
      await page.fill('#oc-login-password', 'admin')
      await page.click("button[type='submit']")
      await page.locator('#files').waitFor()
      // select quick file actions share
      await page.locator('.files-quick-action-show-shares').first().click() 
      await page.locator('#sidebar-panel-sharing').waitFor()
      // select view type
      await page.locator('#files-collaborators-role-button-new').click() 
      await page.locator('.tippy-content').last().waitFor()

      const a11yResult = await makeAxeBuilder()
        .include('.tippy-content')
        .analyze()

      expect(a11yResult.violations).toEqual([])
    }),
    // 
    test.skip('new context menu with details for the file list should not have any automatically detectable accessibility issues', async ({ page, baseURL, makeAxeBuilder } ) => {
      /*
      await page.goto(`${baseURL}`)
      await page.fill('#oc-login-username', 'admin')
      await page.fill('#oc-login-password', 'admin')
      await page.click("button[type='submit']")
      await page.locator('#web-content-main').waitFor()
      // switch view
      await page.locator('.resource-tiles').click() 
      await page.locator('.oc-tiles-controls').waitFor()

      const a11yResult = await makeAxeBuilder()
        .include('#tiles-view') //
        //.exclude('id or class') // issue?
        .analyze()

      // print violations to console
      console.log('violation details:')
      var count = 0
      for (var o of a11yResult.violations) {
        console.log(o)
        count ++
      }
      console.log('total number of violations: ' + count)

      expect(a11yResult.violations).not.toEqual([])
      */
    })

    // test uploading files .files-app-bar-actions #new-file-menu-btn (for new file), #upload-menu-btn (for uploading file)
    // tests for settings  

  })
})

