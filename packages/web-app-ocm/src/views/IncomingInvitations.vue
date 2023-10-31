<template>
  <div id="incomiing" class="sciencemesh-app">
    <div>
      <div class="oc-flex oc-flex-middle oc-px-m oc-py-s">
        <oc-icon name="user-received" />
        <h2 class="oc-px-s" v-text="$gettext('Accept invitations')" />
        <oc-contextual-helper class="oc-pl-xs" v-bind="helperContent" />
      </div>
      <br />
      <br />

      <div class="oc-flex oc-flex-column oc-flex-middle oc-flex-center">
        <div class="oc-width-1-2">
          <oc-text-input
            ref="tokenInput"
            v-model="token"
            :label="$gettext('Enter invite token')"
            :clear-button-enabled="true"
          />
          <br />
          <oc-select
            v-model="provider"
            :label="$gettext('Select institution of inviter')"
            :options="providers"
            class="oc-mb-m"
            :loading="loading"
          >
            <template #option="{ full_name, domain }">
              <span class="option">
                <strong v-text="full_name" />
              </span>
              <span class="option" v-text="domain" />
            </template>
            <template #no-options> No institutions found with this name </template>
            <template #selected-option="{ full_name, domain }">
              <strong class="oc-mr-s" v-text="full_name" />
              <small v-text="domain.length > 17 ? domain.slice(0, 20) + '...' : domain" />
            </template>
          </oc-select>
          <div v-if="providerError" class="oc-text-input-message">
            <span class="oc-text-input-danger">{{ providerErrorMessage }}</span>
          </div>
        </div>
        <br />
        <br />
        <oc-button size="small" :disabled="acceptInvitationButtonDisabled" @click="acceptInvite">
          <oc-icon name="add" />
          <span v-text="$gettext('Accept invitation')" />
        </oc-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, unref, VNodeRef } from 'vue'
import { useStore, queryItemAsString, useRouteQuery, useClientService } from '@ownclouders/web-pkg'
import { $gettext } from '@ownclouders/web-pkg/src/router/utils'
import { useGettext } from 'vue3-gettext'

export default defineComponent({
  emits: ['highlightNewConnections'],
  setup(props, { emit }) {
    const store = useStore()
    const clientService = useClientService()
    const { $gettext } = useGettext()

    const tokenQuery = useRouteQuery('token')
    const providerDomainQuery = useRouteQuery('providerDomain')

    const token = ref(undefined)
    const provider = ref(undefined)
    const providers = ref([])
    const loading = ref(true)
    const providerError = ref(false)
    const tokenInput = ref<VNodeRef>()

    const helperContent = () => {
      return {
        text: $gettext('Once you accept invitation, the inviter will be added to your connections.')
      }
    }
    const acceptInvitationButtonDisabled = () => {
      return !unref(token) || !unref(provider) || unref(provider).full_name === 'Unknown provider'
    }

    const providerErrorMessage = () => {
      return isMyProviderSelectedProvider(unref(provider))
        ? $gettext('You cannot select your institution')
        : $gettext('Unknown institution. Check invitation url or select from list')
    }

    const errorPopup = (error: Error) => {
      console.error(error)
      store.dispatch('showErrorMessage', {
        title: $gettext('Error'),
        desc: $gettext('An error occurred'),
        error
      })
    }
    const acceptInvite = async () => {
      try {
        const response = await clientService.httpAuthenticated.post('/sciencemesh/accept-invite', {
          token: unref(token),
          providerDomain: unref(provider).domain
        })
        // FIXME: what is this?!
        const connectionInfo = { providerDomain: 'ddd' } //await response.json()
        token.value = undefined
        provider.value = undefined
        emit('highlightNewConnections')
      } catch (error) {
        errorPopup(error)
      }
    }
    const listProviders = async () => {
      try {
        const { data: allProviders } = await clientService.httpAuthenticated.get(
          '/sciencemesh/list-providers'
        )
        providers.value = allProviders.filter((p) => !isMyProviderSelectedProvider(p))
      } catch (error) {
        errorPopup(error)
      } finally {
        loading.value = false
      }
    }
    const scrollToForm = () => {
      const el = document.getElementById('sciencemesh-accept-invites')
      if (el) {
        el.scrollIntoView()
      }
    }
    const isMyProviderSelectedProvider = (p) => {
      return p.domain === window.location.host
    }

    onMounted(async () => {
      await listProviders()
      if (unref(tokenQuery)) {
        token.value = queryItemAsString(unref(tokenQuery))
        ;(unref(tokenInput) as any).focus()
        scrollToForm()
      }
      if (unref(providerDomainQuery)) {
        let matchedProvider = unref(providers)?.find(
          (p) => p.domain === queryItemAsString(unref(providerDomainQuery))
        )
        if (matchedProvider) {
          provider.value = matchedProvider
          providerError.value = false
        } else {
          provider.value = {
            full_name: 'Unknown provider',
            domain: queryItemAsString(unref(providerDomainQuery))
          }
          providerError.value = true
        }
      }
    })

    return {
      tokenInput,
      helperContent,
      token,
      provider,
      providers,
      loading,
      providerError,
      providerErrorMessage,
      acceptInvitationButtonDisabled,
      acceptInvite
    }
  },
  methods: { $gettext }
})
</script>

<style lang="scss" scoped>
.sciencemesh-app {
}
.option {
  display: block;
}
</style>
