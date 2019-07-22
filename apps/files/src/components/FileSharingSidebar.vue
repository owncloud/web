<template>
  <div id="oc-files-sharing-sidebar">
    <div>
     <oc-spinner v-if="sharesLoading"></oc-spinner>
     <template v-if="!sharesLoading">
        <h4><translate>Owner</translate></h4>
        <oc-user
            avatar=""
            :user-name="highlightedFile.owner.username"
            :display-name="highlightedFile.owner.displayName"
            class="uk-margin-bottom"
          >
        </oc-user>
        <section>
          <label class="oc-label"><translate>Invite new collaborators</translate></label>
          <oc-autocomplete
            v-model="selectedItem" :items="autocompleteResults" :itemsLoading="autocompleteInProgress"
            :placeholder="$_ocCollaborationStatus_autocompletePlacholder" @update:input="onAutocompleteInput"
            :filter="filterRecipients" id="oc-sharing-autocomplete" class="uk-margin-bottom">
            <template v-slot:item="{item}">
              <div class="uk-text-bold files-collaborators-autocomplete-username">{{ item.label }}</div>
              <span class="uk-text-meta">{{ $_ocCollaborators_collaboratorType(item.value.shareType) }}</span>
            </template>
          </oc-autocomplete>
          <div v-if="selectedItem" class="uk-margin-medium-bottom">
            <div class="uk-flex-inline uk-flex-column uk-flex-middle uk-margin-small-bottom">
              <oc-avatar src="" />
              <span>{{ selectedItem.label }}</span>
            </div>
            <div>
              <oc-grid gutter="small">
                <div class="uk-width-1-1">
                  <label class="oc-label"><translate>Role</translate></label>
                  <oc-button id="files-collaborators-role-button" class="uk-width-1-1 files-collaborators-role-button"><span v-if="!selectedNewRole">Select role</span><template v-else>{{ selectedNewRole.name }}</template></oc-button>
                  <p v-if="selectedNewRole" class="uk-text-meta uk-margin-remove">{{ selectedNewRole.description }}</p>
                  <oc-drop closeOnClick dropId="files-collaborators-roles-dropdown" toggle="#files-collaborators-role-button" mode="click" :options="{ offset: 0, delayHide: 0 }" class="oc-autocomplete-dropdown">
                    <ul class="oc-autocomplete-suggestion-list">
                      <li v-for="(role, key) in roles" :key="key" :id="`files-collaborator-new-collaborator-role-${role.tag}`" class="oc-autocomplete-suggestion" :class="{ 'oc-autocomplete-suggestion-selected' : selectedNewRole === role }" @click="$_ocCollaborators_newCollaboratorsSelectRole(role)">
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
                <oc-grid v-if="selectedNewRole" gutter="small" class="uk-width-1-1">
                  <div class="uk-flex uk-flex-row uk-flex-wrap uk-flex-middle">
                    <oc-switch class="uk-margin-small-right" @change="$_ocCollaborators_switchPermission('canShare')" /> <translate :class="{ 'uk-text-muted': !canShare }">Can share</translate>
                  </div>
                  <template v-if="selectedNewRole.tag === 'custom'">
                    <div class="uk-flex uk-flex-row uk-flex-wrap uk-flex-middle">
                      <oc-switch class="uk-margin-small-right" @change="$_ocCollaborators_switchPermission('canChange')" /> <translate :class="{ 'uk-text-muted': !canChange }">Can change</translate>
                    </div>
                    <div v-if="highlightedFile.type === 'folder'" class="uk-flex uk-flex-row uk-flex-wrap uk-flex-middle">
                      <oc-switch class="uk-margin-small-right" @change="$_ocCollaborators_switchPermission('canCreate')" /> <translate :class="{ 'uk-text-muted': !canCreate }">Can create</translate>
                    </div>
                    <div v-if="highlightedFile.type === 'folder'" class="uk-flex uk-flex-row uk-flex-wrap uk-flex-middle">
                      <oc-switch class="uk-margin-small-right" @change="$_ocCollaborators_switchPermission('canDelete')" /> <translate :class="{ 'uk-text-muted': !canDelete }">Can delete</translate>
                    </div>
                  </template>
                </oc-grid>
                <div>
                  <oc-button @click="$_ocCollaborators_newCollaboratorsCancel"><translate>Cancel</translate></oc-button>
                </div>
                <div>
                  <oc-button id="files-collaborators-add-new-button" variation="primary" @click="$_ocCollaborators_newCollaboratorsAdd(selectedItem)" :disabled="!selectedNewRole"><translate>Add collaborators</translate></oc-button>
                </div>
              </oc-grid>
            </div>
          </div>
          <oc-loader v-if="sharesLoading" />
          <template v-else>
            <h5><translate>Collaborators</translate><template v-if="shares.length > 0"> ({{ shares.length }})</template></h5>
            <div v-if="$_ocCollaborators_users.length > 0" id="files-collaborators-list">
              <h5><translate>Users</translate> ({{ $_ocCollaborators_users.length }})</h5>
              <oc-accordion>
                <template v-for="(collaborator, index) in $_ocCollaborators_users">
                  <collaborator :key="index" :collaborator="collaborator" :roles="roles" />
                </template>
              </oc-accordion>
            </div>
            <div v-if="$_ocCollaborators_groups.length > 0" id="files-collaborators-list-groups">
              <h5><translate>Groups</translate> ({{ $_ocCollaborators_groups.length }})</h5>
              <oc-accordion>
                <template v-for="(collaborator, index) in $_ocCollaborators_groups">
                  <collaborator :key="index" :collaborator="collaborator" :roles="roles" />
                </template>
              </oc-accordion>
            </div>
          </template>
        </section>
      </template>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex'
import Mixins from './Collaborators/mixins'
const Collaborator = _ => import('./Collaborators/Collaborator.vue')

export default {
  title: ($gettext) => {
    return $gettext('Collaborators')
  },
  name: 'FileSharingSidebar',
  components: {
    Collaborator
  },
  mixins: [
    Mixins
  ],
  mounted () {
    if (this.highlightedFile) {
      this.loadShares({
        client: this.$client,
        path: this.highlightedFile.path
      })
    } else {
      this.sharesClearState()
    }
  },
  watch: {
    selectedFile (newItem, oldItem) {
      if (oldItem !== newItem) {
        this.loadShares({
          client: this.$client,
          path: this.highlightedFile.path
        })
      }
    }
  },
  data () {
    return {
      autocompleteResults: [],
      autocompleteInProgress: false,
      selectedItem: '',
      canShare: false,
      canChange: false,
      canCreate: false,
      canDelete: false,
      roles: {
        viewer: {
          tag: 'viewer',
          name: this.$gettext('Viewer'),
          description: this.$gettext('Download and preview')
        },
        editor: {
          tag: 'editor',
          name: this.$gettext('Editor'),
          description: this.$gettext('Upload, edit, delete, download and preview')
        },
        custom: {
          tag: 'custom',
          name: this.$gettext('Custom role'),
          description: this.$gettext('Set detailed permissions')
        }
      },
      selectedNewRole: null
    }
  },
  computed: {
    ...mapGetters('Files', ['highlightedFile', 'shareOpen', 'shares', 'sharesError', 'sharesLoading']),
    ...mapState(['user']),
    selectedFile () {
      return this.highlightedFile
    },
    $_ocCollaborationStatus_autocompletePlacholder () {
      return this.$gettext('Search by name, email or federation ID\'s')
    },
    $_ocCollaborators_users () {
      return this.shares.filter(collaborator => {
        return collaborator.info.share_type === '0'
      })
    },
    $_ocCollaborators_groups () {
      return this.shares.filter(collaborator => {
        return collaborator.info.share_type === '1'
      })
    }
  },
  methods: {
    ...mapActions('Files', ['shareSetOpen', 'loadShares', 'sharesClearState', 'addShare', 'deleteShare', 'changeShare']),
    onAutocompleteInput (value) {
      if (value.length < 2) {
        return
      }
      this.autocompleteInProgress = true
      this.autocompleteResults = []
      // TODO: move to store
      this.$client.shares.getRecipients(value, 'folder')
        .then(recipients => {
          this.autocompleteInProgress = false
          let users = recipients.exact.users.concat(recipients.users)
          const groups = recipients.exact.groups.concat(recipients.groups)
          users = users.filter((user) => {
            return user.value.shareWith !== this.user.id
          })

          this.autocompleteResults = users.concat(groups)
        })
        .catch(error => {
          console.log(error)
          this.autocompleteInProgress = false
        })
    },
    filterRecipients (item, queryText) {
      return item.label.toLocaleLowerCase().indexOf(queryText.toLocaleLowerCase()) > -1
    },
    $_ocCollaborators_newCollaboratorsCancel () {
      this.selectedItem = ''
    },
    $_ocCollaborators_newCollaboratorsSelectRole (role) {
      this.selectedNewRole = role
    },
    $_ocCollaborators_newCollaboratorsAdd (collaborators) {
      const permissions = { perms: null }
      switch (this.selectedNewRole.tag) {
        case ('viewer'):
          permissions.perms = this.canShare ? 17 : 1
          break
        case ('editor'):
          if (this.highlightedFile.type === 'folder') {
            permissions.perms = this.canShare ? 23 : 7
            break
          }
          permissions.perms = this.canShare ? 19 : 2
          break
        case ('custom'):
          let perms = 1
          const changePerm = 2
          const createPerm = 4
          const deletePerm = 8
          const resharePerm = 16
          if (this.canChange) perms += changePerm
          if (this.canCreate) perms += createPerm
          if (this.canDelete) perms += deletePerm
          if (this.canShare) perms += resharePerm
          permissions.perms = perms
          break
      }
      this.addShare({
        client: this.$client,
        path: this.highlightedFile.path,
        $gettext: this.$gettext,
        shareWith: collaborators.value.shareWith,
        shareType: collaborators.value.shareType,
        permissions: permissions
      })
      this.selectedItem = null
      this.selectedNewRole = null
      this.canChange = false
      this.canCreate = false
      this.canDelete = false
      this.canShare = false
    }
  }
}
</script>

<style>
  /* TODO: Move to design system */
  .oc-app-side-bar .uk-accordion-title .uk-text-lead {
    font-size: 16px;
    font-weight: bold;
  }

  .oc-app-side-bar .uk-accordion-title .uk-inline > span {
    font-size: 16px;
  }

  .oc-app-side-bar .oc-label {
    display: block;
    margin-bottom: 5px;
  }

  .oc-app-side-bar .files-collaborators-role-button {
    padding: 0 10px;
    text-align: left;
  }

  .oc-app-side-bar .oc-autocomplete-suggestion {
    transition: background-color .3s, color .3s;
    cursor: pointer;
  }

  .oc-app-side-bar .oc-autocomplete-suggestion:hover {
    color: white;
    background-color: #002966;
  }

  .oc-app-side-bar .oc-autocomplete-dropdown .uk-card {
    padding: 0 !important;
  }

  .oc-app-side-bar .oc-autocomplete-suggestion:hover .uk-text-meta, .oc-autocomplete-suggestion-selected .uk-text-meta {
    color: white;
  }
</style>
