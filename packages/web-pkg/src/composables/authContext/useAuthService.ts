import { getCurrentInstance } from '@vue/composition-api'

export interface AuthServiceInterface {
  handleAuthError(route: any): any
}

export const useAuthService = (): AuthServiceInterface => {
  return (getCurrentInstance().proxy as any).$authService
}
