const { client } = require('nightwatch-api')
const { After, Before, Given, Then, When } = require('@cucumber/cucumber')
const httpHelper = require('../helpers/httpHelper')
const assert = require('assert')
const fs = require('fs')
const path = require('path')
const occHelper = require('../helpers/occHelper')

let initialConfigJsonSettings

const getConfigJsonContent = function (fullPathOfConfigFile) {
  if (!fs.existsSync(fullPathOfConfigFile)) {
    throw Error('Could not find configfile')
  }
  const rawdata = fs.readFileSync(fullPathOfConfigFile)
  return JSON.parse(rawdata)
}

Given('the property {string} has been set to {string} in web config file', function (key, value) {
  const data = getConfigJsonContent(this.fullPathOfConfigFile)
  data[key] = value
  return fs.writeFileSync(this.fullPathOfConfigFile, JSON.stringify(data, null, 4))
})

function setconfig(key, subkey, value, configfile) {
  const data = getConfigJsonContent(configfile)
  if (!data[key]) {
    data[key] = {}
  }
  data[key][subkey] = value
  return fs.writeFileSync(configfile, JSON.stringify(data, null, 4))
}

Given(
  'the property {string} of {string} has been set to {string} in web config file',
  function (subkey, key, value) {
    return setconfig(key, subkey, value, this.fullPathOfConfigFile)
  }
)

Given(
  'the property {string} of {string} has been set to true in web config file',
  function (subkey, key) {
    return setconfig(key, subkey, true, this.fullPathOfConfigFile)
  }
)

Given(
  'the property {string} of {string} has been set to false in web config file',
  function (subkey, key) {
    return setconfig(key, subkey, false, this.fullPathOfConfigFile)
  }
)

When(
  'the property {string} of {string} is changed to true in web config file',
  function (subkey, key) {
    return setconfig(key, subkey, true, this.fullPathOfConfigFile)
  }
)

When(
  'the property {string} of {string} is changed to false in web config file',
  function (subkey, key) {
    return setconfig(key, subkey, false, this.fullPathOfConfigFile)
  }
)

Given('the property {string} has been deleted in web config file', function (key) {
  const data = getConfigJsonContent(this.fullPathOfConfigFile)
  delete data[key]
  return fs.writeFileSync(this.fullPathOfConfigFile, JSON.stringify(data, null, 4))
})

Then(
  'the {word} message with header {string} should be displayed on the webUI',
  async function (type, message) {
    const text = await client.page.webPage().getDisplayedMessage(type, true)
    assert.strictEqual(text, message)

    const element = type === 'error' ? '@errorMessage' : '@message'
    return await client.page.webPage().waitForElementNotPresent(element)
  }
)

Then(
  'the following {word} message should be displayed on the webUI',
  async function (type, message) {
    const displayedMessage = await client.page.webPage().getDisplayedMessage(type)
    assert.strictEqual(displayedMessage, message)
  }
)

Then(
  'the error message {string} should be displayed on the webUI dialog prompt',
  function (message) {
    return client.page
      .webPage()
      .waitForElementVisible('@ocDialogPromptAlert')
      .expect.element('@ocDialogPromptAlert')
      .text.to.equal(message)
  }
)

Then(
  'the user should see the following error message on the link resolve page',
  function (message) {
    return client.page
      .publicLinkPasswordPage()
      .waitForElementVisible('@linkResolveErrorTitle')
      .expect.element('@linkResolveErrorTitle')
      .text.to.equal(message)
  }
)

When('the user clears all error message from the webUI', function () {
  return client.page.webPage().clearAllErrorMessages()
})

Then('no message should be displayed on the webUI', async function () {
  const hasMessage = await client.page.webPage().hasErrorMessage(false)
  assert.strictEqual(hasMessage, false, 'Expected no messages but a message is displayed.')
  return this
})

const getCurrentScenario = function (testCase) {
  const scenarios = testCase.gherkinDocument.feature.children
  const scenarioName = testCase.pickle.name

  let currentScenario = null
  for (const scenario of scenarios) {
    if (
      Object.prototype.hasOwnProperty.call(scenario, 'scenario') &&
      scenario.scenario.name === scenarioName
    ) {
      currentScenario = scenario.scenario
      break
    }
  }
  return {
    ...currentScenario,
    ...testCase.pickle,
    getLineNumber: () => currentScenario.location.line,
    isScenarioOutline: () => currentScenario.keyword === 'Scenario Outline'
  }
}

const getExpectedFails = function () {
  let expectedFails = null
  let expectedFailureFile = process.env.EXPECTED_FAILURES_FILE || ''
  expectedFailureFile = path.parse(expectedFailureFile).base
  try {
    expectedFails = fs.readFileSync(expectedFailureFile, 'utf8')
  } catch (err) {
    console.error('Expected failures file not found!')
  }
  return expectedFails
}

const checkIfExpectedToFail = function (scenarioLine, expectedFails) {
  const scenarioLineRegex = new RegExp(scenarioLine)
  return scenarioLineRegex.test(expectedFails)
}

After(async function (testCase) {
  if (!client.globals.screenshots) {
    return
  }
  // Generate screenshots when the test fails on retry
  if (testCase.result.status === 'FAILED' && !testCase.result.willBeRetried) {
    const expectedFails = getExpectedFails()

    const scenario = getCurrentScenario(testCase)
    let featureFile = scenario.uri.replace('features/', '') + ':' + scenario.getLineNumber()
    let expectedToFail = checkIfExpectedToFail(featureFile, expectedFails)
    if (scenario.isScenarioOutline()) {
      // scenario example id
      const currentExampleId = scenario.astNodeIds[scenario.astNodeIds.length - 1]
      // scenario examples
      const examples = scenario.examples[0].tableBody
      for (const example of examples) {
        if (example.id === currentExampleId) {
          featureFile = featureFile.replace(/:[0-9]*/, ':' + example.location.line)
          if (!expectedToFail) {
            expectedToFail = checkIfExpectedToFail(featureFile, expectedFails)
          }
          break
        }
      }
    }
    if (!expectedToFail) {
      console.log('saving screenshot of failed test')
      const filename = featureFile.replace('/', '-').replace('.', '_').replace(':', '-L')
      await client.saveScreenshot('./reports/screenshots/' + filename + '.png')
    }
  }
})

Before(function (testCase) {
  testCase.pickle.createdFiles = []
  if (
    typeof process.env.SCREEN_RESOLUTION !== 'undefined' &&
    process.env.SCREEN_RESOLUTION.trim() !== ''
  ) {
    const resolution = process.env.SCREEN_RESOLUTION.split('x')
    resolution[0] = parseInt(resolution[0])
    resolution[1] = parseInt(resolution[1])
    if (resolution[0] > 1 && resolution[1] > 1) {
      client.resizeWindow(resolution[0], resolution[1])
      console.log(
        '\nINFO: setting screen resolution to ' + resolution[0] + 'x' + resolution[1] + '\n'
      )
    } else {
      console.warn('\nWARNING: invalid resolution given, running tests in full resolution!\n')
      client.maximizeWindow()
    }
  } else {
    client.maximizeWindow()
  }
  // todo
  // console.log('  ' + testCase.sourceLocation.uri + ':' + testCase.sourceLocation.line + '\n')
})

After(async function (testCase) {
  if (client.globals.ocis) {
    return
  }
  console.log('\n  Result: ' + testCase.result.status + '\n')

  // clear file locks
  const body = new URLSearchParams()
  body.append('global', 'true')
  const url = 'apps/testing/api/v1/lockprovisioning'
  await httpHelper.deleteOCS(url, 'admin', body)
})

Before(function () {
  try {
    this.fullPathOfConfigFile = client.globals.webUIConfig
    initialConfigJsonSettings = getConfigJsonContent(client.globals.webUIConfig)
  } catch (err) {
    console.log(
      '\x1b[33m%s\x1b[0m',
      `\tCould not read config file.\n\tSet correct path of config file in WEB_UI_CONFIG env variable to fix this.\n\tSome tests may fail as a result.`
    )
  }
})

Before({ tags: '@disablePreviews' }, () => {
  if (!client.globals.ocis) {
    occHelper.runOcc(['config:system:set enable_previews --type=boolean --value=false'])
  }
})

After(function () {
  if (initialConfigJsonSettings) {
    fs.writeFileSync(this.fullPathOfConfigFile, JSON.stringify(initialConfigJsonSettings, null, 4))
  }
})
