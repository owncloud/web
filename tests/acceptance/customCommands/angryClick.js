// from https://github.com/nightwatchjs/nightwatch/issues/1221#issuecomment-327635848
// Wrapper around standard .click()
//
// If click fails, it might be because something is in the way.
// Try dismissing lightboxes/overlays by clicking on the body tag,
// then click again.
exports.command = function angryClick(selector, callback) {
  var self = this
  return this.click(selector, function(result) {
    if (result.status === 0) {
      // click succeeded, handle callback
      if (typeof callback === 'function') {
        callback.call(self, result)
      }
    } else {
      // click failed
      console.log('element not clickable; will try again')
      this.execute(function() {
        // Bypass Selenium element selection and access the body directly.
        // TA body click handler will dismiss it.
        if (typeof document.body.click !== 'undefined') {
          document.body.click()
        }
      })
        // try clicking again
        .click(selector, callback)
    }
  })
}
