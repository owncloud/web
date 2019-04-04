const sleepWhenOutstandingAjaxCalls = function (result) {
  if (result['value'] > 0) {
    this.pause(this.globals.waitForConditionPollInterval)
    this.waitForOutstandingAjaxCalls()
  }
}

exports.command = function () {
  this.execute(
    'return window.activeAjaxCount', [], sleepWhenOutstandingAjaxCalls
  )
}
