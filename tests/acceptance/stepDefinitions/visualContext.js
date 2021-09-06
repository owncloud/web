const { Then } = require('@cucumber/cucumber')
const { client } = require('nightwatch-api')
const _ = require('lodash')
const path = require('path')

const backends = Object.freeze({
  OCIS: 'ocis',
  OC10: 'oc10'
})

const visualElements = Object.freeze({
  topBar: '#oc-topbar',
  sideBar: '.oc-app-navigation'
})

const getImgPath = function(key) {
  const backend = client.globals.ocis ? backends.OCIS : backends.OC10
  if (_.has(visualElements, key)) {
    return path.join(backend, key)
  }
  throw new Error(`Cannot find the element ${key}`)
}

const assertScreenShot = async function(key) {
  if (!client.globals.visual_test) {
    return
  }
  const imgPath = getImgPath(key)
  const element = visualElements[key]
  await client.assert.screenshotIdenticalToBaseline(
    element,
    imgPath,
    'Matched the top bar of files page'
  )
}

Then('the top bar should match the default baseline', function() {
  return assertScreenShot('topBar')
})
Then('the sidebar should match the default baseline', function() {
  return assertScreenShot('sideBar')
})
