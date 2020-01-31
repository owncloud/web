<template>
  <div id="oc-files-sharing-sidebar" class="uk-position-relative">
    <div v-show="visiblePanel === PANEL_SHOW" :aria-hidden="visiblePanel !== PANEL_SHOW" :key="PANEL_SHOW">
      <oc-loader v-if="$_sharesLoading" :aria-label="$gettext('Loading collaborator list')" />
      <template v-else>
        <div v-if="$_ocCollaborators_canShare" class="uk-margin-small-top uk-margin-small-bottom">
          <oc-button variation="primary" icon="add" @click="$_ocCollaborators_addShare" class="files-collaborators-open-add-share-dialog-button">
            <translate>Add Collaborators</translate>
          </oc-button>
        </div>
        <translate
          v-else
          class="files-collaborators-no-reshare-permissions-message"
          key="no-reshare-permissions-message"
          v-text="noResharePermsMessage"
        />
        <section v-if="$_ownerAndResharers.length > 0">
          <ul class="uk-list uk-list-divider uk-overflow-hidden">
            <li v-for="collaborator in $_ownerAndResharers" :key="collaborator.key">
              <collaborator :collaborator="collaborator"/>
            </li>
          </ul>
          <hr/>
        </section>
        <section v-if="$_directOutgoingShares.length > 0">
          <transition-group id="files-collaborators-list"
                            class="uk-list uk-list-divider uk-overflow-hidden"
                            enter-active-class="uk-animation-slide-left-medium"
                            leave-active-class="uk-animation-slide-right-medium uk-animation-reverse"
                            name="custom-classes-transition"
                            tag="ul">
            <li v-for="collaborator in $_directOutgoingShares" :key="collaborator.key">
              <collaborator :collaborator="collaborator" :modifiable="true" @onDelete="$_ocCollaborators_deleteShare" @onEdit="$_ocCollaborators_editShare"/>
            </li>
          </transition-group>
          <hr/>
        </section>
        <section v-if="$_indirectOutgoingShares.length > 0">
          <ul class="uk-list uk-list-divider uk-overflow-hidden">
            <li v-for="collaborator in $_indirectOutgoingShares" :key="collaborator.key">
              <collaborator :collaborator="collaborator"/>
            </li>
          </ul>
          <hr/>
        </section>
        <div v-if="$_noCollaborators && !$_sharesLoading" key="oc-collaborators-no-results"><translate>No collaborators</translate></div>
      </template>
    </div>
    <div v-if="visiblePanel === PANEL_NEW" :key="PANEL_NEW">
      <transition enter-active-class="uk-animation-slide-right uk-animation-fast"
                  leave-active-class="uk-animation-slide-right uk-animation-reverse uk-animation-fast"
                  name="custom-classes-transition">
        <div class="uk-position-cover oc-default-background" >
          <new-collaborator v-if="$_ocCollaborators_canShare" key="new-collaborator" @close="$_ocCollaborators_showList" />
        </div>
      </transition>
    </div>
    <div v-if="visiblePanel === PANEL_EDIT" :key="PANEL_EDIT">
      <transition enter-active-class="uk-animation-slide-right uk-animation-fast"
                  leave-active-class="uk-animation-slide-right uk-animation-reverse uk-animation-fast"
                  name="custom-classes-transition">
        <div class="uk-position-cover oc-default-background">
          <edit-collaborator v-if="$_ocCollaborators_canShare" key="edit-collaborator" @close="$_ocCollaborators_showList" :collaborator="currentShare" />
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex'
import Mixins from '../mixins/collaborators'
import { textUtils } from '../helpers/textUtils'
import { shareTypes } from '../helpers/shareTypes'
import { getParentPaths } from '../helpers/path'
const NewCollaborator = _ => import('./Collaborators/NewCollaborator.vue')
const EditCollaborator = _ => import('./Collaborators/EditCollaborator.vue')
const Collaborator = _ => import('./Collaborators/Collaborator.vue')

const PANEL_SHOW = 'showCollaborators'
const PANEL_EDIT = 'editCollaborator'
const PANEL_NEW = 'newCollaborator'

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
  data () {
    return {
      visiblePanel: PANEL_SHOW,
      currentShare: null,

      // panel types
      PANEL_SHOW: PANEL_SHOW,
      PANEL_EDIT: PANEL_EDIT,
      PANEL_NEW: PANEL_NEW
    }
  },
  mixins: [Mixins],
  mounted () {
    this.toggleCollaboratorsEdit(false)
    if (this.highlightedFile) {
      this.$_reloadShares()
    } else {
      this.$_clearShares()
    }
  },
  watch: {
    selectedFile (newItem, oldItem) {
      if (oldItem !== newItem) {
        this.$_reloadShares()
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
    ...mapState('Files', [
      'incomingShares',
      'incomingSharesError',
      'incomingSharesLoading',
      'sharesTree'
    ]),
    ...mapState(['user']),
    selectedFile () {
      return this.highlightedFile
    },
    $_sharesLoading () {
      return this.sharesLoading && this.incomingSharesLoading
    },

    $_noCollaborators () {
      return this.$_ownerAndResharers.length === 0 &&
        this.$_directOutgoingShares.length === 0 &&
        this.$_indirectOutgoingShares.length === 0
    },

    $_ownerAndResharers () {
      const ownerArray = this.$_shareOwnerAsCollaborator ? [this.$_shareOwnerAsCollaborator] : []
      return [
        ...ownerArray,
        ...this.$_resharersAsCollaborators
      ]
    },
    $_shareOwnerAsCollaborator () {
      if (!this.$_allIncomingShares.length) {
        return null
      }

      const firstShare = this.$_allIncomingShares[0]
      return {
        ...firstShare,
        name: firstShare.info.uid_file_owner,
        displayName: firstShare.info.displayname_file_owner,
        key: 'owner-' + firstShare.info.id,
        info: {
          path: firstShare.info.path,
          // set to user share for displaying user
          share_type: '' + shareTypes.user, // most code requires string..
          share_with_additional_info: firstShare.info.additional_info_file_owner || []
        },
        role: this.ownerRole
      }
    },

    $_resharersAsCollaborators () {
      const resharers = new Map()
      const owner = this.$_shareOwnerAsCollaborator

      this.$_allIncomingShares.forEach(share => {
        if (share.info.uid_owner !== owner.name) {
          resharers.set(share.info.uid_owner, {
            ...share,
            name: share.info.uid_owner,
            displayName: share.info.displayname_owner,
            role: this.resharerRole,
            key: 'resharer-' + share.info.id,
            info: {
              path: share.info.path,
              // set to user share for displaying user
              share_type: '' + shareTypes.user, // most code requires string..
              share_with_additional_info: share.info.additional_info_owner || []
            }
          })
        }
      })

      // make them unique then sort
      return Array.from(resharers.values()).sort(this.$_collaboratorsComparator.bind(this))
    },

    /**
     * Returns all incoming shares, direct and indirect
     *
     * @return {Array.<Object>} list of incoming shares
     */
    $_allIncomingShares () {
      // direct incoming shares
      const allShares = [...this.incomingShares]

      // indirect incoming shares
      const parentPaths = getParentPaths(this.highlightedFile.path, true)
      if (parentPaths.length === 0) {
        return []
      }

      // remove root entry
      parentPaths.pop()

      parentPaths.forEach((parentPath) => {
        const shares = this.sharesTree[parentPath]
        if (shares) {
          shares.forEach((share) => {
            if (share.incoming) {
              allShares.push(share)
            }
          })
        }
      })

      return allShares
    },

    $_directOutgoingShares () {
      // direct outgoing shares
      return this.shares
        .filter(this.$_isCollaboratorShare.bind(this))
        .sort(this.$_collaboratorsComparator.bind(this))
        .map(collaborator => {
          collaborator.key = 'collaborator-' + collaborator.info.id
          return collaborator
        })
    },

    $_indirectOutgoingShares () {
      const allShares = []
      const parentPaths = getParentPaths(this.highlightedFile.path, true)
      if (parentPaths.length === 0) {
        return []
      }

      // remove root entry
      parentPaths.pop()

      parentPaths.forEach((parentPath) => {
        const shares = this.sharesTree[parentPath]
        if (shares) {
          shares.forEach((share) => {
            if (share.outgoing && this.$_isCollaboratorShare(share)) {
              share.key = 'indirect-collaborator-' + share.info.id
              allShares.push(share)
            }
          })
        }
      })

      return allShares
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
      'deleteShare',
      'loadIncomingShares',
      'incomingSharesClearState'
    ]),
    $_isCollaboratorShare (collaborator) {
      return this.$_ocCollaborators_isUser(collaborator) || this.$_ocCollaborators_isGroup(collaborator)
    },
    $_collaboratorsComparator (c1, c2) {
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
        return textUtils.naturalSortCompare(name1, name2)
      }
    },
    $_ocCollaborators_addShare () {
      this.visiblePanel = PANEL_NEW
    },
    $_ocCollaborators_editShare (share) {
      this.currentShare = share
      this.visiblePanel = PANEL_EDIT
    },
    $_ocCollaborators_deleteShare (share) {
      this.deleteShare({
        client: this.$client,
        share: share
      })
    },
    $_ocCollaborators_showList () {
      this.visiblePanel = PANEL_SHOW
      this.currentShare = null
    },
    $_ocCollaborators_isUser (collaborator) {
      return collaborator.info.share_type === '0' || collaborator.info.share_type === '6'
    },
    $_ocCollaborators_isGroup (collaborator) {
      return collaborator.info.share_type === '1'
    },
    $_reloadShares () {
      this.loadShares({
        client: this.$client,
        path: this.highlightedFile.path
      })
      this.loadIncomingShares({
        client: this.$client,
        path: this.highlightedFile.path
      })
    },
    $_clearShares () {
      this.sharesClearState()
      this.incomingSharesClearState()
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
