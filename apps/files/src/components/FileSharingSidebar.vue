<template>
  <div id="oc-files-sharing-sidebar" class="uk-position-relative">
    <div>
      <oc-loader v-if="sharesLoading" aria-label="Loading collaborator list" />
      <template v-else>
        <div v-if="$_ocCollaborators_canShare" class="uk-text-right">
          <oc-button variation="primary" icon="add" @click="visiblePanel = 'newCollaborator'" class="files-collaborators-open-add-share-dialog-button"><translate>Add Collaborators</translate></oc-button>
        </div>
        <translate
          v-else
          class="files-collaborators-no-reshare-permissions-message"
          key="no-reshare-permissions-message"
          v-text="noResharePermsMessage"
        />
        <div v-if="$_ocCollaborators_users.length > 0" id="files-collaborators-list" key="oc-collaborators-user-list">
          <h5>
            <translate>Users</translate>
            ({{ $_ocCollaborators_users.length }})
          </h5>
          <template v-for="user in $_ocCollaborators_users">
            <oc-grid :key="user.info.id" gutter="small" class="files-collaborators-collaborator">
              <div>
                <oc-icon class="files-collaborators-collaborator-delete" role="button" name="close" :aria-label="$gettext('Delete share')" @click="$_ocCollaborators_deleteShare(user)" />
              </div>
              <collaborator class="uk-width-expand" :collaborator="user" />
              <div class="uk-width-auto">
                <oc-icon class="files-collaborators-collaborator-edit" role="button" name="edit" :aria-label="$gettext('Edit share')" @click="$_ocCollaborators_editShare(user)" />
              </div>
            </oc-grid>
          </template>
        </div>
        <div v-if="$_ocCollaborators_groups.length > 0" id="files-collaborators-list-groups" key="oc-collaborators-group-list">
          <h5>
            <translate>Groups</translate>
            ({{ $_ocCollaborators_groups.length }})
          </h5>
          <template v-for="group in $_ocCollaborators_groups">
            <oc-grid :key="group.info.id" gutter="small" class="files-collaborators-collaborator">
              <div>
                <oc-icon class="files-collaborators-collaborator-delete uk-vertical-align" role="button" name="close" :aria-label="$gettext('Delete share')" @click="$_ocCollaborators_deleteShare(group)" />
              </div>
              <collaborator class="uk-width-expand" :collaborator="group" />
              <div class="uk-width-auto">
                <oc-icon class="files-collaborators-collaborator-edit" role="button" name="edit" :aria-label="$gettext('Edit share')" @click="$_ocCollaborators_editShare(group)" />
              </div>
            </oc-grid>
          </template>
        </div>
        <div v-if="!shares.length && !sharesLoading" key="oc-collaborators-no-results"><translate>No collaborators</translate></div>
      </template>
    </div>
    <transition name="custom-classes-transition" enter-active-class="uk-animation-slide-right uk-animation-fast" leave-active-class="uk-animation-slide-right uk-animation-reverse uk-animation-fast">
      <div v-if="visiblePanel == 'newCollaborator'" class="uk-position-cover oc-default-background">
        <new-collaborator v-if="$_ocCollaborators_canShare" key="new-collaborator" @close="visiblePanel='collaboratorList'" />
      </div>
    </transition>
    <transition name="custom-classes-transition" enter-active-class="uk-animation-slide-right uk-animation-fast" leave-active-class="uk-animation-slide-right uk-animation-reverse uk-animation-fast">
      <div v-if="visiblePanel == 'editCollaborator'" class="uk-position-cover oc-default-background">
        <edit-collaborator v-if="$_ocCollaborators_canShare" key="edit-collaborator" @close="visiblePanel='collaboratorList'; currentShare = null" :collaborator="currentShare" />
      </div>
    </transition>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex'
import Mixins from '../mixins/collaborators'
const NewCollaborator = _ => import('./Collaborators/NewCollaborator.vue')
const EditCollaborator = _ => import('./Collaborators/EditCollaborator.vue')
const Collaborator = _ => import('./Collaborators/Collaborator.vue')

export default {
  title: $gettext => {
    return $gettext('Collaborators')
  },
  name: 'FileSharingSidebar',
  components: {
    NewCollaborator,
    EditCollaborator,
    Collaborator
  },
  data: () => {
    return {
      visiblePanel: 'collaboratorList',
      currentShare: null
    }
  },
  mixins: [Mixins],
  mounted () {
    this.toggleCollaboratorsEdit(false)
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
        return collaborator.info.share_type === '0' || collaborator.info.share_type === '6'
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
      'sharesClearState',
      'deleteShare'
    ]),
    $_ocCollaborators_editShare (share) {
      this.currentShare = share
      this.visiblePanel = 'editCollaborator'
    },
    $_ocCollaborators_deleteShare (share) {
      this.deleteShare({
        client: this.$client,
        share: share
      })
    }
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

/** needed to cover the container below when transitioning */
.oc-app-side-bar .oc-default-background {
  background-color: white;
}
</style>
