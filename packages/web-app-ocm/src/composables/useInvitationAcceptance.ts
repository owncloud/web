import { ref, computed } from 'vue'
import { useClientService, useMessages, useInviteTokensListStore } from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'

export function useInvitationAcceptance() {
  const clientService = useClientService()
  const { showErrorMessage } = useMessages()
  const inviteTokensListStore = useInviteTokensListStore()
  const { $gettext } = useGettext()

  const loading = ref(false)
  const error = ref(false)

  const isOwnGeneratedToken = (token: string) => {
    return inviteTokensListStore.getTokensList().some((t) => t.token === token)
  }

  const errorPopup = (error: Error) => {
    console.error(error)
    showErrorMessage({
      title: $gettext('Error'),
      desc: $gettext('An error occurred'),
      errors: [error]
    })
  }

  const acceptInvitation = async (token: string, providerDomain: string) => {
    loading.value = true
    error.value = false

    try {
      if (isOwnGeneratedToken(token)) {
        throw new Error($gettext('Self-invitations are not permitted'))
      }

      const response = await clientService.httpAuthenticated.post('/sciencemesh/accept-invite', {
        token,
        providerDomain
      })

      return true
    } catch (err) {
      console.error('Error accepting invitation:', err)
      error.value = true
      errorPopup(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const validateParameters = (token: string | undefined, providerDomain: string | undefined) => {
    if (!token || !providerDomain) {
      throw new Error($gettext('Missing required parameters: token and providerDomain'))
    }
  }

  return {
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    isOwnGeneratedToken,
    acceptInvitation,
    validateParameters,
    errorPopup
  }
}
