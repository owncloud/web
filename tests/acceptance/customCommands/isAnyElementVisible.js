const { Logger } = require('nightwatch')
/**
 * Determine if an element is currently displayed
 * ".isAnyElementVisible" will automatically wait for the element to be visible (until the specified timeout).
 * The provided selector may resolve to multiple elements, in that case, it will check if any of them is visible.
 * If none of the element from the collection is found or visible,
 * by default, an error is thrown but it WILL NOT fail the test.
 *
 * Usage:
 * .isAnyElementVisible(locateStrategy: string, selector: string, callback?: function)
 * .isAnyElementVisible({ locateStrategy: string, selector: string, timeout?: number, suppressNotFoundErrors?: boolean }, callback?: function)
 * @returns {exports}
 */
module.exports.command = async function (...args) {
  const defaultTimeout = 5 * 1000
  const defaultLocateStrategy = 'css selector'
  const params = {
    timeout: defaultTimeout,
    suppressNotFoundErrors: false,
    callback: null
  }

  if (args.length > 3) {
    throw new Error(`Expected 2 or 3 arguments but got ${args.length}`)
  }

  if (args[0] instanceof Object && !(args[0] instanceof Array)) {
    if (args.length > 2) {
      throw new Error(`Expected 2 arguments but got ${args.length}`)
    }
    params.locateStrategy = args[0].locateStrategy || defaultLocateStrategy
    params.selector = args[0].selector
    params.timeout = args[0].timeout || defaultTimeout
    if (typeof params.suppressNotFoundErrors === 'boolean') {
      params.suppressNotFoundErrors = args[0].suppressNotFoundErrors
    }
    if (args[1]) params.callback = args[1]
  } else {
    params.locateStrategy = args[0]
    params.selector = args[1]
    if (args[2]) params.callback = args[2]
  }

  if (!['css selector', 'xpath'].includes(params.locateStrategy)) {
    throw new Error(
      `Invalid selector type: "${params.locateStrategy}".\n Use either "xpath" or "css selector"`
    )
  }
  if (!params.selector) {
    throw new Error(`Element selector is required`)
  }
  if (params.callback !== null && typeof params.callback !== 'function') {
    throw new Error(`${params.callback} is not a function`)
  }

  const startTime = new Date()
  let elapsedTime = new Date()

  let result = {
    isVisible: false
  }
  // wait and try until element is visible or timeout
  while (elapsedTime - startTime < params.timeout && !result.isVisible) {
    await this.elements(params.locateStrategy, params.selector, async (res) => {
      result = { ...result, ...res }
      if (res.value.length === 0) {
        return
      }
      for (const { ELEMENT } of res.value) {
        await this.elementIdDisplayed(ELEMENT, ({ value }) => (result.isVisible = value === true))
        if (result.isVisible) break
      }
    })
    elapsedTime = new Date()
  }

  if (!params.suppressNotFoundErrors && !result.isVisible) {
    Logger.error(
      `Timed out while waiting for element '${params.selector}' to be visible for ${params.timeout} milliseconds.`
    )
  }

  params.callback && params.callback(result)
  return this
}
