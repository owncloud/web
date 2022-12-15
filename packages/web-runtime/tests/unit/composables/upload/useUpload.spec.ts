import { useUpload } from 'web-runtime/src/composables/upload'
import { defineComponent } from 'vue'
import { SpaceResource } from 'web-client/src/helpers'
import { mock } from 'jest-mock-extended'
import {
  createStore,
  defaultPlugins,
  mount,
  defaultStoreMockOptions,
  defaultComponentMocks
} from 'web-test-helpers'

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

    const result = await wrapper.vm.createDirectoryTree(space, currentFolder, uppyResources)

    expect(result.successful).toContain('/l1')
    expect(result.successful).toContain('/l1/l2')
    expect(result.successful).toContain('/l1/l2/l3')
    expect(result.successful).toContain('/l1/l2/anotherFolder')
    expect(result.failed.length).toBe(0)
    expect(mocks.$clientService.webdav.createFolder).toHaveBeenCalledTimes(4)
  })

  it('should contain failed folders in the result', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
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
  const store = createStore(storeOptions)

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
        global: {
          plugins: [...defaultPlugins(), store],
          mocks
        }
      }
    )
  }
}
