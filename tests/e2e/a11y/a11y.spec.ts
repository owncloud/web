import { test, expect } from './axeBuilder'

test.describe('Accessibility', () => {
  test('login page should not have any automatically detectable accessibility issues', async ({ page, baseURL, makeAxeBuilder }, testInfo ) => {
    await page.goto(`${baseURL}`)
    await page.fill('#oc-login-username', 'admin')
    await page.fill('#oc-login-password', 'admin')
    await page.click("button[type='submit']")
    await page.locator('#files').waitFor()

    // users settings
    await page.goto(`${baseURL}/admin-settings/users`)
    await page.locator('#user-list').waitFor()

    // https://host.docker.internal:9200/admin-settings/users
    const a11yResult = await makeAxeBuilder()
      .include('#user-list')
      //excluding known issues --> they still need to be reported
      .exclude('#users-filter-confirm')
      .analyze()

    // print violations to console
    console.log('violation details:')
    var count = 0
    for (var o of a11yResult.violations) {
      console.log(o)
      count ++
    }
    console.log('total number of violations: ' + count)

    // check output of the reports below
    await testInfo.attach('accessibility-scan-results', {
      body: JSON.stringify(a11yResult, null, 2),
      contentType: 'application/json'
    })

    expect(a11yResult.violations).toEqual([])
  })
})

