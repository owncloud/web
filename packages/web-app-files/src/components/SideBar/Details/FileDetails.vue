<template>
  <div id="oc-file-details-sidebar">
    <div v-if="hasContent">
      <div
        v-if="file.thumbnail"
        key="file-thumbnail"
        :style="{
          'background-image': $asyncComputed.preview.updating ? 'none' : `url(${preview})`
        }"
        class="details-preview oc-flex oc-flex-middle oc-flex-center oc-mb"
        data-testid="preview"
      >
        <oc-spinner v-if="$asyncComputed.preview.updating" />
      </div>
      <div
        v-if="showShares"
        key="file-shares"
        data-testid="sharingInfo"
        class="oc-flex oc-flex-middle oc-my-m"
      >
        <oc-button
          v-if="hasPeopleShares"
          v-oc-tooltip="peopleSharesLabel"
          appearance="raw"
          class="oc-mr-xs"
          :aria-label="peopleSharesLabel"
          @click="expandPeoplesPanel"
        >
          <oc-icon name="group" />
        </oc-button>
        <oc-button
          v-if="hasLinkShares"
          v-oc-tooltip="linkSharesLabel"
          appearance="raw"
          class="oc-mr-xs"
          :aria-label="linkSharesLabel"
          @click="expandLinksPanel"
        >
          <oc-icon name="link" />
        </oc-button>
        <p class="oc-my-rm oc-mx-s" v-text="detailSharingInformation" />
      </div>
      <table class="details-table" :aria-label="detailsTableLabel">
        <tr v-if="hasTimestamp" data-testid="timestamp">
          <th scope="col" class="oc-pr-s" v-text="timestampTitle" />
          <td>
            <oc-button
              v-if="showVersions"
              v-oc-tooltip="seeVersionsLabel"
              appearance="raw"
              :aria-label="seeVersionsLabel"
              @click="expandVersionsPanel"
              v-text="capitalizedTimestamp"
            />
            <span v-else v-text="capitalizedTimestamp" />
          </td>
        </tr>
        <tr v-if="showSharedVia" data-testid="shared-via">
          <th scope="col" class="oc-pr-s" v-text="sharedViaLabel" />
          <td>
            <router-link :to="sharedParentRoute">
              <span v-oc-tooltip="sharedViaTooltip" v-text="sharedParentDir" />
            </router-link>
          </td>
        </tr>
        <tr v-if="showSharedBy" data-testid="shared-by">
          <th scope="col" class="oc-pr-s" v-text="sharedByLabel" />
          <td>
            <span v-text="sharedByDisplayName" />
          </td>
        </tr>
        <tr v-if="ownerDisplayName" data-testid="ownerDisplayName">
          <th scope="col" class="oc-pr-s" v-text="ownerTitle" />
          <td>
            <p class="oc-m-rm">
              {{ ownerDisplayName }}
              <span v-if="ownedByCurrentUser" v-translate>(me)</span>
              <span v-if="!ownedByCurrentUser && ownerAdditionalInfo"
                >({{ ownerAdditionalInfo }})</span
              >
            </p>
          </td>
        </tr>
        <tr v-if="showSize" data-testid="sizeInfo">
          <th scope="col" class="oc-pr-s" v-text="sizeTitle" />
          <td v-text="getResourceSize(file.size)" />
        </tr>
        <tr v-if="showVersions" data-testid="versionsInfo">
          <th scope="col" class="oc-pr-s" v-text="versionsTitle" />
          <td>
            <oc-button
              v-oc-tooltip="seeVersionsLabel"
              appearance="raw"
              :aria-label="seeVersionsLabel"
              @click="expandVersionsPanel"
              v-text="versions.length"
            />
          </td>
        </tr>
      </table>
    </div>
    <p v-else data-testid="noContentText" v-text="noContentText" />
  </div>
</template>
<script>
import { computed, ref } from '@vue/composition-api'
import Mixins from '../../../mixins'
import MixinResources from '../../../mixins/resources'
import { mapActions, mapGetters } from 'vuex'
import { ImageDimension } from '../../../constants'
import { loadPreview } from '../../../helpers/resource'
import upperFirst from 'lodash-es/upperFirst'
import path from 'path'
import { createLocationSpaces, isAuthenticatedRoute } from '../../../router'
import { ShareTypes } from '../../../helpers/share'

export default {
  name: 'FileDetails',
  mixins: [Mixins, MixinResources],

  inject: ['displayedItem'],
  setup() {
    const sharedParentDir = ref('')
    const sharedParentRoute = computed(() =>
      createLocationSpaces('files-spaces-personal-home', {
        params: { item: sharedParentDir.value }
      })
    )

    return {
      sharedParentDir,
      sharedParentRoute
    }
  },

  title: ($gettext) => {
    return $gettext('Details')
  },

  data: () => ({
    loading: false,
    sharedByName: '',
    sharedByDisplayName: '',
    sharedTime: 0,
    sharedItem: null
  }),
  computed: {
    ...mapGetters('Files', ['versions', 'sharesTree', 'sharesTreeLoading']),
    ...mapGetters(['user', 'getToken', 'configuration']),

    file() {
      return this.displayedItem.value
    },

    hasContent() {
      return (
        this.hasTimestamp ||
        this.ownerDisplayName ||
        this.showSize ||
        this.showShares ||
        this.showVersions
      )
    },
    noContentText() {
      return this.$gettext('No information to display')
    },
    detailsTableLabel() {
      return this.$gettext('Overview of the information about the selected file')
    },
    shareDateLabel() {
      return this.$gettext('Shared:')
    },
    sharedViaLabel() {
      return this.$gettext('Shared via:')
    },
    sharedViaTooltip() {
      return this.$gettextInterpolate(
        this.$gettext("Navigate to '%{folder}'"),
        { folder: this.sharedParentDir || '' },
        true
      )
    },
    showSharedBy() {
      return (
        this.showShares &&
        !this.ownedByCurrentUser &&
        !this.sharesTreeLoading &&
        this.sharedByDisplayName &&
        this.sharedByName !== this.file.ownerId
      )
    },
    showSharedVia() {
      return (
        this.showShares &&
        !this.sharesTreeLoading &&
        this.file.webDavPath !== this.sharedParentDir &&
        this.sharedParentDir !== null
      )
    },
    showShares() {
      return this.hasAnyShares && isAuthenticatedRoute(this.$route)
    },
    detailSharingInformation() {
      const isFolder = this.file.type === 'folder'
      if (isFolder) {
        return this.$gettext('This folder has been shared.')
      }
      return this.$gettext('This file has been shared.')
    },
    peopleSharesLabel() {
      return this.$gettext('Show invited people')
    },
    linkSharesLabel() {
      return this.$gettext('Show links')
    },
    sharedByLabel() {
      return this.$gettext('Shared by:')
    },
    hasTimestamp() {
      return this.file.mdate?.length > 0
    },
    timestampTitle() {
      return this.$gettext('Last modified:')
    },
    ownerTitle() {
      return this.$gettext('Owner:')
    },
    ownerDisplayName() {
      return (
        this.file.ownerDisplayName ||
        this.file.shareOwnerDisplayname ||
        this.file.owner?.[0].displayName
      )
    },
    ownerAdditionalInfo() {
      return this.file.owner?.[0].additionalInfo
    },
    showSize() {
      return this.getResourceSize(this.file.size) !== '?'
    },
    sizeTitle() {
      return this.$gettext('Size:')
    },
    showVersions() {
      if (this.file.type === 'folder') {
        return
      }
      return this.versions.length > 0 && isAuthenticatedRoute(this.$route)
    },
    versionsTitle() {
      return this.$gettext('Versions:')
    },
    seeVersionsLabel() {
      return this.$gettext('See all versions')
    },
    capitalizedTimestamp() {
      const displayDate = this.formDateFromHTTP(this.file.mdate)
      return upperFirst(displayDate)
    },
    hasAnyShares() {
      return (
        this.file.shareTypes?.length > 0 ||
        this.file.indicators?.length > 0 ||
        this.sharedItem !== null
      )
    },
    hasPeopleShares() {
      return (
        ShareTypes.containsAnyValue(ShareTypes.authenticated, this.file.shareTypes) ||
        this.file.indicators?.filter((e) => e.icon === 'group').length > 0 ||
        this.sharedItem !== null
      )
    },
    hasLinkShares() {
      return (
        ShareTypes.containsAnyValue(ShareTypes.unauthenticated, this.file.shareTypes) ||
        this.file.indicators?.filter((e) => e.icon === 'link').length > 0
      )
    },
    ownedByCurrentUser() {
      return (
        this.file.ownerId === this.user.id ||
        this.file.owner?.[0].username === this.user.id ||
        this.file.shareOwner === this.user.id
      )
    }
  },
  watch: {
    file() {
      this.loadData()
      this.refreshShareDetailsTree()
    },
    sharesTree() {
      // missing early return
      this.sharedItem = null

      const sharePathParentOrCurrent = this.getParentSharePath(
        this.file.webDavPath,
        this.sharesTree
      )
      if (sharePathParentOrCurrent === null) {
        return
      }
      const userShares = this.sharesTree[sharePathParentOrCurrent]?.filter((s) =>
        ShareTypes.containsAnyValue(ShareTypes.individuals, [s.shareType])
      )
      if (userShares.length === 0) {
        return
      }

      this.sharedItem = userShares[0]
      this.sharedByName = this.sharedItem.owner?.name
      this.sharedByDisplayName = this.sharedItem.owner?.displayName
      if (this.sharedItem.owner?.additionalInfo) {
        this.sharedByDisplayName += ' (' + this.sharedItem.owner.additionalInfo + ')'
      }
      this.sharedTime = this.sharedItem.stime
      this.sharedParentDir = sharePathParentOrCurrent
    }
  },
  mounted() {
    this.loadData()
    this.refreshShareDetailsTree()
  },
  asyncComputed: {
    preview: {
      async get() {
        // TODO: this timeout resolves flickering of the preview because it's rendered multiple times. Needs a better solution.
        await new Promise((resolve) => setTimeout(resolve, 500))
        return loadPreview({
          resource: this.file,
          isPublic: !isAuthenticatedRoute(this.$route),
          dimensions: ImageDimension.Preview,
          server: this.configuration.server,
          userId: this.user.id,
          token: this.getToken
        })
      },
      lazy: true,
      watch: ['file.id']
    }
  },
  methods: {
    ...mapActions('Files', ['loadPreview', 'loadVersions', 'loadSharesTree']),
    ...mapActions('Files/sidebar', { setSidebarPanel: 'setActivePanel' }),
    refreshShareDetailsTree() {
      this.loadSharesTree({
        client: this.$client,
        path: this.file.webDavPath,
        $gettext: this.$gettext
      })
    },
    getParentSharePath(childPath, shares) {
      let currentPath = childPath
      if (!currentPath) {
        return null
      }
      while (currentPath !== '/') {
        const share = shares[currentPath]
        if (share !== undefined && share[0] !== undefined) {
          return currentPath
        }
        currentPath = path.dirname(currentPath)
      }
      return null
    },
    expandPeoplesPanel() {
      this.setSidebarPanel('sharing-item')
    },
    expandLinksPanel() {
      this.setSidebarPanel('links-item')
    },
    expandVersionsPanel() {
      this.setSidebarPanel('versions-item')
    },
    async loadData() {
      this.loading = true
      const calls = []
      if (this.file.type === 'file' && isAuthenticatedRoute(this.$route)) {
        calls.push(this.loadVersions({ client: this.$client, fileId: this.file.id }))
      }
      await Promise.all(calls.map((p) => p.catch((e) => e)))
      this.loading = false
    }
  }
}
</script>
<style lang="scss" scoped>
.details-table {
  text-align: left;

  tr {
    height: 1.5rem;
  }

  th {
    font-weight: 600;
  }
}

.details-preview {
  background-color: var(--oc-color-background-muted);
  border: 10px solid var(--oc-color-background-muted);
  height: 230px;

  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
</style>
