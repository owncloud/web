/**
 * waits till a css property equals the given value
 * @param selector
 * @param locateStrategy 'css selector' or 'xpath'
 * @param property the CSS property
 * @param value the status to wail till
 * @param timeout defaults to this.globals.waitForConditionTimeout
 * @returns {exports}
 */

module.exports.command = function({
  selector,
  locateStrategy = 'css selector',
  property,
  value,
  timeout = this.globals.waitForConditionTimeout
}) {
  if (locateStrategy === 'xpath') {
    this.useXpath()
  } else if (locateStrategy === 'css selector') {
    this.useCss()
  } else {
    this.assert.fail('invalid locateStrategy')
  }
  this.expect
    .element(selector)
    .to.have.css(property)
    .which.equals(value)
    .before(timeout)
  return this
}
