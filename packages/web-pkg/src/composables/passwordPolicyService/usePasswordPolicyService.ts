import { useService } from '@ownclouders/web-pkg/src/composables/service'
import { PasswordPolicyService } from '@ownclouders/web-pkg/src/services/passwordPolicy'

export const usePasswordPolicyService = (): PasswordPolicyService => {
  return useService('$passwordPolicyService')
}
