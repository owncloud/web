const sleepWhenOutstandingAjaxCalls = function (result) {
  if (result['value'] > 0) {
    this.pause(this.globals.waitForConditionPollInterval)
    this.waitForOutstandingAjaxCalls()
  }
}

exports.command = function () {
  // init the ajax counter if it hasn't been initialized yet
  this.execute('return (typeof window.activeAjaxCount === "undefined")', [], function (result) {
    if (result['value'] === true) {
      throw Error('checking outstanding Ajax calls will not work without calling initAjaxCounter() first')
    }
  })

  this.execute(
    'return window.activeAjaxCount', [], sleepWhenOutstandingAjaxCalls
  )
  return this
}
