import { shallowMount } from '@vue/test-utils'
import SkipTo from 'web-runtime/src/components/SkipTo.vue'

document.getElementById = jest.fn(() => ({
  setAttribute: jest.fn(),
  focus: jest.fn(),
  scrollIntoView: jest.fn()
}))

const selectors = {
  skipButton: '.skip-button'
}

describe('SkipTo component', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  const spySkipToTarget = jest.spyOn(SkipTo.methods, 'skipToTarget')

  let wrapper
  let skipButton
  beforeEach(() => {
    wrapper = getShallowWrapper()
    skipButton = wrapper.find(selectors.skipButton)
  })

  it('should render provided text in the slot', () => {
    expect(skipButton.text()).toEqual('Skip to main')
  })
  it('should call "skipToTarget" method on click', async () => {
    await skipButton.trigger('click')

    expect(spySkipToTarget).toHaveBeenCalledTimes(1)
  })
})

function getShallowWrapper() {
  return shallowMount(SkipTo, {
    propsData: {
      target: ''
    },
    slots: {
      default: 'Skip to main'
    }
  })
}
