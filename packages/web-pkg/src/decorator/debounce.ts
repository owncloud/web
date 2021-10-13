import debounce from 'lodash-es/debounce'

/**
 * Wrap lodash debounce as a decorator
 * @param {number} wait The number of milliseconds to delay.
 * @param {Object} options The options object.
 * @param {boolean} options.leading? Specify invoking on the leading edge of the timeout.
 * @param {number} options.maxWait? The maximum time decorated func is allowed to be delayed before it’s invoked.
 * @param {boolean} options.trailing? Specify invoking on the trailing edge of the timeout.
 */
export default (
  wait: number,
  options?: {
    leading?: boolean
    maxWait?: number
    trailing?: boolean
  }
) => {
  return function (target: unknown, key: string, descriptor: PropertyDescriptor): void {
    const fn = descriptor.value
    const bouncer = debounce(
      async function (
        executor: { resolve: (value: any) => void; reject: (reason: any) => void },
        ...args: any[]
      ) {
        try {
          const result = await fn.apply(this, args)
          executor.resolve(result)
        } catch (error) {
          executor.reject(error)
        }
      },
      wait,
      options
    )

    descriptor.value = function (...args: any[]) {
      return new Promise((resolve, reject) => {
        bouncer.apply(this, [{ resolve, reject }, ...args])
      })
    }
  }
}
