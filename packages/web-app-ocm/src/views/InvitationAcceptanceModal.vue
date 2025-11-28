<template>
  <oc-modal
    v-if="showModal"
    :title="$gettext('Accept Invitation')"
    :button-cancel-text="$gettext('Decline')"
    :button-confirm-text="$gettext('Accept')"
    :button-confirm-disabled="acceptButtonDisabled"
    @cancel="declineInvitation"
    @confirm="acceptInvitation"
  >
    <template #content>
      <div class="invitation-acceptance-content">
        <div v-if="loading" class="oc-text-center oc-p-m">
          <app-loading-spinner />
          <p class="oc-mt-s" v-text="$gettext('Processing invitation...')" />
        </div>

        <div v-else class="oc-p-m">
          <div class="oc-flex oc-flex-middle oc-mb-m">
            <oc-icon name="user-received" size="large" class="oc-mr-m" />
            <div>
              <h3 v-text="$gettext('You have received an invitation')" />
              <p
                class="oc-text-muted"
                v-text="$gettext('Accept this invitation to establish a federated connection.')"
              />
            </div>
          </div>

          <div
            class="invitation-details oc-p-m"
            style="background: var(--oc-color-background-hover); border-radius: 8px"
          >
            <div class="oc-mb-s">
              <strong v-text="$gettext('From Institution:')" />
              <span class="oc-ml-s" v-text="provider" />
            </div>
            <div class="oc-text-small oc-text-muted">
              <span v-text="$gettext('Token:')" />
              <span class="oc-ml-s oc-font-mono" v-text="token" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </oc-modal>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useInvitationAcceptance } from '../composables/useInvitationAcceptance'

const emit = defineEmits<{
  (e: 'highlightNewConnections'): void
  (e: 'close'): void
}>()

const props = defineProps<{
  showModal: boolean
  token: string
  provider: string
}>()

const {
  loading,
  acceptInvitation: acceptInvitationAPI,
  validateParameters
} = useInvitationAcceptance()

const acceptButtonDisabled = computed(() => {
  return loading.value || !props.token || !props.provider
})

const acceptInvitation = async () => {
  try {
    validateParameters(props.token, props.provider)

    await acceptInvitationAPI(props.token, props.provider)

    emit('highlightNewConnections')
    emit('close')
  } catch (err) {
    console.error('Error accepting invitation:', err)
    emit('close')
  }
}

const declineInvitation = () => {
  emit('close')
}
</script>

<style lang="scss" scoped>
.invitation-acceptance-content {
  min-height: 200px;
}

.invitation-details {
  border: 1px solid var(--oc-color-border);
}
</style>
