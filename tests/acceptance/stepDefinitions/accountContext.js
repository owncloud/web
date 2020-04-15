const { client } = require('nightwatch-api')
const { When, Then } = require('cucumber')
const assert = require('assert')
const _ = require('lodash')

When('the user browses to the account page', function() {
  return client.page.accountPage().navigateAndWaitTillLoaded()
})

Then('the user should have following details displayed on the account information', async function(
  dataTable
) {
  const expectedAccInfo = dataTable.rowsHash()
  const actualAccInfo = await client.page.accountPage().getAccountInformation()
  const actualEntries = Object.entries(actualAccInfo)
  for (const [key, value] of actualEntries) {
    if (key === 'Groups membership') {
      const actualGroupMembership = value.split(',').map(grp => grp.trim())
      const expectedGroupMembership = expectedAccInfo[key].split(',').map(grp => grp.trim())
      const differenceInGroups = _.difference(actualGroupMembership, expectedGroupMembership)
      assert.strictEqual(
        differenceInGroups.length,
        0,
        'Actual group membership for the user was ' +
          actualGroupMembership +
          ' but was expected to be ' +
          expectedGroupMembership
      )
    } else {
      assert.strictEqual(value, expectedAccInfo[key])
    }
  }
})

When('the user logs out using the webUI', function() {
  return client.page.accountPage().logout()
})
