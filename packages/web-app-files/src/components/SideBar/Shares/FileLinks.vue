<template>
  <div id="oc-files-file-link" class="oc-position-relative">
    <div class="oc-flex oc-flex-middle">
      <h3 class="oc-text-bold oc-text-medium oc-m-rm" v-text="linksHeading" />
      <oc-contextual-helper v-if="helpersEnabled" class="oc-pl-xs" v-bind="viaLinkHelp" />
    </div>
    <p
      v-if="!canCreateLinks({ space, resource })"
      data-testid="files-links-no-share-permissions-message"
      class="oc-mt-m"
      v-text="$gettext('You do not have permission to create links')"
    />
    <div v-if="quicklink || canCreateLinks({ space, resource })" class="oc-mt-m">
      <name-and-copy v-if="quicklink" :link-share="quicklink" />
      <create-quick-link
        v-else-if="canCreateLinks({ space, resource })"
        :expiration-rules="expirationRules"
        @create-public-link="addNewLink(true)"
      />
      <details-and-edit
        v-if="quicklink"
        :can-rename="false"
        :expiration-rules="expirationRules"
        :is-folder-share="resource.isFolder"
        :is-modifiable="canEditLink(quicklink)"
        :is-password-enforced="isPasswordEnforcedForLinkType(quicklink.type)"
        :is-password-removable="canDeletePublicLinkPassword(quicklink)"
        :link-share="quicklink"
        @update-link="handleLinkUpdate"
        @remove-public-link="deleteLinkConfirmation"
      />
      <hr class="oc-my-m" />
      <oc-button
        v-if="canCreateLinks({ space, resource })"
        id="files-file-link-add"
        variation="primary"
        appearance="raw"
        data-testid="files-link-add-btn"
        @click="addNewLink(false)"
      >
        <span v-text="$gettext('Add link')"
      /></oc-button>
    </div>

    <oc-list v-if="directLinks.length" class="oc-overflow-hidden oc-my-m">
      <li
        v-for="link in displayLinks"
        :key="link.key"
        class="oc-py-s"
        :data-testid="`files-link-id-${link.id}`"
      >
        <name-and-copy :link-share="link" />
        <details-and-edit
          :can-rename="true"
          :expiration-rules="expirationRules"
          :is-folder-share="resource.isFolder"
          :is-modifiable="canEditLink(link)"
          :is-password-enforced="isPasswordEnforcedForLinkType(link.type)"
          :is-password-removable="canDeletePublicLinkPassword(link)"
          :link-share="link"
          @update-link="handleLinkUpdate"
          @remove-public-link="deleteLinkConfirmation"
        />
      </li>
    </oc-list>
    <div v-if="directLinks.length > 3" class="oc-flex oc-flex-center">
      <oc-button
        class="indirect-link-list-toggle"
        appearance="raw"
        @click="toggleLinkListCollapsed"
        v-text="collapseButtonTitle"
      />
    </div>
    <div v-if="indirectLinks.length" id="indirect-link-list">
      <hr class="oc-my-m" />
      <div class="oc-flex">
        <h3 class="oc-text-bold oc-m-rm oc-text-medium">
          <span v-text="indirectLinksHeading" />
        </h3>
        <oc-contextual-helper v-if="helpersEnabled" class="oc-pl-xs" v-bind="indirectLinkHelp" />
      </div>
      <oc-list v-if="!indirectLinkListCollapsed" class="oc-overflow-hidden oc-my-m">
        <li
          v-for="link in displayIndirectLinks"
          :key="link.key"
          class="oc-py-s"
          :data-testid="`files-link-id-${link.id}`"
        >
          <name-and-copy :link-share="link" />
          <details-and-edit
            :expiration-rules="expirationRules"
            :is-folder-share="true"
            :is-modifiable="false"
            :link-share="link"
          />
        </li>
      </oc-list>
      <div class="oc-flex oc-flex-center">
        <oc-button
          class="indirect-link-list-toggle"
          appearance="raw"
          @click="toggleIndirectLinkListCollapsed"
          v-text="indirectCollapseButtonTitle"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, inject, ref, Ref, unref } from 'vue'
import {
  useAbility,
  useExpirationRules,
  useFileActionsCreateLink,
  FileAction,
  useClientService,
  useModals,
  useMessages,
  useConfigStore,
  useResourcesStore,
  useLinkTypes,
  useCanShare
} from '@ownclouders/web-pkg'
import { shareViaLinkHelp, shareViaIndirectLinkHelp } from '../../../helpers/contextualHelpers'
import { LinkShare } from '@ownclouders/web-client'
import DetailsAndEdit from './Links/DetailsAndEdit.vue'
import NameAndCopy from './Links/NameAndCopy.vue'
import CreateQuickLink from './Links/CreateQuickLink.vue'
import { Resource, SpaceResource } from '@ownclouders/web-client'
import { isLocationSharesActive, useSharesStore } from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'
import { storeToRefs } from 'pinia'
import { SharingLinkType } from '@ownclouders/web-client/graph/generated'

export default defineComponent({
  name: 'FileLinks',
  components: {
    CreateQuickLink,
    DetailsAndEdit,
    NameAndCopy
  },
  setup() {
    const { showMessage, showErrorMessage } = useMessages()
    const { $gettext } = useGettext()
    const ability = useAbility()
    const clientService = useClientService()
    const { can } = ability
    const { expirationRules } = useExpirationRules()
    const { dispatchModal } = useModals()
    const { removeResources } = useResourcesStore()
    const { isPasswordEnforcedForLinkType } = useLinkTypes()
    const { canShare: canCreateLinks } = useCanShare()

    const sharesStore = useSharesStore()
    const { updateLink, deleteLink } = sharesStore
    const { linkShares } = storeToRefs(sharesStore)

    const configStore = useConfigStore()
    const { options: configOptions } = storeToRefs(configStore)

    const { actions: createLinkActions } = useFileActionsCreateLink()
    const createLinkAction = computed<FileAction>(() =>
      unref(createLinkActions).find(({ name }) => name === 'create-links')
    )
    const createQuicklinkAction = computed<FileAction>(() =>
      unref(createLinkActions).find(({ name }) => name === 'create-quick-links')
    )

    const space = inject<Ref<SpaceResource>>('space')
    const resource = inject<Ref<Resource>>('resource')

    const linkListCollapsed = ref(true)
    const indirectLinkListCollapsed = ref(true)
    const directLinks = computed(() =>
      unref(linkShares)
        .filter((l) => !l.indirect && !l.isQuickLink)
        .sort((a, b) => b.createdDateTime.localeCompare(a.createdDateTime))
        .map((share) => {
          return { ...share, key: 'direct-link-' + share.id }
        })
    )
    const indirectLinks = computed(() =>
      unref(linkShares)
        .filter((l) => l.indirect)
        .sort((a, b) => b.createdDateTime.localeCompare(a.createdDateTime))
        .map((share) => {
          return { ...share, key: 'indirect-link-' + share.id }
        })
    )

    const canDeleteReadOnlyPublicLinkPassword = computed(() =>
      can('delete-all', 'ReadOnlyPublicLinkPassword')
    )

    const canEditLink = (linkShare: LinkShare) => {
      return (
        canCreateLinks({ space: unref(space), resource: unref(resource) }) &&
        (can('create-all', 'PublicLink') || linkShare.type === SharingLinkType.Internal)
      )
    }

    const addNewLink = (isQuickLink: boolean) => {
      const handlerArgs = { space: unref(space), resources: [unref(resource)] }
      if (isQuickLink) {
        return unref(createQuicklinkAction)?.handler(handlerArgs)
      }

      return unref(createLinkAction)?.handler(handlerArgs)
    }

    const canDeletePublicLinkPassword = (linkShare: LinkShare) => {
      const isPasswordEnforced = isPasswordEnforcedForLinkType(linkShare.type)

      if (!isPasswordEnforced) {
        return true
      }

      return linkShare.type === SharingLinkType.View && unref(canDeleteReadOnlyPublicLinkPassword)
    }

    const handleLinkUpdate = async ({
      linkShare,
      password = undefined
    }: {
      linkShare: LinkShare
      password?: string
    }) => {
      try {
        await updateLink({
          clientService,
          space: unref(space),
          resource: unref(resource),
          linkShare,
          options: {
            displayName: linkShare.displayName,
            type: linkShare.type,
            expirationDateTime: linkShare.expirationDateTime,
            ...(password !== undefined && { password })
          }
        })
        showMessage({ title: $gettext('Link was updated successfully') })
      } catch (e) {
        console.error(e)
        showErrorMessage({
          title: $gettext('Failed to update link'),
          errors: [e]
        })
      }
    }

    return {
      clientService,
      space,
      resource,
      isPasswordEnforcedForLinkType,
      indirectLinkListCollapsed,
      linkListCollapsed,
      linkShares,
      directLinks,
      indirectLinks,
      deleteLink,
      configStore,
      configOptions,
      canCreateLinks,
      canEditLink,
      expirationRules,
      handleLinkUpdate,
      addNewLink,
      dispatchModal,
      showMessage,
      showErrorMessage,
      removeResources,
      canDeletePublicLinkPassword
    }
  },
  computed: {
    collapseButtonTitle() {
      return this.linkListCollapsed ? this.$gettext('Show more') : this.$gettext('Show less')
    },
    indirectCollapseButtonTitle() {
      return this.indirectLinkListCollapsed ? this.$gettext('Show') : this.$gettext('Hide')
    },

    quicklink() {
      return this.linkShares.find(({ isQuickLink, indirect }) => isQuickLink === true && !indirect)
    },

    helpersEnabled() {
      return this.configOptions.contextHelpers
    },

    viaLinkHelp() {
      return shareViaLinkHelp({ configStore: this.configStore })
    },
    indirectLinkHelp() {
      return shareViaIndirectLinkHelp({ configStore: this.configStore })
    },

    linksHeading() {
      return this.$gettext('Share via link')
    },

    indirectLinksHeading() {
      return this.$gettext('Indirect links (%{ count })', {
        count: this.indirectLinks.length.toString()
      })
    },

    displayLinks() {
      if (this.directLinks.length > 3 && this.linkListCollapsed) {
        return this.directLinks.slice(0, 3)
      }
      return this.directLinks
    },

    displayIndirectLinks() {
      if (this.indirectLinkListCollapsed) {
        return []
      }
      return this.indirectLinks
    },

    resourceIsSpace() {
      return this.resource.type === 'space'
    }
  },
  methods: {
    toggleLinkListCollapsed() {
      this.linkListCollapsed = !this.linkListCollapsed
    },

    toggleIndirectLinkListCollapsed() {
      this.indirectLinkListCollapsed = !this.indirectLinkListCollapsed
    },

    deleteLinkConfirmation({ link }: { link: LinkShare }) {
      this.dispatchModal({
        variation: 'danger',
        title: this.$gettext('Delete link'),
        message: this.$gettext(
          'Are you sure you want to delete this link? Recreating the same link again is not possible.'
        ),
        confirmText: this.$gettext('Delete'),
        onConfirm: async () => {
          let lastLinkId = this.linkShares.length === 1 ? this.linkShares[0].id : undefined
          const loadIndicators = this.linkShares.filter((l) => !l.indirect).length === 1

          try {
            await this.deleteLink({
              clientService: this.clientService,
              space: this.space,
              resource: this.resource,
              linkShare: link,
              loadIndicators
            })

            this.showMessage({ title: this.$gettext('Link was deleted successfully') })

            if (lastLinkId && isLocationSharesActive(this.$router, 'files-shares-via-link')) {
              if (this.resourceIsSpace) {
                // spaces need their actual id instead of their share id to be removed from the file list
                lastLinkId = this.resource.id.toString()
              }
              this.removeResources([{ id: lastLinkId }] as Resource[])
            }
          } catch (e) {
            console.error(e)
            this.showErrorMessage({
              title: this.$gettext('Failed to delete link'),
              errors: [e]
            })
          }
        }
      })
    }
  }
})
</script>
<style lang="scss">
#oc-files-file-link,
#oc-files-sharing-sidebar {
  border-radius: 5px;
}

.link-name-container {
  background-color: var(--oc-color-input-bg);
  border: 1px solid var(--oc-color-input-border);
  border-radius: 5px;
}
</style>
