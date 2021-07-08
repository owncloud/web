import { VisibilityObserver } from '../../../src/observer'

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

describe('VisibilityObserver', () => {
  it.each([
    { onEnter: jest.fn() },
    { onExit: jest.fn() },
    {
      onEnter: jest.fn(),
      onExit: jest.fn()
    },
    {}
  ])('observes %p', cb => {
    const observer = new VisibilityObserver()
    observer.observe(document.getElementById('target'), cb)
    expect(mockIntersectionObserver.observe).toBeCalledTimes(Object.keys(cb).length ? 1 : 0)
  })

  it('handles entered and exited callbacks', () => {
    const onEnter = jest.fn()
    const onExit = jest.fn()
    const observer = new VisibilityObserver()
    const target = document.getElementById('target')
    observer.observe(target, { onEnter, onExit })
    callback([{ isIntersecting: false, intersectionRatio: -1, target }])
    expect(onEnter).toBeCalledTimes(0)
    expect(onExit).toBeCalledTimes(0)
    callback([{ isIntersecting: true, intersectionRatio: 1, target }])
    expect(onEnter).toBeCalledTimes(1)
    expect(onExit).toBeCalledTimes(0)
    callback([{ isIntersecting: false, intersectionRatio: -1, target }])
    expect(onEnter).toBeCalledTimes(1)
    expect(onExit).toBeCalledTimes(1)
    callback([{ isIntersecting: true, intersectionRatio: 1, target }])
    expect(onEnter).toBeCalledTimes(2)
    expect(onExit).toBeCalledTimes(1)
    callback([{ isIntersecting: false, intersectionRatio: -1, target }])
    expect(onEnter).toBeCalledTimes(2)
    expect(onExit).toBeCalledTimes(2)
  })

  it.each(['disconnect', 'unobserve'])('handles %p', m => {
    const onEnter = jest.fn()
    const onExit = jest.fn()
    const observer = new VisibilityObserver()
    const target = document.getElementById('target')
    observer.observe(target, { onEnter, onExit })
    observer[m](target)
    callback([{ isIntersecting: false, intersectionRatio: -1, target }])
    expect(onEnter).toBeCalledTimes(0)
    expect(onExit).toBeCalledTimes(0)
    callback([{ isIntersecting: true, intersectionRatio: 1, target }])
    expect(onEnter).toBeCalledTimes(0)
    expect(onExit).toBeCalledTimes(0)
    callback([{ isIntersecting: false, intersectionRatio: -1, target }])
    expect(onEnter).toBeCalledTimes(0)
    expect(onExit).toBeCalledTimes(0)
  })

  it('unobserves in callback', () => {
    const onEnter = jest.fn()
    const onExit = jest.fn()
    const observer = new VisibilityObserver()
    const target = document.getElementById('target')
    observer.observe(target, {
      onEnter: ({ unobserve }) => {
        unobserve()
        onEnter()
      },
      onExit: ({ unobserve }) => {
        unobserve()
        onExit()
      }
    })
    callback([{ isIntersecting: false, intersectionRatio: -1, target }])
    expect(onEnter).toBeCalledTimes(0)
    expect(onExit).toBeCalledTimes(0)
    expect(mockIntersectionObserver.unobserve).toBeCalledTimes(0)
    callback([{ isIntersecting: true, intersectionRatio: 1, target }])
    expect(onEnter).toBeCalledTimes(1)
    expect(onExit).toBeCalledTimes(0)
    expect(mockIntersectionObserver.unobserve).toBeCalledTimes(0)
    callback([{ isIntersecting: false, intersectionRatio: -1, target }])
    expect(onEnter).toBeCalledTimes(1)
    expect(onExit).toBeCalledTimes(1)
    expect(mockIntersectionObserver.unobserve).toBeCalledTimes(1)
    callback([{ isIntersecting: true, intersectionRatio: 1, target }])
    expect(onEnter).toBeCalledTimes(1)
    expect(onExit).toBeCalledTimes(1)
    callback([{ isIntersecting: false, intersectionRatio: -1, target }])
    expect(onEnter).toBeCalledTimes(1)
    expect(onExit).toBeCalledTimes(1)
  })
})
