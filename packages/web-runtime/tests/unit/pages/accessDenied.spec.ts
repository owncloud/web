import accessDenied from '../../../src/pages/accessDenied.vue'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  mount,
  defaultStoreMockOptions
} from 'web-test-helpers'
import { mock } from 'jest-mock-extended'

const selectors = {
  logInAgainButton: '#exitAnchor'
}

import { ConfigurationManager, useConfigurationManager } from '@ownclouders/web-pkg'
import { createMockThemeStore } from 'web-test-helpers/src/mocks/pinia'

jest.mock('@ownclouders/web-pkg', () => ({
  ...jest.requireActual('@ownclouders/web-pkg'),
  useConfigurationManager: jest.fn()
}))

describe('access denied page', () => {
  it('renders component', () => {
    const { wrapper } = getWrapper()
    expect(wrapper.html()).toMatchSnapshot()
  })
  describe('"Log in again" button', () => {
    it('navigates to "loginUrl" if set in config', () => {
      const loginUrl = 'https://myidp.int/login'
      const { wrapper } = getWrapper({ loginUrl })

      const logInAgainButton = wrapper.find(selectors.logInAgainButton)
      const loginAgainUrl = new URL(logInAgainButton.attributes().href)
      loginAgainUrl.search = ''

      expect(logInAgainButton.exists()).toBeTruthy()
      expect(loginAgainUrl.toString()).toEqual(loginUrl)
    })
  })
})

function getWrapper({ loginUrl = '' } = {}) {
  const mocks = {
    ...defaultComponentMocks()
  }
  const storeOptions = { ...defaultStoreMockOptions }

  jest.mocked(useConfigurationManager).mockImplementation(() =>
    mock<ConfigurationManager>({
      options: {
        loginUrl
      }
    } as any)
  )

  const store = createStore(storeOptions)

  return {
    storeOptions,
    mocks,
    wrapper: mount(accessDenied, {
      global: {
        plugins: [...defaultPlugins(), store, createMockThemeStore()],
        mocks,
        provide: mocks
      }
    })
  }
}
