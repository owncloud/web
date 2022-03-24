<template>
  <div>
    <oc-modal
      icon="info"
      :title="$gettext('Create user')"
      :button-cancel-text="$gettext('Cancel')"
      :button-confirm-text="$gettext('Create')"
      :button-confirm-disabled="buttonConfirmDisabled"
      @cancel="$emit('cancel')"
      @confirm="$emit('confirm', user)"
    >
      <template #content>
        <oc-text-input
          v-model="user.onPremisesSamAccountName"
          class="oc-mb-s"
          :label="$gettext('User name') + '*'"
          :error-message="formData.userName.errorMessage"
          :fix-message-line="true"
          @input="validateUserName"
        />
        <oc-text-input
          v-model="user.displayName"
          class="oc-mb-s"
          :label="$gettext('First and last name') + '*'"
          :error-message="formData.displayName.errorMessage"
          :fix-message-line="true"
          @input="validateDisplayName"
        />
        <oc-text-input
          v-model="user.mail"
          class="oc-mb-s"
          :label="$gettext('Email') + '*'"
          :error-message="formData.email.errorMessage"
          type="email"
          :fix-message-line="true"
          @change="validateEmail"
        />
        <oc-text-input
          v-model="user.passwordProfile.password"
          class="oc-mb-s"
          :label="$gettext('Password') + '*'"
          :error-message="formData.password.errorMessage"
          type="password"
          :fix-message-line="true"
          @input="validatePassword"
        />
      </template>
    </oc-modal>
  </div>
</template>

<script>
import * as EmailValidator from 'email-validator'

export default {
  name: 'CreateUserModal',
  data: function () {
    return {
      formData: {
        userName: {
          errorMessage: '',
          valid: false
        },
        displayName: {
          errorMessage: '',
          valid: false
        },
        email: {
          errorMessage: '',
          valid: false
        },
        password: {
          errorMessage: '',
          valid: false
        }
      },
      user: {
        onPremisesSamAccountName: '',
        displayName: '',
        mail: '',
        passwordProfile: {
          password: ''
        }
      }
    }
  },
  computed: {
    buttonConfirmDisabled() {
      let invalid = false
      Object.keys(this.formData).forEach((key) => {
        if (this.formData[key].valid === false) {
          invalid = true
        }
      })
      return invalid
    }
  },
  methods: {
    validateUserName() {
      this.formData.userName.valid = false

      if (this.user.onPremisesSamAccountName.trim() === '') {
        return (this.formData.userName.errorMessage = this.$gettext('User name cannot be empty'))
      }

      this.formData.userName.errorMessage = ''
      this.formData.userName.valid = true
    },

    validateDisplayName() {
      this.formData.displayName.valid = false

      if (this.user.displayName.trim() === '') {
        return (this.formData.displayName.errorMessage = this.$gettext(
          'Display name cannot be empty'
        ))
      }

      this.formData.displayName.errorMessage = ''
      this.formData.displayName.valid = true
    },

    validateEmail() {
      this.formData.email.valid = false

      if (!EmailValidator.validate(this.user.mail)) {
        return (this.formData.email.errorMessage = this.$gettext('Please enter a valid email'))
      }

      this.formData.email.errorMessage = ''
      this.formData.email.valid = true
    },
    validatePassword() {
      this.formData.password.valid = false

      if (this.user.passwordProfile.password.trim() === '') {
        return (this.formData.password.errorMessage = this.$gettext('Password cannot be empty'))
      }

      this.formData.password.errorMessage = ''
      this.formData.password.valid = true
    }
  }
}
</script>
