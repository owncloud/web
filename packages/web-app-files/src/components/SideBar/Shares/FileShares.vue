<template>
  <div id="oc-files-sharing-sidebar" class="uk-position-relative">
    <oc-loader v-if="sharesLoading" :aria-label="$gettext('Loading people list')" />
    <template v-else>
      <invite-collaborator-form
        v-if="$_ocCollaborators_canShare"
        key="new-collaborator"
        class="oc-my-s"
      />
      <p
        v-else
        key="no-reshare-permissions-message"
        data-testid="files-collaborators-no-reshare-permissions-message"
        v-text="noResharePermsMessage"
      />
      <div v-if="hasSharees" class="avatars-wrapper uk-flex uk-flex-middle uk-flex-between">
        <h4 class="oc-text-initial oc-text-bold oc-mb-rm" v-text="sharedWithLabel" />
        <oc-button
          v-oc-tooltip="sharedWithTooltip"
          data-testid="collaborators-show-people"
          appearance="raw"
          :aria-label="sharedWithTooltip"
          @click="toggleShareeList"
        >
          <oc-avatars
            v-if="!showShareesList"
            :items="collaboratorsAvatar"
            :stacked="true"
            :is-tooltip-displayed="false"
            class="sharee-avatars"
          />
          <oc-icon v-else name="chevron_up" />
        </oc-button>
      </div>
      <template v-if="showShareesList || collaboratorsAvatar.length === 0">
        <transition-group
          id="files-collaborators-list"
          class="uk-list uk-list-divider uk-overflow-hidden oc-m-rm"
          name="custom-classes-transition"
          tag="ul"
          :aria-label="$gettext('Share receivers')"
        >
          <li v-for="collaborator in collaborators" :key="collaborator.key">
            <collaborator-list-item
              :collaborator="collaborator"
              :modifiable="!collaborator.indirect"
              @onDelete="$_ocCollaborators_deleteShare"
            />
          </li>
        </transition-group>
      </template>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex'
import { textUtils } from '../../../helpers/textUtils'
import { getParentPaths } from '../../../helpers/path'
import { dirname } from 'path'
import InviteCollaboratorForm from './InviteCollaborator/InviteCollaboratorForm.vue'
import CollaboratorListItem from './Collaborators/ListItem.vue'
import { ShareTypes } from '../../../helpers/share'

export default {
  title: ($gettext) => {
    return $gettext('People')
  },
  name: 'FileShares',
  components: {
    InviteCollaboratorForm,
    CollaboratorListItem
  },
  data() {
    return {
      currentShare: null,
      showShareesList: true
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

    sharedWithLabel() {
      return this.$gettext('Shared with')
    },

    hasSharees() {
      return this.collaboratorsAvatar.length > 0
    },

    sharedWithTooltip() {
      return this.showShareesList
        ? this.$gettext('Collapse list of invited people')
        : this.$gettext('Show all invited people')
    },

    sharesLoading() {
      return (
        this.currentFileOutgoingSharesLoading ||
        this.incomingSharesLoading ||
        this.sharesTreeLoading
      )
    },

    collaboratorsAvatar() {
      return this.collaborators.map((c) => {
        return {
          ...c.collaborator,
          shareType: c.shareType
        }
      })
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

    collaborators() {
      return [...this.currentFileOutgoingCollaborators, ...this.indirectOutgoingShares]
        .sort(this.collaboratorsComparator)
        .map((collaborator) => {
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

      parentPaths.forEach((parentPath) => {
        const shares = this.sharesTree[parentPath]
        if (shares) {
          shares.forEach((share) => {
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
      const translatedFile = this.$gettext("You don't have permission to share this file.")
      const translatedFolder = this.$gettext("You don't have permission to share this folder.")
      return this.highlightedFile.type === 'file' ? translatedFile : translatedFolder
    },

    currentUsersPermissions() {
      if (this.$_allIncomingShares.length > 0) {
        let permissions = 0

        for (const share of this.$_allIncomingShares) {
          permissions |= share.permissions
        }

        return permissions
      }

      return null
    }
  },
  watch: {
    highlightedFile: {
      handler: function (newItem, oldItem) {
        if (oldItem !== newItem) {
          this.$_reloadShares()
          this.showShareesList = true
        }
      },
      immediate: true
    }
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
      return ShareTypes.containsAnyValue(ShareTypes.authenticated, [collaborator.shareType])
    },
    collaboratorsComparator(c1, c2) {
      // Sorted by: type, direct, display name, creation date
      const c1DisplayName = c1.collaborator ? c1.collaborator.displayName : c1.displayName
      const c2DisplayName = c2.collaborator ? c2.collaborator.displayName : c2.displayName
      const name1 = c1DisplayName.toLowerCase().trim()
      const name2 = c2DisplayName.toLowerCase().trim()
      const c1UserShare = ShareTypes.containsAnyValue(ShareTypes.individuals, [c1.shareType])
      const c2UserShare = ShareTypes.containsAnyValue(ShareTypes.individuals, [c2.shareType])
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
    toggleShareeList() {
      this.showShareesList = !this.showShareesList
    },
    $_ocCollaborators_deleteShare(share) {
      this.deleteShare({
        client: this.$client,
        share: share,
        resource: this.highlightedFile
      })
    },
    $_reloadShares() {
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
.avatars-wrapper {
  height: 40px;
}
</style>
