<template>
  <div id="oc-files-file-link" class="oc-position-relative">
    <div class="oc-flex">
      <h3 class="oc-text-bold oc-text-medium oc-m-rm" v-text="linksHeading" />
      <oc-contextual-helper v-if="helpersEnabled" class="oc-pl-xs" v-bind="viaLinkHelp" />
    </div>
    <p
      v-if="!canCreatePublicLinks"
      data-testid="files-links-no-reshare-permissions-message"
      class="oc-mt-m"
      v-text="noResharePermsMessage"
    />
    <div class="oc-mt-m">
      <name-and-copy v-if="quicklink" :link="quicklink" />
      <create-quick-link
        v-else-if="canCreatePublicLinks"
        :expiration-date="expirationDate"
        @create-public-link="checkLinkToCreate"
      />
      <details-and-edit
        v-if="quicklink"
        :available-role-options="getAvailableRoleOptions(quicklink)"
        :can-rename="false"
        :expiration-date="expirationDate"
        :is-folder-share="resource.isFolder"
        :is-modifiable="canEdit"
        :is-password-enforced="isPasswordEnforcedFor(quicklink)"
        :link="quicklink"
        @update-link="checkLinkToUpdate"
        @remove-public-link="deleteLinkConfirmation"
      />
      <hr class="oc-my-m" />
      <oc-button
        v-if="canCreatePublicLinks"
        id="files-file-link-add"
        variation="primary"
        data-testid="files-link-add-btn"
        @click="addNewLink"
        v-text="addButtonLabel"
      />
    </div>

    <oc-list v-if="links.length" class="oc-overflow-hidden oc-my-m">
      <li
        v-for="link in displayLinks"
        :key="link.key"
        class="oc-py-s"
        :data-testid="`files-link-id-${link.id}`"
      >
        <name-and-copy :link="link" />
        <details-and-edit
          :available-role-options="getAvailableRoleOptions(link)"
          :can-rename="true"
          :expiration-date="expirationDate"
          :is-folder-share="resource.isFolder"
          :is-modifiable="canEdit"
          :is-password-enforced="isPasswordEnforcedFor(link)"
          :link="link"
          @update-link="checkLinkToUpdate"
          @remove-public-link="deleteLinkConfirmation"
        />
      </li>
    </oc-list>
    <div v-if="links.length > 3" class="oc-flex oc-flex-center">
      <oc-button appearance="raw" @click="toggleLinkListCollapsed">
        <span v-text="collapseButtonTitle" />
        <oc-icon :name="collapseButtonIcon" fill-type="line" />
      </oc-button>
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
          <name-and-copy :link="link" />
          <details-and-edit
            :available-role-options="getAvailableRoleOptions(link)"
            :expiration-date="expirationDate"
            :is-folder-share="true"
            :is-modifiable="false"
            :link="link"
          />
        </li>
      </oc-list>
      <div class="oc-flex oc-flex-center">
        <oc-button
          id="indirect-link-list-toggle"
          appearance="raw"
          @click="toggleIndirectLinkListCollapsed"
        >
          <span v-text="indirectCollapseButtonTitle" />
          <oc-icon :name="indirectCollapseButtonIcon" fill-type="line" />
        </oc-button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, inject, ref } from 'vue'
import { DateTime } from 'luxon'
import { mapGetters, mapActions, mapState, mapMutations } from 'vuex'
import {
  useStore,
  useCapabilitySpacesEnabled,
  useCapabilityShareJailEnabled,
  useCapabilityFilesSharingResharing,
  useCapabilityFilesSharingPublicCanEdit,
  useCapabilityFilesSharingPublicCanContribute,
  useCapabilityFilesSharingPublicAlias
} from 'web-pkg/src/composables'
import { shareViaLinkHelp, shareViaIndirectLinkHelp } from '../../../helpers/contextualHelpers'
import { getParentPaths } from '../../../helpers/path'
import { ShareTypes, LinkShareRoles, SharePermissions } from 'web-client/src/helpers/share'
import { cloneStateObject } from '../../../helpers/store'
import { showQuickLinkPasswordModal } from '../../../quickActions'
import DetailsAndEdit from './Links/DetailsAndEdit.vue'
import NameAndCopy from './Links/NameAndCopy.vue'
import { useGraphClient } from 'web-pkg/src/composables'
import CreateQuickLink from './Links/CreateQuickLink.vue'
import { getLocaleFromLanguage } from 'web-pkg/src/helpers'
import { Resource } from 'web-client/src/helpers'
import { isLocationSharesActive } from '../../../router'

export default defineComponent({
  name: 'FileLinks',
  components: {
    CreateQuickLink,
    DetailsAndEdit,
    NameAndCopy
  },
  setup() {
    const store = useStore()

    const linkListCollapsed = !store.getters.configuration.options.sidebar.shares.showAllOnLoad
    const indirectLinkListCollapsed = ref(linkListCollapsed)

    return {
      ...useGraphClient(),
      space: inject<Resource>('space'),
      resource: inject<Resource>('resource'),
      incomingParentShare: inject<Resource>('incomingParentShare'),
      hasSpaces: useCapabilitySpacesEnabled(),
      hasShareJail: useCapabilityShareJailEnabled(),
      hasResharing: useCapabilityFilesSharingResharing(),
      hasPublicLinkEditing: useCapabilityFilesSharingPublicCanEdit(),
      hasPublicLinkContribute: useCapabilityFilesSharingPublicCanContribute(),
      hasPublicLinkAliasSupport: useCapabilityFilesSharingPublicAlias(),
      indirectLinkListCollapsed,
      linkListCollapsed
    }
  },
  computed: {
    ...mapGetters('Files', ['currentFileOutgoingLinks']),
    ...mapGetters(['capabilities', 'configuration']),
    ...mapState(['user']),
    ...mapState('Files', ['sharesTree']),

    addButtonLabel() {
      return this.$gettext('Add link')
    },

    collapseButtonTitle() {
      return this.linkListCollapsed ? this.$gettext('Show all') : this.$gettext('Show less')
    },
    collapseButtonIcon() {
      return this.linkListCollapsed ? 'arrow-down-s' : 'arrow-up-s'
    },
    indirectCollapseButtonTitle() {
      return this.indirectLinkListCollapsed ? this.$gettext('Show') : this.$gettext('Hide')
    },
    indirectCollapseButtonIcon() {
      return this.indirectLinkListCollapsed ? 'arrow-down-s' : 'arrow-up-s'
    },

    quicklink() {
      return this.currentFileOutgoingLinks.find((link) => link.quicklink === true)
    },

    expirationDate() {
      const expireDate = this.capabilities.files_sharing.public.expire_date

      let defaultExpireDate = null
      let maxExpireDateFromCaps = null

      if (expireDate.days) {
        const days = parseInt(expireDate.days)
        defaultExpireDate = DateTime.now()
          .setLocale(getLocaleFromLanguage(this.$language.current))
          .plus({ days })
          .toJSDate()
      }

      if (expireDate.enforced) {
        const days = parseInt(expireDate.days)
        maxExpireDateFromCaps = DateTime.now()
          .setLocale(getLocaleFromLanguage(this.$language.current))
          .plus({ days })
          .toJSDate()
      }

      return {
        enforced: expireDate.enforced,
        default: defaultExpireDate,
        min: DateTime.now().setLocale(getLocaleFromLanguage(this.$language.current)).toJSDate(),
        max: maxExpireDateFromCaps
      }
    },

    passwordEnforced() {
      return (
        this.capabilities.files_sharing.public.password?.enforced_for || {
          read_only: false,
          upload_only: false,
          read_write: false
        }
      )
    },

    helpersEnabled() {
      return this.configuration?.options?.contextHelpers
    },

    viaLinkHelp() {
      return shareViaLinkHelp
    },
    indirectLinkHelp() {
      return shareViaIndirectLinkHelp
    },

    canCreatePublicLinks() {
      if (this.resource.isReceivedShare() && !this.hasResharing) {
        return false
      }

      const isShareJail = this.space?.driveType === 'share'
      if (isShareJail && !this.hasResharing) {
        return false
      }

      return this.resource.canShare({ user: this.user })
    },

    canEdit() {
      return this.canCreatePublicLinks
    },

    noResharePermsMessage() {
      const translatedFile = this.$gettext("You don't have permission to share this file.")
      const translatedFolder = this.$gettext("You don't have permission to share this folder.")
      return this.resource.type === 'file' ? translatedFile : translatedFolder
    },

    linksHeading() {
      return this.$gettext('Share publicly')
    },

    indirectLinksHeading() {
      const translated = this.$gettext('Indirect links (%{ count })')
      return this.$gettextInterpolate(translated, { count: this.indirectLinks.length })
    },

    links() {
      return this.currentFileOutgoingLinks
        .filter((link) => !link.quicklink)
        .map((share) => {
          return { ...share, key: 'direct-link-' + share.id }
        })
        .sort((a, b) => {
          return b.stime - a.stime
        })
    },

    displayLinks() {
      if (this.links.length > 3 && this.linkListCollapsed) {
        return this.links.slice(0, 3)
      }
      return this.links
    },

    displayIndirectLinks() {
      if (this.indirectLinkListCollapsed) {
        return []
      }
      return this.indirectLinks
    },

    indirectLinks() {
      const allShares = []
      const parentPaths = getParentPaths(this.resource.path, false)
      if (parentPaths.length === 0) {
        return []
      }

      parentPaths.forEach((parentPath) => {
        const shares = cloneStateObject(this.sharesTree[parentPath])
        if (shares) {
          shares.forEach((share) => {
            if (share.outgoing && share.shareType === ShareTypes.link.value) {
              share.key = 'indirect-link-' + share.id
              allShares.push(share)
            }
          })
        }
      })
      return allShares.sort((a, b) => {
        return b.stime - a.stime
      })
    },

    resourceIsSpace() {
      return this.resource.type === 'space'
    },

    currentStorageId() {
      if (this.resourceIsSpace) {
        return this.resource.id
      }

      if (this.space) {
        return this.space.id
      }

      return null
    }
  },
  methods: {
    ...mapActions('Files', ['addLink', 'updateLink', 'removeLink']),
    ...mapActions(['showMessage', 'createModal', 'hideModal']),
    ...mapMutations('Files', ['REMOVE_FILES']),

    toggleLinkListCollapsed() {
      this.linkListCollapsed = !this.linkListCollapsed
    },

    toggleIndirectLinkListCollapsed() {
      this.indirectLinkListCollapsed = !this.indirectLinkListCollapsed
    },

    isPasswordEnforcedFor(link) {
      const currentRole = LinkShareRoles.getByBitmask(
        link.permissions,
        link.indirect || this.resource.isFolder
      )

      const canRead = currentRole.hasPermission(SharePermissions.read)
      const canUpdate = currentRole.hasPermission(SharePermissions.update)
      const canCreate = currentRole.hasPermission(SharePermissions.create)
      const canDelete = currentRole.hasPermission(SharePermissions.delete)

      if (this.passwordEnforced.read_only === true) {
        return canRead && !canUpdate && !canCreate && !canDelete
      }
      if (this.passwordEnforced.upload_only === true) {
        return !canRead && !canUpdate && canCreate && !canDelete
      }
      if (this.passwordEnforced.read_write === true) {
        return canRead && !canUpdate && canCreate && !canDelete
      }
      if (this.passwordEnforced.read_write_delete === true) {
        return canRead && canUpdate && canCreate && canDelete
      }
      return false
    },

    addNewLink() {
      this.checkLinkToCreate({
        link: {
          name: this.$gettext('Link'),
          permissions: 1,
          expiration: this.expirationDate.default,
          password: false
        }
      })
    },

    checkLinkToCreate({ link, onError = () => {} }) {
      const paramsToCreate = this.getParamsForLink(link)

      if (this.isPasswordEnforcedFor(link)) {
        showQuickLinkPasswordModal({ ...this.$language, store: this.$store }, (newPassword) => {
          this.createLink({ params: { ...paramsToCreate, password: newPassword }, onError })
        })
      } else {
        this.createLink({ params: paramsToCreate, onError })
      }
    },

    checkLinkToUpdate({ link, onSuccess = () => {} }) {
      const params = this.getParamsForLink(link)

      if (!link.password && this.isPasswordEnforcedFor(link)) {
        showQuickLinkPasswordModal({ ...this.$language, store: this.$store }, (newPassword) => {
          this.updatePublicLink({ params: { ...params, password: newPassword }, onSuccess })
        })
      } else {
        this.updatePublicLink({ params, onSuccess })
      }
    },

    getParamsForLink(link) {
      let expireDate = ''

      if (link.expiration) {
        expireDate = (
          typeof link.expiration === 'string'
            ? DateTime.fromISO(link.expiration)
            : DateTime.fromJSDate(link.expiration)
        )
          .setLocale(getLocaleFromLanguage(this.$language.current))
          .endOf('day')
          .toFormat("yyyy-MM-dd'T'HH:mm:ssZZZ")
      }

      let password

      switch (link.password) {
        // no password
        case false:
          password = undefined
          break
        // delete password
        case '':
          password = ''
          break
        // existing password
        case true:
          password = undefined
          break
        // adding/editing password
        default:
          password = link.password
          break
      }

      return {
        expireDate,
        password,
        id: link.id,
        permissions: link.permissions.toString(),
        quicklink: link.quicklink,
        name: link.name,
        spaceRef: this.resource.fileId,
        ...(this.currentStorageId && {
          storageId: this.currentStorageId
        })
      }
    },

    async createLink({ params, onError = (e) => {} }) {
      let path = this.resource.path
      // sharing a share root from the share jail -> use resource name as path
      if (this.hasShareJail && path === '/') {
        path = `/${this.resource.name}`
      }
      await this.addLink({
        path,
        client: this.$client,
        $gettext: this.$gettext,
        storageId: this.resource.fileId || this.resource.id,
        params
      }).catch((e) => {
        onError(e)
        console.error(e)
        this.showMessage({
          title: this.$gettext('Failed to create link'),
          status: 'danger'
        })
      })

      this.showMessage({
        title: this.$gettext('Link was created successfully')
      })
    },

    async updatePublicLink({ params, onSuccess = () => {}, onError = (e) => {} }) {
      await this.updateLink({
        id: params.id,
        client: this.$client,
        params
      })
        .then(onSuccess)
        .catch((e) => {
          onError(e)
          console.error(e)
          this.showMessage({
            title: this.$gettext('Failed to update link'),
            status: 'danger'
          })
        })

      this.showMessage({
        title: this.$gettext('Link was updated successfully')
      })
    },

    deleteLinkConfirmation({ link }) {
      const modal = {
        variation: 'danger',
        icon: 'alarm-warning',
        title: this.$gettext('Delete link'),
        message: this.$gettext(
          'Are you sure you want to delete this link? Recreating the same link again is not possible.'
        ),
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Delete'),
        onCancel: this.hideModal,
        onConfirm: () =>
          this.deleteLink({
            client: this.$client,
            share: link,
            resource: this.resource
          })
      }
      this.createModal(modal)
    },

    async deleteLink({ client, share, resource }) {
      this.hideModal()
      let path = resource.path
      // sharing a share root from the share jail -> use resource name as path
      if (this.hasShareJail && path === '/') {
        path = `/${resource.name}`
      }

      const lastLinkId =
        this.currentFileOutgoingLinks.length === 1 ? this.currentFileOutgoingLinks[0].id : undefined

      try {
        await this.removeLink({ client, share, path, loadIndicators: !!lastLinkId })
        this.showMessage({
          title: this.$gettext('Link was deleted successfully')
        })

        if (lastLinkId && isLocationSharesActive(this.$router, 'files-shares-via-link')) {
          this.REMOVE_FILES([{ id: lastLinkId }])
        }
      } catch (e) {
        console.error(e)
        this.showMessage({
          title: this.$gettext('Failed to delete link'),
          status: 'danger'
        })
      }
    },

    getAvailableRoleOptions(link) {
      if (this.incomingParentShare && this.canCreatePublicLinks) {
        return LinkShareRoles.filterByBitmask(
          this.incomingParentShare.permissions,
          this.resource.isFolder,
          this.hasPublicLinkEditing,
          this.hasPublicLinkContribute,
          this.hasPublicLinkAliasSupport,
          !!link.password
        )
      }

      return LinkShareRoles.list(
        this.resource.isFolder,
        this.hasPublicLinkEditing,
        this.hasPublicLinkContribute,
        this.hasPublicLinkAliasSupport,
        !!link.password
      )
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
