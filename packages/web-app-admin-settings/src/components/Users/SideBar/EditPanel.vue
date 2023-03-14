<template>
  <div id="user-edit-panel" class="oc-mt-xl">
    <UserInfoBox :user="user" />
    <form id="user-edit-form" class="oc-background-highlight oc-p-m" autocomplete="off">
      <div>
        <oc-text-input
          id="userName-input"
          v-model="editUser.onPremisesSamAccountName"
          class="oc-mb-s"
          :label="$gettext('User name')"
          :error-message="formData.userName.errorMessage"
          :fix-message-line="true"
          @update:model-value="validateUserName"
        />
        <oc-text-input
          id="displayName-input"
          v-model="editUser.displayName"
          class="oc-mb-s"
          :label="$gettext('First and last name')"
          :error-message="formData.displayName.errorMessage"
          :fix-message-line="true"
          @update:model-value="validateDisplayName"
        />
        <oc-text-input
          id="email-input"
          v-model="editUser.mail"
          class="oc-mb-s"
          :label="$gettext('Email')"
          :error-message="formData.email.errorMessage"
          type="email"
          :fix-message-line="true"
          @change="validateEmail"
        />
        <oc-text-input
          id="password-input"
          :model-value="editUser.passwordProfile?.password"
          class="oc-mb-s"
          :label="$gettext('Password')"
          type="password"
          :fix-message-line="true"
          placeholder="●●●●●●●●"
          @update:model-value="onUpdatePassword"
        />
        <div class="oc-mb-s">
          <oc-select
            id="role-input"
            :model-value="editUser"
            :label="$gettext('Role')"
            option-label="displayName"
            :options="translatedRoleOptions"
            :clearable="false"
            @update:model-value="onUpdateRole"
          >
            <template #selected-option>
              {{ selectedRoleName }}
            </template>
          </oc-select>
          <div class="oc-text-input-message"></div>
        </div>
        <div class="oc-mb-s">
          <oc-select
            id="login-input"
            :disabled="isLoginInputDisabled"
            :model-value="editUser"
            :label="$gettext('Login')"
            :options="loginOptions"
            :clearable="false"
            @update:model-value="onUpdateLogin"
          >
            <template #selected-option>
              {{ selectedLoginLabel }}
            </template>
          </oc-select>
          <div class="oc-text-input-message"></div>
        </div>
        <quota-select
          v-if="showQuota"
          id="quota-select-form"
          :key="'quota-select-' + _user.id"
          class="oc-mb-s"
          :title="$gettext('Personal quota')"
          :total-quota="editUser.drive.quota.total || 0"
          :max-quota="maxQuota"
          @selected-option-change="changeSelectedQuotaOption"
        />
        <p
          v-else
          class="oc-mb-m oc-mt-rm oc-text-meta"
          v-text="$gettext('To set an individual quota, the user needs to have logged in once.')"
        />
        <group-select
          class="oc-mb-s"
          :selected-groups="editUser.memberOf"
          :group-options="groupOptions"
          @selected-option-change="changeSelectedGroupOption"
        />
      </div>
      <compare-save-dialog
        class="edit-compare-save-dialog oc-mb-l"
        :original-object="compareSaveDialogOriginalObject"
        :compare-object="editUser"
        :confirm-button-disabled="invalidFormData"
        @revert="revertChanges"
        @confirm="$emit('confirm', { user, editUser })"
      ></compare-save-dialog>
    </form>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, PropType, ref, unref } from 'vue'
import * as EmailValidator from 'email-validator'
import UserInfoBox from './UserInfoBox.vue'
import CompareSaveDialog from 'web-pkg/src/components/sideBar/CompareSaveDialog.vue'
import GroupSelect from '../GroupSelect.vue'
import QuotaSelect from 'web-pkg/src/components/QuotaSelect.vue'
import { cloneDeep } from 'lodash-es'
import { Group, User } from 'web-client/src/generated'
import { MaybeRef, useGraphClient, useStore } from 'web-pkg'
import { useCapabilitySpacesMaxQuota } from 'web-pkg/src/composables'

export default defineComponent({
  name: 'EditPanel',
  components: {
    UserInfoBox,
    CompareSaveDialog,
    QuotaSelect,
    GroupSelect
  },
  props: {
    user: {
      type: Object as PropType<User>,
      required: false,
      default: null
    },
    roles: {
      type: Array,
      required: true
    },
    groups: {
      type: Array as PropType<Group[]>,
      required: true
    }
  },
  emits: ['confirm'],
  setup(props) {
    const store = useStore()
    const currentUser = store.getters.user
    const editUser: MaybeRef<User> = ref({})
    const formData = ref({
      displayName: {
        errorMessage: '',
        valid: true
      },
      userName: {
        errorMessage: '',
        valid: true
      },
      email: {
        errorMessage: '',
        valid: true
      }
    })
    const groupOptions = computed(() => {
      const { memberOf: selectedGroups } = unref(editUser)
      return props.groups.filter((g) => !selectedGroups.some((s) => s.id === g.id))
    })

    const isLoginInputDisabled = computed(() => currentUser.uuid === (props.user as User).id)

    return {
      maxQuota: useCapabilitySpacesMaxQuota(),
      isLoginInputDisabled,
      editUser,
      formData,
      groupOptions,
      ...useGraphClient(),
      // HACK: make sure _user has a proper type
      _user: computed(() => props.user as User)
    }
  },
  computed: {
    loginOptions() {
      return [
        {
          label: this.$gettext('Allowed'),
          value: true
        },
        {
          label: this.$gettext('Forbidden'),
          value: false
        }
      ]
    },
    selectedLoginLabel() {
      return this.editUser.accountEnabled === false
        ? this.$gettext('Forbidden')
        : this.$gettext('Allowed')
    },
    translatedRoleOptions() {
      return this.roles.map((role) => {
        return { ...role, displayName: this.$gettext(role.displayName) }
      })
    },
    invalidFormData() {
      return Object.values(this.formData)
        .map((v: any) => !!v.valid)
        .includes(false)
    },
    showQuota() {
      return this.editUser.drive?.quota
    },
    compareSaveDialogOriginalObject() {
      return cloneDeep(this.user)
    },
    selectedRoleName() {
      const assignedRole = this.editUser.appRoleAssignments[0]
      return this.$gettext(
        this.roles.find((role) => role.id === assignedRole?.appRoleId)?.displayName || ''
      )
    }
  },
  watch: {
    user: {
      handler: function () {
        this.editUser = cloneDeep(this.user)
      },
      deep: true,
      immediate: true
    },
    editUser: {
      handler: function () {
        /**
         * Property accountEnabled won't be always set, but this still means, that login is allowed.
         * So we actually don't need to change the property if missing and not set to forbidden in the UI.
         * This also avoids the compare save dialog from displaying that there are unsaved changes.
         */
        if (this.editUser.accountEnabled === true && this.user.accountEnabled !== false) {
          delete this.editUser.accountEnabled
        }
      },
      deep: true
    }
  },
  methods: {
    changeSelectedQuotaOption(option) {
      this.editUser.drive.quota.total = option.value
    },
    changeSelectedGroupOption(option: Group[]) {
      this.editUser.memberOf = option
    },
    async validateUserName() {
      this.formData.userName.valid = false

      if (this.editUser.onPremisesSamAccountName.trim() === '') {
        this.formData.userName.errorMessage = this.$gettext('User name cannot be empty')
        return false
      }

      if (this.editUser.onPremisesSamAccountName.includes(' ')) {
        this.formData.userName.errorMessage = this.$gettext('User name cannot contain white spaces')
        return false
      }

      if (
        this.editUser.onPremisesSamAccountName.length &&
        !isNaN(this.editUser.onPremisesSamAccountName[0])
      ) {
        this.formData.userName.errorMessage = this.$gettext('User name cannot start with a number')
        return false
      }

      if (this.user.onPremisesSamAccountName !== this.editUser.onPremisesSamAccountName) {
        try {
          await this.graphClient.users.getUser(this.editUser.onPremisesSamAccountName)
          this.formData.userName.errorMessage = this.$gettext('User "%{userName}" already exists', {
            userName: this.editUser.onPremisesSamAccountName
          })
          return false
        } catch (e) {
          /**
           * If the backend throws an error, the user doesn't exist and everything is alright
           */
        }
      }

      this.formData.userName.errorMessage = ''
      this.formData.userName.valid = true
      return true
    },
    validateDisplayName() {
      this.formData.displayName.valid = false

      if (this.editUser.displayName.trim() === '') {
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

      if (!EmailValidator.validate(this.editUser.mail)) {
        this.formData.email.errorMessage = this.$gettext('Please enter a valid email')
        return false
      }

      this.formData.email.errorMessage = ''
      this.formData.email.valid = true
      return true
    },
    revertChanges() {
      this.editUser = cloneDeep(this.user)
      Object.values(this.formData).forEach((formDataValue: any) => {
        formDataValue.valid = true
        formDataValue.errorMessage = ''
      })
    },
    onUpdateRole(role) {
      if (!this.editUser.appRoleAssignments.length) {
        this.editUser.appRoleAssignments.push({ appRoleId: role.id, displayName: role.displayName })
        return
      }
      this.editUser.appRoleAssignments[0].appRoleId = role.id
    },
    onUpdatePassword(password) {
      this.editUser.passwordProfile = {
        password
      }
    },
    onUpdateLogin({ value }) {
      this.editUser.accountEnabled = value
    }
  }
})
</script>

<style lang="scss">
#user-edit-panel {
  #user-edit-form {
    border-radius: 5px;
  }
}
</style>
