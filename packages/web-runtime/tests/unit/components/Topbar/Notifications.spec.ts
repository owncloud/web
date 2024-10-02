import Notifications from 'web-runtime/src/components/Topbar/Notifications.vue'
import { Notification, NotificationAction } from 'web-runtime/src/helpers/notifications'
import { mock, mockDeep } from 'jest-mock-extended'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  shallowMount,
  defaultStoreMockOptions,
  mockAxiosResolve
} from 'web-test-helpers'
import { OwnCloudSdk } from '@ownclouders/web-client/src/types'
import { SpaceResource } from '@ownclouders/web-client'
import { Drive } from '@ownclouders/web-client/src/generated'

const selectors = {
  notificationBellStub: 'notification-bell-stub',
  avatarImageStub: 'avatar-image-stub',
  noNewNotifications: '.oc-notifications-no-new',
  markAll: '.oc-notifications-mark-all',
  notificationsLoading: '.oc-notifications-loading',
  notificationItem: '.oc-notifications-item',
  notificationSubject: '.oc-notifications-subject',
  notificationMessage: '.oc-notifications-message',
  notificationLink: '.oc-notifications-link',
  notificationActions: '.oc-notifications-actions',
  notificationRouterLinkStub: '.oc-notifications-item router-link-stub'
}

jest.mock('@ownclouders/web-pkg', () => ({
  ...jest.requireActual('@ownclouders/web-pkg'),
  useServerSentEvents: jest.fn()
}))

describe('Notification component', () => {
  it('renders the notification bell and no notifications if there are none', () => {
    const { wrapper } = getWrapper()
    expect(wrapper.find(selectors.notificationBellStub).exists()).toBeTruthy()
    expect(wrapper.find(selectors.noNewNotifications).exists()).toBeTruthy()
    expect(wrapper.find(selectors.markAll).exists()).toBeFalsy()
  })
  it('renders a set of notifications', async () => {
    const notifications = [mock<Notification>({ messageRich: undefined })]
    const { wrapper } = getWrapper({ notifications })
    await wrapper.vm.fetchNotificationsTask.perform()
    await wrapper.vm.fetchNotificationsTask.last
    expect(wrapper.find(selectors.noNewNotifications).exists()).toBeFalsy()
    expect(wrapper.findAll(selectors.notificationItem).length).toBe(notifications.length)
  })
  it('renders the loading state', async () => {
    const notifications = [mock<Notification>({ messageRich: undefined })]
    const { wrapper } = getWrapper({ notifications })
    await wrapper.vm.fetchNotificationsTask.perform()
    await wrapper.vm.fetchNotificationsTask.last
    wrapper.vm.loading = true
    await wrapper.vm.$nextTick()
    expect(wrapper.find(selectors.notificationsLoading).exists()).toBeTruthy()
  })
  it('marks all notifications as read', async () => {
    const notifications = [mock<Notification>({ messageRich: undefined })]
    const { wrapper, mocks } = getWrapper({ notifications })
    await wrapper.vm.fetchNotificationsTask.perform()
    await wrapper.vm.fetchNotificationsTask.last
    await wrapper.find(selectors.markAll).trigger('click')
    expect(wrapper.find(selectors.notificationItem).exists()).toBeFalsy()
    expect(mocks.$clientService.owncloudSdk.requests.ocs).toHaveBeenCalledTimes(3)
  })
  describe('avatar', () => {
    it('loads based on the username', async () => {
      const notification = mock<Notification>({
        messageRich: undefined,
        user: 'einstein'
      })
      const { wrapper } = getWrapper({ notifications: [notification] })
      await wrapper.vm.fetchNotificationsTask.perform()
      await wrapper.vm.fetchNotificationsTask.last
      const avatarImageStub = wrapper.findComponent<any>(selectors.avatarImageStub)
      expect(avatarImageStub.attributes('userid')).toEqual(notification.user)
      expect(avatarImageStub.attributes('user-name')).toEqual(notification.user)
    })
    it('loads based on the rich parameters', async () => {
      const displayname = 'Albert Einstein'
      const name = 'einstein'
      const notification = mock<Notification>({
        messageRich: undefined,
        messageRichParameters: { user: { displayname, name } }
      })
      const { wrapper } = getWrapper({ notifications: [notification] })
      await wrapper.vm.fetchNotificationsTask.perform()
      await wrapper.vm.fetchNotificationsTask.last
      const avatarImageStub = wrapper.findComponent<any>(selectors.avatarImageStub)
      expect(avatarImageStub.attributes('userid')).toEqual(name)
      expect(avatarImageStub.attributes('user-name')).toEqual(displayname)
    })
  })
  describe('subject', () => {
    it('displays if no message given', async () => {
      const notification = mock<Notification>({
        messageRich: undefined,
        message: undefined
      })
      const { wrapper } = getWrapper({ notifications: [notification] })
      await wrapper.vm.fetchNotificationsTask.perform()
      await wrapper.vm.fetchNotificationsTask.last
      expect(wrapper.find(selectors.notificationSubject).exists()).toBeTruthy()
    })
  })
  describe('message', () => {
    it('displays simple message if messageRich not given', async () => {
      const notification = mock<Notification>({
        messageRich: undefined,
        message: 'some message'
      })
      const { wrapper } = getWrapper({ notifications: [notification] })
      await wrapper.vm.fetchNotificationsTask.perform()
      await wrapper.vm.fetchNotificationsTask.last
      wrapper.vm.showDrop()
      await wrapper.vm.$nextTick()
      expect(wrapper.find(selectors.notificationMessage).text()).toEqual(notification.message)
    })
    it('displays rich message and interpolates the text', async () => {
      const notification = mock<Notification>({
        messageRich: '{user} shared {resource} with you',
        messageRichParameters: {
          user: { displayname: 'Albert Einstein' },
          resource: { name: 'someFile.txt' }
        }
      })
      const { wrapper } = getWrapper({ notifications: [notification] })
      await wrapper.vm.fetchNotificationsTask.perform()
      await wrapper.vm.fetchNotificationsTask.last
      wrapper.vm.showDrop()
      await wrapper.vm.$nextTick()
      expect(wrapper.find(selectors.notificationMessage).text()).toEqual(
        'Albert Einstein shared someFile.txt with you'
      )
    })
  })
  describe('link', () => {
    it('displays if given directly', async () => {
      const notification = mock<Notification>({
        messageRich: undefined,
        link: 'http://some-link.com'
      })
      const { wrapper } = getWrapper({ notifications: [notification] })
      await wrapper.vm.fetchNotificationsTask.perform()
      await wrapper.vm.fetchNotificationsTask.last
      expect(wrapper.find(selectors.notificationLink).exists()).toBeTruthy()
    })
    describe('if given via messageRichParameters', () => {
      it('renders notification as link for shares', async () => {
        const notification = mock<Notification>({
          messageRich: '{user} shared {resource} with you',
          object_type: 'share',
          messageRichParameters: {
            user: { displayname: 'Albert Einstein' },
            resource: { name: 'someFile.txt' },
            share: { id: '1' }
          }
        })
        const { wrapper } = getWrapper({ notifications: [notification] })
        await wrapper.vm.fetchNotificationsTask.perform()
        await wrapper.vm.fetchNotificationsTask.last
        wrapper.vm.showDrop()
        await wrapper.vm.$nextTick()
        await wrapper.vm.$nextTick()
        const routerLink = wrapper.findComponent<any>(selectors.notificationRouterLinkStub)
        expect(routerLink.props('to').name).toEqual('files-shares-with-me')
        expect(routerLink.props('to').query).toEqual({
          scrollTo: notification.messageRichParameters.share.id
        })
      })
      it('renders notification as link for already loaded spaces', async () => {
        const spaceMock = mock<SpaceResource>({
          fileId: '1',
          getDriveAliasAndItem: () => 'driveAlias',
          disabled: false
        })
        const notification = mock<Notification>({
          messageRich: '{user} added you to space {space}',
          object_type: 'storagespace',
          messageRichParameters: {
            user: { displayname: 'Albert Einstein' },
            space: { name: 'someFile.txt', id: `${spaceMock.fileId}!2` }
          }
        })
        const { wrapper } = getWrapper({ notifications: [notification], spaces: [spaceMock] })
        await wrapper.vm.fetchNotificationsTask.perform()
        await wrapper.vm.fetchNotificationsTask.last
        wrapper.vm.showDrop()
        await wrapper.vm.$nextTick()
        await wrapper.vm.$nextTick()
        const routerLink = wrapper.findComponent<any>(selectors.notificationRouterLinkStub)
        expect(routerLink.props('to').params).toEqual({
          driveAliasAndItem: 'driveAlias'
        })
      })
      it('renders notification as link for new spaces after fetching them', async () => {
        const spaceMock = mock<SpaceResource>({
          fileId: '1',
          getDriveAliasAndItem: () => 'driveAlias',
          disabled: false
        })
        const notification = mock<Notification>({
          messageRich: '{user} added you to space {space}',
          object_type: 'storagespace',
          messageRichParameters: {
            user: { displayname: 'Albert Einstein' },
            space: { name: 'someFile.txt', id: `${spaceMock.fileId}!2` }
          }
        })

        const { wrapper, mocks } = getWrapper({ notifications: [notification] })
        mocks.$clientService.graphAuthenticated.drives.getDrive.mockResolvedValue(
          mockAxiosResolve(mock<Drive>({ special: [] }))
        )

        await wrapper.vm.fetchNotificationsTask.perform()
        await wrapper.vm.fetchNotificationsTask.last
        wrapper.vm.showDrop()
        await wrapper.vm.$nextTick()
        await wrapper.vm.$nextTick()
        const routerLink = wrapper.findComponent<any>(selectors.notificationRouterLinkStub)

        expect(mocks.$clientService.graphAuthenticated.drives.getDrive).toHaveBeenCalledTimes(1)
        expect(routerLink.exists()).toBeTruthy()
      })
      it('does not render notification as link if user has been removed from space', async () => {
        const spaceMock = mock<SpaceResource>({
          fileId: '1',
          getDriveAliasAndItem: () => 'driveAlias',
          disabled: false
        })
        const notification = mock<Notification>({
          messageRich: '{user} removed you from space {space}',
          object_type: 'storagespace',
          subject: 'Removed from Space',
          messageRichParameters: {
            user: { displayname: 'Albert Einstein' },
            space: { name: 'someFile.txt', id: `${spaceMock.fileId}!2` }
          }
        })
        const { wrapper } = getWrapper({ notifications: [notification], spaces: [spaceMock] })
        await wrapper.vm.fetchNotificationsTask.perform()
        await wrapper.vm.fetchNotificationsTask.last
        wrapper.vm.showDrop()
        await wrapper.vm.$nextTick()
        await wrapper.vm.$nextTick()
        const routerLink = wrapper.findComponent<any>(selectors.notificationRouterLinkStub)
        expect(routerLink.exists()).toBeFalsy()
      })
    })
  })
  describe('actions', () => {
    it('display if given', async () => {
      const notification = mock<Notification>({
        messageRich: undefined,
        actions: [mock<NotificationAction>()]
      })
      const { wrapper } = getWrapper({ notifications: [notification] })
      await wrapper.vm.fetchNotificationsTask.perform()
      await wrapper.vm.fetchNotificationsTask.last
      expect(wrapper.find(selectors.notificationActions).exists()).toBeTruthy()
    })
    it('remove the notification when triggered', async () => {
      const notification = mock<Notification>({
        notification_id: '1',
        messageRich: undefined,
        actions: [mock<NotificationAction>({ link: 'http://some-link.com' })]
      })
      const { wrapper, mocks } = getWrapper({ notifications: [notification] })
      await wrapper.vm.fetchNotificationsTask.perform()
      await wrapper.vm.fetchNotificationsTask.last
      expect(wrapper.find(selectors.notificationItem).exists()).toBeTruthy()
      const jsonResponse = {
        json: jest.fn().mockResolvedValue({ ocs: { data: {} } })
      }
      mocks.$clientService.owncloudSdk.requests.ocs.mockResolvedValue(
        mockDeep<Response>(jsonResponse)
      )
      await wrapper.find(`${selectors.notificationActions} button`).trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.find(selectors.notificationItem).exists()).toBeFalsy()
    })
  })
})

function getWrapper({ mocks = {}, notifications = [], spaces = [] } = {}) {
  const localMocks = { ...defaultComponentMocks(), ...mocks }
  const clientMock = mockDeep<OwnCloudSdk>()
  const jsonResponse = {
    json: jest.fn().mockResolvedValue({ ocs: { data: notifications } }),
    headers: {}
  }
  clientMock.requests.ocs.mockResolvedValue(mockDeep<Response>(jsonResponse))
  localMocks.$clientService.owncloudSdk = clientMock

  const storeOptions = { ...defaultStoreMockOptions }
  storeOptions.modules.runtime.modules.spaces.getters.spaces.mockReturnValue(spaces)
  const store = createStore(storeOptions)
  return {
    mocks: localMocks,
    storeOptions,
    wrapper: shallowMount(Notifications, {
      global: {
        renderStubDefaultSlot: true,
        plugins: [...defaultPlugins(), store],
        mocks: localMocks,
        provide: localMocks,
        stubs: { 'avatar-image': true, OcButton: false }
      }
    })
  }
}
