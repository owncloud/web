import { ConfigurationManager } from '@ownclouders/web-pkg'
import { AuthService } from 'web-runtime/src/services/auth/authService'
import { createRouter } from 'web-test-helpers/src'

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

        authService.initialize(configurationManager, null, null, router, null, null)

        await authService.signInCallback()

        expect(replaceSpy).toHaveBeenCalledWith({
          path,
          query
        })
      }
    )
  })
})
