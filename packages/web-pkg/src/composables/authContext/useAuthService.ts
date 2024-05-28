import { useService } from '../service'

export interface AuthServiceInterface {
  handleAuthError(route: any): any
  signinSilent(): Promise<unknown>
  logoutUser(): Promise<void>
}

export const useAuthService = (): AuthServiceInterface => {
  return useService('$authService')
}
