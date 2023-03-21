import Debounce from '../../../src/decorator/debounce'

const hammered = jest.fn()

class Sample {
  @Debounce(500)
  public resolve(): void {
    hammered()
  }
}

describe('Debounce', () => {
  test('debounce decorated function', () => {
    jest.useFakeTimers()

    const sample = new Sample()

    for (let i = 0; i < 100; i++) {
      sample.resolve()
    }

    expect(hammered).toHaveBeenCalledTimes(0)

    jest.runAllTimers()

    expect(hammered).toHaveBeenCalledTimes(1)
  })
})
