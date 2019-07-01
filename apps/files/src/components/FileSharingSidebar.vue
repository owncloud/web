<template>
  <div id="oc-files-sharing-sidebar">
    <div>
     <oc-spinner v-if="sharesLoading"></oc-spinner>
     <template v-if="!sharesLoading">
      <!-- TODO: Discuss placement of owner in file details instead of collaborators
      <h4><translate>Owner</translate></h4>
      <oc-user
          :avatar="owner.avatar"
          :user-name="owner.name"
          :display-name="owner.displayName"
          class="uk-margin-bottom"
        >
        <template slot="properties">
          <span v-translate>{{ owner.email }}</span>
        </template>
      </oc-user> -->
      <section>
        <h4>Collaborators ({{ shares.length }})</h4>
        <label class="oc-label"><translate>Invite new collaborators</translate></label>
        <oc-autocomplete
          v-model="selectedItem" :items="autocompleteResults" :itemsLoading="autocompleteInProgress"
          :placeholder="$_ocCollaborationStatus_autocompletePlacholder" @update:input="onAutocompleteInput"
          :filter="filterRecipients" id="oc-sharing-autocomplete" class="uk-margin-bottom"
        >
          <template v-slot:item="{item}">
            <span>{{ buildRecipientDisplay(item) }}</span>
          </template>
        </oc-autocomplete>
        <oc-accordion v-if="!sharesLoading" :multiple=true>
          <oc-accordion-item v-for="(collaborator, index) in shares" :key="index" class="uk-margin-small-bottom">
            <template slot="title">
              <oc-user
                :avatar="collaborator.avatar"
                :user-name="collaborator.name"
                :display-name="collaborator.displayName"
              >
                <template slot="properties">
                  <span v-translate>{{ collaborator.role }}<template v-if="collaborator.expires"> | <translate :translate-params="{expires: formDateFromNow(collaborator.expires)}">Expires: %{expires}</translate></template></span>
                </template>
              </oc-user>
            </template>
            <template slot="content">
              <oc-grid gutter="small" class="uk-flex uk-flex-between uk-margin-small-bottom">
                <div class="uk-flex uk-flex-column">
                  <span class="uk-text-meta">Type</span>
                  <span>User</span>
                </div>
                <div class="uk-flex uk-flex-column">
                  <span class="uk-text-meta">Status</span>
                  <span>Accepted</span>
                </div>
                <div class="uk-flex uk-flex-column">
                  <span class="uk-text-meta">Shared from</span>
                  <span>Administrator</span>
                </div>
              </oc-grid>
              <oc-grid gutter="small" class="uk-margin-bottom">
                <div class="uk-width-1-1 uk-width-1-2@xl">
                  <label class="oc-label">Role</label>
                  <oc-button :id="`files-collaborators-role-button-${index}`" class="uk-width-1-1 files-collaborators-role-button">{{ roles[collaborator.role].name }}</oc-button>
                  <p class="uk-text-meta uk-margin-remove">{{ roles[collaborator.role].description }}</p>
                  <oc-drop id="files-collaborators-roles-dropdown" :toggle="`#files-collaborators-role-button-${index}`" mode="click" :options="{ 'offset': 0 }" class="oc-autocomplete-dropdown">
                    <ul class="oc-autocomplete-suggestion-list">
                      <li v-for="(role, key) in roles" :key="key" class="oc-autocomplete-suggestion" :class="{ 'oc-autocomplete-suggestion-selected' : roles[collaborator.role] === role }" @click="onEdit(collaborator); editing.role = key">
                        <span class="uk-text-bold">{{ role.name }}</span>
                        <p class="uk-text-meta uk-margin-remove">{{ role.description }}</p>
                      </li>
                    </ul>
                  </oc-drop>
                </div>
                <div class="uk-width-1-1 uk-width-1-2@xl">
                  <label class="oc-label">Expiration date <span class="uk-text-meta uk-remove-margin">(optional)</span></label>
                  <oc-text-input type="date" class="uk-width-1-1 oc-button-role">04 - 07 - 2019</oc-text-input>
                </div>
              </oc-grid>
              <oc-button variation="primary" :disabled="editing.name != collaborator.name || saving" @click="onSave(editing)">Save</oc-button>
              <oc-button :aria-label="_deleteButtonLabel" name="delete" icon="delete" @click="onDelete(collaborator)" />
              <oc-spinner v-if="saving" small></oc-spinner>
            </template>
          </oc-accordion-item>
        </oc-accordion>
      </section>
     </template>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex'

export default {
  title: ($gettext) => {
    return $gettext('Collaborators')
  },
  name: 'FileSharingSidebar',
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
    selectedItem: function (newSelectedSharee) {
      // TODO: handle groups as well
      this.addShare({
        client: this.$client,
        path: this.highlightedFile.path,
        $gettext: this.$gettext,
        shareWith: newSelectedSharee.value.shareWith,
        shareType: newSelectedSharee.value.shareType
      })
    }
  },
  data () {
    return {
      autocompleteResults: [],
      autocompleteInProgress: false,
      selectedItem: '',
      editing: { name: null },
      saving: false,

      roles: {
        viewer: {
          name: this.$gettext('Viewer'),
          description: this.$gettext('Download and preview')
        },
        editor: {
          name: this.$gettext('Editor'),
          description: this.$gettext('Upload, edit, delete, download and preview')
        },
        coowner: {
          name: this.$gettext('Co-owner'),
          description: this.$gettext('Share, upload, edit, delete, download and preview')
        }
        // customRole: {
        //   name: this.$gettext('Custom role'),
        //   description: this.$gettext('Set detailed permissions')
        // }
      }
    }
  },
  computed: {
    ...mapGetters('Files', ['highlightedFile', 'shareOpen', 'shares', 'sharesError', 'sharesLoading']),
    ...mapState(['user']),
    $_ocCollaborationStatus_autocompletePlacholder () {
      return this.$gettext('Search by name, email or federation ID\'s')
    },
    owner () {
      if (this.shares.length === 0) {
        return {
          avatar: 'https://picsum.photos/64/64?image=1074',
          name: this.user.id,
          displayName: this.user.displayname
        }
      }
      const s = this.shares[0]
      return {
        avatar: 'https://picsum.photos/64/64?image=1074',
        name: s.uid_owner,
        displayName: s.info.displayname_owner
      }
    },
    _deleteButtonLabel () {
      return this.$gettext('Delete Share')
    },
    _editButtonLabel () {
      return this.$gettext('Edit Share')
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
    buildRecipientDisplay (recipient) {
      if (recipient.value.shareType === 1) {
        const group = this.$gettext('group')
        return `${recipient.label} (${group})`
      }
      // fallback and users get no suffix
      return recipient.label
    },
    onDelete (share) {
      this.deleteShare({
        client: this.$client,
        share: share
      })
    },
    onEdit (collaborator) {
      this.editing = collaborator
    },
    onSave () {
      this.saving = true
      this.changeShare({
        client: this.$client,
        share: this.editing
      })
        .then(() => {
          this.editing = { name: null }
          this.saving = false
        })
    }
  }
}
</script>

<style>
  /* TODO: Move to design system */
  .uk-accordion-title .oc-avatar {
    width: 50px;
  }

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
