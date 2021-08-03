import { EventBus } from '../../../src/event'
import { bus } from '../../../src/instance'

describe('instance', () => {
  test('exports eventBus', () => {
    expect(bus).toBeInstanceOf(EventBus)
  })
})
