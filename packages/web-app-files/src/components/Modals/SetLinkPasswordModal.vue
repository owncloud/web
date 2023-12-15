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
    @password-challenge-completed="confirmDisabled = false"
    @password-challenge-failed="confirmDisabled = true"
    @keydown.enter.prevent="onConfirm"
    @update:model-value="onInput"
  />
  <div class="oc-flex oc-flex-right oc-flex-middle oc-mt-m">
    <oc-button
      class="oc-modal-body-actions-cancel oc-ml-s"
      appearance="outline"
      variation="passive"
      @click="onCancel"
      >{{ $gettext('Cancel') }}
    </oc-button>
    <oc-button
      class="oc-modal-body-actions-confirm oc-ml-s"
      appearance="filled"
      variation="primary"
      :disabled="confirmDisabled"
      @click="onConfirm"
      >{{ link.password ? $gettext('Apply') : $gettext('Set') }}
    </oc-button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, unref, PropType } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useClientService, usePasswordPolicyService, useStore } from '@ownclouders/web-pkg'
import { Share } from '@ownclouders/web-client/src/helpers'

export default defineComponent({
  name: 'SetLinkPasswordModal',
  props: {
    link: { type: Object as PropType<Share>, required: true }
  },
  setup(props, { expose }) {
    const store = useStore()
    const clientService = useClientService()
    const passwordPolicyService = usePasswordPolicyService()
    const { $gettext } = useGettext()

    const password = ref('')
    const errorMessage = ref<string>()
    const confirmDisabled = ref(true)

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
        store.dispatch('hideModal')
        store.dispatch('showMessage', {
          title: $gettext('Link was updated successfully')
        })
      } catch (e) {
        // Human-readable error message is provided, for example when password is on banned list
        if (e.statusCode === 400) {
          errorMessage.value = $gettext(e.message)
          return
        }

        store.dispatch('showErrorMessage', {
          title: $gettext('Failed to update link'),
          error: e
        })
      }
    }

    const onCancel = () => {
      store.dispatch('hideModal')
    }

    expose({ onConfirm, onCancel })

    return {
      password,
      confirmDisabled,
      onInput,
      onConfirm,
      onCancel,
      errorMessage,
      passwordPolicyService,
      inputPasswordPolicy: passwordPolicyService.getPolicy(),
      inputGeneratePasswordMethod: () => passwordPolicyService.generatePassword()
    }
  }
})
</script>
