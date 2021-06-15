import { debounce } from './debounce'

describe('debounce', () => {
  it('waits until callback gets executed', () => {
    const cb = jest.fn()
    const debounced = debounce(cb)
    debounced()
    debounced()
    debounced()
    debounced()

    expect(cb).toBeCalledTimes(0)
  })

  it('executes callback only once every duration', () => {
    jest.useFakeTimers('modern')

    const cb = jest.fn()
    const debounced = debounce(cb, 50)
    debounced()
    debounced()
    debounced()
    debounced()
    jest.advanceTimersByTime(51)
    debounced()
    debounced()
    debounced()
    debounced()
    jest.advanceTimersByTime(51)
    expect(cb).toBeCalledTimes(2)
  })

  it('can be canceled', () => {
    jest.useFakeTimers('modern')

    const cb = jest.fn()
    const debounced = debounce(cb, 50)
    debounced()
    debounced()
    debounced()
    debounced()
    debounced.cancel()
    jest.advanceTimersByTime(51)
    expect(cb).toBeCalledTimes(0)
  })
})
