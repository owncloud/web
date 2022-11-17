import { useUpload } from 'web-runtime/src/composables/upload'
import { defineComponent } from '@vue/composition-api'
import { mount } from '@vue/test-utils'
import { defaultComponentMocks } from 'web-test-helpers/src/mocks/defaultComponentMocks'
import { defaultLocalVue } from 'web-test-helpers/src/localVue/defaultLocalVue'
import { defaultStoreMockOptions } from 'web-test-helpers/src/mocks/store/defaultStoreMockOptions'
import { createStore } from 'vuex-extensions'
import Vuex from 'vuex'
import { SpaceResource } from 'web-client/src/helpers'
import { mock } from 'jest-mock-extended'

describe('useUpload', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

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

    const result = await wrapper.vm.createDirectoryTree(space, currentFolder, uppyResources)

    expect(result.successful).toContain('/l1')
    expect(result.successful).toContain('/l1/l2')
    expect(result.successful).toContain('/l1/l2/l3')
    expect(result.successful).toContain('/l1/l2/anotherFolder')
    expect(result.failed.length).toBe(0)
    expect(mocks.$clientService.webdav.createFolder).toHaveBeenCalledTimes(4)
  })

  it('should contain failed folders in the result', async () => {
    const { mocks, wrapper } = createWrapper()
    mocks.$clientService.webdav.createFolder.mockRejectedValue(new Error())

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
          relativeFolder: 'l1',
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
          relativeFolder: 'l1',
          relativePath: 'relativePath',
          route: { name: 'files-personal' },
          tusEndpoint: 'tusEndpoint',
          webDavBasePath: 'webDavBasePath'
        }
      }
    ]

    const result = await wrapper.vm.createDirectoryTree(space, currentFolder, uppyResources)

    expect(result.failed).toContain('/l1')
    expect(result.successful.length).toBe(0)
    expect(mocks.$clientService.webdav.createFolder).toHaveBeenCalledTimes(1)
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
        setup: () => {
          return {
            ...useUpload({ uppyService: mocks.$uppyService })
          }
        },
        template: `<div></div>`
      }),
      {
        localVue,
        store,
        mocks
      }
    )
  }
}
