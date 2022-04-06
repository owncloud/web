<template>
  <div class="oc-mt-xl">
    <div class="oc-flex group-info oc-mb-l">
      <avatar-image class="oc-mb-m" :width="80" :userid="user.id" :user-name="user.displayName" />
      <span v-text="user.onPremisesSamAccountName"></span>
      <span class="oc-text-muted group-info-display-name" v-text="user.displayName"></span>
    </div>
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
        v-model="editUserRole"
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
      @confirm="$emit('confirm', { editUser, editUserRole })"
    ></compare-save-dialog>
  </div>
</template>
<script>
import * as EmailValidator from 'email-validator'
import CompareSaveDialog from '../../CompareSaveDialog.vue'

export default {
  name: 'EditPanel',
  components: {
    CompareSaveDialog
  },
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
    originalObjectUser() {
      return { user: { ...this.user, passwordProfile: { password: '' }, role: this.userRole } }
    },
    compareObjectUser() {
      return { user: { ...this.editUser, role: this.editUserRole } }
    },
    invalidFormData() {
      return Object.keys(this.formData)
        .map((k) => !!this.formData[k].valid)
        .includes(false)
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
    },

    revertChanges() {
      this.editUser = { ...this.user, ...{ passwordProfile: { password: '' } } }
      this.editUserRole = this.roles.find((role) => role.id === this.userRole.id)
      Object.keys(this.formData).forEach((formDataKey) => {
        this.formData[formDataKey].invalid = false
        this.formData[formDataKey].errorMessage = ''
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
.user-info {
  align-items: center;
  flex-direction: column;
}
.user-info-display-name {
  font-size: 1.5rem;
}
</style>
