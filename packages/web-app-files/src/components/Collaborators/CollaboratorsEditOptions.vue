<template>
  <oc-grid gutter="small" child-width="1-1">
    <roles-select
      mode="collaborators"
      :roles="roles"
      :selected-role="role"
      @roleSelected="selectRole"
    />
    <template v-if="$_ocCollaborators_hasAdditionalPermissions">
      <label v-if="selectedRole.name !== 'advancedRole'" class="oc-label">
        <translate>Additional permissions:</translate>
      </label>
      <additional-permissions
        :available-permissions="role.additionalPermissions"
        :collaborators-permissions="collaboratorsPermissions"
        @permissionChecked="checkAdditionalPermissions"
      />
    </template>
    <div v-if="expirationSupported">
      <label for="files-collaborators-collaborator-expiration-input">
        <translate>Expiration date:</translate>
        <translate v-if="expirationDateEnforced" tag="em">(required)</translate>
      </label>
      <div class="uk-position-relative">
        <oc-datepicker
          id="files-collaborators-collaborator-expiration-input"
          :key="`collaborator-datepicker-${enteredExpirationDate}`"
          :date="enteredExpirationDate"
          :max-datetime="maxExpirationDate"
          :min-datetime="minExpirationDate"
          :placeholder="expirationDatePlaceholder"
          @input="setExpirationDate"
        />
        <div
          v-if="canResetExpirationDate"
          id="files-collaborators-collaborator-expiration-delete"
          class="uk-position-small uk-position-center-right oc-cursor-pointer"
          :uk-tooltip="expirationDateRemoveTooltip"
          uk-close
          @click="resetExpirationDate"
        />
      </div>
    </div>
  </oc-grid>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import collaboratorsMixins from '../../mixins/collaborators'

import RolesSelect from '../Roles/RolesSelect.vue'
import AdditionalPermissions from './AdditionalPermissions.vue'

export default {
  name: 'CollaboratorsEditOptions',

  components: {
    RolesSelect,
    AdditionalPermissions
  },

  mixins: [collaboratorsMixins],

  props: {
    existingRole: {
      type: Object,
      required: false,
      default: undefined
    },
    collaboratorsPermissions: {
      type: Object,
      required: false,
      default: undefined
    },
    expirationDate: {
      type: Date,
      required: false,
      default: undefined
    },
    existingCollaboratorType: {
      type: [Object, String],
      required: false,
      default: null,
      validator: function(value) {
        return ['user', 'group'].indexOf(value) > -1 || value === null
      }
    }
  },

  data() {
    return {
      selectedRole: null,
      additionalPermissions: null,
      enteredExpirationDate: null
    }
  },

  computed: {
    ...mapGetters(['capabilities']),

    editingUser() {
      return this.existingCollaboratorType === 'user'
    },

    editingGroup() {
      return this.existingCollaboratorType === 'group'
    },

    $_ocCollaborators_hasAdditionalPermissions() {
      return this.selectedRole && this.selectedRole.additionalPermissions
    },

    role() {
      // Returns default role
      if (!this.existingRole && !this.selectedRole) {
        const defaultRole = this.roles[Object.keys(this.roles)[0]]
        this.selectRole(defaultRole, false)
        return defaultRole
      }

      if (
        (this.existingRole && this.existingRole.name === 'advancedRole' && !this.selectedRole) ||
        (this.selectedRole && this.selectedRole.name === 'advancedRole')
      ) {
        this.selectRole(this.advancedRole, false)
        return this.advancedRole
      }

      if (this.existingRole && !this.selectedRole) {
        this.selectRole(this.existingRole, false)
        return this.existingRole
      }

      return this.selectedRole
    },

    expirationSupported() {
      return this.userExpirationDate && this.groupExpirationDate
    },

    defaultExpirationDateSet() {
      if (this.editingUser) {
        return this.userExpirationDate.enabled
      }

      if (this.editingGroup) {
        return this.groupExpirationDate.enabled
      }

      return this.userExpirationDate.enabled || this.groupExpirationDate.enabled
    },

    userExpirationDate() {
      return this.capabilities.files_sharing.user.expire_date
    },

    groupExpirationDate() {
      return this.capabilities.files_sharing.group.expire_date
    },

    defaultExpirationDate() {
      if (!this.defaultExpirationDateSet) {
        return null
      }

      const userMaxExpirationDays = parseInt(this.userExpirationDate.days, 10)
      const groupMaxExpirationDays = parseInt(this.groupExpirationDate.days, 10)

      if (this.editingUser) {
        return moment()
          .add(userMaxExpirationDays, 'days')
          .endOf('day')
          .toISOString()
      }

      if (this.editingGroup) {
        return moment()
          .add(groupMaxExpirationDays, 'days')
          .endOf('day')
          .toISOString()
      }

      // Since we are not separating process for adding users and groups as collaborators
      // we are using the one which is smaller as enforced date
      let days = 0

      if (userMaxExpirationDays && groupMaxExpirationDays) {
        days = Math.min(userMaxExpirationDays, groupMaxExpirationDays)
      } else {
        days = userMaxExpirationDays || groupMaxExpirationDays
      }

      return moment()
        .add(days, 'days')
        .endOf('day')
        .toISOString()
    },

    expirationDateEnforced() {
      if (this.editingUser) {
        return this.userExpirationDate.enforced
      }

      if (this.editingGroup) {
        return this.groupExpirationDate.enforced
      }

      return this.userExpirationDate.enforced || this.groupExpirationDate.enforced
    },

    maxExpirationDate() {
      if (!this.expirationDateEnforced) {
        return null
      }

      return this.defaultExpirationDate
    },

    minExpirationDate() {
      return moment()
        .add(1, 'days')
        .endOf('day')
        .toISOString()
    },

    expirationDatePlaceholder() {
      return this.$gettext('Expiration date')
    },

    expirationDateRemoveTooltip() {
      return this.$gettext('Remove expiration date')
    },

    canResetExpirationDate() {
      return !this.expirationDateEnforced && this.enteredExpirationDate
    }
  },

  mounted() {
    if (this.expirationSupported) {
      if (this.editingUser || this.editingGroup) {
        // FIXME: Datepicker is not displaying correct timezone so for now we add it manually
        // this.enteredExpirationDate = this.expirationDate ? moment(this.expirationDate).toISOString(true) : null
        this.enteredExpirationDate = this.expirationDate
          ? moment(this.expirationDate)
              .add(moment().utcOffset(), 'm')
              .toISOString()
          : null
      } else {
        this.enteredExpirationDate = this.defaultExpirationDate
      }
    }
  },

  methods: {
    selectRole(role) {
      this.selectedRole = role
      this.publishChange()
    },

    checkAdditionalPermissions(permissions) {
      this.additionalPermissions = permissions
      this.publishChange()
    },

    setExpirationDate(date) {
      // Expiration date picker is emitting empty string when the component is initialised
      // This ensures it will be null as we treat it everywhere in that way
      this.enteredExpirationDate = date === '' ? null : date
      this.publishChange()
    },

    resetExpirationDate() {
      this.enteredExpirationDate = null
      this.publishChange()
    },

    publishChange() {
      this.$emit('optionChange', {
        role: this.selectedRole,
        permissions: this.additionalPermissions,
        expirationDate: this.enteredExpirationDate
      })
    }
  }
}
</script>
