import UserMenu from '../../../../src/components/Topbar/UserMenu.vue'
import {
  defaultPlugins,
  defaultStubs,
  mount,
  defaultComponentMocks,
  RouteLocation
} from 'web-test-helpers'
import { mock } from 'vitest-mock-extended'
import { SpaceResource } from '@ownclouders/web-client'
import { Quota } from '@ownclouders/web-client/graph/generated'

const totalQuota = 1024
const basicQuota = 300
const warningQuota = 810
const dangerQuota = 990

const noEmail = ''
const email = 'test@test.de'

describe('User Menu component', () => {
  describe('when user is not logged in', () => {
    it('renders a navigation with login button', () => {
      const wrapper = getMountedWrapper({}, noEmail, true)
      expect(wrapper.html()).toMatchSnapshot()
    })
  })
  describe('when quota and no email is set', () => {
    it('renders a navigation without email', () => {
      const wrapper = getMountedWrapper({ used: basicQuota, total: totalQuota }, noEmail)
      expect(wrapper.html()).toMatchSnapshot()
    })
  })
  describe('when no quota and email is set', () => {
    it('the user menu does not contain a quota', () => {
      const wrapper = getMountedWrapper(null, email)
      expect(wrapper.html()).toMatchSnapshot()
    })
  })
  describe('when no quota and no email is set', () => {
    it('the user menu does not contain a quota', () => {
      const wrapper = getMountedWrapper(null, noEmail)
      expect(wrapper.html()).toMatchSnapshot()
    })
  })
  describe('when quota is below 80%', () => {
    it('renders a primary quota progress bar', () => {
      const wrapper = getMountedWrapper(
        {
          used: basicQuota,
          total: totalQuota
        },
        email
      )
      expect(wrapper.html()).toMatchSnapshot()
    })
  })
  describe('when quota is above 80% and below 90%', () => {
    it('renders a warning quota progress bar', () => {
      const wrapper = getMountedWrapper(
        {
          used: warningQuota,
          total: totalQuota
        },
        email
      )
      expect(wrapper.html()).toMatchSnapshot()
    })
  })
  describe('when quota is above 90%', () => {
    it('renders a danger quota progress bar', () => {
      const wrapper = getMountedWrapper(
        {
          used: dangerQuota,
          total: totalQuota
        },
        email
      )
      expect(wrapper.html()).toMatchSnapshot()
    })
  })
  describe('when quota is unlimited', () => {
    it('renders no percentag of total and no progress bar', () => {
      const wrapper = getMountedWrapper(
        {
          used: basicQuota,
          total: 0
        },
        email
      )
      expect(wrapper.html()).toMatchSnapshot()
    })
  })
  describe('when quota is not defined', () => {
    it('renders no percentag of total and no progress bar', () => {
      const wrapper = getMountedWrapper(
        {
          used: dangerQuota,
          total: 0
        },
        email
      )
      expect(wrapper.html()).toMatchSnapshot()
    })
  })
  describe('imprint and privacy urls', () => {
    it('should renders imprint and privacy section if urls are defined', () => {
      const wrapper = getMountedWrapper(
        {
          used: dangerQuota,
          total: totalQuota
        },
        email,
        false,
        true
      )
      const element = wrapper.find('.imprint-footer')
      expect(element.exists()).toBeTruthy()
      const output = element.html()
      expect(output).toContain('https://imprint.url')
      expect(output).toContain('https://privacy.url')
    })
  })
})

const getMountedWrapper = (
  quota: Quota,
  userEmail: string,
  noUser = false,
  areThemeUrlsSet = false
) => {
  const mocks = {
    ...defaultComponentMocks({
      currentRoute: mock<RouteLocation>({ path: '/files', fullPath: '/files' })
    })
  }

  return mount(UserMenu, {
    global: {
      provide: mocks,
      renderStubDefaultSlot: true,
      plugins: [
        ...defaultPlugins({
          piniaOptions: {
            themeState: {
              currentTheme: {
                common: {
                  urls: {
                    privacy: areThemeUrlsSet ? 'https://privacy.url.theme' : '',
                    imprint: areThemeUrlsSet ? 'https://imprint.url.theme' : ''
                  }
                }
              }
            },
            userState: {
              user: noUser
                ? null
                : {
                    id: '1',
                    onPremisesSamAccountName: 'einstein',
                    displayName: 'Albert Einstein',
                    mail: userEmail || ''
                  }
            },
            spacesState: {
              spaces: [
                mock<SpaceResource>({
                  spaceQuota: quota,
                  isOwner: () => true,
                  driveType: 'personal'
                })
              ]
            }
          }
        })
      ],
      stubs: {
        ...defaultStubs,
        'oc-button': true,
        'oc-drop': true,
        'oc-list': true,
        'avatar-image': true,
        'oc-icon': true,
        'oc-progress': true
      },
      mocks
    }
  })
}
