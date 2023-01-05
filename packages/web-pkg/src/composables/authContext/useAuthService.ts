import { useService } from '../service'

export interface AuthServiceInterface {
  handleAuthError(route: any): any
}

export const useAuthService = (): AuthServiceInterface => {
  return useService('$authService')
}
