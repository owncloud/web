import Notifications from 'web-runtime/src/components/Topbar/Notifications.vue'
import { mockDeep } from 'jest-mock-extended'
import { OwnCloudSdk } from 'web-client/src/types'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  mount,
  shallowMount,
  defaultStoreMockOptions
} from 'web-test-helpers'

const testData = {
  selectors: {
    notificationBell: '#oc-notification-bell',
    ocIconStub: 'oc-icon-stub',
    actionButton: '.oc-ml-s',
    resolveNotificationButton: '#resolve-notification-button',
    link: '.oc-width-1-1 > p > a',
    subject: 'h4',
    message: '.oc-text-small'
  },
  notifications: {
    emptyActions: [
      {
        notification_id: 1,
        subject: 'Test',
        message: 'This is a test message',
        actions: []
      }
    ],
    get singleAction() {
      return [
        {
          ...this.emptyActions[0],
          actions: [
            {
              label: 'Test Action',
              link: 'http://some.link'
            }
          ]
        }
      ]
    },
    twoActiveNotifications: [
      {
        subject: 'First Notification',
        message: 'This is first test message',
        actions: []
      },
      {
        subject: 'Second Notification',
        message: 'This is second test message',
        actions: []
      }
    ],
    linkActions: [
      {
        link: 'http://test.link',
        actions: []
      }
    ]
  }
}

describe('Notification component', () => {
  const { selectors } = testData

  describe('when active notification contains a message', () => {
    it('displays the notification message', () => {
      const { wrapper } = getWrapper({
        mountType: shallowMount,
        activeNotifications: testData.notifications.emptyActions
      })
      const messageElement = wrapper.find(selectors.message)

      expect(messageElement.exists()).toBeTruthy()
      expect(messageElement.text()).toBe('This is a test message')
    })

    it('displays the notification subject', () => {
      const { wrapper } = getWrapper({
        mountType: shallowMount,
        activeNotifications: testData.notifications.emptyActions
      })
      const subjectElement = wrapper.find(selectors.subject)

      expect(subjectElement.exists()).toBeTruthy()
      expect(subjectElement.text()).toBe('Test')
    })
  })

  describe('active notifications actions', () => {
    describe('when active notification action is empty', () => {
      const client = mockDeep<OwnCloudSdk>({})
      const { wrapper } = getWrapper({
        activeNotifications: testData.notifications.emptyActions,
        mocks: { $client: client }
      })

      it('does not display the action button', () => {
        expect(wrapper.find(selectors.actionButton).exists()).toBeFalsy()
      })

      it('displays the resolve notification button', () => {
        expect(wrapper.find(selectors.resolveNotificationButton).exists()).toBeTruthy()
      })

      it('dispatches deleteNotification when resolve notification is clicked', () => {
        const notificationSpy = jest.spyOn(wrapper.vm, 'deleteNotification')
        client.requests.ocs.mockImplementation(() => Promise.resolve(new Response()))

        const resolveNotificationButton = wrapper.find(selectors.resolveNotificationButton)

        expect(resolveNotificationButton.exists()).toBeTruthy()
        resolveNotificationButton.trigger('click')
        expect(notificationSpy).toHaveBeenCalledTimes(1)
        expect(notificationSpy).toHaveBeenCalledWith({ client, notification: 1 })
      })
    })

    describe('when active notification action has an action', () => {
      const { wrapper, mocks } = getWrapper({
        activeNotifications: testData.notifications.singleAction
      })

      it('displays the action button with action label', () => {
        const actionButton = wrapper.find(selectors.actionButton)

        expect(actionButton.exists()).toBeTruthy()
        expect(actionButton.text()).toBe('Test Action')
      })

      it("doesn't display the resolve notification button", () => {
        expect(wrapper.find(selectors.resolveNotificationButton).exists()).toBeFalsy()
      })

      it('calls executeRequest when action button is clicked', async () => {
        const actionButton = wrapper.find(selectors.actionButton)

        await actionButton.trigger('click')
        expect(mocks.$client.requests.ocs).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('active notifications links', () => {
    it('does not display link if no link is given', () => {
      const { wrapper } = getWrapper({
        mountType: shallowMount,
        activeNotifications: testData.notifications.emptyActions
      })
      const linkButton = wrapper.find(selectors.link)

      expect(linkButton.exists()).toBeFalsy()
    })

    it('displays link if a link is given', () => {
      const { wrapper } = getWrapper({
        mountType: shallowMount,
        activeNotifications: testData.notifications.linkActions
      })
      const linkButton = wrapper.find(selectors.link)

      expect(linkButton.exists()).toBeTruthy()
      expect(linkButton.text()).toBe('http://test.link')
    })
  })

  describe('when active notification has multiple notifications', () => {
    it('displays all notifications from active notifications', () => {
      const { wrapper } = getWrapper({
        mountType: shallowMount,
        activeNotifications: testData.notifications.twoActiveNotifications
      })
      const subject = wrapper.findAll(selectors.subject)
      const message = wrapper.findAll(selectors.message)

      expect(subject).toHaveLength(2)
      expect(message).toHaveLength(2)
      expect(subject.at(0).text()).toBe('First Notification')
      expect(subject.at(1).text()).toBe('Second Notification')
      expect(message.at(0).text()).toBe('This is first test message')
      expect(message.at(1).text()).toBe('This is second test message')
    })
  })
})

function getWrapper({ mountType = mount, mocks = {}, activeNotifications = [] } = {}) {
  const localMocks = { ...defaultComponentMocks(), ...mocks }
  const jsonResponse = {
    json: jest.fn().mockImplementation(() => Promise.resolve({ ocs: { data: [] } }))
  }
  localMocks.$client.requests.ocs.mockImplementation(() =>
    Promise.resolve(mockDeep<Response>(jsonResponse))
  )
  const storeOptions = { ...defaultStoreMockOptions }
  storeOptions.getters.activeNotifications.mockImplementation(() => activeNotifications)
  const store = createStore(storeOptions)
  return {
    mocks: localMocks,
    storeOptions,
    wrapper: mountType(Notifications, {
      global: {
        renderStubDefaultSlot: true,
        plugins: [...defaultPlugins(), store],
        mocks: localMocks,
        stubs: { 'oc-icon': true }
      }
    })
  }
}
