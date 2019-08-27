<template>
  <div id="oc-files-sharing-sidebar">
    <new-collaborator v-if="$_ocCollaborators_canShare" key="new-collaborator" />
    <translate
      v-else
      key="no-reshare-permissions-message"
      v-text="noResharePermsMessage"
    />
    <oc-loader v-if="sharesLoading" />
    <template v-else>
      <div v-if="$_ocCollaborators_users.length > 0" id="files-collaborators-list">
        <h5>
          <translate>Users</translate>
          ({{ $_ocCollaborators_users.length }})
        </h5>
        <oc-accordion>
          <template v-for="user in $_ocCollaborators_users">
            <collaborator :key="user.info.id" :collaborator="user" />
          </template>
        </oc-accordion>
      </div>
      <div v-if="$_ocCollaborators_groups.length > 0" id="files-collaborators-list-groups">
        <h5>
          <translate>Groups</translate>
          ({{ $_ocCollaborators_groups.length }})
        </h5>
        <oc-accordion>
          <template v-for="group in $_ocCollaborators_groups">
            <collaborator :key="group.info.id" :collaborator="group" />
          </template>
        </oc-accordion>
      </div>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex'
import Mixins from './Collaborators/mixins'
const NewCollaborator = _ => import('./Collaborators/NewCollaborator.vue')
const Collaborator = _ => import('./Collaborators/Collaborator.vue')

export default {
  title: $gettext => {
    return $gettext('Collaborators')
  },
  name: 'FileSharingSidebar',
  components: {
    NewCollaborator,
    Collaborator
  },
  mixins: [Mixins],
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
        this.selectedCollaborators = []
      }
    }
  },
  computed: {
    ...mapGetters('Files', [
      'highlightedFile',
      'shares',
      'sharesError',
      'sharesLoading'
    ]),
    ...mapState(['user']),
    selectedFile () {
      return this.highlightedFile
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
    },
    $_ocCollaborators_canShare () {
      return this.highlightedFile.canShare()
    },
    noResharePermsMessage () {
      const translated = this.$gettext('You don\'t have permission to share this %{type}')
      return this.$gettextInterpolate(translated, { type: this.highlightedFile.type })
    }
  },
  methods: {
    ...mapActions('Files', [
      'loadShares',
      'sharesClearState'
    ])
  }
}
</script>

<style>
/* TODO: Move to design system */
.oc-app-side-bar .oc-label {
  display: block;
  margin-bottom: 5px;
}

.oc-app-side-bar .files-collaborators-role-button {
  padding: 0 10px;
  text-align: left;
}

.oc-app-side-bar .oc-autocomplete-dropdown .uk-card {
  padding: 0 !important;
}

.oc-app-side-bar .oc-autocomplete-suggestion:hover .uk-text-meta,
.oc-autocomplete-suggestion-selected .uk-text-meta {
  color: white;
}
</style>
