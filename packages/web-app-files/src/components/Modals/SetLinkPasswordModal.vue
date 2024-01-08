<template>
  <oc-text-input
    :model-value="password"
    :label="$gettext('Password')"
    type="password"
    :password-policy="inputPasswordPolicy"
    :generate-password-method="inputGeneratePasswordMethod"
    :fix-message-line="true"
    :placeholder="link.password ? '●●●●●●●●' : null"
    :error-message="errorMessage"
    class="oc-modal-body-input"
    @password-challenge-completed="$emit('update:confirmDisabled', false)"
    @password-challenge-failed="$emit('update:confirmDisabled', true)"
    @keydown.enter.prevent="$emit('confirm')"
    @update:model-value="onInput"
  />
</template>

<script lang="ts">
import { defineComponent, ref, unref, PropType } from 'vue'
import { useGettext } from 'vue3-gettext'
import {
  Modal,
  useClientService,
  useMessages,
  usePasswordPolicyService,
  useStore
} from '@ownclouders/web-pkg'
import { Share } from '@ownclouders/web-client/src/helpers'

export default defineComponent({
  name: 'SetLinkPasswordModal',
  props: {
    modal: { type: Object as PropType<Modal>, required: true },
    link: { type: Object as PropType<Share>, required: true }
  },
  emits: ['confirm', 'update:confirmDisabled'],
  setup(props, { expose }) {
    const store = useStore()
    const { showMessage, showErrorMessage } = useMessages()
    const clientService = useClientService()
    const passwordPolicyService = usePasswordPolicyService()
    const { $gettext } = useGettext()

    const password = ref('')
    const errorMessage = ref<string>()

    const onInput = (value: string) => {
      password.value = value
      errorMessage.value = undefined
    }

    const onConfirm = async () => {
      try {
        await store.dispatch('Files/updateLink', {
          id: props.link.id,
          client: clientService.owncloudSdk,
          params: { ...props.link, password: unref(password) }
        })
        showMessage({ title: $gettext('Link was updated successfully') })
      } catch (e) {
        // Human-readable error message is provided, for example when password is on banned list
        if (e.statusCode === 400) {
          errorMessage.value = $gettext(e.message)
          return Promise.reject()
        }

        showErrorMessage({
          title: $gettext('Failed to update link'),
          errors: [e]
        })
      }
    }

    expose({ onConfirm })

    return {
      password,
      onInput,
      errorMessage,
      passwordPolicyService,
      inputPasswordPolicy: passwordPolicyService.getPolicy(),
      inputGeneratePasswordMethod: () => passwordPolicyService.generatePassword(),

      // unit tests
      onConfirm
    }
  }
})
</script>
