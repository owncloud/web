<template>
  <div id="oc-files-sharing-sidebar">
    <div>
     <oc-spinner v-if="sharesLoading"></oc-spinner>
    <oc-accordion v-if="!sharesLoading" :multiple=true>
      <oc-accordion-item v-if="owner" class="uk-open">
        <span slot="title" v-translate>Owner(s)</span>
        <template slot="content">
          <oc-user
            :avatar="owner.avatar"
            :user-name="owner.name"
            :display-name="owner.displayName"
            :email="owner.email"
          >
            <template slot="properties">
              <span v-translate>Owner</span>
            </template>
          </oc-user>
        </template>
      </oc-accordion-item>
      <oc-accordion-item class="uk-open">
        <span slot="title" v-translate>Collaborators</span>
        <template slot="content">
          <oc-autocomplete v-model="selectedItem" :items="autocompleteResults" :itemsLoading="autocompleteInProgress"
                           :placeholder="$_ocCollaborationStatus_autocompletePlacholder" @update:input="onAutocompleteInput"
                           :filter="filterRecipients" id="oc-sharing-autocomplete">
            <template v-slot:item="{item}">
              <span>{{ buildRecipientDisplay(item) }}</span>
            </template>          </oc-autocomplete>
          <ul class="uk-list" id="file-share-list">
            <li v-for="(c, k) in shares" :key="k">
              <oc-user
                :avatar="c.avatar"
                :user-name="c.name"
                :display-name="c.displayName"
                :email="c.email"
              >
                <template slot="properties">
                <span v-if="c">
                  <span
                    v-if="c.role && roles[c.role] && roles[c.role].name"
                    v-text="roles[c.role].name"
                    :uk-tooltip="roles[c.role].description"
                  />
                  <span v-if="c.role && c.expires">|</span>
                  <span v-if="c.expires">
                    <translate :translate-params="{expires: formDateFromNow(c.expires)}">Expires: %{expires}</translate>
                  </span>
                </span>
                </template>
                <template slot="actions">
                  <oc-icon :aria-label="_deleteButtonLabel" name="delete" @click="onDelete(c)" />
                  <oc-icon :aria-label="_editButtonLabel" v-if="editing != c" name="edit" @click="onEdit(c)" />
                </template>
              </oc-user>

              <div v-if="editing && editing.info.id == c.info.id" class="uk-margin-small-top">
                <div v-for="(role, r) in roles" :key="r" @click="editing.role = r">
                  <div class="uk-inline">
                    <oc-radio :model="editing.role" :value="r" />
                  </div>
                  <div class="uk-inline">
                    <div>
                      <strong v-text="role.name" />
                    </div>
                  </div>
                </div>
                <div class="uk-container uk-padding-remove uk-margin-small-top">
                  <oc-spinner v-if="saving" small></oc-spinner>
                  <oc-button @click="onSave(editing)" :disabled="saving"><translate>Save</translate></oc-button>
                </div>
              </div>
            </li>
          </ul>
        </template>
      </oc-accordion-item>
    </oc-accordion>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex'
export default {
  title: ($gettext) => {
    return $gettext('Sharing')
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
      editing: null,
      saving: false,

      roles: {
        viewer: { name: 'Viewer', description: 'Download and preview' },
        editor: { name: 'Editor', description: 'Upload, edit, delete, download and preview' },
        coowner: {
          name: 'Co-owner',
          description: 'Share, upload, edit, delete, download and preview'
        },
        legacy: {
          name: 'Legacy',
          description: 'Yet unmapped combination of permissions'
        }
      }
    }
  },
  computed: {
    ...mapGetters('Files', ['highlightedFile', 'shareOpen', 'shares', 'sharesError', 'sharesLoading']),
    ...mapState(['user']),
    $_ocCollaborationStatus_autocompletePlacholder () {
      return this.$gettext('Add name(s), email(s) or federation ID\'s')
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
    onEdit (share) {
      this.editing = JSON.parse(JSON.stringify(share))
    },
    onSave () {
      this.saving = true
      this.changeShare({
        client: this.$client,
        share: this.editing
      })
        .then(() => {
          this.editing = null
          this.saving = false
        })
    }
  }
}
</script>
