<template>
  <div class="files-collaborators-collaborator-edit-dialog">
    <div v-if="user.id !== collaborator.owner.name" class="uk-text-meta uk-flex uk-flex-middle uk-margin-small-bottom"><oc-icon name="repeat" class="uk-margin-small-right" /> {{ collaborator.owner.displayName }}</div>
    <collaborator class="uk-width-expand" :collaborator="collaborator" :first-column="false" />
    <collaborators-edit-options
      :existingRole="$_originalRole"
      :collaboratorsPermissions="$_originalPermissions"
      :expirationDate="originalExpirationDate"
      :existingCollaboratorType="collaboratorType"
      @optionChange="collaboratorOptionChanged"
      class="uk-margin-bottom"
    />
    <hr class="divider" />
    <oc-grid gutter="small" class="uk-margin-bottom">
      <div>
        <oc-button :disabled="saving" @click="$_ocCollaborators_cancelChanges" class="files-collaborators-collaborator-cancel" key="edit-collaborator-cancel-button">
          <translate>Cancel</translate>
        </oc-button>
        <oc-button :disabled="true" key="edit-collaborator-saving-button" v-if="saving">
          <oc-spinner :aria-label="$gettext('Saving Share')" class="uk-position-small uk-position-center-left" size="xsmall"/>
          <span :aria-hidden="true" class="uk-margin-small-left" v-translate>Saving Share</span>
        </oc-button>
        <oc-button :aria-label="$gettext('Save Share')" :disabled="!$_hasChanges" @click="$_ocCollaborators_saveChanges" id="files-collaborators-collaborator-save-share-button"
                   key="edit-collaborator-saving-button" v-else
                   variation="primary">
          <translate>Save Share</translate>
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
  mixins: [
    Mixins
  ],
  props: {
    collaborator: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      selectedRole: null,
      additionalPermissions: null,
      saving: false,
      expirationDate: null
    }
  },
  computed: {
    ...mapGetters('Files', ['highlightedFile']),
    ...mapGetters(['user']),

    collaboratorType () {
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

    $_originalPermissions () {
      const permissions = this.collaborator.customPermissions
      return filterObject(permissions, (key, value) => value)
    },

    $_originalRole () {
      return this.roles[this.collaborator.role.name]
    },

    $_permissionsBitmask () {
      const role = this.selectedRole || this.$_originalRole
      const permissions = this.additionalPermissions || Object.keys(this.$_originalPermissions)
      return roleToBitmask(role, permissions)
    },

    $_hasChanges () {
      if (this.selectedRole !== null && this.selectedRole.name !== this.$_originalRole.name) {
        // if the role has changed, always return true. The user doesn't need to understand if two bitmasks of different roles are the same!
        return true
      }

      // FIXME: Datepicker is not displaying correct timezone so for now we add it manually
      const originalExpirationDate = this.originalExpirationDate
        ? moment(this.originalExpirationDate).add(moment().utcOffset(), 'm').toISOString()
        : null

      if (this.expirationDate !== originalExpirationDate) {
        return true
      }

      const originalBitmask = roleToBitmask(this.$_originalRole, Object.keys(this.$_originalPermissions))
      return originalBitmask !== this.$_permissionsBitmask
    },

    originalExpirationDate () {
      const expirationDate = this.collaborator.expires

      if (expirationDate) {
        return expirationDate
      }

      return null
    }
  },
  methods: {
    ...mapActions('Files', ['changeShare']),

    $_ocCollaborators_saveChanges () {
      this.saving = true

      if (!this.selectedRole) this.selectedRole = this.$_originalRole
      const bitmask = this.$_permissionsBitmask

      this.changeShare({
        client: this.$client,
        share: this.collaborator,
        // Map bitmask to role to get the correct role in case the advanced role was mapped to existing role
        role: bitmaskToRole(bitmask, this.highlightedFile.type === 'folder'),
        permissions: bitmask,
        expirationDate: this.expirationDate
      })
        .then(() => this.$_ocCollaborators_cancelChanges())
        .catch((errors) => {
          this.saving = false
        })
    },

    $_ocCollaborators_cancelChanges () {
      this.selectedRole = null
      this.additionalPermissions = null
      this.expirationDate = this.originalExpirationDate
      this.saving = false
      this.close()
    },

    close () {
      this.$emit('close')
    }
  }
}
</script>

<style>
  .oc-text {
    font-size: 1rem;
  }

  .oc-disabled {
    opacity: .4;
  }
</style>
