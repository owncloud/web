module.exports = {
  url: function () {
    return this.api.launchUrl + '/#/'
  },
  elements: {
    message: {
      selector: '//*[contains(@class, "uk-notification-message-primary")]/div',
      locateStrategy: 'xpath'
    }
  }
}
