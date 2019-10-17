<template>
  <oc-accordion-item class="files-collaborators-collaborator uk-margin-small-bottom" :class="{ 'oc-disabled uk-disabled' : collaboratorsEditInProgress && !editing }">
    <template slot="title">
      <div v-if="user.id !== collaborator.info.uid_owner" class="uk-text-meta uk-flex uk-flex-middle uk-margin-small-bottom"><oc-icon name="repeat" class="uk-margin-small-right" /> {{ collaborator.info.displayname_owner }}</div>
      <div class="files-collaborators-collaborator-information uk-flex uk-flex-wrap uk-flex-middle">
        <oc-spinner v-if="loading" key="collaborator-avatar-spinner" uk-spinner="ratio:1.6" class="uk-margin-small-right" />
        <div v-else key="collaborator-avatar-loaded">
          <oc-avatar v-if="avatar" :src="avatar" class="uk-margin-small-right" width=50 height=50 />
          <div v-else key="collaborator-avatar-placeholder">
            <oc-icon v-if="collaborator.info.share_type === '1'" class="uk-margin-small-right" name="group" size="large" />
            <oc-icon v-else class="uk-margin-small-right" name="person" size="large" />
          </div>
        </div>
        <div class="uk-flex uk-flex-column uk-flex-center">
          <div class="oc-text">
            <span class="files-collaborators-collaborator-name uk-text-bold">{{ collaborator.displayName }}</span>
            <span v-if="parseInt(collaborator.info.share_type, 10) === 0 && collaborator.info.share_with_additional_info.length > 0" class="uk-text-meta">
              ({{ collaborator.info.share_with_additional_info }})
            </span>
          </div>
          <span class="oc-text">{{ originalRole.label }}<template v-if="collaborator.expires"> | <translate :translate-params="{expires: formDateFromNow(collaborator.expires)}">Expires: %{expires}</translate></template></span>
          <span class="uk-text-meta" v-text="$_ocCollaborators_collaboratorType(collaborator.info.share_type)" />
        </div>
      </div>
    </template>
    <template slot="content">
      <collaborators-edit-options
        :existingRole="collaborator.role"
        :collaboratorsPermissions="collaborator.customPermissions"
        @optionChange="collaboratorOptionChanged"
        class="uk-margin-bottom"
      />
      <template v-if="editing">
        <oc-button :disabled="collaboratorSaving" @click="$_ocCollaborators_cancelChanges">
          <translate>Cancel</translate>
        </oc-button>
        <oc-button variation="primary" :disabled="collaboratorSaving" :aria-label="_saveButtonLabel" @click="saveChanges(collaborator)">
          <translate>Save</translate>
        </oc-button>
      </template>
      <oc-button :disabled="collaboratorSaving" :aria-label="_deleteButtonLabel" name="delete" icon="delete" @click="onDelete(collaborator)" variation="danger" />
      <oc-spinner v-if="collaboratorSaving" class="uk-margin-small-left" />
    </template>
  </oc-accordion-item>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Mixins from '../../mixins/collaborators'
import { roleToBitmask } from '../../helpers/collaborators'

const CollaboratorsEditOptions = () => import('./CollaboratorsEditOptions.vue')

export default {
  name: 'Collaborator',
  components: {
    CollaboratorsEditOptions
  },
  props: ['collaborator'],
  mixins: [
    Mixins
  ],
  data () {
    return {
      avatar: '',
      loading: false,
      editing: false,
      permissionsChanged: false,
      selectedRole: null,
      additionalPermissions: null
    }
  },
  computed: {
    ...mapGetters('Files', ['highlightedFile', 'collaboratorSaving', 'collaboratorsEditInProgress']),
    ...mapGetters(['user']),

    _deleteButtonLabel () {
      return this.$gettext('Delete Share')
    },

    _saveButtonLabel () {
      return this.$gettext('Save Share')
    },

    originalRole () {
      if (this.collaborator.role.name === 'advancedRole') {
        return this.advancedRole
      }

      return this.roles[this.collaborator.role.name]
    }
  },
  mounted () {
    this.$_ocCollaborators_loadAvatar(this.collaborator)
  },
  methods: {
    ...mapActions('Files', ['deleteShare', 'changeShare', 'toggleCollaboratorsEdit']),

    onDelete (share) {
      this.deleteShare({
        client: this.$client,
        share: share
      })
      this.editing = false
      this.toggleCollaboratorsEdit(false)
    },
    saveChanges (collaborator) {
      if (!this.selectedRole) this.selectedRole = this.roles[collaborator.role.name]
      this.changeShare({
        client: this.$client,
        share: collaborator,
        role: this.selectedRole,
        permissions: roleToBitmask(this.selectedRole, this.additionalPermissions, this.highlightedFile.type === 'folder')
      })
        .then(() => {
          this.editing = false
          this.toggleCollaboratorsEdit(false)
        })
    },
    $_ocCollaborators_cancelChanges () {
      this.editing = false
      this.toggleCollaboratorsEdit(false)
    },

    onChange () {
      // TODO: Bring this back
      // if (this.selectedRole.name === this.originalRole.name && !this.permissionsChanged) {
      //   this.editing = false
      //   this.toggleCollaboratorsEdit(false)
      //   return
      // }

      this.toggleCollaboratorsEdit(true)
    },

    rolesDropItemClass (role) {
      if ((this.roles[this.collaborator.role].tag === role.tag && !this.selectedNewRole) || this.selectedNewRole === role) {
        return 'oc-autocomplete-suggestion-selected'
      }
    }
  }
}
</script>

<style>
  /* TODO: Move to ODS  */
  .oc-text {
    font-size: 1rem;
  }

  .oc-disabled {
    opacity: .4;
  }
</style>
