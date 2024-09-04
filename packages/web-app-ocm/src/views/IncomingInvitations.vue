<template>
  <div id="incoming" class="sciencemesh-app">
    <div>
      <div class="oc-flex oc-flex-middle oc-px-m oc-py-s">
        <oc-icon name="user-received" />
        <h2 class="oc-px-s" v-text="$gettext('Accept invitations')" />
        <oc-contextual-helper class="oc-pl-xs" v-bind="helperContent" />
      </div>
      <div v-if="!providers.length" class="oc-flex oc-flex-center oc-flex-middle">
        <oc-icon name="error-warning" fill-type="line" class="oc-mr-s" size="large" />
        <span v-text="$gettext('The list of institutions is empty. Please contact your admin.')" />
      </div>
      <div v-else class="oc-flex oc-flex-column oc-flex-middle oc-flex-center oc-p-m">
        <div class="oc-width-1-2">
          <oc-text-input
            ref="tokenInput"
            v-model="token"
            :label="$gettext('Enter invite token')"
            :clear-button-enabled="true"
            class="oc-mb-m"
          />
          <oc-select
            v-model="provider"
            :label="$gettext('Select institution of inviter')"
            :options="providers"
            class="oc-mb-m"
            :position-fixed="true"
            :loading="loading"
          >
            <template #option="{ full_name, domain }">
              <div class="oc-text-break">
                <span class="option">
                  <strong v-text="full_name" />
                </span>
                <span class="option" v-text="domain" />
              </div>
            </template>
            <template #no-options> No institutions found with this name </template>
            <template #selected-option="{ full_name, domain }">
              <div class="options-wrapper oc-text-break">
                <strong class="oc-mr-s oc-text-break" v-text="full_name" />
                <small
                  v-oc-tooltip="domain"
                  v-text="domain.length > 17 ? domain.slice(0, 20) + '...' : domain"
                />
              </div>
            </template>
          </oc-select>
          <div v-if="providerError" class="oc-text-input-message">
            <span
              class="oc-text-input-danger"
              v-text="$gettext('Unknown institution. Check invitation url or select from list')"
            />
          </div>
        </div>
        <oc-button size="small" :disabled="acceptInvitationButtonDisabled" @click="acceptInvite">
          <oc-icon name="add" />
          <span v-text="$gettext('Accept invitation')" />
        </oc-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, unref } from 'vue'
import {
  queryItemAsString,
  useClientService,
  useRoute,
  useRouter,
  useMessages,
  useConfigStore
} from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'
import { onBeforeRouteUpdate, RouteLocationNormalized } from 'vue-router'
import { ProviderSchema, providerListSchema } from '../schemas'
import { OcTextInput } from '@ownclouders/design-system/src/components'

export default defineComponent({
  emits: ['highlightNewConnections'],
  setup(props, { emit }) {
    const { showErrorMessage } = useMessages()
    const router = useRouter()
    const clientService = useClientService()
    const configStore = useConfigStore()
    const { $gettext } = useGettext()

    const token = ref<string>(undefined)
    const provider = ref<ProviderSchema>(undefined)
    const providers = ref<ProviderSchema[]>([])
    const loading = ref(true)
    const providerError = ref(false)
    const tokenInput = ref<InstanceType<typeof OcTextInput>>()

    const helperContent = computed(() => {
      return {
        text: $gettext(
          'Once you accept the invitation, the inviter will be added to your connections.'
        )
      }
    })

    const acceptInvitationButtonDisabled = computed(() => {
      return !unref(token) || !unref(provider) || unref(provider).full_name === 'Unknown provider'
    })

    const errorPopup = (error: Error) => {
      console.error(error)
      showErrorMessage({
        title: $gettext('Error'),
        desc: $gettext('An error occurred'),
        errors: [error]
      })
    }
    const acceptInvite = async () => {
      try {
        await clientService.httpAuthenticated.post('/sciencemesh/accept-invite', {
          token: unref(token),
          providerDomain: unref(provider).domain
        })
        token.value = undefined
        provider.value = undefined

        const { token: currentToken, providerDomain, ...query } = unref(route).query
        router.replace({
          name: 'open-cloud-mesh-invitations',
          query
        })

        emit('highlightNewConnections')
      } catch (error) {
        errorPopup(error)
      }
    }
    const listProviders = async () => {
      try {
        const { data: allProviders } = await clientService.httpAuthenticated.get(
          '/sciencemesh/list-providers',
          {
            schema: providerListSchema
          }
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
    const isMyProviderSelectedProvider = (p: ProviderSchema) => {
      return p.domain === new URL(configStore.serverUrl).hostname
    }

    const handleParams = (to: RouteLocationNormalized) => {
      const tokenQuery = to.query.token
      if (tokenQuery) {
        token.value = queryItemAsString(tokenQuery)
        unref(tokenInput).focus()
        scrollToForm()
      }
      const providerDomainQuery = to.query.providerDomain
      if (providerDomainQuery) {
        const matchedProvider = unref(providers)?.find(
          (p) => p.domain === queryItemAsString(providerDomainQuery)
        )
        if (matchedProvider) {
          provider.value = matchedProvider
          providerError.value = false
        } else {
          provider.value = {
            full_name: 'Unknown provider',
            domain: queryItemAsString(providerDomainQuery)
          }
          providerError.value = true
        }
      }
    }

    const route = useRoute()
    onMounted(async () => {
      await listProviders()
      handleParams(unref(route))
    })
    onBeforeRouteUpdate((to, from) => {
      handleParams(to)
    })

    return {
      tokenInput,
      helperContent,
      token,
      provider,
      providers,
      loading,
      providerError,
      acceptInvitationButtonDisabled,
      acceptInvite
    }
  }
})
</script>

<style lang="scss">
.sciencemesh-app {
  .option {
    display: block;
  }

  .vs__selected,
  .options-wrapper {
    max-width: 100%;
  }

  .vs__selected-options {
    max-width: 100%;
    overflow: hidden;
  }
}
</style>
