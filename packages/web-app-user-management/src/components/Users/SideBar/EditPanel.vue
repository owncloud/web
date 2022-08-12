<template>
  <div class="oc-mt-xl">
    <UserInfoBox :user="user" />
    <div class="oc-background-highlight oc-p-m">
      <div>
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
        <div class="oc-mb-s">
          <oc-select
            v-model="editUser.role"
            :label="$gettext('Role')"
            option-label="displayName"
            :options="roles"
            :clearable="false"
          />
          <div class="oc-text-input-message"></div>
        </div>
        <quota-select
          v-if="showQuota"
          :title="$gettext('Personal quota')"
          :total-quota="editUser.drive.quota.total || 0"
          @selectedOptionChange="changeSelectedQuotaOption"
        />
        <p v-else v-translate class="oc-m-rm">
          To set an individual quota, the user needs to have logged in once.
        </p>
      </div>
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
import CompareSaveDialog from 'web-pkg/src/components/sidebar/CompareSaveDialog.vue'
import QuotaSelect from 'web-pkg/src/components/QuotaSelect.vue'
import { cloneDeep } from 'lodash-es'

export default {
  name: 'EditPanel',
  components: {
    UserInfoBox,
    CompareSaveDialog,
    QuotaSelect
  },
  props: {
    user: {
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
    userRole() {
      return this.user ? this.userRoles[this.user.id] : null
    },

    originalObjectUser() {
      return { ...this.user, passwordProfile: { password: '' } }
    },
    compareObjectUser() {
      return { ...this.editUser }
    },
    invalidFormData() {
      return Object.values(this.formData)
        .map((v) => !!v.valid)
        .includes(false)
    },
    showQuota() {
      return this.editUser.drive
    }
  },
  watch: {
    user: {
      handler: function () {
        this.editUser = { ...cloneDeep(this.user), ...{ passwordProfile: { password: '' } } }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    changeSelectedQuotaOption(option) {
      this.editUser.drive.quota.total = option.value
    },

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
      this.editUser = { ...cloneDeep(this.user), ...{ passwordProfile: { password: '' } } }
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
