<template>
  <div id="oc-files-sharing-sidebar" class="oc-position-relative">
    <oc-loader v-if="sharesLoading" :aria-label="$gettext('Loading people list')" />
    <template v-else>
      <h3 v-translate class="oc-text-bold oc-m-rm oc-text-initial">Share with people</h3>
      <invite-collaborator-form v-if="currentUserCanShare" key="new-collaborator" class="oc-my-s" />
      <p
        v-else
        key="no-reshare-permissions-message"
        data-testid="files-collaborators-no-reshare-permissions-message"
        v-text="noResharePermsMessage"
      />
      <div v-if="hasSharees" class="avatars-wrapper oc-flex oc-flex-middle oc-flex-between">
        <h4 class="oc-text-initial oc-text-bold oc-my-rm" v-text="sharedWithLabel" />
      </div>
      <template v-if="hasSharees">
        <ul
          id="files-collaborators-list"
          class="oc-list oc-list-divider oc-overflow-hidden"
          :class="{ 'oc-mb-l': showSpaceMembers, 'oc-m-rm': !showSpaceMembers }"
          :aria-label="$gettext('Share receivers')"
        >
          <li v-for="collaborator in displayCollaborators" :key="collaborator.key">
            <collaborator-list-item
              :share="collaborator"
              :modifiable="!collaborator.indirect"
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
        <h4 class="oc-text-initial oc-text-bold oc-my-s" v-text="spaceMemberLabel" />
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
    </template>
  </div>
</template>

<script lang="ts">
import { useTask } from 'vue-concurrency'
import { mapGetters, mapActions, mapState } from 'vuex'
import { watch, computed, ref, unref } from '@vue/composition-api'
import {
  useStore,
  useDebouncedRef,
  useRouteParam,
  useCapabilityProjectSpacesEnabled,
  useCapabilityShareJailEnabled,
  useCapabilityFilesSharingResharing
} from 'web-pkg/src/composables'
import { createLocationSpaces, isLocationSpacesActive } from '../../../router'
import { textUtils } from '../../../helpers/textUtils'
import { getParentPaths } from '../../../helpers/path'
import { buildSpaceShare } from '../../../helpers/resources'
import { ShareTypes } from '../../../helpers/share'
import { sortSpaceMembers } from '../../../helpers/space'
import InviteCollaboratorForm from './Collaborators/InviteCollaborator/InviteCollaboratorForm.vue'
import CollaboratorListItem from './Collaborators/ListItem.vue'
import { useGraphClient } from 'web-client/src/composables'

export default {
  name: 'FileShares',
  components: {
    InviteCollaboratorForm,
    CollaboratorListItem
  },
  setup() {
    const store = useStore()
    const currentFileOutgoingSharesLoading = computed(
      () => store.getters['Files/currentFileOutgoingSharesLoading']
    )
    const incomingSharesLoading = computed(() => store.state.Files.incomingSharesLoading)
    const sharesTreeLoading = computed(() => store.state.Files.sharesTreeLoading)
    const sharesLoading = useDebouncedRef(true, 250)
    watch([currentFileOutgoingSharesLoading, incomingSharesLoading, sharesTreeLoading], () => {
      sharesLoading.value =
        currentFileOutgoingSharesLoading.value ||
        incomingSharesLoading.value ||
        sharesTreeLoading.value
    })

    const currentSpace = ref(null)
    const spaceMembers = ref([])
    const currentStorageId = useRouteParam('storageId')
    watch(
      currentStorageId,
      (storageId) => {
        currentSpace.value = store.state.Files.spaces?.find((space) => space.id === storageId)
      },
      { immediate: true }
    )
    const isCurrentSpaceTypeProject = computed(() => unref(currentSpace)?.driveType === 'project')

    const { graphClient } = useGraphClient({ store })

    const loadSpaceMembersTask = useTask(function* (signal, ref) {
      const promises = []
      const spaceShares = []

      for (const role of Object.keys(unref(currentSpace).spaceRoles)) {
        for (const userId of unref(currentSpace).spaceRoles[role]) {
          promises.push(
            unref(graphClient)
              .users.getUser(userId)
              .then((resolved) => {
                spaceShares.push(
                  buildSpaceShare({ ...resolved.data, role }, unref(currentSpace).id)
                )
              })
          )
        }
      }

      yield Promise.all(promises).then(() => {
        spaceMembers.value = sortSpaceMembers(spaceShares)
      })
    })

    const sharesListCollapsed = !store.getters.configuration.options.sidebar.shares.showAllOnLoad

    return {
      currentStorageId,
      currentSpace,
      spaceMembers,
      isCurrentSpaceTypeProject,
      loadSpaceMembersTask,
      sharesListCollapsed,
      sharesLoading,
      hasProjectSpaces: useCapabilityProjectSpacesEnabled(),
      hasShareJail: useCapabilityShareJailEnabled(),
      hasResharing: useCapabilityFilesSharingResharing()
    }
  },
  computed: {
    ...mapGetters('Files', ['highlightedFile', 'currentFileOutgoingCollaborators']),
    ...mapState('Files', ['incomingShares', 'sharesTree']),
    ...mapState(['user']),

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

    currentUserCanShare() {
      const isProjects = this.$route.name === 'files-spaces-personal'
      if (isProjects) return this.highlightedFile.canShare({ user: this.user })

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
    }
  },
  async mounted() {
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
        title: this.$gettext('Remove share'),
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Remove'),
        icon: 'alarm-warning',
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
        ...(this.currentStorageId && { storageId: this.currentStorageId })
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
          params: { item: parentShare.path }
        })
      }

      return null
    }
  }
}
</script>

<style>
.avatars-wrapper {
  height: 40px;
}
</style>
