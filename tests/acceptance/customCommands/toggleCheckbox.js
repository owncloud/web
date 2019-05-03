exports.command = function (enableOrDisable, checkboxId) {
  this.element('css selector', checkboxId, (response) => {
    this.elementIdSelected(response.value.ELEMENT, (result) => {
      const checked = result.value === true
      if ((enableOrDisable === 'disable' && checked) ||
        (enableOrDisable === 'enable' && !checked)) {
        // if the checkbox needs to be unchecked but it is checked
        // Or the checkbox needs to be checked but it is unchecked
        this
          .click(checkboxId)
      } else if (enableOrDisable !== 'enable' && enableOrDisable !== 'disable') {
        throw new Error(`Expected 'enable' or 'disable', ${enableOrDisable} given`)
      }
    })
  })
  return this
}
