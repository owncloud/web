<template>
  <div class="oc-mt-xl">
    <div class="oc-flex group-info oc-mb-l">
      <avatar-image class="oc-mb-m" :width="80" :userid="user.id" :user-name="user.displayName" />
      <span v-text="user.onPremisesSamAccountName"></span>
      <span class="oc-text-muted group-info-display-name" v-text="user.displayName"></span>
    </div>
    <div v-if="editUser">
      <oc-text-input
        v-model="editUser.displayName"
        class="oc-mb-s"
        :label="$gettext('First and last name')"
        :error-message="formData.displayName.errorMessage"
        :fix-message-line="true"
        @input="validateDisplayName"
      />
      <oc-text-input
        v-model="editUser.mail"
        class="oc-mb-s"
        :label="$gettext('Email')"
        :error-message="formData.email.errorMessage"
        type="email"
        :fix-message-line="true"
        @change="validateEmail"
      />
      <oc-text-input
        v-model="editUser.passwordProfile.password"
        class="oc-mb-s"
        :label="$gettext('Password')"
        type="password"
        :fix-message-line="true"
        default-value="●●●●●●●●"
      />
      <oc-select
        v-model="editUserRole"
        :label="$gettext('Role')"
        option-label="displayName"
        :options="roles"
        :clearable="false"
      />
      <oc-button @click="$emit('confirm', { editUser, editUserRole })">ok</oc-button>
    </div>
  </div>
</template>
<script>
import * as EmailValidator from 'email-validator'

export default {
  name: 'EditPanel',
  props: {
    user: {
      type: Object,
      required: true
    },
    userRole: {
      type: Object,
      required: true
    },
    roles: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      editUser: {},
      editUserRole: {},
      formData: {
        displayName: {
          errorMessage: '',
          valid: false
        },
        email: {
          errorMessage: '',
          valid: false
        }
      }
    }
  },
  watch: {
    user: {
      handler: function () {
        this.editUser = { ...this.user, ...{ passwordProfile: { password: '' } } }
        this.editUserRole = this.roles.find((role) => role.id === this.userRole.id)
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    validateDisplayName() {
      this.formData.displayName.valid = false

      if (this.editUser.displayName.trim() === '') {
        this.formData.displayName.errorMessage = this.$gettext('Display name cannot be empty')
        return false
      }

      this.formData.displayName.errorMessage = ''
      this.formData.displayName.valid = true
      return true
    },

    validateEmail() {
      this.formData.email.valid = false

      if (!EmailValidator.validate(this.editUser.mail)) {
        this.formData.email.errorMessage = this.$gettext('Please enter a valid email')
        return false
      }

      this.formData.email.errorMessage = ''
      this.formData.email.valid = true
      return true
    }
  }
}
</script>
<style lang="scss">
.user-info {
  align-items: center;
  flex-direction: column;
}
.user-info-display-name {
  font-size: 1.5rem;
}
</style>
