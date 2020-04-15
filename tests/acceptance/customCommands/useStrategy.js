const events = require('events')

class UseStrategy extends events.EventEmitter {
  /**
   * UseStrategy can enable strategy for given `Element` object,
   * or, from given strategy param.
   *
   * @param {string|Object} [strategy]
   *
   * @example When you don't know strategy of given element before-hand
   * useSelector(menuButton).assert.elementNotPresent.useCss() // rollback to default css
   * useSelector(selector).assert.elementNotPresent.useCss() // selector is string
   * useSelector({locateStrategy: selector})
   */
  command(strategy = this.client.locateStrategy) {
    if (typeof strategy === 'object' && strategy.locateStrategy) {
      strategy = strategy.locateStrategy
    }
    this.client.setLocateStrategy(strategy)
    this.emit('complete')
  }
}

module.exports = UseStrategy
