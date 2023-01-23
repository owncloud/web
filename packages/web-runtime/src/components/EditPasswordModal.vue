<template>
  <oc-modal
    :title="$gettext('Change password')"
    :button-cancel-text="$gettext('Cancel')"
    :button-confirm-text="$gettext('Confirm')"
    :button-confirm-disabled="confirmButtonDisabled"
    @confirm="editPassword"
    @cancel="$emit('cancel')"
  >
    <template #content>
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
  </oc-modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'EditPasswordModal',
  emits: ['cancel', 'confirm'],
  data: function () {
    return {
      currentPassword: '',
      newPassword: '',
      newPasswordConfirm: '',
      passwordConfirmErrorMessage: ''
    }
  },
  computed: {
    confirmButtonDisabled() {
      return (
        !this.currentPassword.trim().length ||
        !this.newPassword.trim().length ||
        this.newPassword !== this.newPasswordConfirm
      )
    }
  },
  methods: {
    editPassword() {
      this.$emit('confirm', this.currentPassword, this.newPassword)
    },
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
