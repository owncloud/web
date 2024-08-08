import { nextTick, ref } from 'vue'
import SpaceHeader from 'web-app-files/src/components/Spaces/SpaceHeader.vue'
import { Drive } from '@ownclouders/web-client/graph/generated'
import { SpaceResource, buildSpace, Resource } from '@ownclouders/web-client'
import { defaultPlugins, mount, defaultComponentMocks } from 'web-test-helpers'
import { mock } from 'vitest-mock-extended'

vi.mock('@ownclouders/web-pkg', async (importOriginal) => ({
  ...(await importOriginal<any>()),
  useFileActions: vi.fn().mockReturnValue({
    getDefaultAction: vi.fn().mockReturnValue({ handler: vi.fn() })
  })
}))

describe('SpaceHeader', () => {
  it('should add the "squashed"-class when the sidebar is opened', () => {
    const wrapper = getWrapper({
      space: buildSpace({ id: '1' } as unknown as Drive),
      isSideBarOpen: true
    })
    expect(wrapper.find('.space-header-squashed').exists()).toBeTruthy()
    expect(wrapper.html()).toMatchSnapshot()
  })
  describe('space image', () => {
    it('should show the default image if no other image is set', () => {
      const wrapper = getWrapper({ space: buildSpace({ id: '1' } as unknown as Drive) })
      expect(wrapper.find('.space-header-image-default').exists()).toBeTruthy()
      expect(wrapper.html()).toMatchSnapshot()
    })
    it('should show the set image', async () => {
      const spaceMock = { spaceImageData: { webDavUrl: '/' } }
      const wrapper = getWrapper({
        space: { ...buildSpace({ id: '1' } as unknown as Drive), ...spaceMock }
      })
      await wrapper.vm.loadPreviewTask.last
      expect(wrapper.find('.space-header-image-default').exists()).toBeFalsy()
      expect(wrapper.find('.space-header-image img').exists()).toBeTruthy()
      expect(wrapper.html()).toMatchSnapshot()
    })
    it('should take full width in mobile view', () => {
      const spaceMock = { spaceImageData: { webDavUrl: '/' } }
      const wrapper = getWrapper({
        space: { ...buildSpace({ id: '1' } as unknown as Drive), ...spaceMock },
        isMobileWidth: true
      })
      expect(wrapper.find('.space-header').classes()).not.toContain('oc-flex')
      expect(wrapper.find('.space-header-image').classes()).toContain('space-header-image-expanded')
    })
  })
  describe('space description', () => {
    it('should show the description', async () => {
      const wrapper = getWrapper({ space: buildSpace({ id: '1' } as unknown as Drive) })
      wrapper.vm.markdownResource = mock<Resource>()
      wrapper.vm.markdownContent = 'content'
      await nextTick()
      expect(wrapper.find('.markdown-container').exists()).toBeTruthy()
      expect(wrapper.html()).toMatchSnapshot()
    })
  })
})

function getWrapper({ space = {} as SpaceResource, isSideBarOpen = false, isMobileWidth = false }) {
  const mocks = defaultComponentMocks()
  mocks.$previewService.loadPreview.mockResolvedValue('blob:image')
  return mount(SpaceHeader, {
    props: {
      space,
      isSideBarOpen
    },
    global: {
      mocks,
      plugins: [...defaultPlugins()],
      provide: { ...mocks, isMobileWidth: ref(isMobileWidth) },
      stubs: {
        'quota-modal': true,
        'space-context-actions': true
      }
    }
  })
}
