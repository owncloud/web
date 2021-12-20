import { createLocalVue, mount, Wrapper } from '@vue/test-utils'
import VueCompositionAPI, { nextTick } from '@vue/composition-api'
import ExpirationDatepicker from '../../../../../../src/components/SideBar/Shares/InviteCollaborator/ExpirationDatepicker.vue'
import merge from 'lodash-es/merge'
import Vuex, { GetterTree } from 'vuex'
import DesignSystem from 'owncloud-design-system'
import { DateTime } from 'luxon'
import { ShareTypes } from '../../../../../../src/helpers/share'

const asCapabilitiesGetter = (capabilities = {}): { getters: GetterTree<unknown, unknown> } => ({
  getters: {
    capabilities: () => ({
      files_sharing: capabilities
    })
  }
})
const createWrapper = (store = {}): Wrapper<any> => {
  const localVue = createLocalVue()
  localVue.use(VueCompositionAPI)
  localVue.use(Vuex)
  localVue.use(DesignSystem)

  return mount(ExpirationDatepicker, {
    localVue,
    store: new Vuex.Store(store),
    stubs: {
      translate: true
    }
  })
}

describe('InviteCollaborator ExpirationDatepicker', () => {
  it('only gets displayed if share expiration is supported', () => {
    const wrapper = createWrapper(asCapabilitiesGetter())
    expect(wrapper.html()).toBe('')
  })

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

  it('renders a button to open the datepicker and set an expiration date', () => {
    const wrapper = createWrapper(asCapabilitiesGetter(bareCapabilities))

    expect(wrapper.find('[data-testid="recipient-datepicker-btn"]').exists()).toBe(true)
  })

  it('does not allow to select a date from the past', () => {
    const wrapper = createWrapper(asCapabilitiesGetter(bareCapabilities))
    const minDate = wrapper.find('[data-testid="recipient-datepicker"]').attributes()['min-date']

    expect(DateTime.now().toISODate()).toBe(DateTime.fromJSDate(new Date(minDate)).toISODate())
  })

  it('does not set any maximum date if no user or group is selected', () => {
    const wrapper = createWrapper(asCapabilitiesGetter(enabledCapabilities))
    const maxDate = wrapper.find('[data-testid="recipient-datepicker"]').attributes()['max-date']

    expect(maxDate).toBe(undefined)
  })

  it('pre selects and enforces the default expiration date for users', async () => {
    const wrapper = createWrapper(asCapabilitiesGetter(enabledCapabilities))
    await wrapper.setProps({ shareTypes: [ShareTypes.user.value] })

    const selectedDate = wrapper.find('[data-testid="recipient-datepicker"]').attributes().value
    expect(
      DateTime.now().plus({ days: enabledCapabilities.user.expire_date.days }).toISODate()
    ).toBe(DateTime.fromJSDate(new Date(selectedDate)).toISODate())

    wrapper.vm.$store.hotUpdate(asCapabilitiesGetter(enforcedCapabilities))
    await nextTick()
    const maxDate = wrapper.find('[data-testid="recipient-datepicker"]').attributes()['max-date']
    expect(
      DateTime.now().plus({ days: enabledCapabilities.user.expire_date.days }).toISODate()
    ).toBe(DateTime.fromJSDate(new Date(maxDate)).toISODate())
  })

  it('pre selects and enforces the default expiration date for groups', async () => {
    const wrapper = createWrapper(asCapabilitiesGetter(enabledCapabilities))
    await wrapper.setProps({ shareTypes: [ShareTypes.group.value] })
    const selectedDate = wrapper.find('[data-testid="recipient-datepicker"]').attributes().value

    expect(
      DateTime.now().plus({ days: enabledCapabilities.group.expire_date.days }).toISODate()
    ).toBe(DateTime.fromJSDate(new Date(selectedDate)).toISODate())

    wrapper.vm.$store.hotUpdate(asCapabilitiesGetter(enforcedCapabilities))
    await nextTick()
    const maxDate = wrapper.find('[data-testid="recipient-datepicker"]').attributes()['max-date']
    expect(
      DateTime.now().plus({ days: enabledCapabilities.group.expire_date.days }).toISODate()
    ).toBe(DateTime.fromJSDate(new Date(maxDate)).toISODate())
  })

  it('pre selects and enforces the smallest expiration date if user and group shareTypes are provided', async () => {
    const wrapper = createWrapper(asCapabilitiesGetter(enabledCapabilities))
    await wrapper.setProps({ shareTypes: [ShareTypes.group.value, ShareTypes.user.value] })
    const selectedDate = wrapper.find('[data-testid="recipient-datepicker"]').attributes().value

    expect(
      DateTime.now().plus({ days: enabledCapabilities.user.expire_date.days }).toISODate()
    ).toBe(DateTime.fromJSDate(new Date(selectedDate)).toISODate())

    wrapper.vm.$store.hotUpdate(asCapabilitiesGetter(enforcedCapabilities))
    await nextTick()
    const maxDate = wrapper.find('[data-testid="recipient-datepicker"]').attributes()['max-date']
    expect(
      DateTime.now().plus({ days: enabledCapabilities.user.expire_date.days }).toISODate()
    ).toBe(DateTime.fromJSDate(new Date(maxDate)).toISODate())
  })

  it('emits an event if date changes', async () => {
    const wrapper = createWrapper(asCapabilitiesGetter(enabledCapabilities))
    const manualDate = DateTime.now().plus({ days: 5 })
    const checker = jest.fn()
    wrapper.vm.$on('optionChange', checker as any)
    wrapper.setData({ dateCurrent: manualDate.toJSDate() })

    expect(checker).toBeCalledTimes(1)
    expect(manualDate.toISODate()).toBe(
      DateTime.fromISO(checker.mock.calls[0][0].expirationDate).toISODate()
    )

    wrapper.vm.$store.hotUpdate(asCapabilitiesGetter(enforcedCapabilities))
    await wrapper.setProps({ shareTypes: [ShareTypes.group.value, ShareTypes.user.value] })
    await nextTick()
    expect(checker).toBeCalledTimes(2)
    expect(
      DateTime.now().plus({ days: enforcedCapabilities.user.expire_date.days }).toISODate()
    ).toBe(DateTime.fromISO(checker.mock.calls[1][0].expirationDate).toISODate())
  })
})
