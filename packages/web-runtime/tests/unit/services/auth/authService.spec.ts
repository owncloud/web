import { ConfigurationManager, useAuthStore } from '@ownclouders/web-pkg'
import { mock } from 'jest-mock-extended'
import { AuthService } from 'web-runtime/src/services/auth/authService'
import { UserManager } from 'web-runtime/src/services/auth/userManager'
import { RouteLocation, createRouter, createTestingPinia } from 'web-test-helpers/src'

const mockUpdateContext = jest.fn()
console.debug = jest.fn()

const initAuthService = ({ authService, configurationManager, router = null }) => {
  createTestingPinia()
  const authStore = useAuthStore()

  authService.initialize(configurationManager, null, router, null, null, null, authStore, null)
}

describe('AuthService', () => {
  describe('signInCallback', () => {
    it.each([
      ['/', '/', {}],
      ['/?details=sharing', '/', { details: 'sharing' }],
      [
        '/external?contextRouteName=files-spaces-personal&fileId=0f897576',
        '/external',
        {
          contextRouteName: 'files-spaces-personal',
          fileId: '0f897576'
        }
      ]
    ])(
      'parses query params and passes them explicitly to router.replace: %s => %s %s',
      async (url, path, query: any) => {
        const authService = new AuthService()
        const configurationManager = new ConfigurationManager()

        jest.replaceProperty(authService as any, 'userManager', {
          signinRedirectCallback: jest.fn(),
          getAndClearPostLoginRedirectUrl: () => url
        })

        const router = createRouter()
        const replaceSpy = jest.spyOn(router, 'replace')

        configurationManager.initialize({
          server: 'http://server/address/',
          options: { embed: { enabled: false } }
        })

        initAuthService({ authService, configurationManager, router })

        await authService.signInCallback()

        expect(replaceSpy).toHaveBeenCalledWith({
          path,
          query
        })
      }
    )
  })

  describe('initializeContext', () => {
    it('when embed mode is disabled and access_token is present, should call updateContext', async () => {
      const authService = new AuthService()
      const configurationManager = new ConfigurationManager()

      jest.replaceProperty(
        authService as any,
        'userManager',
        mock<UserManager>({
          getAccessToken: jest.fn().mockResolvedValue('access-token'),
          updateContext: mockUpdateContext
        })
      )

      configurationManager.initialize({
        server: 'http://server/address/',
        options: { embed: { enabled: false } }
      })
      initAuthService({ authService, configurationManager })

      await authService.initializeContext(mock<RouteLocation>({}))

      expect(mockUpdateContext).toHaveBeenCalledWith('access-token', true)
    })

    it('when embed mode is disabled and access_token is not present, should not call updateContext', async () => {
      const authService = new AuthService()
      const configurationManager = new ConfigurationManager()

      jest.replaceProperty(
        authService as any,
        'userManager',
        mock<UserManager>({
          getAccessToken: jest.fn().mockResolvedValue(null),
          updateContext: mockUpdateContext
        })
      )

      configurationManager.initialize({
        server: 'http://server/address/',
        options: { embed: { enabled: false } }
      })
      initAuthService({ authService, configurationManager })

      await authService.initializeContext(mock<RouteLocation>({}))

      expect(mockUpdateContext).not.toHaveBeenCalled()
    })

    it('when embed mode is enabled, access_token is present but auth is not delegated, should call updateContext', async () => {
      const authService = new AuthService()
      const configurationManager = new ConfigurationManager()

      jest.replaceProperty(
        authService as any,
        'userManager',
        mock<UserManager>({
          getAccessToken: jest.fn().mockResolvedValue('access-token'),
          updateContext: mockUpdateContext
        })
      )

      configurationManager.initialize({
        server: 'http://server/address/',
        options: { embed: { enabled: true, delegateAuthentication: false } }
      })
      initAuthService({ authService, configurationManager })

      await authService.initializeContext(mock<RouteLocation>({}))

      expect(mockUpdateContext).toHaveBeenCalledWith('access-token', true)
    })

    it('when embed mode is enabled, access_token is present and auth is delegated, should not call updateContext', async () => {
      const authService = new AuthService()
      const configurationManager = new ConfigurationManager()

      jest.replaceProperty(
        authService as any,
        'userManager',
        mock<UserManager>({
          getAccessToken: jest.fn().mockResolvedValue('access-token'),
          updateContext: mockUpdateContext
        })
      )

      configurationManager.initialize({
        server: 'http://server/address/',
        options: { embed: { enabled: true, delegateAuthentication: true } }
      })
      initAuthService({ authService, configurationManager })

      await authService.initializeContext(mock<RouteLocation>({}))

      expect(mockUpdateContext).not.toHaveBeenCalled()
    })

    it('when embed mode is disabled, access_token is present and auth is delegated, should call updateContext', async () => {
      const authService = new AuthService()
      const configurationManager = new ConfigurationManager()

      jest.replaceProperty(
        authService as any,
        'userManager',
        mock<UserManager>({
          getAccessToken: jest.fn().mockResolvedValue('access-token'),
          updateContext: mockUpdateContext
        })
      )

      configurationManager.initialize({
        server: 'http://server/address/',
        options: { embed: { enabled: false, delegateAuthentication: true } }
      })
      initAuthService({ authService, configurationManager })

      await authService.initializeContext(mock<RouteLocation>({}))

      expect(mockUpdateContext).toHaveBeenCalledWith('access-token', true)
    })
  })
})
