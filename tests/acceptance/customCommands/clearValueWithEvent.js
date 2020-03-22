// from https://github.com/nightwatchjs/nightwatch/issues/1132#issuecomment-340257894
// and adjusted a bit
// because calling "clearValue()" does not trigger Vue events when using v-model
/**
 * A better `clearValue` for inputs having a more complex interaction.
 *
 * @export
 * @param {string} selector
 * @returns
 */
exports.command = function clearValueWithEvent(selector) {
  const { END, BACK_SPACE } = this.Keys
  return this.getValue(selector, result => {
    const chars = result.value.split('')
    // Make sure we are at the end of the input
    this.setValue(selector, END)
    // Delete all the existing characters
    chars.forEach(() => this.setValue(selector, BACK_SPACE))
  })
}
