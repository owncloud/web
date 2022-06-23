<template>
  <div v-if="user" class="oc-mt-xl">
    <UserInfoBox :user="user" />
    <div v-if="editUser" class="oc-background-highlight oc-p-m">
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
        v-model="editUser.role"
        :label="$gettext('Role')"
        option-label="displayName"
        :options="roles"
        :clearable="false"
      />
    </div>
    <compare-save-dialog
      class="edit-compare-save-dialog"
      :original-object="originalObjectUser"
      :compare-object="compareObjectUser"
      :confirm-button-disabled="invalidFormData"
      @revert="revertChanges"
      @confirm="$emit('confirm', editUser)"
    ></compare-save-dialog>
  </div>
</template>
<script>
import * as EmailValidator from 'email-validator'
import UserInfoBox from './UserInfoBox.vue'
import CompareSaveDialog from '../../CompareSaveDialog.vue'

export default {
  name: 'EditPanel',
  components: {
    UserInfoBox,
    CompareSaveDialog
  },
  props: {
    users: {
      type: Array,
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
      formData: {
        displayName: {
          errorMessage: '',
          valid: true
        },
        email: {
          errorMessage: '',
          valid: true
        }
      }
    }
  },
  computed: {
    user() {
      return this.users.length === 1 ? this.users[0] : null
    },

    userRole() {
      return this.user ? this.userRoles[this.user.id] : null
    },

    originalObjectUser() {
      return { user: { ...this.user, passwordProfile: { password: '' } } }
    },
    compareObjectUser() {
      return { user: { ...this.editUser } }
    },
    invalidFormData() {
      return Object.values(this.formData)
        .map((v) => !!v.valid)
        .includes(false)
    }
  },
  watch: {
    user: {
      handler: function () {
        this.editUser = { ...this.user, ...{ passwordProfile: { password: '' } } }
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
    },

    revertChanges() {
      this.editUser = { ...this.user, ...{ passwordProfile: { password: '' } } }
      Object.values(this.formData).forEach((formDataValue) => {
        formDataValue.valid = true
        formDataValue.errorMessage = ''
      })
    }
  }
}
</script>
<style lang="scss">
.edit-compare-save-dialog {
  position: absolute;
  bottom: 0;
  left: 0;
}
</style>
