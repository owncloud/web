import { test, expect, TestInfo } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility', () => {
  test('login page should not have any automatically detectable accessibility issues', async ({ page, baseURL }, testInfo) => {
    await page.goto(`${baseURL}`)
    await page.fill('#oc-login-username', 'admin')
    await page.fill('#oc-login-password', 'admin')
    await page.click("button[type='submit']")
    await page.locator('#files').waitFor()
    console.log('url: ' + baseURL)
    //console.log('url: ' + baseURL + shares)

    // users settings
    await page.goto(`${baseURL}/admin-settings/users`)
    await page.locator('#user-list').waitFor()

    // https://host.docker.internal:9200/admin-settings/users
    const a11yResult = await new AxeBuilder({ page }).include('#user-list').analyze()
    //console.log('report length:' + a11yResult.length)

    console.log('violations: ')
    var count = 0
    for (var o of a11yResult.violations) {
      console.log(o)
      count ++
    }

    console.log('number of violations: ' + count)

    await testInfo.attach('accessibility-scan-results', {
      body: JSON.stringify(a11yResult, null, 2),
      contentType: 'application/json'
    })

    expect(a11yResult.violations).not.toEqual([])
  })

  test('login page should not have any automatically detectable WCAG A or AA violations', async ({ page, baseURL }, testInfo) => {
    await page.goto(`${baseURL}`)
    await page.fill('#oc-login-username', 'admin')
    await page.fill('#oc-login-password', 'admin')
    await page.click("button[type='submit']")
    await page.locator('#files').waitFor()

    const a11yResult = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']) // specify which level should get checked
      .analyze()

    await testInfo.attach('accessibility-scan-results', {
      body: JSON.stringify(a11yResult, null, 2),
      contentType: 'application/json'
    })

    expect(a11yResult.violations).toEqual([]);
  })
})


/*

available tags  (check if there are more)

'cat.name-role-value',
'wcag2a',
'wcag412',
'section508',
'section508.22.a',
'TTv5',
'TT6.a',
'EN-301-549',
'EN-9.4.1.2',
'ACT'


current violations
{
  id: 'button-name',
  impact: 'critical',
  tags: [
    'cat.name-role-value',
    'wcag2a',
    'wcag412',
    'section508',
    'section508.22.a',
    'TTv5',
    'TT6.a',
    'EN-301-549',
    'EN-9.4.1.2',
    'ACT'
  ],
  description: 'Ensure buttons have discernible text',
  help: 'Buttons must have discernible text',
  helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/button-name?application=playwright',
  nodes: [
    {
      any: [Array],
      all: [],
      none: [],
      impact: 'critical',
      html: '<button data-v-babade49="" type="button" class="oc-button oc-rounded oc-button-m oc-button-justify-content-center oc-button-gap-m oc-button-passive oc-button-passive-raw oc-ml-xs" id="users-filter-confirm">',
      target: [Array],
      failureSummary: 'Fix any of the following:\n' +
        '  Element does not have inner text that is visible to screen readers\n' +
        '  aria-label attribute does not exist or is empty\n' +
        '  aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty\n' +
        '  Element has no title attribute\n' +
        '  Element does not have an implicit (wrapped) <label>\n' +
        '  Element does not have an explicit <label>\n' +
        `  Element's default semantics were not overridden with role="none" or role="presentation"`
    }
  ]
}
{
  id: 'empty-table-header',
  ✓  1 …should not have any automatically detectable accessibility issues (2.2s)
  tags: [ 'cat.name-role-value', 'best-practice' ],
  description: 'Ensure table headers have discernible text',
  help: 'Table header text should not be empty',
  helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/empty-table-header?application=playwright',
  nodes: [
    {
      any: [Array],
      all: [],
      none: [],
      impact: 'minor',
      html: '<th class="oc-table-cell oc-table-cell-align-left oc-table-cell-align-middle oc-table-cell-width-shrink oc-text-nowrap oc-th oc-table-header-cell oc-table-header-cell-avatar" style="top: 114px;"><div><span class="oc-table-thead-content header-text"></span></div></th>',
      target: [Array],
      failureSummary: 'Fix any of the following:\n' +
        '  Element does not have text that is visible to screen readers'
    }
  ]
}
*/
