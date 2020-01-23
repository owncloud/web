<template>
  <div id="oc-files-sharing-sidebar" class="uk-position-relative">
    <div :aria-hidden="visiblePanel == 'newCollaborator'" :inert="visiblePanel == 'newCollaborator'">
      <oc-loader v-if="sharesLoading" aria-label="Loading collaborator list" />
      <template v-else>
        <div v-if="$_ocCollaborators_canShare" class="uk-margin-small-top uk-margin-small-bottom">
          <oc-button variation="primary" icon="add" @click="visiblePanel = 'newCollaborator'" class="files-collaborators-open-add-share-dialog-button"><translate>Add Collaborators</translate></oc-button>
        </div>
        <translate
          v-else
          class="files-collaborators-no-reshare-permissions-message"
          key="no-reshare-permissions-message"
          v-text="noResharePermsMessage"
        />
        <div v-if="$_ocCollaborators.length > 0" id="files-collaborators-list" key="oc-collaborators-user-list">
          <template v-for="collaborator in $_ocCollaborators">
            <oc-grid :key="collaborator.info.id" gutter="small" class="files-collaborators-collaborator">
              <div>
                <oc-button :ariaLabel="$gettext('Delete share')" @click="$_ocCollaborators_deleteShare(collaborator)" variation="raw" class="files-collaborators-collaborator-delete">
                  <oc-icon name="close" />
                </oc-button>
              </div>
              <collaborator class="uk-width-expand" :collaborator="collaborator" />
              <div class="uk-width-auto">
                <oc-button :aria-label="$gettext('Edit share')" @click="$_ocCollaborators_editShare(collaborator)" variation="raw" class="files-collaborators-collaborator-edit">
                  <oc-icon name="edit" />
                </oc-button>
              </div>
            </oc-grid>
          </template>
        </div>
        <div v-else-if="!sharesLoading" key="oc-collaborators-no-results"><translate>No collaborators</translate></div>
      </template>
    </div>
    <div :aria-hidden="visiblePanel != 'newCollaborator'" :inert="visiblePanel != 'newCollaborator'">
      <transition name="custom-classes-transition" enter-active-class="uk-animation-slide-right uk-animation-fast" leave-active-class="uk-animation-slide-right uk-animation-reverse uk-animation-fast">
        <div v-if="visiblePanel == 'newCollaborator'" class="uk-position-cover oc-default-background" >
          <new-collaborator v-if="$_ocCollaborators_canShare" key="new-collaborator" @close="visiblePanel='collaboratorList'" />
        </div>
      </transition>
    </div>
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
    $_ocCollaborators () {
      return this.shares
        .filter(collaborator => this.$_ocCollaborators_isUser(collaborator) || this.$_ocCollaborators_isGroup(collaborator))
        .sort((c1, c2) => {
          const name1 = c1.displayName.toLowerCase().trim()
          const name2 = c2.displayName.toLowerCase().trim()
          // sorting priority 1: display name (lower case, ascending), 2: share type (groups first), 3: id (ascending)
          if (name1 === name2) {
            if (this.$_ocCollaborators_isGroup(c1) === this.$_ocCollaborators_isGroup(c2)) {
              return parseInt(c1.info.id, 10) < parseInt(c2.info.id, 10) ? -1 : 1
            } else {
              return this.$_ocCollaborators_isGroup(c1) ? -1 : 1
            }
          } else {
            return name1 < name2 ? -1 : 1
          }
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
    },
    $_ocCollaborators_isUser (collaborator) {
      return collaborator.info.share_type === '0' || collaborator.info.share_type === '6'
    },
    $_ocCollaborators_isGroup (collaborator) {
      return collaborator.info.share_type === '1'
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
