const sleepWhenOutstandingAjaxCalls = function (result, retryWithZero) {
  // sleep in all cases, because even with zero calls we don't know if there isn't
  // one that might start in the next tick, so to be sure sleep again
  this.pause(this.globals.waitForConditionPollInterval)
  if (result.value > 0) {
    this.waitForOutstandingAjaxCalls(true)
  } else if (retryWithZero) {
    // retry in case another call just started
    this.waitForOutstandingAjaxCalls(false)
  }
}

exports.command = function (retryWithZero = true) {
  // init the ajax counter if it hasn't been initialized yet
  this.execute('return (typeof window.activeAjaxCount === "undefined")', [], function (result) {
    if (result.value === true) {
      throw Error(
        'checking outstanding Ajax calls will not work without calling initAjaxCounter() first'
      )
    }
  })

  this.execute('return window.activeAjaxCount', [], (result) =>
    sleepWhenOutstandingAjaxCalls.call(this, result, retryWithZero)
  )
  return this
}
