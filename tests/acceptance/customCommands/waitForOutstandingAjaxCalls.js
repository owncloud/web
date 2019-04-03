const sleepWhenOutstandingAjaxCalls = function (result) {
  if (result['value'] > 0) {
    this.pause(100)
    this.waitForOutstandingAjaxCalls()
  } else {
  }
}

exports.command = function () {
  this.execute('return window.activeAjaxCount', [], sleepWhenOutstandingAjaxCalls)
}
