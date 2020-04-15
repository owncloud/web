/**
 *
 * waits till the element is enabled, at that stage it is "clickable"
 * this function seems to wait longer than waitForElementVisible() and waitForElementNotVisible() for animated elements
 * for animated elements waitForElementVisible and waitForElementNotVisible already finish before the animation is finished
 * elements behind the disappearing animated element might not be clickable yet when waitForElementNotVisible finish
 * also when trying to use an element that is animated to appear, waitForElementVisible does not always wait long enough
 *
 * copied from: https://gist.github.com/deterralba/5862ec98613dbf073545a7d7e87a637d
 * More info https://github.com/nightwatchjs/nightwatch/issues/705
 *
 * @param selector
 * @param locateStrategy 'css selector' or 'xpath'
 * @param timeout defaults to this.globals.waitForConditionTimeout
 * @returns {exports}
 */
module.exports.command = function(
  selector,
  locateStrategy = 'css selector',
  timeout = this.globals.waitForConditionTimeout
) {
  let self = this
  if (locateStrategy === 'xpath') {
    self = this.useXpath()
  } else if (locateStrategy === 'css selector') {
    self = this.useCss()
  } else {
    return this.assert.fail('invalid locateStrategy')
  }
  self.expect.element(selector).enabled.before(timeout)
  return self
}
