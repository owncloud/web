<template>
  <div class="files-collaborators-collaborator-edit-dialog">
    <div v-if="user.id !== collaborator.info.uid_owner" class="uk-text-meta uk-flex uk-flex-middle uk-margin-small-bottom"><oc-icon name="repeat" class="uk-margin-small-right" /> {{ collaborator.info.displayname_owner }}</div>
    <div class="uk-flex uk-flex-wrap uk-flex-middle">
      <collaborator class="uk-width-expand" :collaborator="collaborator" />
    </div>
    <hr class="divider" />
    <collaborators-edit-options
      :existingRole="$_originalRole"
      :collaboratorsPermissions="$_originalPermissions"
      @optionChange="collaboratorOptionChanged"
      class="uk-margin-bottom"
    />
    <hr class="divider" />
    <oc-grid gutter="small" class="uk-margin-bottom">
      <div>
        <oc-button class="files-collaborators-collaborator-cancel" :disabled="saving" @click="$_ocCollaborators_cancelChanges">
          <translate>Cancel</translate>
        </oc-button>
        <oc-button v-if="saving" :disabled="true">
          <oc-spinner :aria-label="$gettext('Saving Share')" class="uk-position-small uk-position-center-left" size="xsmall"/>
          <span :aria-hidden="true" class="uk-margin-small-left" v-translate>Saving Share</span>
        </oc-button>
        <oc-button v-else variation="primary" :disabled="!$_hasChanges" :aria-label="$gettext('Save Share')" @click="$_ocCollaborators_saveChanges">
          <translate>Save Share</translate>
        </oc-button>
      </div>
    </oc-grid>
  </div>
</template>

<script>
import filterObject from 'filter-obj'
import { mapGetters, mapActions } from 'vuex'
import { roleToBitmask, bitmaskToRole } from '../../helpers/collaborators'
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
      saving: false
    }
  },
  computed: {
    ...mapGetters('Files', ['highlightedFile']),
    ...mapGetters(['user']),

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
      const originalBitmask = roleToBitmask(this.$_originalRole, Object.keys(this.$_originalPermissions))
      return originalBitmask !== this.$_permissionsBitmask
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
        permissions: bitmask
      })
        .then(() => this.$_ocCollaborators_cancelChanges())
        .catch(() => {
          this.saving = false
        })
    },

    $_ocCollaborators_cancelChanges () {
      this.selectedRole = null
      this.additionalPermissions = null
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
