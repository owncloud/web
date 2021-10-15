import { EventBus } from '../../../src/event/bus'

describe('EventBus', () => {
  it('can handle load', () => {
    const bus = new EventBus()
    let val

    for (let i = 0; i < 1000; i++) {
      bus.subscribe(`evt.${i}`, (v) => (val = v))
    }

    for (let i = 0; i < 1000; i++) {
      const msg = `msg - ${i}`
      bus.publish(`evt.${i}`, msg)
      expect(val).toBe(msg)
    }

    val = 'untouched'

    for (let i = 0; i < 1000; i++) {
      bus.publish(`evt.unknown.${i}`, `unknown - ${i}`)
    }

    expect(val).toBe('untouched')
  })

  it('calls multiple subscriptions for the same topic', () => {
    const bus = new EventBus()
    const fn = jest.fn()

    bus.subscribe('evt.1', fn)
    bus.subscribe('evt.1', fn)
    bus.publish('evt.1')

    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('can unsubscribe', () => {
    const bus = new EventBus()
    const fn = jest.fn()

    const evt1Token = bus.subscribe('evt.1', fn)
    bus.subscribe('evt.1', fn)

    bus.publish('evt.1')
    expect(fn).toHaveBeenCalledTimes(2)

    bus.unsubscribe('evt.1', evt1Token)
    bus.publish('evt.1')
    expect(fn).toHaveBeenCalledTimes(3)

    bus.unsubscribe('evt.1')
    bus.publish('evt.1')
    expect(fn).toHaveBeenCalledTimes(3)
  })
})
