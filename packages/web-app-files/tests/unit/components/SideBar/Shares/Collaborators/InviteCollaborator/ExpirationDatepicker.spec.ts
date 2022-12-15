import ExpirationDatepicker from 'web-app-files/src/components/SideBar/Shares/Collaborators/InviteCollaborator/ExpirationDatepicker.vue'
import { ShareTypes } from 'web-client/src/helpers/share'
import merge from 'lodash-es/merge'
import { DateTime } from 'luxon'
import { createStore, defaultPlugins, mount, defaultStoreMockOptions } from 'web-test-helpers'
import { nextTick } from 'vue'

const bareCapabilities = {
  user: {
    expire_date: {}
  },
  group: {
    expire_date: {}
  }
}

const enabledCapabilities = merge({}, bareCapabilities, {
  user: {
    expire_date: {
      enabled: true,
      days: 1
    }
  },
  group: {
    expire_date: {
      enabled: true,
      days: 2
    }
  }
})

const enforcedCapabilities = merge({}, enabledCapabilities, {
  user: {
    expire_date: {
      enforced: true
    }
  },
  group: {
    expire_date: {
      enforced: true
    }
  }
})

describe('InviteCollaborator ExpirationDatepicker', () => {
  it('only gets displayed if share expiration is supported', () => {
    const { wrapper } = createWrapper()
    expect(wrapper.html()).toBe('')
  })

  it('renders a button to open the datepicker and set an expiration date', () => {
    const { wrapper } = createWrapper({ capabilities: bareCapabilities })

    expect(wrapper.find('[data-testid="recipient-datepicker-btn"]').exists()).toBe(true)
  })

  it('does not allow to select a date from the past', () => {
    const { wrapper } = createWrapper({ capabilities: bareCapabilities })
    const minDate = wrapper.find('[data-testid="recipient-datepicker"]').attributes()['min-date']

    expect(DateTime.now().toISODate()).toBe(DateTime.fromJSDate(new Date(minDate)).toISODate())
  })

  it('does not set any maximum date if no user or group is selected', () => {
    const { wrapper } = createWrapper({ capabilities: enabledCapabilities })
    const maxDate = wrapper.find('[data-testid="recipient-datepicker"]').attributes()['max-date']

    expect(maxDate).toBe(undefined)
  })

  it('pre selects and enforces the default expiration date for users', async () => {
    const { wrapper } = createWrapper({ capabilities: enabledCapabilities })
    await wrapper.setProps({ shareTypes: [ShareTypes.user.value] })

    const selectedDate = wrapper.find('[data-testid="recipient-datepicker"]').attributes().value
    expect(
      DateTime.now().plus({ days: enabledCapabilities.user.expire_date.days }).toISODate()
    ).toBe(DateTime.fromJSDate(new Date(selectedDate)).toISODate())

    const newCapabilities = {
      getters: {
        capabilities: jest.fn().mockImplementation(() => ({ files_sharing: enforcedCapabilities }))
      }
    }
    wrapper.vm.$store.hotUpdate(newCapabilities)
    await nextTick()
    const maxDate = wrapper.find('[data-testid="recipient-datepicker"]').attributes()['max-date']
    expect(
      DateTime.now().plus({ days: enabledCapabilities.user.expire_date.days }).toISODate()
    ).toBe(DateTime.fromJSDate(new Date(maxDate)).toISODate())
  })

  it('pre selects and enforces the default expiration date for groups', async () => {
    const { wrapper } = createWrapper({ capabilities: enabledCapabilities })
    await wrapper.setProps({ shareTypes: [ShareTypes.group.value] })
    const selectedDate = wrapper.find('[data-testid="recipient-datepicker"]').attributes().value

    expect(
      DateTime.now().plus({ days: enabledCapabilities.group.expire_date.days }).toISODate()
    ).toBe(DateTime.fromJSDate(new Date(selectedDate)).toISODate())

    const newCapabilities = {
      getters: {
        capabilities: jest.fn().mockImplementation(() => ({ files_sharing: enforcedCapabilities }))
      }
    }
    wrapper.vm.$store.hotUpdate(newCapabilities)
    await nextTick()
    const maxDate = wrapper.find('[data-testid="recipient-datepicker"]').attributes()['max-date']
    expect(
      DateTime.now().plus({ days: enabledCapabilities.group.expire_date.days }).toISODate()
    ).toBe(DateTime.fromJSDate(new Date(maxDate)).toISODate())
  })

  it('pre selects and enforces the smallest expiration date if user and group shareTypes are provided', async () => {
    const { wrapper } = createWrapper({ capabilities: enabledCapabilities })
    await wrapper.setProps({ shareTypes: [ShareTypes.group.value, ShareTypes.user.value] })
    const selectedDate = wrapper.find('[data-testid="recipient-datepicker"]').attributes().value

    expect(
      DateTime.now().plus({ days: enabledCapabilities.user.expire_date.days }).toISODate()
    ).toBe(DateTime.fromJSDate(new Date(selectedDate)).toISODate())

    const newCapabilities = {
      getters: {
        capabilities: jest.fn().mockImplementation(() => ({ files_sharing: enforcedCapabilities }))
      }
    }
    wrapper.vm.$store.hotUpdate(newCapabilities)
    await nextTick()
    const maxDate = wrapper.find('[data-testid="recipient-datepicker"]').attributes()['max-date']
    expect(
      DateTime.now().plus({ days: enabledCapabilities.user.expire_date.days }).toISODate()
    ).toBe(DateTime.fromJSDate(new Date(maxDate)).toISODate())
  })

  it('emits an event if date changes', async () => {
    const { wrapper } = createWrapper({ capabilities: enabledCapabilities })
    const checker = jest.fn()
    wrapper.vm.$on('optionChange', checker as any)

    expect(checker).toHaveBeenCalledTimes(0)

    await wrapper.setProps({ shareTypes: [ShareTypes.user.value] })
    await nextTick()
    expect(checker).toHaveBeenCalledTimes(1)
    expect(DateTime.fromISO(checker.mock.calls[0][0].expirationDate).toISODate()).toBe(
      DateTime.now().plus({ days: enabledCapabilities.user.expire_date.days }).toISODate()
    )

    await wrapper.setProps({ shareTypes: [ShareTypes.group.value] })
    await nextTick()
    expect(checker).toHaveBeenCalledTimes(2)
    expect(DateTime.fromISO(checker.mock.calls[1][0].expirationDate).toISODate()).toBe(
      DateTime.now().plus({ days: enabledCapabilities.group.expire_date.days }).toISODate()
    )

    await wrapper.setProps({ shareTypes: [] })
    await nextTick()
    expect(checker).toHaveBeenCalledTimes(3)
    expect(checker.mock.calls[2][0].expirationDate).toBe(null)

    const manualDate = DateTime.now().plus({ days: 5 })
    wrapper.setData({ dateCurrent: manualDate.toJSDate() })
    await nextTick()
    expect(checker).toHaveBeenCalledTimes(4)
    expect(DateTime.fromISO(checker.mock.calls[3][0].expirationDate).toISODate()).toBe(
      manualDate.toISODate()
    )

    wrapper.setData({ dateCurrent: null })
    await wrapper.setProps({ shareTypes: [ShareTypes.user.value, ShareTypes.group.value] })
    await nextTick()
    expect(checker).toHaveBeenCalledTimes(5)
    expect(DateTime.fromISO(checker.mock.calls[4][0].expirationDate).toISODate()).toBe(
      DateTime.now().plus({ days: enabledCapabilities.user.expire_date.days }).toISODate()
    )
  })
})

const createWrapper = ({ capabilities = {} } = {}) => {
  const storeOptions = defaultStoreMockOptions
  storeOptions.getters.capabilities.mockImplementation(() => ({ files_sharing: capabilities }))
  const store = createStore(storeOptions)
  return {
    storeOptions,
    wrapper: mount(ExpirationDatepicker, {
      global: {
        plugins: [...defaultPlugins(), store]
      }
    })
  }
}
