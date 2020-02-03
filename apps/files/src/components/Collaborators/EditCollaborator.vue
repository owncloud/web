<template>
  <div class="files-collaborators-collaborator-edit-dialog">
    <div v-if="user.id !== collaborator.info.uid_owner" class="uk-text-meta uk-flex uk-flex-middle uk-margin-small-bottom"><oc-icon name="repeat" class="uk-margin-small-right" /> {{ collaborator.info.displayname_owner }}</div>
    <div class="uk-flex uk-flex-wrap uk-flex-middle">
      <collaborator class="uk-width-expand" :collaborator="collaborator" />
    </div>
    <hr class="divider" />
    <collaborators-edit-options
      :existingRole="collaborator.role"
      :collaboratorsPermissions="collaboratorsPermissions"
      @optionChange="collaboratorOptionChanged"
      class="uk-margin-bottom"
    />
    <hr class="divider" />
    <oc-grid gutter="small" class="uk-margin-bottom">
      <div>
        <oc-button class="files-collaborators-collaborator-cancel" :disabled="collaboratorSaving" @click="$_ocCollaborators_cancelChanges">
          <translate>Cancel</translate>
        </oc-button>
        <oc-button variation="primary" :disabled="collaboratorSaving || !editing" :aria-label="_saveButtonLabel" @click="$_ocCollaborators_saveChanges(collaborator)">
          <translate>Save</translate>
        </oc-button>
      </div>
    </oc-grid>
    <oc-spinner v-if="collaboratorSaving" class="uk-margin-small-left" :aria-label="$gettext('Saving')"/>
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
  props: ['collaborator'],
  data () {
    return {
      editing: false,
      selectedNewRole: null,
      additionalPermissions: null,
      permissionsChanged: false
    }
  },
  computed: {
    ...mapGetters('Files', ['highlightedFile', 'collaboratorSaving', 'collaboratorsEditInProgress']),
    ...mapGetters(['user']),

    _saveButtonLabel () {
      return this.$gettext('Save Share')
    },

    originalRole () {
      return this.roles[this.collaborator.role].tag
    },

    collaboratorsPermissions () {
      const permissions = this.collaborator.customPermissions

      return filterObject(permissions, (key, value) => value)
    }
  },
  methods: {
    ...mapActions('Files', ['changeShare', 'toggleCollaboratorsEdit']),

    close () {
      this.$emit('close')
    },

    $_ocCollaborators_saveChanges (collaborator) {
      if (!this.selectedRole) this.selectedRole = this.roles[collaborator.role.name]
      let permissions = this.additionalPermissions

      if (!permissions) {
        permissions = []
        for (const permission in this.collaboratorsPermissions) {
          permissions.push(permission)
        }
      }

      const bitmask = roleToBitmask(this.selectedRole, permissions, this.highlightedFile.type === 'folder')

      this.changeShare({
        client: this.$client,
        share: collaborator,
        // TODO: After changing to tabs view, this can be dropped
        // Map bitmask to role to get the correct role in case the advanced role was mapped to existing role
        role: bitmaskToRole(bitmask, this.highlightedFile.type === 'folder'),
        permissions: bitmask
      })
        .then(() => {
          this.editing = false
          this.toggleCollaboratorsEdit(false)
          this.close()
        })
    },
    $_ocCollaborators_changeRole (role) {
      this.selectedNewRole = role
    },
    $_ocCollaborators_selectedRoleName (collaborator) {
      if (!this.selectedNewRole) {
        return this.roles[collaborator.role].name
      }

      return this.selectedNewRole.name
    },
    $_ocCollaborators_selectedRoleDescription (collaborator) {
      if (!this.selectedNewRole) {
        return this.roles[collaborator.role].description
      }

      return this.selectedNewRole.description
    },
    $_ocCollaborators_cancelChanges () {
      this.selectedNewRole = null
      this.editing = false
      this.toggleCollaboratorsEdit(false)
      this.close()
    },

    onChange () {
      // TODO: Bring this back
      // if (this.selectedRole.name === this.originalRole.name && !this.permissionsChanged) {
      //   this.editing = false
      //   this.toggleCollaboratorsEdit(false)
      //   return
      // }

      this.editing = true
      this.toggleCollaboratorsEdit(true)
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
