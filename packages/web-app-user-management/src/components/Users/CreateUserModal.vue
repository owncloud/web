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
          :label="$gettext('First and last name')"
          :fix-message-line="true"
        />
        <oc-text-input
          v-model="user.mail"
          class="oc-mb-s"
          :label="$gettext('Email') + '*'"
          :error-message="formData.email.errorMessage"
          type="email"
          :fix-message-line="true"
          @input="validateEmail"
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
    validateEmail() {
      this.formData.email.valid = false

      if (this.user.mail.trim() === '') {
        return (this.formData.email.errorMessage = this.$gettext('Email cannot be empty'))
      }

      if (!EmailValidator.validate(this.user.mail)) {
        return (this.formData.email.errorMessage = this.$gettext('Email must be valid'))
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
