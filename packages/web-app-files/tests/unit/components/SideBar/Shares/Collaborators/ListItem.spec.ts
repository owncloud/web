import ListItem from 'web-app-files/src/components/SideBar/Shares/Collaborators/ListItem.vue'
import {
  peopleRoleViewerFile,
  peopleRoleViewerFolder,
  SharePermissions,
  ShareTypes
} from '@ownclouders/web-client/src/helpers/share'
import {
  createStore,
  defaultPlugins,
  mount,
  defaultStoreMockOptions,
  defaultStubs,
  defaultComponentMocks
} from 'web-test-helpers'

jest.mock('uuid', () => ({
  v4: () => {
    return '00000000-0000-0000-0000-000000000000'
  }
}))

const selectors = {
  userAvatarImage: 'avatar-image-stub.files-collaborators-collaborator-indicator',
  notUserAvatar: 'oc-avatar-item-stub.files-collaborators-collaborator-indicator',
  collaboratorAdditionalInfo: '.files-collaborators-collaborator-additional-info',
  collaboratorName: '.files-collaborators-collaborator-name',
  accessDetailsButton: '.files-collaborators-collaborator-access-details-button',
  collaboratorRole: '.files-collaborators-collaborator-role',
  collaboratorEdit: '.files-collaborators-collaborator-edit',
  shareInheritanceIndicators: '.oc-resource-indicators',
  expirationDateIcon: '[data-testid="recipient-info-expiration-date"]'
}

describe('Collaborator ListItem component', () => {
  describe('displays the correct image/icon according to the shareType', () => {
    describe('user and spaceUser share type', () => {
      it.each([ShareTypes.user.value, ShareTypes.spaceUser.value])(
        'should display a users avatar',
        (shareType) => {
          const { wrapper } = createWrapper({ shareType })
          expect(wrapper.find(selectors.userAvatarImage).exists()).toBeTruthy()
          expect(wrapper.find(selectors.notUserAvatar).exists()).toBeFalsy()
        }
      )
      it('sets user info on the avatar', () => {
        const { wrapper } = createWrapper()
        expect(wrapper.find(selectors.userAvatarImage).attributes('userid')).toEqual('brian')
        expect(wrapper.find(selectors.userAvatarImage).attributes('user-name')).toEqual(
          'Brian Murphy'
        )
      })
    })
    describe('non-user share types', () => {
      it.each(
        ShareTypes.all.filter(
          (shareType) => ![ShareTypes.user, ShareTypes.spaceUser].includes(shareType)
        )
      )('should display an oc-avatar-item for any non-user share types', (shareType) => {
        const { wrapper } = createWrapper({ shareType: shareType.value })
        expect(wrapper.find(selectors.userAvatarImage).exists()).toBeFalsy()
        expect(wrapper.find(selectors.notUserAvatar).exists()).toBeTruthy()
        expect(wrapper.find(selectors.notUserAvatar).attributes().name).toEqual(shareType.key)
      })
      it('should display an oc-avatar-item for space group shares', () => {
        const { wrapper } = createWrapper({
          shareType: ShareTypes.spaceGroup.value,
          collaborator: { name: undefined, displayName: 'someGroup', additionalInfo: undefined }
        })
        expect(wrapper.find(selectors.userAvatarImage).exists()).toBeFalsy()
        expect(wrapper.find(selectors.notUserAvatar).exists()).toBeTruthy()
      })
    })
  })
  describe('share info', () => {
    it('shows the collaborator display name', () => {
      const { wrapper } = createWrapper()
      expect(wrapper.find(selectors.collaboratorName).text()).toEqual('Brian Murphy')
    })
    it('shows the share expiration date if given', () => {
      const { wrapper } = createWrapper({ expires: new Date() })
      expect(wrapper.find(selectors.expirationDateIcon).exists()).toBeTruthy()
    })
  })
  describe('modifiable property', () => {
    it('shows interactive elements when modifiable', () => {
      const { wrapper } = createWrapper({ modifiable: true })
      expect(wrapper.find(selectors.collaboratorRole).exists()).toBeTruthy()
    })
    it('hides interactive elements when not modifiable', () => {
      const { wrapper } = createWrapper({ modifiable: false })
      expect(wrapper.find(selectors.collaboratorRole).exists()).toBeFalsy()
    })
  })
  describe('share inheritance indicators', () => {
    it('show when sharedParentRoute is given', () => {
      const { wrapper } = createWrapper({
        sharedParentRoute: { params: { driveAliasAndItem: '/folder' } }
      })
      expect(wrapper.find(selectors.shareInheritanceIndicators).exists()).toBeTruthy()
      expect(wrapper.html()).toMatchSnapshot()
    })
    it('do not show when sharedParentRoute is not given', () => {
      const { wrapper } = createWrapper()
      expect(wrapper.find(selectors.shareInheritanceIndicators).exists()).toBeFalsy()
    })
  })
  describe('remove share', () => {
    it('emits the "removeShare" event', () => {
      const { wrapper } = createWrapper()
      ;(wrapper.findComponent<any>('edit-dropdown-stub').vm as any).$emit('removeShare')
      expect(wrapper.emitted().onDelete).toBeTruthy()
    })
  })
  describe('change share role', () => {
    it('calls "changeShare" for regular resources', () => {
      const { wrapper } = createWrapper()
      const changeShareStub = jest.spyOn(wrapper.vm, 'changeShare')
      ;(wrapper.findComponent<any>('role-dropdown-stub').vm as any).$emit('optionChange', {
        role: peopleRoleViewerFile,
        permissions: [SharePermissions.read]
      })
      expect(changeShareStub).toHaveBeenCalled()
    })
    it('calls "changeSpaceMember" for space resources', () => {
      const { wrapper } = createWrapper({ shareType: ShareTypes.spaceUser.value })
      const changeShareStub = jest.spyOn(wrapper.vm, 'changeSpaceMember')
      ;(wrapper.findComponent<any>('role-dropdown-stub').vm as any).$emit('optionChange', {
        role: peopleRoleViewerFile,
        permissions: [SharePermissions.read]
      })
      expect(changeShareStub).toHaveBeenCalled()
    })
    it('shows a message on error', () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const { wrapper } = createWrapper()
      jest.spyOn(wrapper.vm, 'saveShareChanges').mockImplementation(() => {
        throw new Error()
      })
      const changeShareStub = jest.spyOn(wrapper.vm, 'changeShare')
      const showErrorMessageStub = jest.spyOn(wrapper.vm, 'showErrorMessage')
      ;(wrapper.findComponent<any>('role-dropdown-stub').vm as any).$emit('optionChange', {
        role: peopleRoleViewerFile,
        permissions: [SharePermissions.read]
      })
      expect(changeShareStub).not.toHaveBeenCalled()
      expect(showErrorMessageStub).toHaveBeenCalled()
    })
  })
  describe('change expiration date', () => {
    it('calls "changeShare" for regular resources', () => {
      const { wrapper } = createWrapper()
      const changeShareStub = jest.spyOn(wrapper.vm, 'changeShare')
      ;(wrapper.findComponent<any>('edit-dropdown-stub').vm as any).$emit('expirationDateChanged', {
        shareExpirationChanged: new Date()
      })
      expect(changeShareStub).toHaveBeenCalled()
    })
    it('shows a message on error', () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const { wrapper } = createWrapper()
      jest.spyOn(wrapper.vm, 'saveShareChanges').mockImplementation(() => {
        throw new Error()
      })
      const changeShareStub = jest.spyOn(wrapper.vm, 'changeShare')
      const showErrorMessageStub = jest.spyOn(wrapper.vm, 'showErrorMessage')
      ;(wrapper.findComponent<any>('edit-dropdown-stub').vm as any).$emit('expirationDateChanged', {
        shareExpirationChanged: new Date()
      })
      expect(changeShareStub).not.toHaveBeenCalled()
      expect(showErrorMessageStub).toHaveBeenCalled()
    })
  })
})

function createWrapper({
  shareType = ShareTypes.user.value,
  collaborator = {
    name: 'brian',
    displayName: 'Brian Murphy',
    additionalInfo: 'brian@owncloud.com'
  },
  owner = {
    name: 'marie',
    displayName: 'Marie Curie',
    additionalInfo: 'marie@owncloud.com'
  },
  role = peopleRoleViewerFolder,
  modifiable = true,
  expires = undefined,
  sharedParentRoute = null
} = {}) {
  const storeOptions = {
    ...defaultStoreMockOptions,
    state: { user: { id: '1' } }
  }
  storeOptions.modules.Files.actions.changeShare = jest.fn()
  const store = createStore(storeOptions)
  const mocks = defaultComponentMocks()
  return {
    wrapper: mount(ListItem, {
      props: {
        share: {
          id: 'asdf',
          collaborator,
          owner,
          shareType,
          expires,
          role
        },
        modifiable,
        sharedParentRoute
      },
      global: {
        plugins: [...defaultPlugins(), store],
        mocks,
        provide: mocks,
        renderStubDefaultSlot: true,
        stubs: {
          ...defaultStubs,
          'oc-icon': true,
          'avatar-image': true,
          'router-link': true,
          'oc-info-drop': true,
          'oc-table-simple': true,
          'oc-tr': true,
          'oc-td': true,
          'oc-tag': true,
          'oc-pagination': true,
          'oc-avatar-item': true,
          'role-dropdown': true,
          'edit-dropdown': true,
          translate: false
        }
      }
    })
  }
}
