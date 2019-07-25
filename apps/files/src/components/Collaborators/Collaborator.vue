<template>
  <oc-accordion-item :key="collaborator.info.id" class="files-collaborators-collaborator uk-margin-small-bottom">
    <template slot="title">
      <div class="uk-text-meta uk-flex uk-flex-middle uk-margin-small-bottom"><oc-icon name="repeat" class="uk-margin-small-right" /> {{ collaborator.info.displayname_owner }}</div>
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
          <oc-drop dropId="files-collaborators-roles-dropdown" closeOnClick :toggle="`#files-collaborators-role-button-${collaborator.info.id}`" mode="click" :options="{ offset: 0, delayHide: 0 }" class="oc-autocomplete-dropdown">
            <ul class="oc-autocomplete-suggestion-list">
              <li v-for="(role, key) in roles" :key="key" class="oc-autocomplete-suggestion" :class="{ 'oc-autocomplete-suggestion-selected' : (roles[collaborator.role] === role && !selectedNewRole) || selectedNewRole === role }" @click="$_ocCollaborators_changeRole(role, collaborator)">
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
            <oc-switch class="uk-margin-small-right" :model="canShare" @change="$_ocCollaborator_canShare" /> <translate>Can share</translate>
          </div>
          <template v-if="collaborator.role === 'custom'">
            <div class="uk-flex uk-flex-row uk-flex-wrap uk-flex-middle">
              <oc-switch class="uk-margin-small-right" :model="canChange" @change="onEdit" /> <translate>Can change</translate>
            </div>
            <div v-if="selectedFiles[0].type === 'folder'" class="uk-flex uk-flex-row uk-flex-wrap uk-flex-middle">
              <oc-switch class="uk-margin-small-right" :model="canCreate" @change="onEdit" /> <translate>Can create</translate>
            </div>
            <div v-if="selectedFiles[0].type === 'folder'" class="uk-flex uk-flex-row uk-flex-wrap uk-flex-middle">
              <oc-switch class="uk-margin-small-right" :model="canDelete" @change="onEdit" /> <translate>Can delete</translate>
            </div>
          </template>
        </oc-grid>
      </oc-grid>
      <oc-button variation="primary" :disabled="!editing || saving" @click="$_ocCollaborators_saveChanges(collaborator)"><translate>Save</translate></oc-button>
      <oc-button :aria-label="_deleteButtonLabel" name="delete" icon="delete" @click="onDelete(collaborator)" variation="danger" />
      <oc-spinner v-if="saving" small></oc-spinner>
    </template>
  </oc-accordion-item>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Collaborator',
  props: {
    collaborator: {
      type: Object,
      required: true
    },
    roles: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      editing: false,
      saving: false,
      canShare: this.collaborator.canShare,
      canChange: this.collaborator.customPermissions.change,
      canCreate: this.collaborator.customPermissions.create,
      canDelete: this.collaborator.customPermissions.delete,
      selectedNewRole: null
    }
  },
  computed: {
    ...mapGetters('Files', ['selectedFiles']),

    _deleteButtonLabel () {
      return this.$gettext('Delete Share')
    }
  },
  methods: {
    ...mapActions('Files', ['deleteShare', 'changeShare']),

    $_ocCollaborators_collaboratorType (type) {
      if (type === '0') return this.$gettext('User')

      return this.$gettext('Group')
    },
    $_ocCollaborator_canShare (value) {
      this.editing = true
      this.canShare = value
    },
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
      this.saving = true
      if (!this.selectedNewRole) this.selectedNewRole = this.roles[collaborator.role]
      collaborator.role = this.selectedNewRole.tag
      this.changeShare({
        client: this.$client,
        share: collaborator,
        reshare: this.canShare
      })
        .then(() => {
          this.editing = false
        })
        .finally(this.saving = false)
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
