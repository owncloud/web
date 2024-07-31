<template>
  <oc-text-input
    :model-value="password"
    :label="$gettext('Password')"
    type="password"
    :password-policy="inputPasswordPolicy"
    :generate-password-method="inputGeneratePasswordMethod"
    :placeholder="link.hasPassword ? '●●●●●●●●' : null"
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
import { upperFirst } from 'lodash-es'
import {
  Modal,
  useClientService,
  useMessages,
  usePasswordPolicyService,
  useSharesStore
} from '@ownclouders/web-pkg'
import { LinkShare, Resource, SpaceResource } from '@ownclouders/web-client'

export default defineComponent({
  name: 'SetLinkPasswordModal',
  props: {
    modal: { type: Object as PropType<Modal>, required: true },
    space: { type: Object as PropType<SpaceResource>, required: true },
    resource: { type: Object as PropType<Resource>, required: true },
    link: { type: Object as PropType<LinkShare>, required: true },
    callbackFn: {
      type: Function as PropType<() => void>,
      default: undefined
    }
  },
  emits: ['confirm', 'update:confirmDisabled'],
  setup(props, { expose }) {
    const { showMessage, showErrorMessage } = useMessages()
    const clientService = useClientService()
    const passwordPolicyService = usePasswordPolicyService()
    const { $gettext } = useGettext()
    const { updateLink } = useSharesStore()

    const password = ref('')
    const errorMessage = ref<string>()

    const onInput = (value: string) => {
      password.value = value
      errorMessage.value = undefined
    }

    const onConfirm = async () => {
      try {
        await updateLink({
          clientService,
          space: props.space,
          resource: props.resource,
          linkShare: props.link,
          options: { password: unref(password) }
        })
        if (props.callbackFn) {
          props.callbackFn()
          return
        }
        showMessage({ title: $gettext('Link was updated successfully') })
      } catch (e) {
        // Human-readable error message is provided, for example when password is on banned list
        if (e.response?.status === 400) {
          const errorMsg = e.response.data.error.message
          errorMessage.value = $gettext(upperFirst(errorMsg))
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
