/**
 * try to use waitForElementEnabled() instead of this
 * @returns {exports}
 */
exports.command = function() {
  // till we have a better idea how to detect that an animation is finished
  console.log('waiting for 500ms ...')
  this.pause(500)
  return this
}
