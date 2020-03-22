/**
 *
 * @param {string} enableOrDisable
 * @param {string} selector
 * @param {string} strategy which selection strategy to use 'css selector' or 'xpath'
 */
exports.command = function(enableOrDisable, selector, strategy = 'css selector') {
  this.element(strategy, selector, response => {
    this.elementIdSelected(response.value.ELEMENT, result => {
      const checked = result.value === true
      if (
        (enableOrDisable === 'disable' && checked) ||
        (enableOrDisable === 'enable' && !checked)
      ) {
        // if the checkbox needs to be unchecked but it is checked
        // Or the checkbox needs to be checked but it is unchecked
        if (strategy === 'xpath') {
          this.useXpath()
            .click(selector)
            .useCss()
        } else {
          this.click(selector)
        }
      } else if (enableOrDisable !== 'enable' && enableOrDisable !== 'disable') {
        throw new Error(`Expected 'enable' or 'disable', ${enableOrDisable} given`)
      }
    })
  })
  return this
}
