import ExpirationDatepicker from 'web-app-files/src/components/SideBar/Shares/Collaborators/InviteCollaborator/ExpirationDatepicker.vue'
import { ShareTypes } from '@ownclouders/web-client'
import merge from 'lodash-es/merge'
import { DateTime } from 'luxon'
import { defaultPlugins, mount } from 'web-test-helpers'
import { defineComponent, nextTick } from 'vue'
import { useCapabilityStore } from '@ownclouders/web-pkg'

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
      days: '1'
    }
  },
  group: {
    expire_date: {
      enabled: true,
      days: '2'
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

const DatePickerComponent = defineComponent({
  template: '<div id="foo"><slot></slot></div>'
})

describe('InviteCollaborator ExpirationDatepicker', () => {
  it('renders a button to open the datepicker and set an expiration date', () => {
    const { wrapper } = createWrapper({ sharingCapabilities: bareCapabilities })
    expect(wrapper.find('[data-testid="recipient-datepicker-btn"]').exists()).toBe(true)
  })

  it('does not allow to select a date from the past', () => {
    const { wrapper } = createWrapper({
      sharingCapabilities: bareCapabilities,
      stubOcDatepicker: true
    })
    const minDate = wrapper.find('[data-testid="recipient-datepicker"]').attributes()['min-date']
    expect(DateTime.now().toISODate()).toBe(DateTime.fromJSDate(new Date(minDate)).toISODate())
  })

  it('does not set any maximum date if no user or group is selected', () => {
    const { wrapper } = createWrapper({
      sharingCapabilities: enabledCapabilities,
      stubOcDatepicker: true
    })
    const maxDate = wrapper.find('[data-testid="recipient-datepicker"]').attributes()['max-date']

    expect(maxDate).toBe(undefined)
  })

  it('pre selects and enforces the default expiration date for users', async () => {
    const { wrapper } = createWrapper({
      sharingCapabilities: enabledCapabilities,
      stubOcDatepicker: true
    })
    await wrapper.setProps({ shareTypes: [ShareTypes.user.value] })

    const selectedDate = wrapper
      .find('[data-testid="recipient-datepicker"]')
      .attributes().modelvalue
    expect(
      DateTime.now()
        .plus({ days: Number(enabledCapabilities.user.expire_date.days) })
        .toISODate()
    ).toBe(DateTime.fromJSDate(new Date(selectedDate)).toISODate())

    const capabilityStore = useCapabilityStore()
    capabilityStore.capabilities.files_sharing = enforcedCapabilities

    await nextTick()
    const maxDate = wrapper.find('[data-testid="recipient-datepicker"]').attributes()['max-date']
    expect(
      DateTime.now()
        .plus({ days: Number(enabledCapabilities.user.expire_date.days) })
        .toISODate()
    ).toBe(DateTime.fromJSDate(new Date(maxDate)).toISODate())
  })

  it('pre selects and enforces the default expiration date for groups', async () => {
    const { wrapper } = createWrapper({
      sharingCapabilities: enabledCapabilities,
      stubOcDatepicker: true
    })
    await wrapper.setProps({ shareTypes: [ShareTypes.group.value] })
    const selectedDate = wrapper
      .find('[data-testid="recipient-datepicker"]')
      .attributes().modelvalue

    expect(
      DateTime.now()
        .plus({ days: Number(enabledCapabilities.group.expire_date.days) })
        .toISODate()
    ).toBe(DateTime.fromJSDate(new Date(selectedDate)).toISODate())

    const capabilityStore = useCapabilityStore()
    capabilityStore.capabilities.files_sharing = enforcedCapabilities

    await nextTick()
    const maxDate = wrapper.find('[data-testid="recipient-datepicker"]').attributes()['max-date']
    expect(
      DateTime.now()
        .plus({ days: Number(enabledCapabilities.group.expire_date.days) })
        .toISODate()
    ).toBe(DateTime.fromJSDate(new Date(maxDate)).toISODate())
  })

  it('pre selects and enforces the smallest expiration date if user and group shareTypes are provided', async () => {
    const { wrapper } = createWrapper({
      sharingCapabilities: enabledCapabilities,
      stubOcDatepicker: true
    })
    await wrapper.setProps({ shareTypes: [ShareTypes.group.value, ShareTypes.user.value] })
    const selectedDate = wrapper
      .find('[data-testid="recipient-datepicker"]')
      .attributes().modelvalue

    expect(
      DateTime.now()
        .plus({ days: Number(enabledCapabilities.user.expire_date.days) })
        .toISODate()
    ).toBe(DateTime.fromJSDate(new Date(selectedDate)).toISODate())

    const capabilityStore = useCapabilityStore()
    capabilityStore.capabilities.files_sharing = enforcedCapabilities

    await nextTick()
    const maxDate = wrapper.find('[data-testid="recipient-datepicker"]').attributes()['max-date']
    expect(
      DateTime.now()
        .plus({ days: Number(enabledCapabilities.user.expire_date.days) })
        .toISODate()
    ).toBe(DateTime.fromJSDate(new Date(maxDate)).toISODate())
  })

  it('emits an event if date changes', async () => {
    const { wrapper } = createWrapper({
      sharingCapabilities: enabledCapabilities,
      stubOcDatepicker: true
    })
    expect(wrapper.emitted('optionChange')).toBeFalsy()

    const capabilityStore = useCapabilityStore()
    capabilityStore.capabilities.files_sharing = enabledCapabilities

    await wrapper.setProps({ shareTypes: [ShareTypes.user.value] })
    await nextTick()
    expect(wrapper.emitted('optionChange').length).toBe(1)
    expect(
      DateTime.fromISO(
        (wrapper.emitted('optionChange')[0][0] as { expirationDate: string }).expirationDate
      ).toISODate()
    ).toBe(
      DateTime.now()
        .plus({ days: Number(enabledCapabilities.user.expire_date.days) })
        .toISODate()
    )

    await wrapper.setProps({ shareTypes: [ShareTypes.group.value] })
    await nextTick()
    await nextTick()
    expect(wrapper.emitted('optionChange').length).toBe(2)

    expect(
      DateTime.fromISO(
        (wrapper.emitted('optionChange')[1][0] as { expirationDate: string }).expirationDate
      ).toISODate()
    ).toBe(
      DateTime.now()
        .plus({ days: Number(enabledCapabilities.group.expire_date.days) })
        .toISODate()
    )

    await wrapper.setProps({ shareTypes: [] })
    await nextTick()
    expect(wrapper.emitted('optionChange').length).toBe(3)
    expect(
      (wrapper.emitted('optionChange')[2][0] as { expirationDate: string }).expirationDate
    ).toBe(null)

    const manualDate = DateTime.now().plus({ days: 5 })
    wrapper.vm.dateCurrent = manualDate
    await nextTick()
    expect(wrapper.emitted('optionChange').length).toBe(4)
    expect(
      DateTime.fromISO(
        (wrapper.emitted('optionChange')[3][0] as { expirationDate: string }).expirationDate
      ).toISODate()
    ).toBe(manualDate.toISODate())

    wrapper.vm.dateCurrent = null
    await wrapper.setProps({ shareTypes: [ShareTypes.user.value, ShareTypes.group.value] })
    await nextTick()
    expect(wrapper.emitted('optionChange').length).toBe(5)
    expect(
      DateTime.fromISO(
        (wrapper.emitted('optionChange')[4][0] as { expirationDate: string }).expirationDate
      ).toISODate()
    ).toBe(
      DateTime.now()
        .plus({ days: Number(enabledCapabilities.user.expire_date.days) })
        .toISODate()
    )
  })
})

const createWrapper = ({ sharingCapabilities = {}, stubOcDatepicker = false } = {}) => {
  const capabilities = { files_sharing: sharingCapabilities }

  return {
    wrapper: mount(ExpirationDatepicker, {
      global: {
        stubs: { OcDatepicker: stubOcDatepicker, DatePicker: DatePickerComponent },
        plugins: [...defaultPlugins({ piniaOptions: { capabilityState: { capabilities } } })]
      }
    })
  }
}
