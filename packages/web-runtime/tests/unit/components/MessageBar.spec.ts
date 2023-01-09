import MessageBar from 'web-runtime/src/components/MessageBar.vue'
import {
  createStore,
  defaultPlugins,
  shallowMount,
  defaultStoreMockOptions
} from 'web-test-helpers'

const messages = [
  {
    id: '101',
    title: 'Error while moving',
    desc: '',
    status: 'danger'
  },
  {
    id: '102',
    title: 'Error while deleting',
    desc: '',
    status: 'danger'
  },
  {
    id: '103',
    title: 'Error while renaming',
    desc: '',
    status: 'danger'
  },
  {
    id: '104',
    title: 'Error while copying',
    desc: '',
    status: 'danger'
  },
  {
    id: '105',
    title: 'Error while restoring',
    desc: '',
    status: 'danger'
  },
  {
    id: '106',
    title: 'Error while uploading',
    desc: '',
    status: 'danger'
  }
]

const selectors = {
  notificationMessage: 'oc-notification-message-stub'
}

describe('MessageBar component', () => {
  const spyDeleteMessage = jest.spyOn((MessageBar as any).methods, 'deleteMessage')
  const spyOcMessagesLimited = jest.spyOn((MessageBar as any).computed, '$_ocMessages_limited')

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('when there is an active message', () => {
    const { wrapper } = getShallowWrapper([messages[0]])
    const notificationMessage = wrapper.findComponent<any>(selectors.notificationMessage)

    it('should set props in oc-notification-message component', () => {
      expect(notificationMessage.attributes().title).toEqual(messages[0].title)
      expect(notificationMessage.attributes().status).toEqual(messages[0].status)
      expect(notificationMessage.attributes().message).toEqual(messages[0].desc)
    })
    it('should call "deleteMessage" method on close event', () => {
      expect(spyDeleteMessage).toHaveBeenCalledTimes(0)
      ;(notificationMessage.vm as any).$emit('close')

      expect(spyDeleteMessage).toHaveBeenCalledTimes(1)
      expect(spyDeleteMessage).toHaveBeenCalledWith(messages[0])
      expect(wrapper.emitted().deleteMessage).toBeTruthy()
      expect(wrapper.emitted().deleteMessage).toEqual([[messages[0]]])
    })
  })

  describe('when there are more than five active messages', () => {
    it('should return only the first five messages', () => {
      const { wrapper } = getShallowWrapper(messages)

      expect(spyOcMessagesLimited).toHaveBeenCalledTimes(1)
      expect(wrapper.vm.$_ocMessages_limited).toHaveLength(5)
    })
  })
})

function getShallowWrapper(activeMessages = []) {
  const storeOptions = defaultStoreMockOptions
  storeOptions.getters.configuration.mockImplementation(() => ({
    options: {
      topCenterNotifications: false
    }
  }))
  const store = createStore(storeOptions)
  return {
    wrapper: shallowMount(MessageBar, {
      props: {
        activeMessages
      },
      global: {
        renderStubDefaultSlot: true,
        plugins: [...defaultPlugins(), store]
      }
    })
  }
}
