import { ref, computed } from 'vue'
import { useClientService, useMessages } from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'
import type {
  WayfProvider,
  WayfFederation,
  FederationsApiResponse,
  DiscoverRequest,
  DiscoverResponse
} from '../types/wayf'

export function useWayf() {
  const clientService = useClientService()
  const { showErrorMessage } = useMessages()
  const { $gettext } = useGettext()

  const loading = ref(false)
  const error = ref(false)
  const federations = ref<WayfFederation>({})

  const isSelfDomain = (domain: string): boolean => {
    const currentHost = window.location.hostname.toLowerCase()
    const checkDomain = domain
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/:\d+$/, '')
    return currentHost === checkDomain
  }

  const discoverProvider = async (domain: string): Promise<string> => {
    try {
      loading.value = true
      const response = await clientService.httpUnAuthenticated.post<DiscoverResponse>(
        '/sciencemesh/discover',
        { domain } as DiscoverRequest
      )

      if (!response.data || !response.data.inviteAcceptDialog) {
        throw new Error('No invite accept dialog found in discovery response')
      }

      return response.data.inviteAcceptDialog
    } catch (err) {
      console.error('Provider discovery failed:', err)
      showErrorMessage({
        title: $gettext('Discovery Failed'),
        desc: $gettext('Could not discover provider at %{domain}', { domain }),
        errors: [err]
      })
      throw err
    } finally {
      loading.value = false
    }
  }

  const buildProviderUrl = (baseUrl: string, token: string, providerDomain?: string): string => {
    const url = new URL(baseUrl)
    if (providerDomain) url.searchParams.set('providerDomain', providerDomain)
    if (token) url.searchParams.set('token', token)
    return url.toString()
  }

  const navigateToProvider = async (
    provider: WayfProvider,
    token: string,
    providerDomain?: string
  ) => {
    if (isSelfDomain(provider.fqdn)) {
      showErrorMessage({
        title: $gettext('Invalid Provider Selection'),
        desc: $gettext(
          'You cannot select your own instance as a provider. Please select a different provider to establish a federated connection.'
        )
      })
      return
    }

    try {
      loading.value = true
      let inviteDialogUrl = provider.inviteAcceptDialog

      // If inviteAcceptDialog is empty, call backend discovery
      if (!inviteDialogUrl || inviteDialogUrl.trim() === '') {
        inviteDialogUrl = await discoverProvider(provider.fqdn)
      } else {
        // If it's a relative path, make it absolute
        if (inviteDialogUrl.startsWith('/')) {
          const baseUrl = `https://${provider.fqdn}`
          inviteDialogUrl = `${baseUrl}${inviteDialogUrl}`
        }
        // If it's already absolute, use as-is
      }

      // Build final URL with query parameters and redirect
      const finalUrl = buildProviderUrl(inviteDialogUrl, token, providerDomain)
      window.location.href = finalUrl
    } catch (err) {
      console.error('Failed to navigate to provider:', err)
      // Error is already shown by discoverProvider, do not use showErrorMessage here
    } finally {
      loading.value = false
    }
  }

  const navigateToManualProvider = async (
    input: string,
    token: string,
    providerDomain?: string
  ) => {
    const trimmedInput = input.trim()
    if (!trimmedInput) return

    if (isSelfDomain(trimmedInput)) {
      showErrorMessage({
        title: $gettext('Invalid Provider Selection'),
        desc: $gettext(
          'You cannot use your own instance as a provider. Please select a different provider to establish a federated connection.'
        )
      })
      return
    }

    try {
      loading.value = true
      const inviteDialogUrl = await discoverProvider(trimmedInput)
      const finalUrl = buildProviderUrl(inviteDialogUrl, token, providerDomain)
      window.location.href = finalUrl
    } catch (err) {
      console.error('Failed to navigate to manual provider:', err)
      // Error is already shown by discoverProvider, do not use showErrorMessage here
    } finally {
      loading.value = false
    }
  }

  const loadFederations = async () => {
    try {
      loading.value = true
      error.value = false

      const response = await clientService.httpUnAuthenticated.get<FederationsApiResponse>(
        '/sciencemesh/federations'
      )

      const transformedFederations: WayfFederation = {}
      response.data.forEach((fed) => {
        const providers = fed.servers
          .map((server) => ({
            name: server.displayName,
            fqdn: new URL(server.url).hostname,
            // Keep empty if not provided by the server
            inviteAcceptDialog: server.inviteAcceptDialog || ''
          }))
          .filter((provider) => !isSelfDomain(provider.fqdn))

        if (providers.length > 0) {
          transformedFederations[fed.federation] = providers
        }
      })

      federations.value = transformedFederations
    } catch (err) {
      console.error('Failed to load federations:', err)
      error.value = true
      showErrorMessage({
        title: $gettext('Failed to Load Providers'),
        desc: $gettext('Could not load the list of available providers'),
        errors: [err]
      })
    } finally {
      loading.value = false
    }
  }

  const filterProviders = (providers: WayfProvider[], query: string): WayfProvider[] => {
    const searchTerm = (query || '').toLowerCase()
    return providers.filter(
      (provider) =>
        provider.name.toLowerCase().includes(searchTerm) ||
        provider.fqdn.toLowerCase().includes(searchTerm)
    )
  }

  return {
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    federations: computed(() => federations.value),
    discoverProvider,
    buildProviderUrl,
    navigateToProvider,
    navigateToManualProvider,
    loadFederations,
    filterProviders
  }
}
