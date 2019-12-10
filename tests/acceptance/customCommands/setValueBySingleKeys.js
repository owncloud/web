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
  if (inputValue) {
    const chars = inputValue.split('').slice(0, -2)
    const charsEnd = inputValue.split('').slice(-2)
    const charPromise = chars.map((char) => this.setValue(selector, char)) || []

    // Sometimes the autocomplete list is not displayed when the characters are entered very fast
    // So we add a small pause for entering the last two characters
    const charEndPromise = charsEnd.map((char) => this.setValue(selector, char).pause(100)) || []

    return Promise.all(charPromise.concat(charEndPromise))
  }
  return this.pause(1)
}
