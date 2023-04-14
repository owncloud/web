import { Resource } from 'web-client/src'
import MediaControls from '../../../src/components/MediaControls.vue'
import { defaultPlugins, shallowMount } from 'web-test-helpers'
import { mock } from 'jest-mock-extended'

const selectors = {
  controlsPrevious: '.preview-controls-previous',
  controlsNext: '.preview-controls-next',
  controlsFullScreen: '.preview-controls-fullscreen',
  controlsImageShrink: '.preview-controls-image-shrink',
  controlsImageOriginalSize: '.preview-controls-image-original-size',
  controlsImageZoom: '.preview-controls-image-zoom',
  controlsRotateLeft: '.preview-controls-rotate-left',
  controlsRotateRight: '.preview-controls-rotate-right'
}

describe('MediaControls component', () => {
  describe('previous button', () => {
    it('exists', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.find(selectors.controlsPrevious).exists()).toBeTruthy()
    })
    it('emits "togglePrevious"-event on click', async () => {
      const { wrapper } = getWrapper()
      await wrapper.find(selectors.controlsPrevious).trigger('click')
      expect(wrapper.emitted('togglePrevious').length).toBeDefined()
    })
  })
  describe('next button', () => {
    it('exists', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.find(selectors.controlsNext).exists()).toBeTruthy()
    })
    it('emits "toggleNext"-event on click', async () => {
      const { wrapper } = getWrapper()
      await wrapper.find(selectors.controlsNext).trigger('click')
      expect(wrapper.emitted('toggleNext').length).toBeDefined()
    })
  })
  describe('full screen toggle', () => {
    it('exists', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.find(selectors.controlsFullScreen).exists()).toBeTruthy()
    })
    it('emits "toggleFullScreen"-event on click', async () => {
      const { wrapper } = getWrapper()
      await wrapper.find(selectors.controlsFullScreen).trigger('click')
      expect(wrapper.emitted('toggleFullScreen').length).toBeDefined()
    })
  })
  describe('size', () => {
    describe('shrink button', () => {
      it('exists if file is an image', () => {
        const { wrapper } = getWrapper({ isImage: true })
        expect(wrapper.find(selectors.controlsImageShrink).exists()).toBeTruthy()
      })
      it('emits "setZoom"-event on click', async () => {
        const { wrapper } = getWrapper({ isImage: true })
        await wrapper.find(selectors.controlsImageShrink).trigger('click')
        expect(wrapper.emitted('setZoom').length).toBeDefined()
      })
    })
    describe('zoom button', () => {
      it('exists if file is an image', () => {
        const { wrapper } = getWrapper({ isImage: true })
        expect(wrapper.find(selectors.controlsImageZoom).exists()).toBeTruthy()
      })
      it('emits "setZoom"-event on click', async () => {
        const { wrapper } = getWrapper({ isImage: true })
        await wrapper.find(selectors.controlsImageZoom).trigger('click')
        expect(wrapper.emitted('setZoom').length).toBeDefined()
      })
    })
    describe('original size button', () => {
      it('exists if file is an image', () => {
        const { wrapper } = getWrapper({ isImage: true })
        expect(wrapper.find(selectors.controlsImageOriginalSize).exists()).toBeTruthy()
      })
      it('emits "setZoom"-event on click', async () => {
        const { wrapper } = getWrapper({ isImage: true })
        await wrapper.find(selectors.controlsImageOriginalSize).trigger('click')
        expect(wrapper.emitted('setZoom').length).toBeDefined()
      })
    })
  })
  describe('rotation', () => {
    describe('left button', () => {
      it('exists if file is an image', () => {
        const { wrapper } = getWrapper({ isImage: true })
        expect(wrapper.find(selectors.controlsRotateLeft).exists()).toBeTruthy()
      })
      it('emits "setRotation"-event on click', async () => {
        const { wrapper } = getWrapper({ isImage: true })
        await wrapper.find(selectors.controlsRotateLeft).trigger('click')
        expect(wrapper.emitted('setRotation').length).toBeDefined()
      })
    })
    describe('right button', () => {
      it('exists if file is an image', () => {
        const { wrapper } = getWrapper({ isImage: true })
        expect(wrapper.find(selectors.controlsRotateRight).exists()).toBeTruthy()
      })
      it('emits "setRotation"-event on click', async () => {
        const { wrapper } = getWrapper({ isImage: true })
        await wrapper.find(selectors.controlsRotateRight).trigger('click')
        expect(wrapper.emitted('setRotation').length).toBeDefined()
      })
    })
  })
})

function getWrapper(props = {}) {
  return {
    wrapper: shallowMount(MediaControls, {
      props: {
        files: [mock<Resource>()],
        activeIndex: 0,
        ...props
      },
      global: {
        plugins: [...defaultPlugins()]
      }
    })
  }
}
