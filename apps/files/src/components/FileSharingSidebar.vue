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
        <p class="files-collaborators-no-reshare-permissions-message"
           key="no-reshare-permissions-message"
           v-else
           v-text="noResharePermsMessage"
        />
        <section>
          <ul class="uk-list uk-list-divider uk-overflow-hidden uk-margin-remove">
            <li  v-if="$_ownerAsCollaborator" :key="$_ownerAsCollaborator.key">
              <collaborator :collaborator="$_ownerAsCollaborator"/>
            </li>
            <li>
              <collaborator :collaborator="$_currentUserAsCollaborator"/>
            </li>
          </ul>
          <hr class="uk-margin-small-top uk-margin-small-bottom" v-if="$_directOutgoingShares.length > 0 || $_indirectOutgoingShares.length > 0" />
        </section>
        <section>
          <transition-group id="files-collaborators-list"
                            class="uk-list uk-list-divider uk-overflow-hidden uk-margin-remove"
                            :enter-active-class="$_transitionGroupEnter"
                            :leave-active-class="$_transitionGroupLeave"
                            name="custom-classes-transition"
                            tag="ul">
            <li v-for="collaborator in $_directOutgoingShares" :key="collaborator.key">
              <collaborator :collaborator="collaborator" :modifiable="true" @onDelete="$_ocCollaborators_deleteShare" @onEdit="$_ocCollaborators_editShare"/>
            </li>
          </transition-group>
          <hr class="uk-margin-small-top uk-margin-small-bottom" v-if="$_directOutgoingShares.length > 0 && $_indirectOutgoingShares.length > 0" />
        </section>
        <section v-if="$_indirectOutgoingShares.length > 0">
          <ul class="uk-list uk-list-divider uk-overflow-hidden uk-margin-remove">
            <li v-for="collaborator in $_indirectOutgoingShares" :key="collaborator.key">
              <collaborator :collaborator="collaborator"/>
            </li>
          </ul>
        </section>
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
import { shareTypes, userShareTypes } from '../helpers/shareTypes'
import { getParentPaths } from '../helpers/path'
import { bitmaskToRole, permissionsBitmask } from '../helpers/collaborators'
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
  mixins: [Mixins],
  data () {
    return {
      visiblePanel: PANEL_SHOW,
      currentShare: null,
      transitionGroupActive: false,

      // panel types
      PANEL_SHOW,
      PANEL_EDIT,
      PANEL_NEW
    }
  },
  computed: {
    ...mapGetters('Files', [
      'highlightedFile',
      'currentFileOutgoingCollaborators',
      'currentFileOutgoingSharesLoading'
    ]),
    ...mapState('Files', [
      'incomingShares',
      'incomingSharesLoading',
      'sharesTree'
    ]),
    ...mapState(['user']),

    $_transitionGroupEnter () {
      return this.transitionGroupActive ? 'uk-animation-slide-left-medium' : ''
    },
    $_transitionGroupLeave () {
      return this.transitionGroupActive ? 'uk-animation-slide-right-medium uk-animation-reverse' : ''
    },

    $_sharesLoading () {
      return this.currentFileOutgoingSharesLoading && this.incomingSharesLoading
    },

    $_currentUserAsCollaborator () {
      const permissions = this.currentUsersPermissions
      const isFolder = this.highlightedFile.type === 'folder'
      let role = { name: '' }

      if (permissions > 0) {
        role = bitmaskToRole(permissions, isFolder)
      } else {
        role.name = 'owner'
      }

      return {
        name: this.user.id,
        displayName: this.user.displayname,
        info: {
          share_type: 0,
          share_with_additional_info: {}
        },
        role
      }
    },

    $_ownerAsCollaborator () {
      if (!this.$_allIncomingShares.length) {
        return null
      }

      const ownerAsCollaborator = this.$_allIncomingShares[0]

      let resharers = new Map()
      this.$_allIncomingShares.forEach(share => {
        if (share.info.uid_owner !== ownerAsCollaborator.info.uid_owner) {
          resharers.set(share.info.uid_owner, {
            name: share.info.uid_owner,
            displayName: share.info.displayname_owner
          })
        }
      })

      // make them unique then sort
      resharers = Array.from(resharers.values()).sort(this.$_collaboratorsComparator.bind(this))

      return {
        ...ownerAsCollaborator,
        name: ownerAsCollaborator.info.uid_file_owner,
        displayName: ownerAsCollaborator.info.displayname_file_owner,
        key: 'owner-' + ownerAsCollaborator.info.id,
        info: {
          path: ownerAsCollaborator.info.path,
          // set to user share for displaying user
          share_type: shareTypes.user,
          share_with_additional_info: ownerAsCollaborator.info.additional_info_file_owner || []
        },
        role: this.ownerRole,
        resharers: resharers
      }
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
      return [...this.currentFileOutgoingCollaborators]
        .sort(this.$_collaboratorsComparator)
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
      const translated = this.$gettext('You don\'t have permission to share this %{type}.')
      return this.$gettextInterpolate(translated, { type: this.highlightedFile.type }, false)
    },

    currentUsersPermissions () {
      if (this.incomingShares.length > 0) {
        let permissions = permissionsBitmask.read

        for (const share of this.incomingShares) {
          permissions |= share.permissions
        }

        return permissions
      }

      return null
    }
  },
  watch: {
    highlightedFile (newItem, oldItem) {
      if (oldItem !== newItem) {
        this.transitionGroupActive = false
        this.$_reloadShares()
      }
    }
  },
  mounted () {
    this.transitionGroupActive = false
    this.$_reloadShares()
  },
  methods: {
    ...mapActions('Files', [
      'loadCurrentFileOutgoingShares',
      'sharesClearState',
      'deleteShare',
      'loadIncomingShares',
      'incomingSharesClearState'
    ]),
    $_isCollaboratorShare (collaborator) {
      return userShareTypes.includes(collaborator.shareType)
    },
    $_collaboratorsComparator (c1, c2) {
      const name1 = c1.displayName.toLowerCase().trim()
      const name2 = c2.displayName.toLowerCase().trim()
      // sorting priority 1: display name (lower case, ascending), 2: share type (groups first), 3: id (ascending)
      if (name1 === name2) {
        const c1GroupShare = c1.shareType === shareTypes.group
        const c2GroupShare = c2.shareType === shareTypes.group
        if (c1GroupShare === c2GroupShare) {
          return textUtils.naturalSortCompare(c1.info.id + '', c2.info.id + '')
        } else {
          return c1GroupShare ? -1 : 1
        }
      } else {
        return textUtils.naturalSortCompare(name1, name2)
      }
    },
    $_ocCollaborators_addShare () {
      this.transitionGroupActive = true
      this.visiblePanel = PANEL_NEW
    },
    $_ocCollaborators_editShare (share) {
      this.currentShare = share
      this.visiblePanel = PANEL_EDIT
    },
    $_ocCollaborators_deleteShare (share) {
      this.transitionGroupActive = true
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
      return collaborator.shareType === shareTypes.user || collaborator.shareType === shareTypes.remote
    },
    $_ocCollaborators_isGroup (collaborator) {
      return collaborator.shareType === shareTypes.group
    },
    $_reloadShares () {
      this.$_ocCollaborators_showList()
      this.loadCurrentFileOutgoingShares({
        client: this.$client,
        path: this.highlightedFile.path,
        $gettext: this.$gettext
      })
      this.loadIncomingShares({
        client: this.$client,
        path: this.highlightedFile.path,
        $gettext: this.$gettext
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
