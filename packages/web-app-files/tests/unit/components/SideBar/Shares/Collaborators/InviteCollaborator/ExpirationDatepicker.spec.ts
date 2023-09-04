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
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders a button to open the datepicker and set an expiration date', () => {
    const { wrapper } = createWrapper({ capabilities: bareCapabilities })
    expect(wrapper.find('[data-testid="recipient-datepicker-btn"]').exists()).toBe(true)
  })

  it('does not allow to select a date from the past', () => {
    const { wrapper } = createWrapper({ capabilities: bareCapabilities, stubOcDatepicker: true })
    const minDate = wrapper.find('[data-testid="recipient-datepicker"]').attributes()['min-date']
    expect(DateTime.now().toISODate()).toBe(DateTime.fromJSDate(new Date(minDate)).toISODate())
  })

  it('does not set any maximum date if no user or group is selected', () => {
    const { wrapper } = createWrapper({ capabilities: enabledCapabilities, stubOcDatepicker: true })
    const maxDate = wrapper.find('[data-testid="recipient-datepicker"]').attributes()['max-date']

    expect(maxDate).toBe(undefined)
  })

  it('pre selects and enforces the default expiration date for users', async () => {
    const { store, wrapper } = createWrapper({
      capabilities: enabledCapabilities,
      stubOcDatepicker: true
    })
    await wrapper.setProps({ shareTypes: [ShareTypes.user.value] })

    const selectedDate = wrapper
      .find('[data-testid="recipient-datepicker"]')
      .attributes().modelvalue
    expect(
      DateTime.now().plus({ days: enabledCapabilities.user.expire_date.days }).toISODate()
    ).toBe(DateTime.fromJSDate(new Date(selectedDate)).toISODate())

    const newCapabilities = {
      getters: {
        capabilities: jest.fn().mockImplementation(() => ({ files_sharing: enforcedCapabilities }))
      }
    }

    store.hotUpdate(newCapabilities)
    await nextTick()
    const maxDate = wrapper.find('[data-testid="recipient-datepicker"]').attributes()['max-date']
    expect(
      DateTime.now().plus({ days: enabledCapabilities.user.expire_date.days }).toISODate()
    ).toBe(DateTime.fromJSDate(new Date(maxDate)).toISODate())
  })

  it('pre selects and enforces the default expiration date for groups', async () => {
    const { store, wrapper } = createWrapper({
      capabilities: enabledCapabilities,
      stubOcDatepicker: true
    })
    await wrapper.setProps({ shareTypes: [ShareTypes.group.value] })
    const selectedDate = wrapper
      .find('[data-testid="recipient-datepicker"]')
      .attributes().modelvalue

    expect(
      DateTime.now().plus({ days: enabledCapabilities.group.expire_date.days }).toISODate()
    ).toBe(DateTime.fromJSDate(new Date(selectedDate)).toISODate())

    const newCapabilities = {
      getters: {
        capabilities: jest.fn().mockImplementation(() => ({ files_sharing: enforcedCapabilities }))
      }
    }
    store.hotUpdate(newCapabilities)
    await nextTick()
    const maxDate = wrapper.find('[data-testid="recipient-datepicker"]').attributes()['max-date']
    expect(
      DateTime.now().plus({ days: enabledCapabilities.group.expire_date.days }).toISODate()
    ).toBe(DateTime.fromJSDate(new Date(maxDate)).toISODate())
  })

  it('pre selects and enforces the smallest expiration date if user and group shareTypes are provided', async () => {
    const { store, wrapper } = createWrapper({
      capabilities: enabledCapabilities,
      stubOcDatepicker: true
    })
    await wrapper.setProps({ shareTypes: [ShareTypes.group.value, ShareTypes.user.value] })
    const selectedDate = wrapper
      .find('[data-testid="recipient-datepicker"]')
      .attributes().modelvalue

    expect(
      DateTime.now().plus({ days: enabledCapabilities.user.expire_date.days }).toISODate()
    ).toBe(DateTime.fromJSDate(new Date(selectedDate)).toISODate())

    const newCapabilities = {
      getters: {
        capabilities: jest.fn().mockImplementation(() => ({ files_sharing: enforcedCapabilities }))
      }
    }
    store.hotUpdate(newCapabilities)
    await nextTick()
    const maxDate = wrapper.find('[data-testid="recipient-datepicker"]').attributes()['max-date']
    expect(
      DateTime.now().plus({ days: enabledCapabilities.user.expire_date.days }).toISODate()
    ).toBe(DateTime.fromJSDate(new Date(maxDate)).toISODate())
  })

  it('emits an event if date changes', async () => {
    const { wrapper } = createWrapper({ capabilities: enabledCapabilities, stubOcDatepicker: true })
    expect(wrapper.emitted().optionChange).toBeFalsy()

    await wrapper.setProps({ shareTypes: [ShareTypes.user.value] })
    await nextTick()
    expect(wrapper.emitted().optionChange.length).toBe(1)
    expect(DateTime.fromISO(wrapper.emitted().optionChange[0][0].expirationDate).toISODate()).toBe(
      DateTime.now().plus({ days: enabledCapabilities.user.expire_date.days }).toISODate()
    )

    await wrapper.setProps({ shareTypes: [ShareTypes.group.value] })
    await nextTick()
    expect(wrapper.emitted().optionChange.length).toBe(2)

    expect(DateTime.fromISO(wrapper.emitted().optionChange[1][0].expirationDate).toISODate()).toBe(
      DateTime.now().plus({ days: enabledCapabilities.group.expire_date.days }).toISODate()
    )

    await wrapper.setProps({ shareTypes: [] })
    await nextTick()
    expect(wrapper.emitted().optionChange.length).toBe(3)
    expect(wrapper.emitted().optionChange[2][0].expirationDate).toBe(null)

    const manualDate = DateTime.now().plus({ days: 5 })
    wrapper.vm.dateCurrent = manualDate.toJSDate()
    await nextTick()
    expect(wrapper.emitted().optionChange.length).toBe(4)
    expect(DateTime.fromISO(wrapper.emitted().optionChange[3][0].expirationDate).toISODate()).toBe(
      manualDate.toISODate()
    )

    wrapper.vm.dateCurrent = null
    await wrapper.setProps({ shareTypes: [ShareTypes.user.value, ShareTypes.group.value] })
    await nextTick()
    expect(wrapper.emitted().optionChange.length).toBe(5)
    expect(DateTime.fromISO(wrapper.emitted().optionChange[4][0].expirationDate).toISODate()).toBe(
      DateTime.now().plus({ days: enabledCapabilities.user.expire_date.days }).toISODate()
    )
  })
})

const createWrapper = ({ capabilities = {}, stubOcDatepicker = false } = {}) => {
  const storeOptions = defaultStoreMockOptions
  storeOptions.getters.capabilities.mockImplementation(() => ({ files_sharing: capabilities }))
  const store = createStore(storeOptions)
  return {
    store,
    storeOptions,
    wrapper: mount(ExpirationDatepicker, {
      global: {
        stubs: { OcDatepicker: stubOcDatepicker },
        plugins: [...defaultPlugins(), store]
      }
    })
  }
}
