import FileDetails from '../../../../../src/components/SideBar/Details/FileDetails.vue'
import { ShareTypes } from '@ownclouders/web-client/src/helpers/share'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  shallowMount,
  defaultStoreMockOptions
} from 'web-test-helpers'
import { mock, mockDeep } from 'jest-mock-extended'
import { Resource, SpaceResource } from '@ownclouders/web-client/src/helpers'

const getResourceMock = ({
  type = 'file',
  mimeType = 'image/jpeg',
  tags = [],
  thumbnail = null,
  shareTypes = [],
  share = null,
  path = '/somePath/someResource',
  locked = false
} = {}) =>
  mock<Resource>({
    id: '1',
    type,
    isFolder: type === 'folder',
    mimeType,
    ownerId: 'marie',
    ownerDisplayName: 'Marie',
    owner: null,
    mdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
    tags,
    size: '740',
    path,
    thumbnail,
    shareTypes,
    share,
    locked
  })

const selectors = {
  eosPath: '[data-testid="eosPath"]',
  eosDirectLink: '[data-testid="eosDirectLink"]',
  sambaPath: '[data-testid="sambaPath"]',
  ownerDisplayName: '[data-testid="ownerDisplayName"]',
  preview: '[data-testid="preview"]',
  resourceIcon: '.details-icon',
  lockedBy: '[data-testid="locked-by"]',
  sharedBy: '[data-testid="shared-by"]',
  sharedVia: '[data-testid="shared-via"]',
  sharingInfo: '[data-testid="sharingInfo"]',
  sizeInfo: '[data-testid="sizeInfo"]',
  tags: '[data-testid="tags"]',
  timestamp: '[data-testid="timestamp"]',
  versionsInfo: '[data-testid="versionsInfo"]'
}

describe('Details SideBar Panel', () => {
  describe('preview', () => {
    describe('shows preview area', () => {
      it('while trying to load a preview', () => {
        const resource = getResourceMock()
        const { wrapper } = createWrapper({ resource })
        expect(wrapper.find(selectors.preview).exists()).toBeTruthy()
        expect(wrapper.find(selectors.resourceIcon).exists()).toBeFalsy()
      })
      it('for allowed mime types', () => {
        const resource = getResourceMock()
        const { wrapper } = createWrapper({ resource })
        expect(wrapper.find(selectors.preview).exists()).toBeTruthy()
        expect(wrapper.find(selectors.resourceIcon).exists()).toBeFalsy()
      })
    })
    it('shows resource icon instead if the resource is a folder', () => {
      const resource = getResourceMock({ type: 'folder' })
      const { wrapper } = createWrapper({ resource })
      expect(wrapper.find(selectors.preview).exists()).toBeFalsy()
      expect(wrapper.find(selectors.resourceIcon).exists()).toBeTruthy()
    })
  })
  describe('status indicators', () => {
    it('show if given on non-public page', () => {
      const resource = getResourceMock({ shareTypes: [ShareTypes.user.value] })
      const { wrapper } = createWrapper({ resource })
      expect(wrapper.find(selectors.sharingInfo).exists()).toBeTruthy()
    })
    it('do not show on a public page', () => {
      const resource = getResourceMock({ shareTypes: [ShareTypes.user.value] })
      const { wrapper } = createWrapper({ resource, isPublicLinkContext: true })
      expect(wrapper.find(selectors.sharingInfo).exists()).toBeFalsy()
    })
  })
  describe('timestamp', () => {
    it('shows if given', () => {
      const resource = getResourceMock()
      const { wrapper } = createWrapper({ resource })
      expect(wrapper.find(selectors.timestamp).exists()).toBeTruthy()
    })
  })
  describe('locked by', () => {
    it('shows if the resource is locked', () => {
      const resource = getResourceMock({ locked: true })
      const { wrapper } = createWrapper({ resource })
      expect(wrapper.find(selectors.lockedBy).exists()).toBeTruthy()
    })
  })
  describe('shared via', () => {
    it('shows if the resource has an indirect share', () => {
      const resource = getResourceMock()
      const ancestorMetaData = {
        '/somePath': { path: '/somePath', shareTypes: [ShareTypes.user.value] }
      }
      const { wrapper } = createWrapper({ resource, ancestorMetaData })
      expect(wrapper.find(selectors.sharedVia).exists()).toBeTruthy()
    })
  })
  describe('shared by', () => {
    it('shows if the resource is a share from another user', () => {
      const share = { fileOwner: { displayName: 'Marie' } }
      const resource = getResourceMock({ shareTypes: [ShareTypes.user.value], share })
      const { wrapper } = createWrapper({ resource, user: { id: 'einstein' } })
      expect(wrapper.find(selectors.sharedBy).exists()).toBeTruthy()
    })
  })
  describe('owner display name', () => {
    it('shows if given', () => {
      const resource = getResourceMock()
      const { wrapper } = createWrapper({ resource })
      expect(wrapper.find(selectors.ownerDisplayName).exists()).toBeTruthy()
    })
  })
  describe('size', () => {
    it('shows if given', () => {
      const resource = getResourceMock()
      const { wrapper } = createWrapper({ resource })
      expect(wrapper.find(selectors.sizeInfo).exists()).toBeTruthy()
    })
  })
  describe('versions', () => {
    it('show if given for files on a private page', () => {
      const resource = getResourceMock()
      const { wrapper } = createWrapper({ resource, versions: ['1'] })
      expect(wrapper.find(selectors.versionsInfo).exists()).toBeTruthy()
    })
    it('do not show for folders on a private page', () => {
      const resource = getResourceMock({ type: 'folder' })
      const { wrapper } = createWrapper({ resource, versions: ['1'] })
      expect(wrapper.find(selectors.versionsInfo).exists()).toBeFalsy()
    })
    it('do not show on public pages', () => {
      const resource = getResourceMock()
      const { wrapper } = createWrapper({ resource, versions: ['1'], isPublicLinkContext: true })
      expect(wrapper.find(selectors.versionsInfo).exists()).toBeFalsy()
    })
  })
  describe('running on EOS', () => {
    it('shows eos path and direct link', () => {
      const resource = getResourceMock()
      const { wrapper } = createWrapper({ resource, runningOnEos: true })
      expect(wrapper.find(selectors.eosPath).exists()).toBeTruthy()
      expect(wrapper.find(selectors.eosDirectLink).exists()).toBeTruthy()
    })
  })
  describe('CERN features', () => {
    it('show samba link', () => {
      const resource = getResourceMock({ path: '/eos/user/t/test/123.png' })
      const { wrapper } = createWrapper({ resource, cernFeatures: true })
      expect(wrapper.find(selectors.sambaPath).exists()).toBeTruthy()
    })
  })
  describe('tags', () => {
    it('show if given', () => {
      const resource = getResourceMock({ tags: ['moon', 'mars'] })
      const { wrapper } = createWrapper({ resource })
      expect(wrapper.find(selectors.tags).exists()).toBeTruthy()
    })
    it('should use router-link on private page', () => {
      const resource = getResourceMock({ tags: ['moon', 'mars'] })
      const { wrapper } = createWrapper({ resource })
      expect(wrapper.find(selectors.tags).find('router-link-stub').exists()).toBeTruthy()
    })
    it('should not use router-link on public page', () => {
      const resource = getResourceMock({ tags: ['moon', 'mars'] })
      const { wrapper } = createWrapper({ resource, isPublicLinkContext: true })
      expect(wrapper.find(selectors.tags).find('router-link-stub').exists()).toBeFalsy()
    })
  })
})

function createWrapper({
  resource = null,
  runningOnEos = false,
  cernFeatures = false,
  isPublicLinkContext = false,
  ancestorMetaData = {},
  user = { id: 'marie' },
  versions = []
} = {}) {
  const storeOptions = defaultStoreMockOptions
  storeOptions.getters.user.mockReturnValue(user)
  storeOptions.getters.configuration.mockReturnValue({ options: { runningOnEos, cernFeatures } })
  storeOptions.modules.Files.getters.versions.mockReturnValue(versions)
  storeOptions.getters.capabilities.mockReturnValue({ files: { tags: true } })
  storeOptions.modules.runtime.modules.ancestorMetaData.getters.ancestorMetaData.mockReturnValue(
    ancestorMetaData
  )
  storeOptions.modules.runtime.modules.auth.getters.isPublicLinkContextReady.mockReturnValue(
    isPublicLinkContext
  )
  const store = createStore(storeOptions)
  const mocks = { ...defaultComponentMocks() }
  return {
    wrapper: shallowMount(FileDetails, {
      global: {
        stubs: { 'router-link': true, 'oc-resource-icon': true },
        provide: {
          ...mocks,
          resource,
          space: mockDeep<SpaceResource>()
        },
        plugins: [...defaultPlugins(), store],
        mocks
      }
    })
  }
}
