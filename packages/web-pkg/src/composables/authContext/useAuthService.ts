import { getCurrentInstance } from 'vue'

export interface AuthServiceInterface {
  handleAuthError(route: any): any
}

export const useAuthService = (): AuthServiceInterface => {
  return (getCurrentInstance().proxy as any).$authService
}
