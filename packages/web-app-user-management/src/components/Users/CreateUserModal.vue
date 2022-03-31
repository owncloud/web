<template>
  <oc-modal
    :title="$gettext('Create user')"
    :button-cancel-text="$gettext('Cancel')"
    :button-confirm-text="$gettext('Create')"
    :button-confirm-disabled="buttonConfirmDisabled"
    focus-trap-initial="#input-user-name"
    @cancel="$emit('cancel')"
    @confirm="$emit('confirm', user)"
  >
    <template #content>
      <oc-text-input
        id="input-user-name"
        v-model="user.onPremisesSamAccountName"
        class="oc-mb-s"
        :label="$gettext('User name') + '*'"
        :error-message="formData.userName.errorMessage"
        :fix-message-line="true"
        @input="validateUserName"
      />
      <oc-text-input
        id="input-display-name"
        v-model="user.displayName"
        class="oc-mb-s"
        :label="$gettext('First and last name') + '*'"
        :error-message="formData.displayName.errorMessage"
        :fix-message-line="true"
        @input="validateDisplayName"
      />
      <oc-text-input
        id="input-mail"
        v-model="user.mail"
        class="oc-mb-s"
        :label="$gettext('Email') + '*'"
        :error-message="formData.email.errorMessage"
        type="email"
        :fix-message-line="true"
        @change="validateEmail"
      />
      <oc-text-input
        id="input-password"
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
</template>

<script>
import * as EmailValidator from 'email-validator'

export default {
  name: 'CreateUserModal',
  props: {
    existingUsers: {
      type: Array,
      required: false,
      default: () => {
        return []
      }
    }
  },
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
      return Object.keys(this.formData)
        .map((k) => !!this.formData[k].valid)
        .includes(false)
    }
  },
  methods: {
    validateUserName() {
      this.formData.userName.valid = false

      if (this.user.onPremisesSamAccountName.trim() === '') {
        this.formData.userName.errorMessage = this.$gettext('User name cannot be empty')
        return false
      }

      if (this.user.onPremisesSamAccountName.includes(' ')) {
        this.formData.userName.errorMessage = this.$gettext('User name cannot contain white spaces')
        return false
      }

      if (
        this.user.onPremisesSamAccountName.length &&
        !isNaN(this.user.onPremisesSamAccountName[0])
      ) {
        this.formData.userName.errorMessage = this.$gettext('User name cannot start with a number')
        return false
      }

      if (
        this.existingUsers.find(
          (existingUser) =>
            existingUser.onPremisesSamAccountName === this.user.onPremisesSamAccountName
        )
      ) {
        this.formData.userName.errorMessage = this.$gettextInterpolate(
          this.$gettext('User "%{userName}" already exists'),
          { userName: this.user.onPremisesSamAccountName }
        )
        return false
      }

      this.formData.userName.errorMessage = ''
      this.formData.userName.valid = true
      return true
    },

    validateDisplayName() {
      this.formData.displayName.valid = false

      if (this.user.displayName.trim() === '') {
        this.formData.displayName.errorMessage = this.$gettext('Display name cannot be empty')
        return false
      }

      this.formData.displayName.errorMessage = ''
      this.formData.displayName.valid = true
      return true
    },

    validateEmail() {
      this.formData.email.valid = false

      if (!EmailValidator.validate(this.user.mail)) {
        this.formData.email.errorMessage = this.$gettext('Please enter a valid email')
        return false
      }

      this.formData.email.errorMessage = ''
      this.formData.email.valid = true
      return true
    },
    validatePassword() {
      this.formData.password.valid = false

      if (this.user.passwordProfile.password.trim() === '') {
        this.formData.password.errorMessage = this.$gettext('Password cannot be empty')
        return false
      }

      this.formData.password.errorMessage = ''
      this.formData.password.valid = true
      return true
    }
  }
}
</script>
