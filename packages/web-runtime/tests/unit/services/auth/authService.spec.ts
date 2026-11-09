import { ConfigStore, useAuthStore, useConfigStore } from '@ownclouders/web-pkg'
import { mock } from 'vitest-mock-extended'
import { Router } from 'vue-router'
import { AuthService } from '../../../../src/services/auth/authService'
import { UserManager } from '../../../../src/services/auth/userManager'
import { RouteLocation, createRouter, createTestingPinia } from '@ownclouders/web-test-helpers'
import { User } from 'oidc-client-ts'

const mockUpdateContext = vi.fn()
console.debug = vi.fn()

vi.mock('../../../../src/services/auth/userManager')

const initAuthService = ({
  authService,
  configStore = null,
  router = null
}: {
  authService: AuthService
  configStore?: ConfigStore
  router?: Router
}) => {
  createTestingPinia()
  const authStore = useAuthStore()
  configStore = configStore || useConfigStore()

  authService.initialize(configStore, null, router, null, null, null, authStore, null, null)
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
      async (url, path, query: Record<string, string>) => {
        const authService = new AuthService()

        Object.defineProperty(authService, 'userManager', {
          value: {
            signinRedirectCallback: vi.fn(),
            getAndClearPostLoginRedirectUrl: () => url
          }
        })

        const router = createRouter()
        const replaceSpy = vi.spyOn(router, 'replace')

        initAuthService({ authService, router })
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

      Object.defineProperty(authService, 'userManager', {
        value: mock<UserManager>({
          getAccessToken: vi.fn().mockResolvedValue('access-token'),
          updateContext: mockUpdateContext
        })
      })

      initAuthService({ authService })

      await authService.initializeContext(mock<RouteLocation>({}))

      expect(mockUpdateContext).toHaveBeenCalledWith('access-token', true)
    })

    it('when embed mode is disabled and access_token is not present, should not call updateContext', async () => {
      const authService = new AuthService()

      Object.defineProperty(authService, 'userManager', {
        value: mock<UserManager>({
          getAccessToken: vi.fn().mockResolvedValue(null),
          updateContext: mockUpdateContext
        })
      })

      initAuthService({ authService })

      await authService.initializeContext(mock<RouteLocation>({}))

      expect(mockUpdateContext).not.toHaveBeenCalled()
    })

    it('when embed mode is enabled, access_token is present but auth is not delegated, should call updateContext', async () => {
      const authService = new AuthService()

      Object.defineProperty(authService, 'userManager', {
        value: mock<UserManager>({
          getAccessToken: vi.fn().mockResolvedValue('access-token'),
          updateContext: mockUpdateContext
        })
      })

      initAuthService({ authService })

      await authService.initializeContext(mock<RouteLocation>({}))

      expect(mockUpdateContext).toHaveBeenCalledWith('access-token', true)
    })

    it('when embed mode is enabled, access_token is present and auth is delegated, should not call updateContext', async () => {
      const authService = new AuthService()

      Object.defineProperty(authService, 'userManager', {
        value: mock<UserManager>({
          getAccessToken: vi.fn().mockResolvedValue('access-token'),
          updateContext: mockUpdateContext
        })
      })

      const configStore = useConfigStore()
      configStore.options = { embed: { enabled: true, delegateAuthentication: true } }
      initAuthService({ authService, configStore })

      await authService.initializeContext(mock<RouteLocation>({}))

      expect(mockUpdateContext).not.toHaveBeenCalled()
    })

    it('when embed mode is disabled, access_token is present and auth is delegated, should call updateContext', async () => {
      const authService = new AuthService()

      Object.defineProperty(authService, 'userManager', {
        value: mock<UserManager>({
          getAccessToken: vi.fn().mockResolvedValue('access-token'),
          updateContext: mockUpdateContext
        })
      })

      initAuthService({ authService })

      await authService.initializeContext(mock<RouteLocation>({}))

      expect(mockUpdateContext).toHaveBeenCalledWith('access-token', true)
    })

    it('does not log the access_token or refresh_token when a new user is loaded', async () => {
      const authService = new AuthService()
      const addUserLoadedMock = vi.fn()

      Object.defineProperty(authService, 'userManager', {
        value: mock<UserManager>({
          getAccessToken: vi.fn().mockResolvedValue('access-token'),
          getUser: vi.fn().mockResolvedValue(mock<User>({ expires_in: 3600 })),
          updateContext: mockUpdateContext,
          areEventHandlersRegistered: false,
          events: mock<UserManager['events']>({
            addUserLoaded: addUserLoadedMock
          })
        })
      })

      initAuthService({ authService })

      await authService.initializeContext(mock<RouteLocation>({}))

      const userLoadedHandler = addUserLoadedMock.mock.calls[0][0]

      const accessToken = 'distinctive-access-token-value'
      const refreshToken = 'distinctive-refresh-token-value'

      const consoleSpies = {
        debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
        log: vi.spyOn(console, 'log').mockImplementation(() => {}),
        info: vi.spyOn(console, 'info').mockImplementation(() => {}),
        warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
        error: vi.spyOn(console, 'error').mockImplementation(() => {})
      }

      try {
        await userLoadedHandler(
          mock<User>({
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: 3600
          })
        )

        const loggedValues = Object.values(consoleSpies)
          .flatMap((spy) => spy.mock.calls)
          .flat()

        loggedValues.forEach((value) => {
          expect(String(value)).not.toContain(accessToken)
          expect(String(value)).not.toContain(refreshToken)
        })
      } finally {
        Object.values(consoleSpies).forEach((spy) => spy.mockRestore())
      }
    })
  })

  describe('acr', () => {
    const mockSignInRedirect = vi.fn()

    it('when user is not authenticated, should redirect to login page', async () => {
      const authService = new AuthService()

      Object.defineProperty(authService, 'userManager', {
        value: mock<UserManager>({
          getUser: vi.fn().mockResolvedValue(null),
          signinRedirect: mockSignInRedirect
        })
      })

      await authService.requireAcr('advanced', '/')
      expect(mockSignInRedirect).toHaveBeenCalledWith({ acr_values: 'advanced' })
    })

    it('when user is authenticated and acr is not the one required, should redirect to login page', async () => {
      const authService = new AuthService()

      Object.defineProperty(authService, 'userManager', {
        value: mock<UserManager>({
          getUser: vi
            .fn()
            .mockResolvedValue(mock<User>({ profile: { acr: 'regular' }, expired: false })),
          signinRedirect: mockSignInRedirect
        })
      })

      await authService.requireAcr('advanced', '/')
      expect(mockSignInRedirect).toHaveBeenCalledWith({ acr_values: 'advanced' })
    })

    it('when user is authenticated and acr is the one required but access token is expired, should redirect to login page', async () => {
      const authService = new AuthService()

      Object.defineProperty(authService, 'userManager', {
        value: mock<UserManager>({
          getUser: vi
            .fn()
            .mockResolvedValue(mock<User>({ profile: { acr: 'advanced' }, expired: true })),
          signinRedirect: mockSignInRedirect
        })
      })

      await authService.requireAcr('advanced', '/')
      expect(mockSignInRedirect).toHaveBeenCalledWith({ acr_values: 'advanced' })
    })

    it('when user is authenticated and acr is the one required, should not redirect to login page', async () => {
      const authService = new AuthService()

      Object.defineProperty(authService, 'userManager', {
        value: mock<UserManager>({
          getUser: vi
            .fn()
            .mockResolvedValue(mock<User>({ profile: { acr: 'advanced' }, expired: false })),
          signinRedirect: mockSignInRedirect
        })
      })

      await authService.requireAcr('advanced', '/')
      expect(mockSignInRedirect).not.toHaveBeenCalled()
    })
  })
})
