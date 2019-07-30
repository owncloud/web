<template>
  <oc-accordion-item :key="collaborator.info.id" class="files-collaborators-collaborator uk-margin-small-bottom">
    <template slot="title">
      <div v-if="user.id !== collaborator.info.uid_owner" class="uk-text-meta uk-flex uk-flex-middle uk-margin-small-bottom"><oc-icon name="repeat" class="uk-margin-small-right" /> {{ collaborator.info.displayname_owner }}</div>
      <div class="files-collaborators-collaborator-information uk-flex uk-flex-wrap uk-flex-middle">
        <oc-avatar :src="collaborator.avatar" class="uk-margin-small-right" />
        <div class="uk-flex uk-flex-column uk-flex-center">
          <div class="oc-text"><span class="files-collaborators-collaborator-name uk-text-bold">{{ collaborator.displayName }}</span><span v-if="collaborator.additionalInfo" class="uk-text-meta"> ({{ collaborator.additionalInfo }})</span></div>
          <div class="oc-text">{{ roles[collaborator.role].name }}<template v-if="collaborator.expires"> | <translate :translate-params="{expires: formDateFromNow(collaborator.expires)}">Expires: %{expires}</translate></template></div>
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
            <oc-switch class="uk-margin-small-right" :model="canShare" @change="$_ocCollaborators_switchPermission('canShare')" /> <translate :class="{ 'uk-text-muted': !canShare }">Can share</translate>
          </div>
          <template v-if="collaborator.role === 'custom' || selectedNewRole && selectedNewRole.tag === 'custom'">
            <div class="uk-flex uk-flex-row uk-flex-wrap uk-flex-middle">
              <oc-switch class="uk-margin-small-right" :model="canChange" @change="$_ocCollaborators_switchPermission('canChange')" /> <translate :class="{ 'uk-text-muted': !canChange }">Can change</translate>
            </div>
            <div v-if="highlightedFile.type === 'folder'" class="uk-flex uk-flex-row uk-flex-wrap uk-flex-middle">
              <oc-switch class="uk-margin-small-right" :model="canCreate" @change="$_ocCollaborators_switchPermission('canCreate')" /> <translate :class="{ 'uk-text-muted': !canCreate }">Can create</translate>
            </div>
            <div v-if="highlightedFile.type === 'folder'" class="uk-flex uk-flex-row uk-flex-wrap uk-flex-middle">
              <oc-switch class="uk-margin-small-right" :model="canDelete" @change="$_ocCollaborators_switchPermission('canDelete')" /> <translate :class="{ 'uk-text-muted': !canDelete }">Can delete</translate>
            </div>
          </template>
        </oc-grid>
      </oc-grid>
      <oc-button variation="primary" :disabled="!editing || collaboratorSaving" @click="$_ocCollaborators_saveChanges(collaborator)"><translate>Save</translate></oc-button>
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
  props: ['collaborator', 'roles'],
  mixins: [
    Mixins
  ],
  data () {
    return {
      editing: false,
      canShare: this.collaborator.canShare,
      canChange: this.collaborator.customPermissions.change,
      canCreate: this.collaborator.customPermissions.create,
      canDelete: this.collaborator.customPermissions.delete,
      selectedNewRole: null
    }
  },
  computed: {
    ...mapGetters('Files', ['highlightedFile', 'collaboratorSaving']),
    ...mapGetters(['user']),

    _deleteButtonLabel () {
      return this.$gettext('Delete Share')
    }
  },
  methods: {
    ...mapActions('Files', ['deleteShare', 'changeShare']),

    onDelete (share) {
      this.deleteShare({
        client: this.$client,
        share: share
      })
    },
    onEdit () {
      this.editing = true
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
        })
    },
    $_ocCollaborators_changeRole (role) {
      this.selectedNewRole = role
      this.editing = true
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
    }
  }
}
</script>

<style>
  .oc-text {
    font-size: 1rem;
  }
</style>
