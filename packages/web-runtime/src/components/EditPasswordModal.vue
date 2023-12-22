<template>
  <oc-text-input
    v-model="currentPassword"
    :label="$gettext('Current password')"
    type="password"
    :fix-message-line="true"
  />
  <oc-text-input
    v-model="newPassword"
    :label="$gettext('New password')"
    type="password"
    :fix-message-line="true"
    @change="validatePasswordConfirm"
  />
  <oc-text-input
    v-model="newPasswordConfirm"
    :label="$gettext('Repeat new password')"
    type="password"
    :fix-message-line="true"
    :error-message="passwordConfirmErrorMessage"
    @change="validatePasswordConfirm"
  />
</template>

<script lang="ts">
import { computed, defineComponent, ref, PropType, unref, watch } from 'vue'
import { useGettext } from 'vue3-gettext'
import { Modal, useClientService, useStore } from '@ownclouders/web-pkg'

export default defineComponent({
  name: 'EditPasswordModal',
  props: { modal: { type: Object as PropType<Modal>, required: true } },
  emits: ['update:confirmDisabled'],
  setup(props, { emit, expose }) {
    const store = useStore()
    const clientService = useClientService()
    const { $gettext } = useGettext()

    const currentPassword = ref('')
    const newPassword = ref('')
    const newPasswordConfirm = ref('')
    const passwordConfirmErrorMessage = ref('')

    const confirmButtonDisabled = computed(() => {
      return (
        !unref(currentPassword).trim().length ||
        !unref(newPassword).trim().length ||
        unref(newPassword) !== unref(newPasswordConfirm)
      )
    })

    watch(
      confirmButtonDisabled,
      () => {
        emit('update:confirmDisabled', unref(confirmButtonDisabled))
      },
      { immediate: true }
    )

    const onConfirm = () => {
      return clientService.graphAuthenticated.users
        .changeOwnPassword(unref(currentPassword).trim(), unref(newPassword).trim())
        .then(() => {
          store.dispatch('showMessage', {
            title: $gettext('Password was changed successfully')
          })
        })
        .catch((error) => {
          console.error(error)
          store.dispatch('showErrorMessage', {
            title: $gettext('Failed to change password'),
            error
          })
        })
    }

    expose({ onConfirm })

    return {
      currentPassword,
      newPassword,
      newPasswordConfirm,
      passwordConfirmErrorMessage,

      // unit tests
      confirmButtonDisabled
    }
  },

  methods: {
    validatePasswordConfirm() {
      this.passwordConfirmErrorMessage = ''

      if (
        this.newPassword.trim().length &&
        this.newPasswordConfirm.trim().length &&
        this.newPassword !== this.newPasswordConfirm
      ) {
        this.passwordConfirmErrorMessage = this.$gettext(
          'Password and password confirmation must be identical'
        )
        return false
      }

      return true
    }
  }
})
</script>
