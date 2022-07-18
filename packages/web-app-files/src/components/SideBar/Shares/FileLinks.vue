<template>
  <div id="oc-files-file-link" class="oc-position-relative">
    <oc-loader v-if="linksLoading" :aria-label="$gettext('Loading list of file links')" />
    <template v-else>
      <h3 class="oc-text-bold oc-m-rm oc-text-initial">
        <span v-text="linksHeading" />
        <oc-contextual-helper v-if="helpersEnabled" v-bind="viaLinkHelp" />
      </h3>
      <div v-if="canCreatePublicLinks" class="oc-mt-m">
        <name-and-copy v-if="quicklink" :link="quicklink" />
        <create-quick-link
          v-else
          :expiration-date="expirationDate"
          @createPublicLink="checkLinkToCreate"
        />
        <details-and-edit
          v-if="quicklink"
          :available-role-options="availableRoleOptions"
          :can-rename="false"
          :expiration-date="expirationDate"
          :is-folder-share="highlightedFile.isFolder"
          :is-modifiable="canEdit"
          :is-password-enforced="isPasswordEnforcedFor(quicklink)"
          :link="quicklink"
          @updateLink="checkLinkToUpdate"
          @removePublicLink="deleteLinkConfirmation"
        />
        <hr class="link-separator oc-my-m" />
        <oc-button
          id="files-file-link-add"
          variation="primary"
          appearance="raw"
          data-testid="files-link-add-btn"
          @click="addNewLink"
          v-text="addButtonLabel"
        />
      </div>
      <p
        v-else
        data-testid="files-links-no-reshare-permissions-message"
        class="oc-mt-m"
        v-text="noResharePermsMessage"
      />
      <oc-list v-if="links.length" class="oc-overflow-hidden oc-my-m">
        <li
          v-for="link in displayLinks"
          :key="link.key"
          class="oc-py-s"
          :data-testid="`files-link-id-${link.id}`"
        >
          <name-and-copy :link="link" />
          <details-and-edit
            :available-role-options="availableRoleOptions"
            :can-rename="true"
            :expiration-date="expirationDate"
            :is-folder-share="highlightedFile.isFolder"
            :is-modifiable="canEdit"
            :is-password-enforced="isPasswordEnforcedFor(link)"
            :link="link"
            @updateLink="checkLinkToUpdate"
            @removePublicLink="deleteLinkConfirmation"
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
        <hr class="link-separator oc-my-m" />
        <h3 class="oc-text-bold oc-m-rm oc-text-initial">
          <span v-text="indirectLinksHeading" />
          <oc-contextual-helper v-if="helpersEnabled" v-bind="indirectLinkHelp" />
        </h3>
        <oc-list v-if="!indirectLinkListCollapsed" class="oc-overflow-hidden oc-my-m">
          <li
            v-for="link in displayIndirectLinks"
            :key="link.key"
            class="oc-py-s"
            :data-testid="`files-link-id-${link.id}`"
          >
            <name-and-copy :link="link" />
            <details-and-edit
              :available-role-options="availableRoleOptions"
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
    </template>
  </div>
</template>
<script lang="ts">
import { dirname } from 'path'
import { defineComponent } from '@vue/composition-api'
import { DateTime } from 'luxon'
import { mapGetters, mapActions, mapState } from 'vuex'
import {
  useStore,
  useCapabilitySpacesEnabled,
  useCapabilityShareJailEnabled,
  useCapabilityFilesSharingResharing
} from 'web-pkg/src/composables'
import mixins from '../../../mixins'
import { shareViaLinkHelp, shareViaIndirectLinkHelp } from '../../../helpers/contextualHelpers'
import { getParentPaths } from '../../../helpers/path'
import { ShareTypes, LinkShareRoles, SharePermissions } from '../../../helpers/share'
import { cloneStateObject } from '../../../helpers/store'
import { showQuickLinkPasswordModal } from '../../../quickActions'
import DetailsAndEdit from './Links/DetailsAndEdit.vue'
import NameAndCopy from './Links/NameAndCopy.vue'
import { useGraphClient } from 'web-client/src/composables'
import CreateQuickLink from './Links/CreateQuickLink.vue'
import { isLocationSpacesActive } from '../../../router'

export default defineComponent({
  name: 'FileLinks',
  components: {
    CreateQuickLink,
    DetailsAndEdit,
    NameAndCopy
  },
  mixins: [mixins],
  setup() {
    const store = useStore()

    const linkListCollapsed = !store.getters.configuration.options.sidebar.shares.showAllOnLoad
    const indirectLinkListCollapsed =
      !store.getters.configuration.options.sidebar.shares.showAllOnLoad

    return {
      ...useGraphClient(),
      hasSpaces: useCapabilitySpacesEnabled(),
      hasShareJail: useCapabilityShareJailEnabled(),
      hasResharing: useCapabilityFilesSharingResharing(),
      indirectLinkListCollapsed,
      linkListCollapsed
    }
  },
  computed: {
    ...mapGetters('Files', [
      'highlightedFile',
      'currentFileOutgoingLinks',
      'currentFileOutgoingSharesLoading',
      'sharesTreeLoading'
    ]),
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

    share() {
      // the root share has an empty key in the shares tree. That's the reason why we retrieve the share by an empty key here
      return this.sharesTree['']?.find((s) => s.incoming)
    },

    expirationDate() {
      const expireDate = this.capabilities.files_sharing.public.expire_date

      let defaultExpireDate = null
      let maxExpireDateFromCaps = null

      if (expireDate.days) {
        const days = parseInt(expireDate.days)
        defaultExpireDate = DateTime.now()
          .setLocale(this.$language.current)
          .plus({ days })
          .toJSDate()
      }

      if (expireDate.enforced) {
        const days = parseInt(expireDate.days)
        maxExpireDateFromCaps = DateTime.now()
          .setLocale(this.$language.current)
          .plus({ days })
          .toJSDate()
      }

      return {
        enforced: expireDate.enforced,
        default: defaultExpireDate,
        min: DateTime.now().setLocale(this.$language.current).toJSDate(),
        max: maxExpireDateFromCaps
      }
    },

    availableRoleOptions() {
      if (this.highlightedFile.isReceivedShare() && this.canCreatePublicLinks && this.share) {
        return LinkShareRoles.filterByBitmask(
          parseInt(this.share.permissions),
          this.highlightedFile.isFolder,
          this.capabilities.files_sharing?.public?.can_edit
        )
      }

      const roles = LinkShareRoles.list(
        this.highlightedFile.isFolder,
        this.capabilities.files_sharing?.public?.can_edit
      )
      // add empty permission link if oCIS for alias link
      return [
        // { role: null, name: 'Alias link', label: this.$gettext('Only invited people') },
        ...roles
      ]
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

    canEdit() {
      return this.canCreatePublicLinks
    },

    noResharePermsMessage() {
      const translatedFile = this.$gettext("You don't have permission to share this file.")
      const translatedFolder = this.$gettext("You don't have permission to share this folder.")
      return this.highlightedFile.type === 'file' ? translatedFile : translatedFolder
    },

    linksLoading() {
      return this.currentFileOutgoingSharesLoading || this.sharesTreeLoading
    },

    linksHeading() {
      if (this.hasSpaces) {
        return this.$gettext('Share via link')
      }
      return this.$gettext('Share via public link')
    },

    indirectLinksHeading() {
      const translated = this.$gettext('Indirect links (%{ count })')
      return this.$gettextInterpolate(translated, { count: this.indirectLinks.length })
    },

    links() {
      return this.currentFileOutgoingLinks
        .filter((link) => !link.quicklink)
        .map((share) => {
          share.key = 'direct-link-' + share.id
          return share
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
      const parentPaths = getParentPaths(this.highlightedFile.path, false)
      if (parentPaths.length === 0) {
        return []
      }

      // remove root entry
      parentPaths.pop()

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
      return this.highlightedFile.type === 'space'
    },

    currentStorageId() {
      if (this.resourceIsSpace) {
        return this.highlightedFile.id
      }

      return this.$route.params.storageId || null
    }
  },
  methods: {
    ...mapActions('Files', ['addLink', 'updateLink', 'removeLink']),
    ...mapActions(['showMessage', 'createModal', 'hideModal']),

    toggleLinkListCollapsed() {
      this.linkListCollapsed = !this.linkListCollapsed
    },

    toggleIndirectLinkListCollapsed() {
      this.indirectLinkListCollapsed = !this.indirectLinkListCollapsed
    },

    reloadLinks() {
      this.loadCurrentFileOutgoingShares({
        client: this.$client,
        graphClient: this.graphClient,
        path: this.highlightedFile.path,
        $gettext: this.$gettext,
        ...(this.currentStorageId && { storageId: this.currentStorageId }),
        resource: this.highlightedFile
      })
      this.loadSharesTree({
        client: this.$client,
        path: this.highlightedFile.path === '' ? '/' : dirname(this.highlightedFile.path),
        $gettext: this.$gettext,
        ...(this.currentStorageId && { storageId: this.currentStorageId })
      })
    },

    isPasswordEnforcedFor(link) {
      const currentRole = LinkShareRoles.getByBitmask(
        parseInt(link.permissions),
        link.indirect || this.highlightedFile.isFolder
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
        showQuickLinkPasswordModal({ store: this.$store }, async (newPassword) => {
          this.createLink({ params: { ...paramsToCreate, password: newPassword }, onError })
        })
      } else {
        this.createLink({ params: paramsToCreate, onError })
      }
    },

    checkLinkToUpdate({ link, onSuccess = () => {} }) {
      const params = this.getParamsForLink(link)

      if (!link.password && this.isPasswordEnforcedFor(link)) {
        showQuickLinkPasswordModal({ store: this.$store }, async (newPassword) => {
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
          .setLocale(this.$language.current)
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
        permissions: link.permissions,
        quicklink: link.quicklink,
        name: link.name,
        spaceRef: this.highlightedFile.fileId,
        ...(this.currentStorageId && {
          storageId: this.currentStorageId
        })
      }
    },

    async createLink({ params, onError = (e) => {} }) {
      let path = this.highlightedFile.path
      // sharing a share root from the share jail -> use resource name as path
      if (this.hasShareJail && path === '/') {
        path = `/${this.highlightedFile.name}`
      }
      await this.addLink({
        path,
        client: this.$client,
        $gettext: this.$gettext,
        storageId: this.highlightedFile.fileId || this.highlightedFile.id,
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
            resource: this.highlightedFile
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
      // removeLink currently fetches all shares from the backend in order to reload the shares indicators
      // TODO: Check if to-removed link is last link share and only reload if it's the last link
      await this.removeLink({
        client,
        share,
        path,
        ...(this.currentStorageId && { storageId: this.currentStorageId })
      })
        .then(
          this.showMessage({
            title: this.$gettext('Link was deleted successfully')
          })
        )
        .catch((e) => {
          console.error(e)
          this.showMessage({
            title: this.$gettext('Failed to delete link'),
            status: 'danger'
          })
        })
    }
  }
})
</script>
<style lang="scss">
.link-name-container {
  background-color: var(--oc-color-input-bg);
  border: 1px solid var(--oc-color-input-border);
}
.link-separator {
  background: var(--oc-color-input-border);
  height: 2px;
}
</style>
