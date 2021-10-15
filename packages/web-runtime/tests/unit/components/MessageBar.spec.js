import { shallowMount, createLocalVue } from '@vue/test-utils'
import DesignSystem from 'owncloud-design-system'
import GetText from 'vue-gettext'

import MessageBar from 'web-runtime/src/components/MessageBar.vue'

const localVue = createLocalVue()
localVue.use(DesignSystem)
localVue.use(GetText, {
  translations: 'does-not-matter.json',
  silent: true
})

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
  const spyDeleteMessage = jest.spyOn(MessageBar.methods, 'deleteMessage')
  const spyOcMessagesLimited = jest.spyOn(MessageBar.computed, '$_ocMessages_limited')

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('when there is an active message', () => {
    const wrapper = getShallowWrapper([messages[0]])
    const notificationMessage = wrapper.find(selectors.notificationMessage)

    it('should set props in oc-notification-message component', () => {
      expect(notificationMessage.attributes().title).toEqual(messages[0].title)
      expect(notificationMessage.attributes().status).toEqual(messages[0].status)
      expect(notificationMessage.attributes().message).toEqual(messages[0].desc)
    })
    it('should call "deleteMessage" method on close event', () => {
      expect(spyDeleteMessage).toHaveBeenCalledTimes(0)

      notificationMessage.vm.$emit('close')

      expect(spyDeleteMessage).toHaveBeenCalledTimes(1)
      expect(spyDeleteMessage).toHaveBeenCalledWith(messages[0])
      expect(wrapper.emitted().deleteMessage).toBeTruthy()
      expect(wrapper.emitted().deleteMessage).toEqual([[messages[0]]])
    })
  })

  describe('when there are more than five active messages', () => {
    it('should return only the first five messages', () => {
      const wrapper = getShallowWrapper(messages)

      expect(spyOcMessagesLimited).toHaveBeenCalledTimes(1)
      expect(wrapper.vm.$_ocMessages_limited).toHaveLength(5)
    })
  })
})

function getShallowWrapper(activeMessages = []) {
  return shallowMount(MessageBar, {
    localVue,
    propsData: {
      activeMessages
    },
    stubs: {
      'oc-icon': true,
      'oc-notifications': true,
      'oc-notification-message': true
    }
  })
}
