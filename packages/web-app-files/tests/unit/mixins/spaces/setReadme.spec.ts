import setReadme from 'web-app-files/src/mixins/spaces/actions/setReadme.js'
import { buildSpace } from 'web-client/src/helpers'
import { mockDeep } from 'jest-mock-extended'
import { OwnCloudSdk } from 'web-client/src/types'
import { defaultStoreMockOptions } from 'web-test-helpers/src/mocks/store/defaultStoreMockOptions'
import { defaultComponentMocks } from 'web-test-helpers/src/mocks/defaultComponentMocks'
import { createStore, defaultPlugins, mount } from 'web-test-helpers'

const Component = {
  template: '<div></div>',
  mixins: [setReadme]
}

describe('setReadme', () => {
  afterEach(() => jest.clearAllMocks())
  describe('isEnabled property', () => {
    it('should be false when no resource given', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.vm.$_setSpaceReadme_items[0].isEnabled({ resources: [] })).toBe(false)
    })
    it('should be false when mimeType is not text', () => {
      const spaceMock = {
        id: '1',
        root: { permissions: [{ roles: ['manager'], grantedTo: [{ user: { id: 1 } }] }] },
        special: [{ specialFolder: { name: 'readme' } }]
      }
      const { wrapper } = getWrapper(true, buildSpace(spaceMock))
      expect(
        wrapper.vm.$_setSpaceReadme_items[0].isEnabled({
          resources: [{ id: 1, mimeType: 'image/png' }]
        })
      ).toBe(false)
    })
    it('should be true when the mimeType is "text/plain"', () => {
      const spaceMock = {
        id: '1',
        root: { permissions: [{ roles: ['manager'], grantedTo: [{ user: { id: 1 } }] }] },
        special: [{ specialFolder: { name: 'readme' } }]
      }
      const { wrapper } = getWrapper(true, buildSpace(spaceMock))
      expect(
        wrapper.vm.$_setSpaceReadme_items[0].isEnabled({
          resources: [{ id: 1, mimeType: 'text/plain' }]
        })
      ).toBe(true)
    })
    it('should be true when when mimeType is text', () => {
      const spaceMock = {
        id: '1',
        root: { permissions: [{ roles: ['viewer'], grantedTo: [{ user: { id: 1 } }] }] },
        special: [{ specialFolder: { name: 'readme' } }]
      }
      const { wrapper } = getWrapper(true, buildSpace(spaceMock))
      expect(
        wrapper.vm.$_setSpaceReadme_items[0].isEnabled({
          resources: [{ id: 1, mimeType: 'text/plain' }]
        })
      ).toBe(false)
    })
  })
  describe('method "$_setSpaceReadme_trigger"', () => {
    it('should show message on success', async () => {
      const { wrapper } = getWrapper(true, { id: 1 })
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.$_setSpaceReadme_trigger({
        resources: [
          {
            webDavPath: '/spaces/1fe58d8b-aa69-4c22-baf7-97dd57479f22/subfolder',
            name: 'readme.md'
          }
        ]
      })

      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const { wrapper } = getWrapper(false, { id: 1 })
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.$_setSpaceReadme_trigger({
        resources: [
          {
            webDavPath: '/spaces/1fe58d8b-aa69-4c22-baf7-97dd57479f22/subfolder',
            name: 'readme.md'
          }
        ]
      })

      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })
  })
})

function getWrapper(resolveGetFileContents = true, space = undefined) {
  const clientMock = mockDeep<OwnCloudSdk>()
  const defaultMocks = defaultComponentMocks({ currentRoute: { name: 'files-spaces-generic' } })
  const mocks = {
    ...defaultMocks,
    $client: {
      ...clientMock,
      files: {
        ...clientMock.files,
        getFileContents: jest.fn().mockImplementation(() => {
          if (resolveGetFileContents) {
            return Promise.resolve('readme')
          }
          return Promise.reject(new Error(''))
        }),
        putFileContents: jest
          .fn()
          .mockImplementation(() => Promise.resolve({ ETag: '60c7243c2e7f1' }))
      }
    },
    space
  }
  const storeOptions = {
    ...defaultStoreMockOptions,
    modules: { ...defaultStoreMockOptions.modules, user: { state: { id: 'alice', uuid: 1 } } }
  }
  const store = createStore(storeOptions)
  return {
    wrapper: mount(Component, {
      global: {
        plugins: [...defaultPlugins(), store],
        mocks
      }
    })
  }
}
