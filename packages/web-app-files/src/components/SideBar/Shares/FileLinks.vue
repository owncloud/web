<template>
  <div id="oc-files-file-link" class="oc-position-relative">
    <div
      v-show="currentView === VIEW_SHOW"
      :key="VIEW_SHOW"
      :aria-hidden="currentView !== VIEW_SHOW"
    >
      <oc-loader v-if="linksLoading" :aria-label="$gettext('Loading list of file links')" />
      <template v-else>
        <h3 class="oc-text-bold oc-m-rm oc-text-initial">
          <span v-text="linksHeading" />
          <oc-contextual-helper v-if="helpersEnabled" v-bind="viaLinkHelp" />
        </h3>
        <div v-if="canCreatePublicLinks" class="oc-mt-m">
          <!-- quicklink goes here -->
          <!-- <hr class="oc-my-s"> -->
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
            v-for="link in links"
            :key="link.key"
            class="oc-py-s"
            :data-testid="`files-link-id-${link.id}`"
          >
            <name-and-copy :link="link" />
            <details-and-edit
              :is-folder-share="highlightedFile.isFolder"
              :link="link"
              :modifiable="canEdit"
              :password-enforced="passwordEnforced"
              :expiration-date="globalExpirationDate"
              :available-role-options="availableRoleOptions"
              @updateLink="updatePublicLink"
              @removePublicLink="deleteLinkConfirmation"
            />
          </li>
        </oc-list>
      </template>
    </div>
    <div
      v-if="currentView === VIEW_CREATE"
      :key="VIEW_CREATE"
      :aria-hidden="currentView !== VIEW_CREATE"
    >
      <create-form
        :default-link-name="defaultNewLinkName"
        :password-enforced="passwordEnforced"
        :expiration-date="globalExpirationDate"
        :available-role-options="availableRoleOptions"
        @createPublicLink="createLink"
        @cancelLinkCreation="cancelCreation"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { DateTime } from 'luxon'
import { mapGetters, mapActions, mapState } from 'vuex'
import mixins from '../../../mixins'
import { getParentPaths } from '../../../helpers/path'
import { textUtils } from '../../../helpers/textUtils'
import { cloneStateObject } from '../../../helpers/store'
import CreateForm from './Links/CreateForm.vue'
import DetailsAndEdit from './Links/DetailsAndEdit.vue'
import NameAndCopy from './Links/NameAndCopy.vue'
import { ShareTypes, LinkShareRoles } from '../../../helpers/share'
import { useStore, useCapabilitySpacesEnabled } from 'web-pkg/src/composables'
import { clientService } from 'web-pkg/src/services'
import { dirname } from 'path'
import { defineComponent } from '@vue/composition-api'
import { shareViaLinkHelp } from '../../../helpers/contextualHelpers'

const VIEW_SHOW = 'showLinks'
const VIEW_CREATE = 'addPublicLink'

export default defineComponent({
  name: 'FileLinks',
  components: {
    CreateForm,
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

    return { graphClient, hasSpaces: useCapabilitySpacesEnabled() }
  },
  data() {
    return {
      VIEW_SHOW,
      VIEW_CREATE,
      currentView: VIEW_SHOW
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

    defaultNewLinkName() {
      return this.capabilities?.files_sharing?.public?.defaultPublicLinkShareName || ''
    },

    globalExpirationDate() {
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
      return this.configuration.options.contextHelpers
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
      return [...this.currentFileOutgoingLinks, ...this.indirectLinks]
        .sort(this.linksComparator)
        .map((share) => {
          share.key = 'direct-link-' + share.id
          return share
        })
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

    reloadLinks() {
      this.loadCurrentFileOutgoingShares({
        client: this.$client,
        graphClient: this.graphClient,
        path: this.highlightedFile.path,
        $gettext: this.$gettext,
        storageId: this.currentStorageId,
        resource: this.highlightedFile
      })
      this.loadSharesTree({
        client: this.$client,
        path: this.highlightedFile.path === '' ? '/' : dirname(this.highlightedFile.path),
        $gettext: this.$gettext,
        storageId: this.currentStorageId
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

    addNewLink() {
      this.currentView = VIEW_CREATE
    },

    cancelCreation() {
      this.currentView = VIEW_SHOW
    },

    getParamsForLink(link) {
      let expireDate = ''

      if (link.expiration) {
        expireDate = DateTime.fromJSDate(link.expiration)
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
        permissions: link.permissions,
        name: link.name,
        ...(this.currentStorageId && {
          spaceRef: `${this.currentStorageId}${this.highlightedFile.path}`
        })
      }
    },

    async createLink({ link, showError }) {
      const params = this.getParamsForLink(link)

      await this.addLink({
        path: this.highlightedFile.path,
        client: this.$client,
        $gettext: this.$gettext,
        params,
        storageId: this.currentStorageId
      }).catch(showError)

      this.currentView = VIEW_SHOW

      this.showMessage({
        title: this.$gettext('Link was created successfully')
      })
    },

    async updatePublicLink({ link, onSuccess = () => {}, onError = (e) => {} }) {
      const params = this.getParamsForLink(link)

      await this.updateLink({
        id: link.id,
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
      await this.removeLink({ client, share, resource, storageId: this.currentStorageId })
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
