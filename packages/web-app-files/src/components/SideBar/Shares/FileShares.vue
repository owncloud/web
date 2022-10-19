<template>
  <div id="oc-files-sharing-sidebar" class="oc-position-relative">
    <div class="oc-flex">
      <h3 v-translate class="oc-text-bold oc-text-medium oc-m-rm">Share with people</h3>
      <oc-contextual-helper
        v-if="helpersEnabled"
        class="oc-pl-xs"
        v-bind="inviteCollaboratorHelp"
        :aria-label="helperLabel"
      />
    </div>
    <invite-collaborator-form v-if="currentUserCanShare" key="new-collaborator" class="oc-my-s" />
    <p
      v-else
      key="no-reshare-permissions-message"
      data-testid="files-collaborators-no-reshare-permissions-message"
      v-text="noResharePermsMessage"
    />
    <div v-if="hasSharees" class="avatars-wrapper oc-flex oc-flex-middle oc-flex-between">
      <h4 class="oc-text-bold oc-my-rm" v-text="sharedWithLabel" />
    </div>
    <template v-if="hasSharees">
      <name-and-copy :link="shareLink" />
      <ul
        id="files-collaborators-list"
        class="oc-list oc-list-divider oc-overflow-hidden"
        :class="{ 'oc-mb-l': showSpaceMembers, 'oc-m-rm': !showSpaceMembers }"
        :aria-label="$gettext('Share receivers')"
      >
        <li v-for="collaborator in displayCollaborators" :key="collaborator.key">
          <collaborator-list-item
            :share="collaborator"
            :modifiable="isShareModifiable(collaborator)"
            :shared-parent-route="getSharedParentRoute(collaborator)"
            @onDelete="$_ocCollaborators_deleteShare_trigger"
          />
        </li>
      </ul>
      <div v-if="showShareToggle" class="oc-flex oc-flex-center">
        <oc-button
          appearance="raw"
          @click="toggleShareesListCollapsed"
          v-text="collapseButtonTitle"
        />
      </div>
    </template>
    <template v-if="showSpaceMembers">
      <h4 class="oc-text-bold oc-my-s" v-text="spaceMemberLabel" />
      <ul
        id="space-collaborators-list"
        class="oc-list oc-list-divider oc-overflow-hidden oc-m-rm"
        :aria-label="spaceMemberLabel"
      >
        <li v-for="collaborator in displaySpaceMembers" :key="collaborator.key">
          <collaborator-list-item :share="collaborator" :modifiable="false" />
        </li>
      </ul>
      <div v-if="showShareToggle" class="oc-flex oc-flex-center">
        <oc-button
          appearance="raw"
          @click="toggleShareesListCollapsed"
          v-text="collapseButtonTitle"
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { mapGetters, mapActions, mapState } from 'vuex'
import { watch, computed, ref, unref } from '@vue/composition-api'
import {
  useStore,
  useRouteParam,
  useCapabilityProjectSpacesEnabled,
  useCapabilityShareJailEnabled,
  useCapabilityFilesSharingResharing
} from 'web-pkg/src/composables'
import { createLocationSpaces, isLocationSpacesActive } from '../../../router'
import { textUtils } from '../../../helpers/textUtils'
import { getParentPaths } from '../../../helpers/path'
import { ShareTypes } from 'web-client/src/helpers/share'
import InviteCollaboratorForm from './Collaborators/InviteCollaborator/InviteCollaboratorForm.vue'
import CollaboratorListItem from './Collaborators/ListItem.vue'
import {
  shareInviteCollaboratorHelp,
  shareInviteCollaboratorHelpCern
} from '../../../helpers/contextualHelpers'
import NameAndCopy from './Links/NameAndCopy.vue'
import { encodePath } from 'web-pkg/src/utils'

export default {
  name: 'FileShares',
  components: {
    InviteCollaboratorForm,
    CollaboratorListItem,
    NameAndCopy
  },
  setup() {
    const store = useStore()
    const currentSpace = ref(null)
    const currentStorageId = useRouteParam('storageId')
    watch(
      currentStorageId,
      (storageId) => {
        currentSpace.value = store.state.runtime.spaces?.spaces?.find(
          (space) => space.id === storageId
        )
      },
      { immediate: true }
    )
    const isCurrentSpaceTypeProject = computed(() => unref(currentSpace)?.driveType === 'project')
    const sharesListCollapsed = !store.getters.configuration.options.sidebar.shares.showAllOnLoad

    return {
      currentStorageId,
      currentSpace,
      isCurrentSpaceTypeProject,
      sharesListCollapsed,
      hasProjectSpaces: useCapabilityProjectSpacesEnabled(),
      hasShareJail: useCapabilityShareJailEnabled(),
      hasResharing: useCapabilityFilesSharingResharing()
    }
  },
  computed: {
    ...mapGetters('Files', ['highlightedFile', 'currentFileOutgoingCollaborators']),
    ...mapGetters(['homeFolder']),
    ...mapGetters(['configuration']),
    ...mapGetters('runtime/spaces', ['spaceMembers']),
    ...mapState('Files', ['incomingShares', 'sharesTree']),
    ...mapState(['user']),

    inviteCollaboratorHelp() {
      const cernFeatures = !!this.configuration?.options?.cernFeatures

      if (cernFeatures) {
        const mergedHelp = shareInviteCollaboratorHelp
        mergedHelp.list = [
          ...shareInviteCollaboratorHelpCern.list,
          ...shareInviteCollaboratorHelp.list
        ]
        return mergedHelp
      }

      return shareInviteCollaboratorHelp
    },
    helperLabel(){
      return this.$gettext('Contextual helper')
    },
    helpersEnabled() {
      return this.configuration?.options?.contextHelpers
    },
    sharedWithLabel() {
      return this.$gettext('Shared with')
    },
    spaceMemberLabel() {
      return this.$gettext('Space members')
    },

    collapseButtonTitle() {
      return this.sharesListCollapsed ? this.$gettext('Show more') : this.$gettext('Show less')
    },

    hasSharees() {
      return this.collaborators.length > 0
    },

    highlightedIsHomeFolder() {
      return this.highlightedFile?.path === this.homeFolder
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
      // filter out bad egroups
      return [
        ...this.currentFileOutgoingCollaborators.filter(
          (e) => e.collaborator.displayName || e.displayName
        ),
        ...this.indirectOutgoingShares.filter((e) => e.collaborator.displayName || e.displayName)
      ]
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

    displayCollaborators() {
      if (this.collaborators.length > 3 && this.sharesListCollapsed) {
        return this.collaborators.slice(0, 3)
      }
      return this.collaborators
    },

    displaySpaceMembers() {
      if (this.spaceMembers.length > 3 && this.sharesListCollapsed) {
        return this.spaceMembers.slice(0, 3)
      }
      return this.spaceMembers
    },

    showShareToggle() {
      return this.spaceMembers.length > 3 || this.collaborators.length > 3
    },

    indirectOutgoingShares() {
      const allShares = []
      const parentPaths = getParentPaths(this.highlightedFile.path, false)
      if (parentPaths.length === 0) {
        return []
      }

      parentPaths.forEach((parentPath) => {
        const shares = this.sharesTree[parentPath]
        if (shares) {
          shares.forEach((share) => {
            if (share.outgoing && this.$_isCollaboratorShare(share)) {
              allShares.push({ ...share, key: 'indirect-collaborator-' + share.id })
            }
          })
        }
      })

      return allShares
    },

    currentUserCanShare() {
      if (this.highlightedIsHomeFolder) {
        return false
      }
      if (this.highlightedFile.isReceivedShare() && !this.hasResharing) {
        return false
      }
      const isShareJail = isLocationSpacesActive(this.$router, 'files-spaces-share')
      if (isShareJail && !this.hasResharing) {
        return false
      }

      return this.highlightedFile.canShare({ user: this.user })
    },
    noResharePermsMessage() {
      if (this.highlightedIsHomeFolder) {
        return this.$gettext("You can't share your entire home folder")
      } else if (this.highlightedFile.type === 'file') {
        return this.$gettext("You don't have permission to share this file.")
      } else if (this.highlightedFile.type === 'folder') {
        return this.$gettext("You don't have permission to share this folder.")
      }
    },
    currentUserIsMemberOfSpace() {
      return this.currentSpace?.spaceMemberIds?.includes(this.user.uuid)
    },
    showSpaceMembers() {
      return (
        this.currentSpace &&
        this.isCurrentSpaceTypeProject &&
        this.highlightedFile.type !== 'space' &&
        this.currentUserIsMemberOfSpace
      )
    },
    shareLink() {
      return {
        path: `${this.configuration.server}files/spaces${encodePath(this.highlightedFile.path)}`,
        url: `${this.configuration.server}files/spaces${encodePath(this.highlightedFile.path)}`
      }
    }
  },
  mounted() {
    if (this.showSpaceMembers) {
      this.loadSpaceMembersTask.perform()
    }
  },
  methods: {
    ...mapActions('Files', ['deleteShare']),
    ...mapActions(['createModal', 'hideModal', 'showMessage']),
    toggleShareesListCollapsed() {
      this.sharesListCollapsed = !this.sharesListCollapsed
    },
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

    $_ocCollaborators_deleteShare_trigger(share) {
      const modal = {
        variation: 'danger',
        icon: 'alarm-warning',
        title: this.$gettext('Remove share'),
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Remove'),
        message: this.$gettext('Are you sure you want to remove this share?'),
        hasInput: false,
        onCancel: this.hideModal,
        onConfirm: () => this.$_ocCollaborators_deleteShare(share)
      }

      this.createModal(modal)
    },

    $_ocCollaborators_deleteShare(share) {
      let path = this.highlightedFile.path
      // sharing a share root from the share jail -> use resource name as path
      if (this.hasShareJail && path === '/') {
        path = `/${this.highlightedFile.name}`
      }
      this.deleteShare({
        client: this.$client,
        share: share,
        path,
        storageId: this.highlightedFile.fileId
      })
        .then(() => {
          this.hideModal()
          this.showMessage({
            title: this.$gettext('Share was removed successfully')
          })
        })
        .catch((error) => {
          console.error(error)
          this.showMessage({
            title: this.$gettext('Failed to remove share'),
            status: 'danger'
          })
        })
    },
    getSharedParentRoute(parentShare) {
      if (!parentShare.indirect) {
        return null
      }

      if (this.sharesTree[parentShare.path]) {
        if (isLocationSpacesActive(this.$router, 'files-spaces-project')) {
          return createLocationSpaces('files-spaces-project', {
            params: { storageId: this.currentStorageId, item: parentShare.path }
          })
        }

        return createLocationSpaces('files-spaces-personal', {
          params: { storageId: this.currentStorageId, item: parentShare.path }
        })
      }

      return null
    },

    isShareModifiable(collaborator) {
      if (
        this.currentUserIsMemberOfSpace &&
        !this.currentSpace?.spaceRoles.manager.includes(this.user.uuid)
      ) {
        return false
      }

      return !collaborator.indirect
    }
  }
}
</script>

<style>
.avatars-wrapper {
  height: 40px;
}
</style>
