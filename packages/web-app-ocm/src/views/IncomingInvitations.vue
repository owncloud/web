<template>
  <div id="incoming" class="sciencemesh-app">
    <div>
      <div class="oc-flex oc-flex-middle oc-px-m oc-pt-s">
        <oc-icon name="user-received" />
        <h2 class="oc-px-s" v-text="$gettext('Accept invitations')" />
        <oc-contextual-helper class="oc-pl-xs" v-bind="helperContent" />
      </div>
      <div class="oc-flex oc-flex-column oc-flex-middle oc-flex-center oc-p-m">
        <div class="oc-width-1-2">
          <oc-text-input
            v-model="token"
            :label="$gettext('Enter invite token')"
            :clear-button-enabled="true"
            class="oc-mb-s"
            @update:model-value="decodeInviteToken"
          />
          <div
            :class="{
              'oc-text-input-danger': providerError && token,
              'oc-text-input-success': provider
            }"
          >
            <span v-text="$gettext('Institution:')" />
            <span v-if="!token" v-text="'-'" />
            <span v-else-if="provider" v-text="provider" />
            <span v-else v-text="$gettext('invalid invite token')" />
          </div>
        </div>
        <div
          v-oc-tooltip="isUsingOwnGeneratedTokenToolTip"
          :aria-label="isUsingOwnGeneratedTokenToolTip"
        >
          <oc-button
            size="small"
            :disabled="acceptInvitationButtonDisabled"
            class="oc-mt-s"
            @click="acceptInvite"
          >
            <oc-icon name="add" />
            <span v-text="$gettext('Accept invitation')" />
          </oc-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, unref } from 'vue'
import { useRoute, useRouter } from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'
import { useInvitationAcceptance } from '../composables/useInvitationAcceptance'

const emit = defineEmits<{ (e: 'highlightNewConnections'): void }>()

const router = useRouter()
const route = useRoute()
const { $gettext } = useGettext()

const { acceptInvitation, isOwnGeneratedToken } = useInvitationAcceptance()

const token = ref<string>(undefined)
const decodedToken = ref<string>(undefined)
const provider = ref<string>(undefined)
const providerError = ref(false)

const helperContent = computed(() => {
  return {
    text: $gettext(
      'Once you accept the invitation, the inviter will be added to your connections.'
    ),
    title: $gettext('Accepting invitations')
  }
})

const isUsingOwnGeneratedTokenToolTip = computed(() =>
  isOwnGeneratedToken(unref(decodedToken)) ? $gettext('Self-invitations are not permitted') : ''
)

const acceptInvitationButtonDisabled = computed(() => {
  return !unref(decodedToken) || !unref(provider) || isOwnGeneratedToken(unref(decodedToken))
})

const acceptInvite = async () => {
  if (isOwnGeneratedToken(unref(decodedToken))) {
    return
  }

  try {
    // Use shared invitation acceptance logic
    await acceptInvitation(unref(decodedToken), unref(provider))

    token.value = undefined
    provider.value = undefined

    const { token: currentToken, providerDomain, ...query } = unref(route).query
    router.replace({
      name: 'open-cloud-mesh-invitations',
      query
    })

    emit('highlightNewConnections')
  } catch (error) {
    // Error handling is already done in the shared logic, do not use showErrorMessage here
  }
}

const decodeInviteToken = (value: string) => {
  try {
    let decoded = value.trim()

    // If value doesn't contain '@', assume it's base64 encoded
    if (!decoded.includes('@')) {
      decoded = atob(decoded)
    }

    if (!decoded.includes('@')) {
      throw new Error('Invalid token format')
    }

    const [token, serverUrl] = decoded.split('@')
    if (!token || !serverUrl) {
      throw new Error('Invalid token format')
    }

    provider.value = serverUrl
    decodedToken.value = token
    providerError.value = false
  } catch (error) {
    console.error('Failed to decode invite token:', error)
    provider.value = ''
    decodedToken.value = ''
    providerError.value = true
  }
}
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
