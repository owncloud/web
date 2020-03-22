<template>
  <div id="oc-files-sharing-sidebar" class="uk-position-relative">
    <div
      v-show="visiblePanel === PANEL_SHOW"
      :key="PANEL_SHOW"
      :aria-hidden="visiblePanel !== PANEL_SHOW"
    >
      <oc-loader v-if="sharesLoading" :aria-label="$gettext('Loading collaborator list')" />
      <template v-else>
        <div v-if="$_ocCollaborators_canShare" class="uk-margin-small-top uk-margin-small-bottom">
          <oc-button
            variation="primary"
            icon="add"
            class="files-collaborators-open-add-share-dialog-button"
            @click="$_ocCollaborators_addShare"
          >
            <translate>Add Collaborators</translate>
          </oc-button>
        </div>
        <p
          v-else
          key="no-reshare-permissions-message"
          class="files-collaborators-no-reshare-permissions-message"
          v-text="noResharePermsMessage"
        />
        <section>
          <ul class="uk-list uk-list-divider uk-overflow-hidden uk-margin-remove">
            <li v-if="$_ownerAsCollaborator" :key="$_ownerAsCollaborator.key">
              <collaborator :collaborator="$_ownerAsCollaborator" />
            </li>
            <li>
              <collaborator :collaborator="$_currentUserAsCollaborator" />
            </li>
          </ul>
          <hr v-if="collaborators.length > 0" class="uk-margin-small-top uk-margin-small-bottom" />
        </section>
        <section>
          <transition-group
            id="files-collaborators-list"
            class="uk-list uk-list-divider uk-overflow-hidden uk-margin-remove"
            :enter-active-class="$_transitionGroupEnter"
            :leave-active-class="$_transitionGroupLeave"
            name="custom-classes-transition"
            tag="ul"
          >
            <li v-for="collaborator in collaborators" :key="collaborator.key">
              <collaborator
                :collaborator="collaborator"
                :modifiable="!collaborator.indirect"
                @onDelete="$_ocCollaborators_deleteShare"
                @onEdit="$_ocCollaborators_editShare"
              />
            </li>
          </transition-group>
        </section>
      </template>
    </div>
    <div v-if="visiblePanel === PANEL_NEW" :key="PANEL_NEW">
      <transition
        enter-active-class="uk-animation-slide-right uk-animation-fast"
        leave-active-class="uk-animation-slide-right uk-animation-reverse uk-animation-fast"
        name="custom-classes-transition"
      >
        <div class="uk-position-cover oc-default-background">
          <new-collaborator
            v-if="$_ocCollaborators_canShare"
            key="new-collaborator"
            @close="$_ocCollaborators_showList"
          />
        </div>
      </transition>
    </div>
    <div v-if="visiblePanel === PANEL_EDIT" :key="PANEL_EDIT">
      <transition
        enter-active-class="uk-animation-slide-right uk-animation-fast"
        leave-active-class="uk-animation-slide-right uk-animation-reverse uk-animation-fast"
        name="custom-classes-transition"
      >
        <div class="uk-position-cover oc-default-background">
          <edit-collaborator
            v-if="$_ocCollaborators_canShare"
            key="edit-collaborator"
            :collaborator="currentShare"
            @close="$_ocCollaborators_showList"
          />
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
import { dirname } from 'path'
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
  data() {
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
      'currentFileOutgoingSharesLoading',
      'sharesTreeLoading'
    ]),
    ...mapState('Files', ['incomingShares', 'incomingSharesLoading', 'sharesTree']),
    ...mapState(['user']),

    $_transitionGroupEnter() {
      return this.transitionGroupActive ? 'uk-animation-slide-left-medium' : ''
    },
    $_transitionGroupLeave() {
      return this.transitionGroupActive
        ? 'uk-animation-slide-right-medium uk-animation-reverse'
        : ''
    },

    sharesLoading() {
      return (
        this.currentFileOutgoingSharesLoading ||
        this.incomingSharesLoading ||
        this.sharesTreeLoading
      )
    },

    $_currentUserAsCollaborator() {
      const permissions = this.currentUsersPermissions
      const isFolder = this.highlightedFile.type === 'folder'
      let role = { name: '' }

      if (permissions > 0) {
        role = bitmaskToRole(permissions, isFolder)
      } else {
        role.name = 'owner'
      }

      return {
        collaborator: {
          name: this.user.id,
          displayName: this.user.displayname,
          additionalInfo: null
        },
        owner: {},
        fileOwner: {},
        shareType: shareTypes.user,
        role
      }
    },

    $_ownerAsCollaborator() {
      if (!this.$_allIncomingShares.length) {
        return null
      }
      const firstShare = this.$_allIncomingShares[0]
      const ownerAsCollaborator = {
        ...firstShare,
        collaborator: firstShare.fileOwner,
        owner: {},
        fileOwner: {},
        key: 'owner-' + firstShare.id,
        role: this.ownerRole
      }

      const resharers = new Map()
      this.$_allIncomingShares.forEach(share => {
        if (share.owner.name !== ownerAsCollaborator.collaborator.name) {
          resharers.set(share.owner.name, share.owner)
        }
      })

      // make them unique then sort
      ownerAsCollaborator.resharers = Array.from(resharers.values()).sort(
        this.collaboratorsComparator.bind(this)
      )
      return ownerAsCollaborator
    },

    /**
     * Returns all incoming shares, direct and indirect
     *
     * @return {Array.<Object>} list of incoming shares
     */
    $_allIncomingShares() {
      // direct incoming shares
      const allShares = [...this.incomingShares]

      // indirect incoming shares
      const parentPaths = getParentPaths(this.highlightedFile.path, true)
      if (parentPaths.length === 0) {
        return []
      }

      // remove root entry
      parentPaths.pop()

      parentPaths.forEach(parentPath => {
        const shares = this.sharesTree[parentPath]
        if (shares) {
          shares.forEach(share => {
            if (share.incoming) {
              allShares.push(share)
            }
          })
        }
      })

      return allShares
    },

    collaborators() {
      return [...this.currentFileOutgoingCollaborators, ...this.indirectOutgoingShares]
        .sort(this.collaboratorsComparator)
        .map(collaborator => {
          collaborator.key = 'collaborator-' + collaborator.id
          if (
            collaborator.owner.name !== collaborator.fileOwner.name &&
            collaborator.owner.name !== this.user.id
          ) {
            collaborator.resharers = [collaborator.owner]
          }
          return collaborator
        })
    },

    indirectOutgoingShares() {
      const allShares = []
      const parentPaths = getParentPaths(this.highlightedFile.path, false)
      if (parentPaths.length === 0) {
        return []
      }

      // remove root entry
      parentPaths.pop()

      parentPaths.forEach(parentPath => {
        const shares = this.sharesTree[parentPath]
        if (shares) {
          shares.forEach(share => {
            if (share.outgoing && this.$_isCollaboratorShare(share)) {
              share.key = 'indirect-collaborator-' + share.id
              allShares.push(share)
            }
          })
        }
      })

      return allShares
    },

    $_ocCollaborators_canShare() {
      return this.highlightedFile.canShare()
    },
    noResharePermsMessage() {
      const translated = this.$gettext("You don't have permission to share this %{type}.")
      return this.$gettextInterpolate(translated, { type: this.highlightedFile.type }, false)
    },

    currentUsersPermissions() {
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
    highlightedFile(newItem, oldItem) {
      if (oldItem !== newItem) {
        this.transitionGroupActive = false
        this.$_reloadShares()
      }
    }
  },
  mounted() {
    this.transitionGroupActive = false
    this.$_reloadShares()
  },
  methods: {
    ...mapActions('Files', [
      'loadCurrentFileOutgoingShares',
      'loadSharesTree',
      'sharesClearState',
      'deleteShare',
      'loadIncomingShares',
      'incomingSharesClearState'
    ]),
    $_isCollaboratorShare(collaborator) {
      return userShareTypes.includes(collaborator.shareType)
    },
    collaboratorsComparator(c1, c2) {
      // Sorted by: type, direct, display name, creation date
      const c1DisplayName = c1.collaborator ? c1.collaborator.displayName : c1.displayName
      const c2DisplayName = c2.collaborator ? c2.collaborator.displayName : c2.displayName
      const name1 = c1DisplayName.toLowerCase().trim()
      const name2 = c2DisplayName.toLowerCase().trim()
      const c1UserShare = c1.shareType === shareTypes.user || c1.shareType === shareTypes.remote
      const c2UserShare = c2.shareType === shareTypes.user || c1.shareType === shareTypes.remote
      const c1DirectShare = !c1.indirect
      const c2DirectShare = !c2.indirect

      if (c1UserShare === c2UserShare) {
        if (c1DirectShare === c2DirectShare) {
          if (name1 === name2) {
            return textUtils.naturalSortCompare(c1.stime + '', c2.stime + '')
          }

          return textUtils.naturalSortCompare(name1, name2)
        }

        return c1DirectShare ? -1 : 1
      }

      return c1UserShare ? -1 : 1
    },
    $_ocCollaborators_addShare() {
      this.transitionGroupActive = true
      this.visiblePanel = PANEL_NEW
    },
    $_ocCollaborators_editShare(share) {
      this.currentShare = share
      this.visiblePanel = PANEL_EDIT
    },
    $_ocCollaborators_deleteShare(share) {
      this.transitionGroupActive = true
      this.deleteShare({
        client: this.$client,
        share: share
      })
    },
    $_ocCollaborators_showList() {
      this.visiblePanel = PANEL_SHOW
      this.currentShare = null
    },
    $_ocCollaborators_isUser(collaborator) {
      return (
        collaborator.shareType === shareTypes.user || collaborator.shareType === shareTypes.remote
      )
    },
    $_ocCollaborators_isGroup(collaborator) {
      return collaborator.shareType === shareTypes.group
    },
    $_reloadShares() {
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
      this.loadSharesTree({
        client: this.$client,
        path: dirname(this.highlightedFile.path),
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
