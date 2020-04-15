/**
 * setValue by sending the keys one, by one
 * running federation tests on chrome browser has a problem with sendKeys and drops incomplete string when sending a
 * whole string to the phoenix modal dialogs
 *
 * @export
 * @param {string} selector
 * @param {string} inputValue
 * @returns
 */
exports.command = function setValueBySingleKeys(selector, inputValue) {
  if (inputValue) {
    const chars = inputValue.split('').slice(0, -2)
    const charsEnd = inputValue.split('').slice(-2)
    const charPromise = this.setValue(selector, chars)

    // Sometimes the autocomplete list is not displayed when the characters are entered very fast
    // So we add a small pause for entering the last two characters
    const charEndPromise = charsEnd.map(char => this.setValue(selector, char).pause(100)) || []

    return Promise.all([charPromise, ...charEndPromise])
  }
  return this.pause(1)
}
