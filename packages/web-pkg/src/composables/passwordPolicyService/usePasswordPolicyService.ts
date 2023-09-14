import { useService } from 'web-pkg/src/composables/service'
import { PasswordPolicyService } from 'web-pkg/src/services/passwordPolicy'

export const usePasswordPolicyService = (): PasswordPolicyService => {
  return useService('$passwordPolicyService')
}
