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
          :password-enforced="passwordEnforced"
          :expiration-date="expirationDate"
          @createPublicLink="checkLinkToCreate"
        />
        <details-and-edit
          v-if="quicklink"
          :is-folder-share="highlightedFile.isFolder"
          :link="quicklink"
          :modifiable="canEdit"
          :can-rename="false"
          :password-enforced="passwordEnforced"
          :expiration-date="expirationDate"
          :available-role-options="availableRoleOptions"
          @updateLink="checkLinkToCreate"
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
            :is-folder-share="highlightedFile.isFolder"
            :link="link"
            :modifiable="canEdit && !link.indirect"
            :can-rename="true"
            :password-enforced="passwordEnforced"
            :expiration-date="expirationDate"
            :available-role-options="availableRoleOptions"
            @updateLink="checkLinkToUpdate"
            @removePublicLink="deleteLinkConfirmation"
          />
        </li>
      </oc-list>
      <div v-if="links.length > 3" class="oc-flex oc-flex-center">
        <oc-button appearance="raw" @click="toggleLinkListCollapsed" v-text="collapseButtonTitle" />
      </div>
    </template>
  </div>
</template>
<script lang="ts">
import { dirname } from 'path'
import { defineComponent } from '@vue/composition-api'
import { DateTime } from 'luxon'
import { mapGetters, mapActions, mapState } from 'vuex'
import { useStore, useCapabilitySpacesEnabled } from 'web-pkg/src/composables'
import { clientService } from 'web-pkg/src/services'
import mixins from '../../../mixins'
import { shareViaLinkHelp } from '../../../helpers/contextualHelpers'
import { getParentPaths } from '../../../helpers/path'
import { ShareTypes, LinkShareRoles, SharePermissions } from '../../../helpers/share'
import { cloneStateObject } from '../../../helpers/store'
import { textUtils } from '../../../helpers/textUtils'
import { showQuickLinkPasswordModal } from '../../../quickActions'
import CreateQuickLink from './Links/CreateQuickLink.vue'
import DetailsAndEdit from './Links/DetailsAndEdit.vue'
import NameAndCopy from './Links/NameAndCopy.vue'

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
    const graphClient = clientService.graphAuthenticated(
      store.getters.configuration.server,
      store.getters.getToken
    )

    const linkListCollapsed = !store.getters.configuration.options.sidebar.shares.showAllOnLoad

    return {
      graphClient,
      hasSpaces: useCapabilitySpacesEnabled(),
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
      return this.linkListCollapsed ? this.$gettext('Show more') : this.$gettext('Show less')
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
      const roles = LinkShareRoles.list(
        this.highlightedFile.isFolder,
        this.capabilities.files_sharing?.public?.can_edit
      ).map((role) => {
        return {
          role,
          name: role.name,
          label: this.$gettext(role.label)
        }
      })
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

    canCreatePublicLinks() {
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

    links() {
      const nonQuickLinkOutgoingLinks = this.currentFileOutgoingLinks.filter(
        (link) => !link.quicklink
      )

      return [...nonQuickLinkOutgoingLinks, ...this.indirectLinks]
        .sort(this.linksComparator)
        .map((share) => {
          share.key = 'direct-link-' + share.id
          return share
        })
    },

    displayLinks() {
      const linkShares = this.links
      const sortedLinkShares = linkShares.sort((a, b) => {
        return b.stime - a.stime
      })
      if (this.links.length > 3 && this.linkListCollapsed) {
        return sortedLinkShares.slice(0, 3)
      }
      return sortedLinkShares
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
      return allShares.sort(this.linksComparator)
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
  watch: {
    highlightedFile(newItem, oldItem) {
      if (oldItem !== newItem) {
        this.reloadLinks()
      }
    }
  },
  mounted() {
    this.reloadLinks()
  },

  methods: {
    ...mapActions('Files', [
      'addLink',
      'updateLink',
      'removeLink',
      'loadSharesTree',
      'loadCurrentFileOutgoingShares'
    ]),
    ...mapActions(['showMessage', 'createModal', 'hideModal']),

    toggleLinkListCollapsed() {
      this.linkListCollapsed = !this.linkListCollapsed
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

    linksComparator(l1, l2) {
      // sorting priority 1: display name (lower case, ascending), 2: creation time (descending)
      const name1 = l1.name.toLowerCase().trim()
      const name2 = l2.name.toLowerCase().trim()
      const l1Direct = !l1.indirect
      const l2Direct = !l2.indirect

      if (l1Direct === l2Direct) {
        if (name1 === name2) {
          return l1.stime - l2.stime
        }

        return textUtils.naturalSortCompare(name1, name2)
      }

      return l1Direct ? -1 : 1
    },

    checkPasswordEnforcedFor(link) {
      const currentRole = this.availableRoleOptions.find(({ role }) => {
        return parseInt(link.permissions) === role.bitmask(false)
      })

      const canRead = currentRole.role.hasPermission(SharePermissions.read)
      const canCreate = currentRole.role.hasPermission(SharePermissions.create)
      const canDelete = currentRole.role.hasPermission(SharePermissions.delete)

      if (this.passwordEnforced.read_only === true) {
        return canRead && !canCreate && !canDelete
      }
      if (this.passwordEnforced.upload_only === true) {
        return !canRead && canCreate && !canDelete
      }
      if (this.passwordEnforced.read_write === true) {
        return canRead && canCreate && !canDelete
      }
      if (this.passwordEnforced.read_write_delete === true) {
        return canRead && canCreate && canDelete
      }
      return false
    },

    addNewLink() {
      this.checkLinkToCreate({
        link: {
          name: this.$gettext('Link'),
          role: this.availableRoleOptions[0],
          permissions: 1,
          expiration: this.expirationDate.default,
          password: false
        }
      })
    },

    checkLinkToCreate({ link, onError = () => {} }) {
      const paramsToCreate = this.getParamsForLink(link)

      if (!link.password && this.checkPasswordEnforcedFor(link)) {
        showQuickLinkPasswordModal({ store: this.$store }, async (newPassword) => {
          this.hideModal()
          this.createLink({ params: { ...paramsToCreate, password: newPassword }, onError })
        })
      } else {
        this.createLink({ params: paramsToCreate, onError })
      }
    },

    checkLinkToUpdate({ link, onSuccess = () => {} }) {
      const params = this.getParamsForLink(link)

      if (!link.password && this.checkPasswordEnforcedFor(link)) {
        showQuickLinkPasswordModal({ store: this.$store }, async (newPassword) => {
          this.hideModal()
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
        ...(this.currentStorageId && {
          storageId: this.currentStorageId,
          spaceRef: `${this.currentStorageId}${this.highlightedFile.path}`
        })
      }
    },

    async createLink({ params, onError = (e) => {} }) {
      await this.addLink({
        path: this.highlightedFile.path,
        client: this.$client,
        $gettext: this.$gettext,
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
      // removeLink currently fetches all shares from the backend in order to reload the shares indicators
      // TODO: Check if to-removed link is last link share and only reload if it's the last link
      await this.removeLink({
        client,
        share,
        resource,
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
