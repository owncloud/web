import ElementIsVisible from './visible'

let callback
let mockIntersectionObserver
const reset = () => {
  mockIntersectionObserver = {
    observe: jest.fn(),
    disconnect: jest.fn(),
    unobserve: jest.fn()
  }
  window.IntersectionObserver = jest.fn().mockImplementation(cb => {
    callback = cb
    return mockIntersectionObserver
  })
}

beforeEach(reset)

window.document.body.innerHTML = `<div id="target">foo</div>`

describe('ElementIsVisible', () => {
  it.each([
    { onEnter: jest.fn() },
    { onExit: jest.fn() },
    {
      onEnter: jest.fn(),
      onExit: jest.fn()
    },
    {}
  ])('observes %p', cb => {
    new ElementIsVisible(document.getElementById('target'), cb)
    expect(mockIntersectionObserver.observe).toBeCalledTimes(Object.keys(cb).length ? 1 : 0)
  })

  it('handles entered and exited callbacks', () => {
    const onEnter = jest.fn()
    const onExit = jest.fn()
    new ElementIsVisible(document.getElementById('target'), { onEnter, onExit })
    callback([{ isIntersecting: false, intersectionRatio: -1 }])
    expect(onEnter).toBeCalledTimes(0)
    expect(onExit).toBeCalledTimes(0)
    callback([{ isIntersecting: true, intersectionRatio: 1 }])
    expect(onEnter).toBeCalledTimes(1)
    expect(onExit).toBeCalledTimes(0)
    callback([{ isIntersecting: false, intersectionRatio: -1 }])
    expect(onEnter).toBeCalledTimes(1)
    expect(onExit).toBeCalledTimes(1)
  })

  it.each(['disconnect', 'unobserve'])('handles %p', m => {
    const onEnter = jest.fn()
    const onExit = jest.fn()
    const obs = new ElementIsVisible(document.getElementById('target'), { onEnter, onExit })
    obs[m]()
    callback([{ isIntersecting: false, intersectionRatio: -1 }])
    expect(onEnter).toBeCalledTimes(0)
    expect(onExit).toBeCalledTimes(0)
    callback([{ isIntersecting: true, intersectionRatio: 1 }])
    expect(onEnter).toBeCalledTimes(0)
    expect(onExit).toBeCalledTimes(0)
    callback([{ isIntersecting: false, intersectionRatio: -1 }])
    expect(onEnter).toBeCalledTimes(0)
    expect(onExit).toBeCalledTimes(0)
  })
})
