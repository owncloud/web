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
          <span class="oc-text">{{ roles[collaborator.role].name }}<template v-if="collaborator.expires"> | <translate :translate-params="{expires: formDateFromNow(collaborator.expires)}">Expires: %{expires}</translate></template></span>
          <span class="uk-text-meta">{{ $_ocCollaborators_collaboratorType(collaborator.info.share_type) }}</span>
        </div>
      </div>
    </template>
    <template slot="content">
      <oc-grid gutter="small" class="uk-margin-bottom">
        <div class="uk-width-1-1">
          <label class="oc-label"><translate>Role</translate></label>
          <oc-button :id="`files-collaborators-role-button-${collaborator.info.id}`" class="uk-width-1-1 files-collaborators-role-button">{{ $_ocCollaborators_selectedRoleName(collaborator) }}</oc-button>
          <p class="uk-text-meta uk-margin-remove">{{ $_ocCollaborators_selectedRoleDescription(collaborator) }}</p>
          <oc-drop :dropId="`files-collaborators-roles-dropdown-${collaborator.info.id}`" closeOnClick :toggle="`#files-collaborators-role-button-${collaborator.info.id}`" mode="click" :options="{ offset: 0, delayHide: 0 }" class="oc-autocomplete-dropdown">
            <ul class="oc-autocomplete-suggestion-list">
              <li v-for="(role, key) in roles" :key="key" class="oc-autocomplete-suggestion" :class="{ 'oc-autocomplete-suggestion-selected' : (roles[collaborator.role] === role.tag && !selectedNewRole) || selectedNewRole === role }" @click="$_ocCollaborators_changeRole(role, collaborator)">
                <span class="uk-text-bold">{{ role.name }}</span>
                <p class="uk-text-meta uk-margin-remove">{{ role.description }}</p>
              </li>
            </ul>
          </oc-drop>
        </div>
        <div v-if="false" class="uk-width-1-1">
          <label class="oc-label"><translate>Expiration date</translate> <translate class="uk-text-meta uk-remove-margin">(optional)</translate></label>
          <oc-text-input type="date" class="uk-width-1-1 oc-button-role">04 - 07 - 2019</oc-text-input>
        </div>
        <oc-grid gutter="small">
          <div class="uk-flex uk-flex-row uk-flex-wrap uk-flex-middle">
            <oc-switch :key="switchKey" class="uk-margin-small-right" :model="canShare" @change="$_ocCollaborators_switchPermission('canShare')" /> <translate :class="{ 'uk-text-muted': !canShare }">Can share</translate>
          </div>
          <template v-if="(collaborator.role === 'custom' && !selectedNewRole) || (selectedNewRole && selectedNewRole.tag === 'custom')">
            <div class="uk-flex uk-flex-row uk-flex-wrap uk-flex-middle">
              <oc-switch :key="switchKey" class="uk-margin-small-right" :model="canChange" @change="$_ocCollaborators_switchPermission('canChange')" /> <translate :class="{ 'uk-text-muted': !canChange }">Can change</translate>
            </div>
            <div v-if="highlightedFile.type === 'folder'" class="uk-flex uk-flex-row uk-flex-wrap uk-flex-middle">
              <oc-switch :key="switchKey" class="uk-margin-small-right" :model="canCreate" @change="$_ocCollaborators_switchPermission('canCreate')" /> <translate :class="{ 'uk-text-muted': !canCreate }">Can create</translate>
            </div>
            <div v-if="highlightedFile.type === 'folder'" class="uk-flex uk-flex-row uk-flex-wrap uk-flex-middle">
              <oc-switch :key="switchKey" class="uk-margin-small-right" :model="canDelete" @change="$_ocCollaborators_switchPermission('canDelete')" /> <translate :class="{ 'uk-text-muted': !canDelete }">Can delete</translate>
            </div>
          </template>
        </oc-grid>
      </oc-grid>
      <template v-if="editing">
        <oc-button :disabled="collaboratorSaving" @click="$_ocCollaborators_cancelChanges(collaborator)">
          <translate>Cancel</translate>
        </oc-button>
        <oc-button variation="primary" :disabled="collaboratorSaving" @click="$_ocCollaborators_saveChanges(collaborator)">
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
import Mixins from './mixins'

export default {
  name: 'Collaborator',
  props: ['collaborator'],
  mixins: [
    Mixins
  ],
  data () {
    return {
      avatar: '',
      loading: false,
      editing: false,
      canShare: this.collaborator.canShare,
      canChange: this.collaborator.customPermissions.change,
      canCreate: this.collaborator.customPermissions.create,
      canDelete: this.collaborator.customPermissions.delete,
      selectedNewRole: null,
      switchKey: Math.floor(Math.random() * 100) // Ensure switch gets back to orginal position after cancel
    }
  },
  computed: {
    ...mapGetters('Files', ['highlightedFile', 'collaboratorSaving', 'collaboratorsEditInProgress']),
    ...mapGetters(['user']),

    _deleteButtonLabel () {
      return this.$gettext('Delete Share')
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
    },
    $_ocCollaborators_saveChanges (collaborator) {
      if (!this.selectedNewRole) this.selectedNewRole = this.roles[collaborator.role]
      this.changeShare({
        client: this.$client,
        share: collaborator,
        canShare: this.canShare,
        canChange: this.canChange,
        canCreate: this.canCreate,
        canDelete: this.canDelete,
        role: this.selectedNewRole.tag
      })
        .then(() => {
          this.editing = false
          this.toggleCollaboratorsEdit(false)
        })
    },
    $_ocCollaborators_changeRole (role) {
      this.selectedNewRole = role
      this.editing = true
      this.toggleCollaboratorsEdit(true)
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
    $_ocCollaborators_cancelChanges (collaborator) {
      this.selectedNewRole = null
      this.canShare = collaborator.canShare
      this.canChange = collaborator.customPermissions.change
      this.canCreate = collaborator.customPermissions.create
      this.canDelete = collaborator.customPermissions.delete
      this.editing = false
      this.switchKey = Math.floor(Math.random() * 100)
      this.toggleCollaboratorsEdit(false)
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
