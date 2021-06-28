import { EventBus } from '../../../src/event/bus'

describe('EventBus', () => {
  test('pubSub', () => {
    const bus = new EventBus()
    let val

    for (let i = 0; i < 1000; i++) {
      bus.on(`evt.${i}`, v => (val = v))
    }

    for (let i = 0; i < 1000; i++) {
      const msg = `msg - ${i}`
      bus.emit(`evt.${i}`, msg)
      expect(val).toBe(msg)
    }

    val = 'untouched'

    for (let i = 0; i < 1000; i++) {
      bus.emit(`evt.unknown.${i}`, `unknown - ${i}`)
    }

    expect(val).toBe('untouched')
  })
})
