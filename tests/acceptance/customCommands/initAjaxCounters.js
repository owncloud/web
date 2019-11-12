exports.command = function () {
  this.execute(function () {
    window.sumStartedAjaxRequests = 0
    window.activeAjaxCount = 0

    function isAllXhrComplete () {
      window.activeAjaxCount--
    }

    (function (open) {
      XMLHttpRequest.prototype.open = function () {
        this.addEventListener('loadend', isAllXhrComplete)
        return open.apply(this, arguments)
      }
    })(XMLHttpRequest.prototype.open)
  })
  this.execute(function () {
    (function (send) {
      XMLHttpRequest.prototype.send = function () {
        window.activeAjaxCount++
        window.sumStartedAjaxRequests++
        return send.apply(this, arguments)
      }
    })(XMLHttpRequest.prototype.send)
  })
  return this
}
