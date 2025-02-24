import { defaultComponentMocks, defaultPlugins, shallowMount } from '@ownclouders/web-test-helpers'
import FolderViewModal from '../../../src/components/FolderViewModal.vue'
import { Modal } from '@ownclouders/web-pkg'
import { mock } from 'vitest-mock-extended'

const SELECTORS = Object.freeze({
  iframe: '#iframe-folder-view'
})

describe('FolderViewModal', () => {
  it('should set iframe src', () => {
    const { wrapper } = getWrapper()
    const iframe = wrapper.find(SELECTORS.iframe)

    expect(iframe.attributes('src')).toEqual(
      'https://example.org/public-link?hide-logo=true&hide-app-switcher=true&hide-account-menu=true&hide-navigation=true&lang=en'
    )
  })
})

function getWrapper() {
  const mocks = defaultComponentMocks()

  return {
    mocks,
    wrapper: shallowMount(FolderViewModal, {
      props: {
        modal: mock<Modal>(),
        publicLink: 'https://example.org/public-link'
      },
      global: {
        plugins: defaultPlugins(),
        mocks,
        provide: mocks
      }
    })
  }
}
