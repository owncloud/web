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
      <portal-target
        name="app.files.sidebar.sharing.shared-with.top"
        :slot-props="{ space, resource }"
        :multiple="true"
      />
      <ul
        id="files-collaborators-list"
        class="oc-list oc-list-divider oc-overflow-hidden"
        :class="{ 'oc-mb-l': showSpaceMembers, 'oc-m-rm': !showSpaceMembers }"
        :aria-label="$gettext('Share receivers')"
      >
        <li v-for="collaborator in displayCollaborators" :key="collaborator.key">
          <collaborator-list-item
            :share="collaborator"
            :resource-name="resource.name"
            :deniable="isShareDeniable(collaborator)"
            :modifiable="isShareModifiable(collaborator)"
            :is-share-denied="isShareDenied(collaborator)"
            :shared-parent-route="getSharedParentRoute(collaborator)"
            :is-locked="resource.locked"
            @on-delete="$_ocCollaborators_deleteShare_trigger"
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
          <collaborator-list-item
            :share="collaborator"
            :resource-name="resource.name"
            :deniable="isSpaceMemberDeniable(collaborator)"
            :modifiable="false"
            :is-share-denied="isSpaceMemberDenied(collaborator)"
            @on-set-deny="setDenyShare"
          />
        </li>
      </ul>
      <div v-if="showMemberToggle" class="oc-flex oc-flex-center">
        <oc-button
          appearance="raw"
          @click="toggleMemberListCollapsed"
          v-text="collapseMemberButtonTitle"
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { mapGetters, mapActions, mapState, mapMutations } from 'vuex'
import {
  useAbility,
  useStore,
  useCapabilityProjectSpacesEnabled,
  useCapabilityShareJailEnabled,
  useCapabilityFilesSharingResharing,
  useCapabilityFilesSharingCanDenyAccess,
  useGetMatchingSpace
} from '@ownclouders/web-pkg'
import { isLocationSharesActive } from '@ownclouders/web-pkg'
import { textUtils } from '../../../helpers/textUtils'
import { peopleRoleDenyFolder, Share, ShareTypes } from '@ownclouders/web-client/src/helpers/share'
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
  User
} from '@ownclouders/web-client/src/helpers'
import { getSharedAncestorRoute } from '@ownclouders/web-pkg'
import { AncestorMetaData } from '@ownclouders/web-pkg'
import { useShares } from 'web-app-files/src/composables'
import { configurationManager } from '@ownclouders/web-pkg'

export default defineComponent({
  name: 'FileShares',
  components: {
    InviteCollaboratorForm,
    CollaboratorListItem
  },
  setup() {
    const store = useStore()
    const ability = useAbility()
    const { getMatchingSpace } = useGetMatchingSpace()

    const resource = inject<Ref<Resource>>('resource')

    const sharesListCollapsed = ref(
      !store.getters.configuration.options.sidebar.shares.showAllOnLoad
    )
    const toggleShareListCollapsed = () => {
      sharesListCollapsed.value = !unref(sharesListCollapsed)
    }
    const memberListCollapsed = ref(
      !store.getters.configuration.options.sidebar.shares.showAllOnLoad
    )
    const toggleMemberListCollapsed = () => {
      memberListCollapsed.value = !unref(memberListCollapsed)
    }

    const ancestorMetaData: Ref<AncestorMetaData> = computed(
      () => store.getters['runtime/ancestorMetaData/ancestorMetaData']
    )
    const getSharedAncestor = (fileId) => {
      return Object.values(unref(ancestorMetaData)).find((a) => a.id === fileId)
    }

    const matchingSpace = computed(() => {
      return getMatchingSpace(unref(resource))
    })

    return {
      ...useShares(),
      ability,
      resource,
      space: inject<Ref<SpaceResource>>('space'),
      matchingSpace,
      sharesListCollapsed,
      toggleShareListCollapsed,
      memberListCollapsed,
      toggleMemberListCollapsed,
      hasProjectSpaces: useCapabilityProjectSpacesEnabled(),
      hasShareJail: useCapabilityShareJailEnabled(),
      hasResharing: useCapabilityFilesSharingResharing(),
      hasShareCanDenyAccess: useCapabilityFilesSharingCanDenyAccess(),
      getSharedAncestor,
      configurationManager
    }
  },
  computed: {
    ...mapGetters(['configuration']),
    ...mapGetters('runtime/spaces', ['spaceMembers', 'spaces']),
    ...mapState(['user']),

    inviteCollaboratorHelp() {
      const cernFeatures = !!this.configuration?.options?.cernFeatures

      if (cernFeatures) {
        const options = {
          configurationManager: this.configurationManager
        }
        const mergedHelp = shareInviteCollaboratorHelp(options)
        mergedHelp.list = [...shareInviteCollaboratorHelpCern(options).list, ...mergedHelp.list]
        return mergedHelp
      }

      return shareInviteCollaboratorHelp({
        configurationManager: this.configurationManager
      })
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

    collapseMemberButtonTitle() {
      return this.memberListCollapsed ? this.$gettext('Show more') : this.$gettext('Show less')
    },

    hasSharees() {
      return this.displayCollaborators.length > 0
    },

    collaborators() {
      return [...this.outgoingCollaborators].sort(this.collaboratorsComparator).map((c) => {
        const collaborator: typeof c & { key?: string; resharers?: User[] } = { ...c }
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
      const collaborators = this.collaborators.filter(
        (c) => c.permissions !== peopleRoleDenyFolder.bitmask(false)
      )

      if (collaborators.length > 3 && this.sharesListCollapsed) {
        return collaborators.slice(0, 3)
      }
      return collaborators
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

    currentUserCanShare() {
      if (this.resource.isReceivedShare() && !this.hasResharing) {
        return false
      }
      const isShareJail = this.space?.driveType === 'share'
      if (isShareJail && !this.hasResharing) {
        return false
      }
      return this.resource.canShare({ user: this.user, ability: this.ability })
    },

    noResharePermsMessage() {
      const translatedFile = this.$gettext("You don't have permission to share this file.")
      const translatedFolder = this.$gettext("You don't have permission to share this folder.")
      return this.resource.type === 'file' ? translatedFile : translatedFolder
    },

    showSpaceMembers() {
      return (
        this.space?.driveType === 'project' &&
        this.resource.type !== 'space' &&
        this.space?.isMember(this.user)
      )
    },

    resourceIsSpace() {
      return this.resource.type === 'space'
    }
  },
  methods: {
    ...mapActions('Files', ['deleteShare', 'addShare']),
    ...mapActions(['createModal', 'hideModal', 'showMessage', 'showErrorMessage']),
    ...mapMutations('Files', ['REMOVE_FILES']),

    getDeniedShare(collaborator: Share): Share {
      return this.collaborators.find(
        (c) =>
          c.permissions === peopleRoleDenyFolder.bitmask(false) &&
          c.file.source === this.resource.id &&
          c.collaborator.name === collaborator.collaborator.name &&
          c.shareType === collaborator.shareType
      )
    },

    isShareDenied(collaborator: Share): boolean {
      return this.collaborators.some(
        (c) =>
          c.permissions === peopleRoleDenyFolder.bitmask(false) &&
          c.collaborator.name === collaborator.collaborator.name &&
          c.shareType === collaborator.shareType
      )
    },

    getDeniedSpaceMember(collaborator: Share): Share {
      let shareType = null

      if (collaborator.shareType === ShareTypes.spaceUser.value) {
        shareType = ShareTypes.user.value
      }

      if (collaborator.shareType === ShareTypes.spaceGroup.value) {
        shareType = ShareTypes.group.value
      }

      return this.collaborators.find(
        (c) =>
          c.permissions === peopleRoleDenyFolder.bitmask(false) &&
          c.file.source === this.resource.id &&
          c.collaborator.name === collaborator.collaborator.name &&
          c.shareType === shareType
      )
    },

    isSpaceMemberDenied(collaborator: Share): boolean {
      let shareType = null

      if (collaborator.shareType === ShareTypes.spaceUser.value) {
        shareType = ShareTypes.user.value
      }

      if (collaborator.shareType === ShareTypes.spaceGroup.value) {
        shareType = ShareTypes.group.value
      }
      return this.collaborators.some(
        (c) =>
          c.permissions === peopleRoleDenyFolder.bitmask(false) &&
          c.collaborator.name === collaborator.collaborator.name &&
          c.shareType === shareType
      )
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

    async setDenyShare({ value, share }) {
      if (value === true) {
        try {
          await this.addShare({
            client: this.$client,
            shareWith: share.collaborator.name,
            displayName: share.collaborator.displayName,
            shareType: share.shareType,
            role: peopleRoleDenyFolder,
            path: this.resource.path,
            permissions: peopleRoleDenyFolder.bitmask(false),
            storageId: this.resource.id
          })
          this.showMessage({
            title: this.$gettext('Access was denied successfully')
          })
        } catch (e) {
          console.error(e)
          this.showErrorMessage({
            title: this.$gettext('Failed to deny access'),
            error: e
          })
        }
      } else {
        try {
          await this.deleteShare({
            client: this.$client,
            share:
              share.shareType === ShareTypes.spaceUser.value ||
              share.shareType === ShareTypes.spaceGroup.value
                ? this.getDeniedSpaceMember(share)
                : this.getDeniedShare(share),
            path: this.resource.path,
            loadIndicators: false
          })
          this.showMessage({
            title: this.$gettext('Access was granted successfully')
          })
        } catch (e) {
          console.error(e)
          this.showErrorMessage({
            title: this.$gettext('Failed to grant access'),
            error: e
          })
        }
      }
    },

    $_ocCollaborators_deleteShare_trigger(share) {
      const modal = {
        variation: 'danger',
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

    async $_ocCollaborators_deleteShare(share) {
      let path = this.resource.path
      // sharing a share root from the share jail -> use resource name as path
      if (this.hasShareJail && path === '/') {
        path = `/${this.resource.name}`
      }

      const lastShareId =
        this.outgoingCollaborators.length === 1 ? this.outgoingCollaborators[0].id : undefined
      const loadIndicators = this.outgoingCollaborators.filter((c) => !c.indirect).length === 1

      try {
        await this.deleteShare({
          client: this.$client,
          share: share,
          path,
          loadIndicators
        })

        this.hideModal()
        this.showMessage({
          title: this.$gettext('Share was removed successfully')
        })
        if (lastShareId && isLocationSharesActive(this.$router, 'files-shares-with-others')) {
          this.REMOVE_FILES([{ id: lastShareId }])
        }
      } catch (error) {
        console.error(error)
        this.showErrorMessage({
          title: this.$gettext('Failed to remove share'),
          error
        })
      }
    },

    getSharedParentRoute(parentShare) {
      if (!parentShare.indirect) {
        return null
      }
      const sharedAncestor = this.getSharedAncestor(parentShare.itemSource)
      if (!sharedAncestor) {
        return null
      }

      return getSharedAncestorRoute({
        sharedAncestor,
        matchingSpace: this.space || this.matchingSpace
      })
    },

    isSpaceMemberDeniable(collaborator) {
      return (
        this.hasShareCanDenyAccess &&
        this.resource.isFolder &&
        !(
          collaborator.shareType === ShareTypes.spaceUser.value &&
          collaborator.collaborator.name === this.user.id
        ) &&
        (!!this.getDeniedSpaceMember(collaborator) || !this.isSpaceMemberDenied(collaborator))
      )
    },

    isShareDeniable(collaborator) {
      return (
        this.hasShareCanDenyAccess &&
        this.resource.isFolder &&
        !!this.getSharedParentRoute(collaborator) &&
        (!!this.getDeniedShare(collaborator) || !this.isShareDenied(collaborator))
      )
    },

    // fixMe: head-breaking logic
    isShareModifiable(collaborator) {
      const isPersonalSpaceShare = !isProjectSpaceResource(this.space)
      const isPersonalMember = this.space?.isMember(this.user)
      const isIndirectPersonalCollaborator = collaborator.indirect
      const isProjectSpaceShare = !isPersonalSpaceShare
      const isManager = this.space?.isManager(this.user)

      if (isPersonalSpaceShare && isPersonalMember && isManager) {
        return true
      }

      if (isPersonalSpaceShare && !isIndirectPersonalCollaborator) {
        return true
      }

      if (isProjectSpaceShare && isManager && !isIndirectPersonalCollaborator) {
        return true
      }

      return false
    }
  }
})
</script>

<style>
.avatars-wrapper {
  height: 40px;
}
</style>
