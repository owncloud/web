const { client } = require('nightwatch-api')
const { When, Then } = require('@cucumber/cucumber')
const assert = require('assert')
const _ = require('lodash')

When('the user browses to the account page', function () {
  return client.page.accountPage().navigateAndWaitTillLoaded()
})

Then(
  'the user should have following details displayed on the account information',
  async function (dataTable) {
    const expectedAccInfo = dataTable.rowsHash()
    const actualAccInfo = await client.page.accountPage().getAccountInformation()
    const actualEntries = Object.entries(actualAccInfo)

    const expectedKeys = Object.keys(expectedAccInfo)
    const actualKeys = Object.keys(actualAccInfo)

    if (actualKeys.length === 0) {
      throw new Error('Sorry, no any account information was found.')
    }

    const notFoundArray = []

    // every expected key should be inside the actual keys array
    expectedKeys.forEach((key) => {
      if (!actualKeys.includes(key)) {
        notFoundArray.push(key)
      }
    })

    if (notFoundArray.length > 0) {
      throw new Error(
        'Error: Missing account information' +
          '\n' +
          'Expected: ' +
          expectedKeys.join(', ') +
          '\n' +
          'Found: ' +
          actualKeys.join(', ') +
          '\n' +
          'Missing: ' +
          notFoundArray.join(', ')
      )
    }
    for (const [key, value] of actualEntries) {
      if (key === 'Group memberships') {
        const actualGroupMembership = value.split(',').map((grp) => grp.trim())
        const expectedGroupMembership = expectedAccInfo[key].split(',').map((grp) => grp.trim())
        const differenceInGroups = _.difference(actualGroupMembership, expectedGroupMembership)
        assert.strictEqual(
          differenceInGroups.length,
          0,
          'Actual group membership for the user was "' +
            actualGroupMembership +
            '" but was expected to be "' +
            expectedGroupMembership +
            '"'
        )
      } else {
        assert.strictEqual(value, expectedAccInfo[key])
      }
    }
  }
)
