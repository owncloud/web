import { useService } from '../service'

export interface AuthServiceInterface {
  handleAuthError(route: any, options?: { forceLogout?: boolean }): any
}

export const useAuthService = (): AuthServiceInterface => {
  return useService('$authService')
}
