<template>
  <oc-modal
    :title="$gettext('Create user')"
    :button-cancel-text="$gettext('Cancel')"
    :button-confirm-text="$gettext('Create')"
    :button-confirm-disabled="isFormInvalid"
    focus-trap-initial="#create-user-input-display-name"
    @cancel="$emit('cancel')"
    @confirm="$emit('confirm', user)"
  >
    <template #content>
      <form autocomplete="off" @submit.prevent="onFormSubmit">
        <oc-text-input
          id="create-user-input-display-name"
          v-model="user.onPremisesSamAccountName"
          class="oc-mb-s"
          :label="$gettext('User name') + '*'"
          :error-message="formData.userName.errorMessage"
          :fix-message-line="true"
          @update:model-value="validateUserName"
        />
        <oc-text-input
          v-model="user.displayName"
          class="oc-mb-s"
          :label="$gettext('First and last name') + '*'"
          :error-message="formData.displayName.errorMessage"
          :fix-message-line="true"
          @update:model-value="validateDisplayName"
        />
        <oc-text-input
          v-model="user.mail"
          class="oc-mb-s"
          :label="$gettext('Email') + '*'"
          :error-message="formData.email.errorMessage"
          type="email"
          :fix-message-line="true"
          @update:model-value="onInputEmail"
          @change="validateEmail"
        />
        <oc-text-input
          v-model="user.passwordProfile.password"
          class="oc-mb-s"
          :label="$gettext('Password') + '*'"
          :error-message="formData.password.errorMessage"
          type="password"
          :fix-message-line="true"
          @update:model-value="validatePassword"
        />
        <input type="submit" class="oc-hidden" />
      </form>
    </template>
  </oc-modal>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import * as EmailValidator from 'email-validator'
import { useGraphClient } from 'web-pkg'

export default defineComponent({
  name: 'CreateUserModal',
  emits: ['cancel', 'confirm'],
  setup() {
    const formData = ref({
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
    })
    return {
      ...useGraphClient(),
      formData
    }
  },
  data: function () {
    return {
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
    isFormInvalid() {
      return Object.keys(this.formData)
        .map((k) => !!this.formData[k].valid)
        .includes(false)
    }
  },
  methods: {
    onInputEmail() {
      if (!EmailValidator.validate(this.user.mail)) {
        return
      }

      this.formData.email.errorMessage = ''
      this.formData.email.valid = true
    },
    async validateUserName() {
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

      try {
        await this.graphClient.users.getUser(this.user.onPremisesSamAccountName)
        this.formData.userName.errorMessage = this.$gettext('User "%{userName}" already exists', {
          userName: this.user.onPremisesSamAccountName
        })
        return false
      } catch (e) {
        /**
         * If the backend throws an error, the user doesn't exist and everything is alright
         */
      }

      this.formData.userName.errorMessage = ''
      this.formData.userName.valid = true
      return true
    },
    validateDisplayName() {
      this.formData.displayName.valid = false

      if (this.user.displayName.trim() === '') {
        this.formData.displayName.errorMessage = this.$gettext(
          'First and last name cannot be empty'
        )
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
    },
    onFormSubmit() {
      if (this.isFormInvalid) {
        return
      }
      this.$emit('confirm', this.user)
    }
  }
})
</script>
