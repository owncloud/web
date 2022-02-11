import PublicLink from '@files/src/views/PublicLink.vue'
import { getStore, localVue } from './views.setup.js'
import { shallowMount, mount } from '@vue/test-utils'

const theme = {
  general: { slogan: 'some-slogan' }
}

const stubs = {
  'oc-spinner': true,
  translate: true
}

const route = { meta: { title: 'some page title' }, params: { token: 'some-token' } }

const component = { ...PublicLink, mounted: jest.fn(), created: jest.fn() }

const selectors = {
  cardFooter: '.oc-card-footer',
  cardBody: '.oc-card-body',
  submitButton: '.oc-login-authorize-button',
  errorTitle: '.oc-link-resolve-error-title',
  publicLinkPasswordRequired: 'form > .oc-card-title'
}

const spinnerStub = 'oc-spinner-stub'
const textInputStub = 'oc-text-input-stub'

describe('PublicLink', () => {
  describe('theming options', () => {
    const wrapper = getWrapper()

    it('should have the page-title set', () => {
      expect(wrapper).toMatchSnapshot()
    })
    it('should display the configuration theme general slogan as the login card footer', () => {
      const slogan = wrapper.find(selectors.cardFooter)

      expect(slogan).toMatchSnapshot()
    })
  })

  describe('when the view is still loading', () => {
    const wrapper = getWrapper({ loading: true })
    it('should display the loading text with the spinner', () => {
      const loading = wrapper.find(selectors.cardBody)

      expect(wrapper.find(spinnerStub).exists()).toBeTruthy()
      expect(loading).toMatchSnapshot()
    })
    it('should not display the error message', () => {
      expect(wrapper.find(selectors.errorTitle).exists()).toBeFalsy()
    })
    it('should not display the password required form', () => {
      expect(wrapper.find(selectors.publicLinkPasswordRequired).exists()).toBeFalsy()
    })
  })

  describe('when the view is not loading anymore', () => {
    it('should not display the loading text and the spinner', () => {
      const wrapper = getWrapper({ loading: false })
      const loading = wrapper.find(selectors.cardBody)

      expect(loading.exists()).toBeFalsy()
    })
    it('should display the error message if "errorMessage" is not empty', async () => {
      const wrapper = getWrapper({ loading: false })
      await wrapper.setData({ errorMessage: 'some-error-message' })

      expect(wrapper.find(selectors.errorTitle).exists()).toBeTruthy()
      expect(wrapper.find(selectors.errorTitle)).toMatchSnapshot()
    })

    describe('and when "passwordRequired" is set as true', () => {
      let passwordRequiredForm
      const wrapper = getWrapper({ loading: false })

      beforeEach(async () => {
        await wrapper.setData({ passwordRequired: true })
        passwordRequiredForm = wrapper.find('form')
      })

      it('should display the password required form', () => {
        expect(passwordRequiredForm.exists()).toBeTruthy()
        expect(passwordRequiredForm).toMatchSnapshot()
      })

      describe('and the password input', () => {
        it('should have a computed label', () => {
          const passwordInput = passwordRequiredForm.find(textInputStub)

          expect(passwordInput).toMatchSnapshot()
        })
        it('should not display the error message if "inputErrorMessage" is falsy', () => {
          const passwordInput = passwordRequiredForm.find(textInputStub)

          expect(passwordInput.attributes().errormessage).toBeUndefined()
        })
        it('should display the error message if "inputErrorMessage" is not empty', async () => {
          await wrapper.setData({ inputErrorMessage: 'some input error message' })
          const passwordInput = passwordRequiredForm.find(textInputStub)

          expect(passwordInput).toMatchSnapshot()
        })
      })

      describe('and the submit button', () => {
        it('should be set as disabled if "password" is empty', () => {
          expect(wrapper.vm.password).toBeNull()

          const submitButton = wrapper.find(selectors.submitButton)
          expect(submitButton.exists()).toBeTruthy()
          expect(submitButton).toMatchSnapshot()
        })
        it('should be set as enabled if "password" is not empty', async () => {
          await wrapper.setData({ password: 'some-value' })
          expect(wrapper.vm.password).toBe('some-value')

          const submitButton = wrapper.find(selectors.submitButton)
          expect(submitButton.exists()).toBeTruthy()
          expect(submitButton.attributes().disabled).toBeUndefined()
        })
      })

      it('should call "resolvePublicLink" method on form submit', async () => {
        const spyResolvePublicLink = jest.spyOn(PublicLink.methods, 'resolvePublicLink')
        const wrapper = getMountedWrapper({ loading: false })

        await wrapper.setData({ passwordRequired: true, password: 'some-pass' })

        const submitButton = wrapper.find(selectors.submitButton)
        await submitButton.trigger('submit')

        expect(spyResolvePublicLink).toHaveBeenCalledTimes(1)
      })
    })
  })
})

function getMountOptions({
  $route = route,
  store = getStore({
    slogan: theme.general.slogan
  }),
  loading = false
} = {}) {
  return {
    localVue,
    store,
    stubs,
    mocks: {
      $route
    },
    data: () => ({
      loading: loading
    })
  }
}

function getWrapper({ loading, store } = {}) {
  return shallowMount(component, getMountOptions({ store, loading }))
}

function getMountedWrapper({ loading, store } = {}) {
  return mount(component, {
    ...getMountOptions({ store, loading }),
    stubs: {}
  })
}
