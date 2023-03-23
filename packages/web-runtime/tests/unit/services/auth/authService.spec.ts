import { AuthService } from 'web-runtime/src/services/auth/authService'

describe('AuthService', () => {
  describe('signInCallback', () => {
    it.each([
      [{ details: 'details' }, { details: 'details' }],
      [{ details: 'details', unknown: 'unknown' }, { details: 'details' }],
      [{ unknown: 'unknown' }, {}]
    ])('forwards only whitelisted query parameters: %s = %s', async (query, expected: any) => {
      const authService = new AuthService()
      const replace = jest.fn()

      jest.replaceProperty(authService as any, 'userManager', {
        signinRedirectCallback: jest.fn(),
        getAndClearPostLoginRedirectUrl: jest.fn()
      })

      jest.replaceProperty(authService as any, 'router', {
        currentRoute: { query },
        replace
      })
      await authService.signInCallback()

      expect(replace.mock.calls[0][0].query).toEqual(expected)
    })
  })
})
