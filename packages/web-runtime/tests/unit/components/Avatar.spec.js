import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'

import Avatar from 'web-runtime/src/components/Avatar.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(DesignSystem)

const propsData = {
  userName: 'admin',
  userid: 'admin',
  width: 24
}

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: false,
    status: 404
  })
)

const ocSpinner = 'oc-spinner-stub'
const ocAvatar = 'oc-avatar-stub'

describe('Avatar component', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  const spySetUser = jest.spyOn(Avatar.methods, 'setUser')

  it('should set user when the component is mounted', () => {
    getShallowWrapper()
    expect(spySetUser).toHaveBeenCalledTimes(1)
    expect(spySetUser).toHaveBeenCalledWith(propsData.userid)
  })

  describe('when the component is still loading', () => {
    it('should render oc-spinner but not oc-avatar', () => {
      const wrapper = getShallowWrapper(true)
      const spinner = wrapper.find(ocSpinner)
      const avatar = wrapper.find(ocAvatar)

      expect(avatar.exists()).toBeFalsy()
      expect(spinner.exists()).toBeTruthy()
      expect(spinner.attributes().style).toEqual(
        `width: ${propsData.width}px; height: ${propsData.width}px;`
      )
    })
  })

  describe('when the component is not loading anymore', () => {
    let wrapper
    beforeEach(() => {
      wrapper = getShallowWrapper()
    })

    it('should render oc-avatar but not oc-spinner', () => {
      const spinner = wrapper.find(ocSpinner)
      const avatar = wrapper.find(ocAvatar)

      expect(spinner.exists()).toBeFalsy()
      expect(avatar.exists()).toBeTruthy()
    })
    it('should set props on oc-avatar component', () => {
      const avatar = wrapper.find(ocAvatar)

      expect(avatar.props().width).toEqual(propsData.width)
      expect(avatar.props().userName).toEqual(propsData.userName)
    })

    describe('when an avatar is not found', () => {
      it('should set empty string to src prop on oc-avatar component', async () => {
        await new Promise((resolve) => {
          setTimeout(() => {
            const avatar = wrapper.find(ocAvatar)
            expect(avatar.props().src).toEqual('')
            resolve()
          }, 1)
        })
      })
    })

    describe('when an avatar is found', () => {
      const blob = 'blob:https://web.org/6fe8f675-6727'
      beforeEach(() => {
        global.URL.createObjectURL = jest.fn(() => blob)

        global.fetch = jest.fn(() =>
          Promise.resolve({
            ok: true,
            status: 200,
            blob: () =>
              Promise.resolve({
                size: 100,
                type: 'image/png'
              })
          })
        )
      })

      it('should set blob as src prop on oc-avatar component', async () => {
        const wrapper = getShallowWrapper()

        await new Promise((resolve) => {
          setTimeout(() => {
            const avatar = wrapper.find(ocAvatar)
            expect(avatar.props().src).toEqual(blob)
            resolve()
          }, 1)
        })
      })
    })
  })
})

function getShallowWrapper(loading = false) {
  return shallowMount(Avatar, {
    localVue,
    store: createStore(),
    propsData,
    data() {
      return {
        loading
      }
    }
  })
}

function createStore() {
  return new Vuex.Store({
    getters: {
      getToken: jest.fn(() => 'GFwHKXdsMgoFwt'),
      capabilities: jest.fn(() => ({
        files_sharing: {
          user: {
            profile_picture: true
          }
        }
      })),
      configuration: jest.fn(() => ({
        server: 'https://oc10.org'
      }))
    }
  })
}
