<template>
  <div id="oc-files-sharing-sidebar">
    <div>
     <oc-spinner v-if="sharesLoading"></oc-spinner>
     <template v-if="!sharesLoading">
      <!-- TODO: Discuss placement of owner in file details instead of collaborators -->
      <h4><translate>Owner</translate></h4>
      <oc-user
          avatar=""
          :user-name="selectedFiles[0].owner.username"
          :display-name="selectedFiles[0].owner.displayName"
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
            <div class="uk-text-bold">{{ item.label }}</div>
            <span class="uk-text-meta">{{ $_ocCollaborators_recipientType(item) }}</span>
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
                <oc-drop id="files-collaborators-roles-dropdown" toggle="#files-collaborators-role-button" mode="click" :options="{ 'offset': 0 }" class="oc-autocomplete-dropdown">
                  <ul class="oc-autocomplete-suggestion-list">
                    <li v-for="(role, key) in roles" :key="key" class="oc-autocomplete-suggestion" @click="$_ocCollaborators_newCollaboratorsSelectRole(role)">
                      <span class="uk-text-bold">{{ role.name }}</span>
                      <p class="uk-text-meta uk-margin-remove">{{ role.description }}</p>
                    </li>
                  </ul>
                </oc-drop>
              </div>
              <div v-if="false" class="uk-width-1-1">
                <label class="oc-label"><translate>Expiration date <span class="uk-text-meta uk-remove-margin">(optional)</span></translate></label>
                <oc-text-input type="date" class="uk-width-1-1 oc-button-role">04 - 07 - 2019</oc-text-input>
              </div>
              <oc-grid v-if="selectedNewRole" gutter="small" class="uk-width-1-1">
                <div class="uk-flex uk-flex-row uk-flex-wrap uk-flex-middle">
                  <oc-switch class="uk-margin-small-right" @change="$_ocCollaborator_canShare" /> <translate>Can share</translate>
                </div>
                <template v-if="selectedNewRole === 'custom'">
                  <div class="uk-flex uk-flex-row uk-flex-wrap uk-flex-middle">
                    <oc-switch class="uk-margin-small-right" /> <translate>Can change</translate>
                  </div>
                  <div class="uk-flex uk-flex-row uk-flex-wrap uk-flex-middle">
                    <oc-switch class="uk-margin-small-right" /> <translate>Can create</translate>
                  </div>
                  <div class="uk-flex uk-flex-row uk-flex-wrap uk-flex-middle">
                    <oc-switch class="uk-margin-small-right" /> <translate>Can delete</translate>
                  </div>
                </template>
              </oc-grid>
              <div>
                <oc-button @click="$_ocCollaborators_newCollaboratorsCancel"><translate>Cancel</translate></oc-button>
              </div>
              <div>
                <oc-button variation="primary" @click="$_ocCollaborators_newCollaboratorsAdd(selectedItem)" :disabled="!selectedNewRole"><translate>Add collaborators</translate></oc-button>
              </div>
            </oc-grid>
          </div>
        </div>
        <oc-loader v-if="sharesLoading" />
        <template v-else>
          <h4><translate>Collaborators</translate><template v-if="shares.length > 0"> ({{ shares.length }})</template></h4>
          <div v-if="$_ocCollaborators_users.length > 0">
            <h5><translate>Users</translate> ({{ $_ocCollaborators_users.length }})</h5>
            <oc-accordion>
              <template v-for="(collaborator, index) in $_ocCollaborators_users">
                <collaborator :key="index" :collaborator="collaborator" :roles="roles" />
              </template>
            </oc-accordion>
          </div>
          <div v-if="$_ocCollaborators_groups.length > 0">
            <h5><translate>Groups</translate> ({{ $_ocCollaborators_groups.length }})</h5>
            <oc-accordion>
              <template v-for="(collaborator, index) in $_ocCollaborators_groups">
                <collaborator :key="index" :collaborator="collaborator" :roles="roles" />
              </template>
            </oc-accordion>
          </div>
        </template>
      </section>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex'
import Collaborator from './Collaborators/Collaborator.vue'

export default {
  title: ($gettext) => {
    return $gettext('Collaborators')
  },
  name: 'FileSharingSidebar',
  components: {
    Collaborator
  },
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
          path: this.selectedFiles[0].path
        })
      }
    }
  },
  data () {
    return {
      autocompleteResults: [],
      autocompleteInProgress: false,
      selectedItem: '',
      editing: { name: null },
      saving: false,
      canShare: false,
      roles: {
        viewer: {
          name: this.$gettext('Viewer'),
          description: this.$gettext('Download and preview')
        },
        editor: {
          name: this.$gettext('Editor'),
          description: this.$gettext('Upload, edit, delete, download and preview')
        },
        // coowner: {
        //   name: this.$gettext('Co-Owner'),
        //   description: this.$gettext('Share, upload, edit, delete, download and preview'),
        //   perms: 16
        // },
        custom: {
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
      return this.selectedFiles[0]
    },
    $_ocCollaborationStatus_autocompletePlacholder () {
      return this.$gettext('Search by name, email or federation ID\'s')
    },
    _deleteButtonLabel () {
      return this.$gettext('Delete Share')
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
          let groups = recipients.exact.groups.concat(recipients.groups)
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
    $_ocCollaborators_recipientType (recipient) {
      if (recipient.value.shareType === 1) {
        return this.$gettext('Group')
      }

      return this.$gettext('User')
    },
    $_ocCollaborators_newCollaboratorsCancel () {
      this.selectedItem = ''
    },
    $_ocCollaborators_newCollaboratorsSelectRole (role) {
      this.selectedNewRole = role
    },
    $_ocCollaborators_newCollaboratorsAdd (collaborators) {
      console.log(this.shares)
      let permissions = { perms: null }
      switch (this.selectedNewRole.name) {
        case ('Viewer'):
          permissions.perms = this.canShare ? 17 : 1
          break
        case ('Editor'):
          if (this.selectedFiles[0].type === 'folder') {
            permissions.perms = this.canShare ? 23 : 7
            break
          }
          permissions.perms = this.canShare ? 19 : 2
          break
      }
      this.addShare({
        client: this.$client,
        path: this.selectedFiles[0].path,
        $gettext: this.$gettext,
        shareWith: collaborators.value.shareWith,
        shareType: collaborators.value.shareType,
        permissions: permissions
      })
      this.selectedItem = null
      this.selectedNewRole = null
      this.canShare = false
    },
    $_ocCollaborators_collaboratorType (type) {
      console.log(this.shares)
      if (type === '0') return this.$gettext('User')

      return this.$gettext('Group')
    },
    $_ocCollaborator_canShare (value) {
      this.canShare = value
    }
  }
}
</script>

<style>
  /* TODO: Move to design system */
  .uk-accordion-title .uk-text-lead {
    font-size: 16px;
    font-weight: bold;
  }

  .uk-accordion-title .uk-inline > span {
    font-size: 16px;
  }

  .oc-label {
    display: block;
    margin-bottom: 5px;
  }

  .files-collaborators-role-button {
    padding: 0 10px;
    text-align: left;
  }

  .oc-autocomplete-suggestion {
    transition: background-color .3s, color .3s;
    cursor: pointer;
  }

  .oc-autocomplete-suggestion:hover {
    color: white;
    background-color: #002966;
  }

  .oc-autocomplete-dropdown .uk-card {
    padding: 0 !important;
  }

  .oc-autocomplete-suggestion:hover .uk-text-meta, .oc-autocomplete-suggestion-selected .uk-text-meta {
    color: white;
  }
</style>
