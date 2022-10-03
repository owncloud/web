import { useUpload } from 'web-runtime/src/composables/upload'
import { defineComponent } from '@vue/composition-api'
import { mount } from '@vue/test-utils'
import { defaultComponentMocks } from '../../../../../../tests/unit/mocks/defaultComponentMocks'
import { defaultLocalVue } from '../../../../../../tests/unit/localVue/defaultLocalVue'
import { defaultStoreMockOptions } from '../../../../../../tests/unit/mocks/store/defaultStoreMockOptions'
import { createStore } from 'vuex-extensions'
import Vuex from 'vuex'
import { SpaceResource } from 'web-client/src/helpers'
import { mock } from 'jest-mock-extended'

describe('useUpload', () => {
  it('should be valid', () => {
    expect(useUpload).toBeDefined()
  })

  it('should create non-existent folders before upload', async () => {
    const { mocks, wrapper } = createWrapper()

    const space = mock<SpaceResource>()
    const currentFolder = 'currentFolder'
    const uppyResources = [
      {
        source: 'source',
        name: 'file1',
        type: 'type',
        data: new Blob(),
        meta: {
          currentFolder: 'currentFolder',
          relativeFolder: 'l1/l2/l3',
          relativePath: 'relativePath',
          route: { name: 'files-personal' },
          tusEndpoint: 'tusEndpoint',
          webDavBasePath: 'webDavBasePath'
        }
      },
      {
        source: 'source',
        name: 'file2',
        type: 'type',
        data: new Blob(),
        meta: {
          currentFolder: 'currentFolder',
          relativeFolder: 'l1/l2/l3',
          relativePath: 'relativePath',
          route: { name: 'files-personal' },
          tusEndpoint: 'tusEndpoint',
          webDavBasePath: 'webDavBasePath'
        }
      },
      {
        source: 'source',
        name: 'file3',
        type: 'type',
        data: new Blob(),
        meta: {
          currentFolder: 'currentFolder',
          relativeFolder: 'l1/l2/anotherFolder',
          relativePath: 'relativePath',
          route: { name: 'files-personal' },
          tusEndpoint: 'tusEndpoint',
          webDavBasePath: 'webDavBasePath'
        }
      }
    ]

    await wrapper.vm.createDirectoryTree(space, currentFolder, uppyResources)
    expect(mocks.$clientService.webdav.createFolder).toHaveBeenCalledTimes(4)
  })
})

const createWrapper = () => {
  const mocks = {
    ...defaultComponentMocks()
  }
  const storeOptions = {
    ...defaultStoreMockOptions
  }
  const localVue = defaultLocalVue()
  const store = createStore(Vuex.Store, storeOptions)

  return {
    mocks,
    wrapper: mount(
      defineComponent({
        template: `<div></div>`,
        setup: () => {
          return {
            ...useUpload({ uppyService: mocks.$uppyService })
          }
        }
      }),
      {
        localVue,
        store,
        mocks
      }
    )
  }
}
