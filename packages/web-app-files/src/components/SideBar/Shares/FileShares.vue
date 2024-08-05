<template>
  <div id="oc-files-sharing-sidebar" class="oc-position-relative">
    <div class="oc-flex">
      <h3 v-translate class="oc-text-bold oc-text-medium oc-m-rm">Share with people</h3>
      <oc-contextual-helper
        v-if="helpersEnabled"
        class="oc-pl-xs"
        v-bind="inviteCollaboratorHelp"
      />
    </div>
    <invite-collaborator-form
      v-if="canShare({ resource, space })"
      key="new-collaborator"
      class="oc-my-s"
    />
    <p
      v-else
      key="no-share-permissions-message"
      data-testid="files-collaborators-no-share-permissions-message"
      v-text="noSharePermsMessage"
    />
    <template v-if="hasSharees">
      <div id="files-collaborators-headline" class="oc-flex oc-flex-middle oc-flex-between">
        <h4 class="oc-text-bold oc-my-rm" v-text="sharedWithLabel" />
        <copy-private-link v-if="filesPrivateLinks" :resource="resource" />
      </div>
      <portal-target
        name="app.files.sidebar.sharing.shared-with.top"
        :slot-props="{ space, resource }"
        :multiple="true"
      />
      <ul
        id="files-collaborators-list"
        class="oc-list oc-list-divider"
        :class="{ 'oc-mb-l': showSpaceMembers, 'oc-m-rm': !showSpaceMembers }"
        :aria-label="$gettext('Share receivers')"
      >
        <li v-for="collaborator in displayCollaborators" :key="collaborator.id">
          <collaborator-list-item
            :share="collaborator"
            :resource-name="resource.name"
            :deniable="isShareDeniable(collaborator)"
            :modifiable="isShareModifiable(collaborator)"
            :is-share-denied="isShareDenied(collaborator)"
            :shared-parent-route="getSharedParentRoute(collaborator)"
            :is-locked="resource.locked"
            @on-delete="deleteShareConfirmation"
            @on-set-deny="setDenyShare"
          />
        </li>
        <portal-target
          name="app.files.sidebar.sharing.shared-with.bottom"
          :slot-props="{ space, resource }"
          :multiple="true"
        />
      </ul>
      <div v-if="showShareToggle" class="oc-flex oc-flex-center">
        <oc-button
          appearance="raw"
          class="toggle-shares-list-btn"
          @click="toggleShareListCollapsed"
        >
          {{ collapseButtonTitle }}
        </oc-button>
      </div>
    </template>
    <template v-if="showSpaceMembers">
      <div class="oc-flex oc-flex-middle oc-flex-between">
        <h4 class="oc-text-bold oc-my-s" v-text="spaceMemberLabel" />
        <copy-private-link v-if="filesPrivateLinks && !hasSharees" :resource="resource" />
      </div>
      <ul
        id="space-collaborators-list"
        class="oc-list oc-list-divider oc-overflow-hidden oc-m-rm"
        :aria-label="spaceMemberLabel"
      >
        <li v-for="(collaborator, i) in displaySpaceMembers" :key="i">
          <collaborator-list-item
            :share="collaborator"
            :resource-name="resource.name"
            :deniable="isSpaceMemberDeniable(collaborator)"
            :modifiable="false"
            :is-share-denied="isSpaceMemberDenied(collaborator)"
            :is-space-share="true"
            @on-set-deny="setDenyShare"
          />
        </li>
      </ul>
      <div v-if="showMemberToggle" class="oc-flex oc-flex-center">
        <oc-button appearance="raw" @click="toggleMemberListCollapsed">
          {{ collapseButtonTitle }}
        </oc-button>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { storeToRefs } from 'pinia'
import {
  useGetMatchingSpace,
  useModals,
  useUserStore,
  useMessages,
  useSpacesStore,
  useCapabilityStore,
  useConfigStore,
  useSharesStore,
  useResourcesStore,
  useCanShare
} from '@ownclouders/web-pkg'
import { isLocationSharesActive } from '@ownclouders/web-pkg'
import { textUtils } from '../../../helpers/textUtils'
import { ShareTypes } from '@ownclouders/web-client'
import InviteCollaboratorForm from './Collaborators/InviteCollaborator/InviteCollaboratorForm.vue'
import CollaboratorListItem from './Collaborators/ListItem.vue'
import {
  shareInviteCollaboratorHelp,
  shareInviteCollaboratorHelpCern
} from '../../../helpers/contextualHelpers'
import { computed, defineComponent, inject, ref, Ref, unref } from 'vue'
import {
  isProjectSpaceResource,
  Resource,
  SpaceResource,
  CollaboratorShare,
  isSpaceResource
} from '@ownclouders/web-client'
import { getSharedAncestorRoute } from '@ownclouders/web-pkg'
import CopyPrivateLink from '../../Shares/CopyPrivateLink.vue'

export default defineComponent({
  name: 'FileShares',
  components: {
    CopyPrivateLink,
    InviteCollaboratorForm,
    CollaboratorListItem
  },
  setup() {
    const userStore = useUserStore()
    const capabilityStore = useCapabilityStore()
    const capabilityRefs = storeToRefs(capabilityStore)
    const { getMatchingSpace } = useGetMatchingSpace()
    const { dispatchModal } = useModals()
    const { canShare } = useCanShare()

    const resourcesStore = useResourcesStore()
    const { removeResources, getAncestorById } = resourcesStore

    const spacesStore = useSpacesStore()
    const { spaceMembers } = storeToRefs(spacesStore)

    const configStore = useConfigStore()
    const { options: configOptions } = storeToRefs(configStore)

    const sharesStore = useSharesStore()
    const { addShare, deleteShare } = sharesStore
    const { collaboratorShares } = storeToRefs(sharesStore)

    const { user } = storeToRefs(userStore)

    const resource = inject<Ref<Resource>>('resource')
    const space = inject<Ref<SpaceResource>>('space')

    const sharesListCollapsed = ref(true)
    const toggleShareListCollapsed = () => {
      sharesListCollapsed.value = !unref(sharesListCollapsed)
    }
    const memberListCollapsed = ref(true)
    const toggleMemberListCollapsed = () => {
      memberListCollapsed.value = !unref(memberListCollapsed)
    }
    const currentUserIsMemberOfSpace = computed(() => {
      return unref(spaceMembers).some((member) => member.sharedWith?.id === unref(user)?.id)
    })

    const matchingSpace = computed(() => {
      return getMatchingSpace(unref(resource))
    })

    const collaborators = computed(() => {
      const collaboratorsComparator = (c1: CollaboratorShare, c2: CollaboratorShare) => {
        // Sorted by: type, direct, display name, creation date
        const name1 = c1.sharedWith.displayName.toLowerCase().trim()
        const name2 = c2.sharedWith.displayName.toLowerCase().trim()
        const c1UserShare = ShareTypes.containsAnyValue(ShareTypes.individuals, [c1.shareType])
        const c2UserShare = ShareTypes.containsAnyValue(ShareTypes.individuals, [c2.shareType])
        const c1DirectShare = !c1.indirect
        const c2DirectShare = !c2.indirect

        if (c1UserShare === c2UserShare) {
          if (c1DirectShare === c2DirectShare) {
            return textUtils.naturalSortCompare(name1, name2)
          }

          return c1DirectShare ? -1 : 1
        }

        return c1UserShare ? -1 : 1
      }

      return unref(collaboratorShares).sort(collaboratorsComparator)
    })

    return {
      addShare,
      deleteShare,
      user,
      resource,
      space,
      matchingSpace,
      sharesListCollapsed,
      toggleShareListCollapsed,
      memberListCollapsed,
      toggleMemberListCollapsed,
      currentUserIsMemberOfSpace,
      hasShareCanDenyAccess: capabilityRefs.sharingDenyAccess,
      filesPrivateLinks: capabilityRefs.filesPrivateLinks,
      getAncestorById,
      configStore,
      configOptions,
      dispatchModal,
      spaceMembers,
      removeResources,
      collaborators,
      canShare,
      ...useMessages()
    }
  },
  computed: {
    inviteCollaboratorHelp() {
      const cernFeatures = this.configOptions.cernFeatures

      if (cernFeatures) {
        const options = {
          configStore: this.configStore
        }
        const mergedHelp = shareInviteCollaboratorHelp(options)
        mergedHelp.list = [...shareInviteCollaboratorHelpCern(options).list, ...mergedHelp.list]
        return mergedHelp
      }

      return shareInviteCollaboratorHelp({
        configStore: this.configStore
      })
    },

    helpersEnabled() {
      return this.configOptions.contextHelpers
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
      return this.displayCollaborators.length > 0
    },

    displayCollaborators() {
      if (this.collaborators.length > 3 && this.sharesListCollapsed) {
        return this.collaborators.slice(0, 3)
      }

      return this.collaborators
    },

    displaySpaceMembers() {
      if (this.spaceMembers.length > 3 && this.memberListCollapsed) {
        return this.spaceMembers.slice(0, 3)
      }
      return this.spaceMembers
    },

    showShareToggle() {
      return this.collaborators.length > 3
    },

    showMemberToggle() {
      return this.spaceMembers.length > 3
    },

    noSharePermsMessage() {
      const translatedFile = this.$gettext("You don't have permission to share this file.")
      const translatedFolder = this.$gettext("You don't have permission to share this folder.")
      return this.resource.type === 'file' ? translatedFile : translatedFolder
    },

    showSpaceMembers() {
      return (
        this.space?.driveType === 'project' &&
        this.resource.type !== 'space' &&
        this.currentUserIsMemberOfSpace
      )
    }
  },
  methods: {
    getDeniedShare(collaborator: CollaboratorShare) {
      // FIXME: currently not supported by sharing NG
      return undefined
    },

    isShareDenied(collaborator: CollaboratorShare) {
      // FIXME: currently not supported by sharing NG
      return false
    },

    getDeniedSpaceMember(collaborator: CollaboratorShare) {
      // FIXME: currently not supported by sharing NG
      return undefined
    },

    isSpaceMemberDenied(collaborator: CollaboratorShare) {
      // FIXME: currently not supported by sharing NG
      return false
    },

    isSpaceMemberDeniable(collaborator: CollaboratorShare) {
      // FIXME: currently not supported by sharing NG
      return false
    },

    isShareDeniable(collaborator: CollaboratorShare) {
      // FIXME: currently not supported by sharing NG
      return false
    },

    async setDenyShare({ value, share }: { value: boolean; share: CollaboratorShare }) {
      if (value === true) {
        try {
          await this.addShare({
            clientService: this.$clientService,
            space: this.space,
            resource: this.resource,
            options: {}
          })
          this.showMessage({
            title: this.$gettext('Access was denied successfully')
          })
        } catch (e) {
          console.error(e)
          this.showErrorMessage({
            title: this.$gettext('Failed to deny access'),
            errors: [e]
          })
        }
      } else {
        try {
          await this.deleteShare({
            clientService: this.$clientService,
            space: this.space,
            resource: this.resource,
            collaboratorShare: isSpaceResource(this.resource)
              ? this.getDeniedSpaceMember(share)
              : this.getDeniedShare(share),
            loadIndicators: false
          })
          this.showMessage({
            title: this.$gettext('Access was granted successfully')
          })
        } catch (e) {
          console.error(e)
          this.showErrorMessage({
            title: this.$gettext('Failed to grant access'),
            errors: [e]
          })
        }
      }
    },

    deleteShareConfirmation(collaboratorShare: CollaboratorShare) {
      this.dispatchModal({
        variation: 'danger',
        title: this.$gettext('Remove share'),
        confirmText: this.$gettext('Remove'),
        message: this.$gettext('Are you sure you want to remove this share?'),
        hasInput: false,
        onConfirm: async () => {
          const lastShareId = this.collaborators.length === 1 ? this.collaborators[0].id : undefined
          const loadIndicators = this.collaborators.filter((c) => !c.indirect).length === 1

          try {
            await this.deleteShare({
              clientService: this.$clientService,
              space: this.space,
              resource: this.resource,
              collaboratorShare,
              loadIndicators
            })

            this.showMessage({
              title: this.$gettext('Share was removed successfully')
            })
            if (lastShareId && isLocationSharesActive(this.$router, 'files-shares-with-others')) {
              this.removeResources([{ id: lastShareId }] as Resource[])
            }
          } catch (error) {
            console.error(error)
            this.showErrorMessage({
              title: this.$gettext('Failed to remove share'),
              errors: [error]
            })
          }
        }
      })
    },

    getSharedParentRoute(collaborator: CollaboratorShare) {
      if (!collaborator.indirect) {
        return null
      }
      const sharedAncestor = this.getAncestorById(collaborator.resourceId)
      if (!sharedAncestor) {
        return null
      }

      return getSharedAncestorRoute({
        sharedAncestor,
        matchingSpace: this.space || this.matchingSpace
      })
    },

    isShareModifiable(collaborator: CollaboratorShare) {
      if (collaborator.indirect) {
        return false
      }

      if (isProjectSpaceResource(this.space) && !this.space.isManager(this.user)) {
        return false
      }

      return true
    }
  }
})
</script>

<style lang="scss" scoped>
#files-collaborators-headline {
  height: 40px;
}
</style>
