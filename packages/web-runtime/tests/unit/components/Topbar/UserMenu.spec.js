import { createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import DesignSystem from '@ownclouders/design-system'
import GetTextPlugin from 'vue-gettext'
import UserMenu from 'web-runtime/src/components/Topbar/UserMenu.vue'
import stubs from '../../../../../../tests/unit/stubs'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(DesignSystem)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const totalQuota = 1000
const basicQuota = 300
const warningQuota = 810
const dangerQuota = 910

const basicRelativeQuota = (basicQuota / totalQuota) * 100
const warningRelativeQuota = (warningQuota / totalQuota) * 100
const dangerRelativeQuota = (dangerQuota / totalQuota) * 100

const noEmail = ''
const email = 'test@test.de'

describe('User Menu component', () => {
  describe('when quota and no email is set', () => {
    it('renders a navigation without email', () => {
      const wrapper = getMountedWrapper(
        { used: basicQuota, total: totalQuota, relative: basicRelativeQuota },
        noEmail
      )
      expect(wrapper).toMatchSnapshot()
    })
  })
  describe('when no quota and email is set', () => {
    it('the user menu does not contain a quota', () => {
      const wrapper = getMountedWrapper(null, email)
      expect(wrapper).toMatchSnapshot()
    })
  })
  describe('when no quota and no email is set', () => {
    it('the user menu does not contain a quota', () => {
      const wrapper = getMountedWrapper(null, noEmail)
      expect(wrapper).toMatchSnapshot()
    })
  })
  describe('when quota is below 80%', () => {
    it('renders a primary quota progress bar', () => {
      const wrapper = getMountedWrapper(
        {
          used: basicQuota,
          total: totalQuota,
          relative: basicRelativeQuota,
          definition: 'default'
        },
        email
      )
      expect(wrapper).toMatchSnapshot()
    })
  })
  describe('when quota is above 80% and below 90%', () => {
    it('renders a warning quota progress bar', () => {
      const wrapper = getMountedWrapper(
        {
          used: warningQuota,
          total: totalQuota,
          relative: warningRelativeQuota,
          definition: 'default'
        },
        email
      )
      expect(wrapper).toMatchSnapshot()
    })
  })
  describe('when quota is above 90%', () => {
    it('renders a danger quota progress bar', () => {
      const wrapper = getMountedWrapper(
        {
          used: dangerQuota,
          total: totalQuota,
          relative: dangerRelativeQuota,
          definition: 'default'
        },
        email
      )
      expect(wrapper).toMatchSnapshot()
    })
  })
  describe('when quota is unlimited', () => {
    it('renders no percentag of total and no progress bar', () => {
      const wrapper = getMountedWrapper(
        {
          used: basicQuota,
          definition: 'default'
        },
        email
      )
      expect(wrapper).toMatchSnapshot()
    })
  })
  describe('when quota is not defined', () => {
    it('renders no percentag of total and no progress bar', () => {
      const wrapper = getMountedWrapper(
        {
          used: dangerQuota,
          total: totalQuota,
          relative: dangerRelativeQuota,
          definition: 'none'
        },
        email
      )
      expect(wrapper).toMatchSnapshot()
    })
  })
})

const getMountedWrapper = (quota, userEmail) => {
  return mount(UserMenu, {
    store: new Vuex.Store({
      getters: {
        quota: () => quota,
        user: () => ({
          id: 'einstein',
          username: 'einstein',
          userDisplayName: 'Albert Einstein',
          userEmail
        })
      }
    }),
    localVue,
    propsData: {
      applicationsList: [
        {
          icon: 'application',
          path: '/settings',
          title: 'Settings'
        }
      ]
    },
    stubs
  })
}
