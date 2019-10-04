/**
 * setValue by sending the keys one, by one
 * internet explorer has a problem with sendKeys and drops random characters when sending a whole string
 * to the phoenix modal dialogs
 * https://github.com/seleniumhq/selenium/issues/805#issuecomment-396581314
 *
 * @export
 * @param {string} selector
 * @param {string} inputValue
 * @returns
 */
exports.command = function setValueBySingleKeys (selector, inputValue) {
  const chars = inputValue.split('')
  if (chars.length === 0) {
    return this.setValue(selector, '')
  }
  return Promise.all(chars.map((char) => {
    return this.setValue(selector, char)
  })
  )
}
