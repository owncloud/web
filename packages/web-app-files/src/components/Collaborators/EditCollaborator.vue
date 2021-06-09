<template>
  <div class="files-collaborators-collaborator-edit-dialog">
    <h4
      id="collaborator-edit-hint"
      tabindex="-1"
      class="oc-invisible-sr"
      v-text="editCollaboratorHint"
    />
    <transition
      enter-active-class="uk-animation-slide-top-small"
      leave-active-class="uk-animation-slide-top-small uk-animation-reverse"
      name="custom-classes-transition"
    >
      <oc-alert
        v-if="errors"
        class="oc-files-collaborators-collaborator-error-alert"
        variation="danger"
      >
        {{ errors }}
      </oc-alert>
    </transition>
    <p
      v-if="user.id !== collaborator.owner.name"
      class="oc-text-muted uk-flex uk-flex-middle oc-mb-s"
    >
      <oc-icon name="repeat" class="oc-mr-s" /> {{ collaborator.owner.displayName }}
    </p>
    <collaborator class="uk-width-expand" :collaborator="collaborator" :first-column="false" />
    <collaborators-edit-options
      :existing-role="$_originalRole"
      :collaborators-permissions="$_originalPermissions"
      :expiration-date="originalExpirationDate"
      :existing-collaborator-type="collaboratorType"
      class="oc-mb"
      @optionChange="collaboratorOptionChanged"
    />
    <hr class="divider" />
    <oc-grid gutter="small" class="oc-mb">
      <div>
        <oc-button
          key="edit-collaborator-cancel-button"
          :disabled="saving"
          class="files-collaborators-collaborator-cancel"
          @click="$_ocCollaborators_cancelChanges"
        >
          <translate>Cancel</translate>
        </oc-button>
      </div>
      <div>
        <oc-button v-if="saving" key="edit-collaborator-saving-button" :disabled="true">
          <oc-spinner :aria-label="$gettext('Saving Share')" size="small" />
          <span v-translate :aria-hidden="true">Saving Share</span>
        </oc-button>
        <oc-button
          v-else
          id="files-collaborators-collaborator-save-share-button"
          key="edit-collaborator-saving-button"
          :aria-label="$gettext('Save Share')"
          :disabled="!$_hasChanges"
          variation="primary"
          @click="$_ocCollaborators_saveChanges"
        >
          <translate>Save</translate>
        </oc-button>
      </div>
    </oc-grid>
  </div>
</template>

<script>
import filterObject from 'filter-obj'
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment'
import { roleToBitmask, bitmaskToRole } from '../../helpers/collaborators'
import { shareTypes } from '../../helpers/shareTypes'
import Collaborator from './Collaborator.vue'
import CollaboratorsEditOptions from './CollaboratorsEditOptions.vue'
import Mixins from '../../mixins/collaborators'

export default {
  name: 'EditCollaborator',
  components: {
    Collaborator,
    CollaboratorsEditOptions
  },
  mixins: [Mixins],
  props: {
    collaborator: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      selectedRole: null,
      additionalPermissions: null,
      saving: false,
      expirationDate: null,
      errors: false
    }
  },
  computed: {
    ...mapGetters('Files', ['highlightedFile']),
    ...mapGetters(['user', 'isOcis']),

    collaboratorType() {
      const collaboratorShareType = this.collaborator.shareType

      if (
        collaboratorShareType === shareTypes.user ||
        collaboratorShareType === shareTypes.guest ||
        collaboratorShareType === shareTypes.remote
      ) {
        return 'user'
      }

      if (collaboratorShareType === shareTypes.group) {
        return 'group'
      }

      return null
    },

    editCollaboratorHint() {
      const translated = this.$gettext('Editing share with %{ currentCollaborator }')
      return this.$gettextInterpolate(
        translated,
        { currentCollaborator: this.collaborator.collaborator.displayName },
        true
      )
    },

    $_originalPermissions() {
      const permissions = this.collaborator.customPermissions
      return filterObject(permissions, (key, value) => value)
    },

    $_originalRole() {
      return this.roles.find(r => r.name === this.collaborator.role.name)
    },

    $_permissionsBitmask() {
      const role = this.selectedRole || this.$_originalRole
      const permissions = this.additionalPermissions || Object.keys(this.$_originalPermissions)
      return roleToBitmask(role, permissions)
    },

    $_hasChanges() {
      if (this.selectedRole !== null && this.selectedRole.name !== this.$_originalRole.name) {
        // if the role has changed, always return true. The user doesn't need to understand if two bitmasks of different roles are the same!
        return true
      }

      // FIXME: Datepicker is not displaying correct timezone so for now we add it manually
      const originalExpirationDate = this.originalExpirationDate
        ? moment(this.originalExpirationDate)
            .add(moment().utcOffset(), 'm')
            .toISOString()
        : null

      if (this.expirationDate !== originalExpirationDate) {
        return true
      }

      const originalBitmask = roleToBitmask(
        this.$_originalRole,
        Object.keys(this.$_originalPermissions)
      )
      return originalBitmask !== this.$_permissionsBitmask
    },

    originalExpirationDate() {
      const expirationDate = this.collaborator.expires

      if (expirationDate) {
        return expirationDate
      }

      return null
    }
  },
  methods: {
    ...mapActions('Files', ['changeShare']),

    $_ocCollaborators_saveChanges() {
      this.saving = true

      if (!this.selectedRole) this.selectedRole = this.$_originalRole
      const bitmask = this.$_permissionsBitmask

      this.changeShare({
        client: this.$client,
        share: this.collaborator,
        // Map bitmask to role to get the correct role in case the advanced role was mapped to existing role
        role: bitmaskToRole(bitmask, this.highlightedFile.type === 'folder', !this.isOcis),
        permissions: bitmask,
        expirationDate: this.expirationDate
      })
        .then(() => this.$_ocCollaborators_cancelChanges())
        .catch(errors => {
          this.errors = errors
          this.saving = false
        })
    },

    $_ocCollaborators_cancelChanges() {
      this.selectedRole = null
      this.additionalPermissions = null
      this.expirationDate = this.originalExpirationDate
      this.errors = false
      this.saving = false
      this.close()
    },

    close() {
      this.$emit('close')
    }
  }
}
</script>
