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
        v-if="shareIndicators.length"
        key="file-shares"
        data-testid="sharingInfo"
        class="oc-flex oc-flex-middle oc-my-m"
      >
        <oc-status-indicators :resource="file" :indicators="shareIndicators" />
        <p class="oc-my-rm oc-mx-s" v-text="detailSharingInformation" />
      </div>
      <table class="details-table" :aria-label="detailsTableLabel">
        <tr v-if="hasTimestamp" data-testid="timestamp">
          <th scope="col" class="oc-pr-s" v-text="timestampLabel" />
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
          <th scope="col" class="oc-pr-s" v-text="ownerLabel" />
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
          <th scope="col" class="oc-pr-s" v-text="sizeLabel" />
          <td v-text="getResourceSize(file.size)" />
        </tr>
        <tr v-if="showVersions" data-testid="versionsInfo">
          <th scope="col" class="oc-pr-s" v-text="versionsLabel" />
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
        <tr v-if="runningOnEos">
          <th scope="col" class="oc-pr-s" v-text="eosPathLabel" />
          <td>
            <div class="oc-flex oc-flex-middle oc-flex-between oc-width-1-1">
              <p
                ref="filePath"
                v-oc-tooltip="file.path"
                class="oc-my-rm oc-text-truncate"
                v-text="file.path"
              />
              <oc-button
                v-oc-tooltip="copyEosPathLabel"
                :aria-label="copyEosPathLabel"
                appearance="raw"
                :variation="copiedEos ? 'success' : 'passive'"
                @click="copyEosPathToClipboard"
              >
                <oc-icon
                  v-if="copiedEos"
                  key="oc-copy-to-clipboard-copied"
                  name="checkbox-circle"
                  class="_clipboard-success-animation"
                />
                <oc-icon v-else key="oc-copy-to-clipboard-copy" name="clipboard" />
              </oc-button>
            </div>
          </td>
        </tr>
        <tr v-if="cernFeatures && getSambaPath(file.path)">
          <th scope="col" class="oc-pr-s" v-text="sambaPathLabel" />
          <td>
            <div class="oc-flex oc-flex-middle oc-flex-between oc-width-1-1">
              <p
                ref="sambaFilePath"
                v-oc-tooltip="getSambaPath(file.path)"
                class="oc-my-rm oc-text-truncate"
                v-text="getSambaPath(file.path)"
              />
              <oc-button
                v-oc-tooltip="copySambaPathLabel"
                :aria-label="copySambaPathLabel"
                appearance="raw"
                :variation="copiedSamba ? 'success' : 'passive'"
                @click="copySambaPathToClipboard"
              >
                <oc-icon
                  v-if="copiedSamba"
                  key="oc-copy-to-clipboard-copied"
                  name="checkbox-circle"
                  class="_clipboard-success-animation"
                />
                <oc-icon v-else key="oc-copy-to-clipboard-copy" name="clipboard" />
              </oc-button>
            </div>
          </td>
        </tr>
        <tr v-if="runningOnEos">
          <th scope="col" class="oc-pr-s" v-text="directLinkLabel" />
          <td>
            <div class="oc-flex oc-flex-middle oc-flex-between oc-width-1-1">
              <p
                ref="directLink"
                v-oc-tooltip="directLink"
                class="oc-my-rm oc-text-truncate"
                v-text="directLink"
              />
              <oc-button
                v-oc-tooltip="copyDirectLinkLabel"
                :aria-label="copyDirectLinkLabel"
                appearance="raw"
                :variation="copiedDirect ? 'success' : 'passive'"
                @click="copyDirectLinkToClipboard"
              >
                <oc-icon
                  v-if="copiedDirect"
                  key="oc-copy-to-clipboard-copied"
                  name="checkbox-circle"
                  class="_clipboard-success-animation"
                />
                <oc-icon v-else key="oc-copy-to-clipboard-copy" name="clipboard" />
              </oc-button>
            </div>
          </td>
        </tr>
      </table>
    </div>
    <p v-else data-testid="noContentText" v-text="noContentText" />
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, ref, unref } from '@vue/composition-api'
import Mixins from '../../../mixins'
import MixinResources from '../../../mixins/resources'
import { mapActions, mapGetters } from 'vuex'
import { ImageDimension } from '../../../constants'
import { loadPreview } from '../../../helpers/resource'
import upperFirst from 'lodash-es/upperFirst'
import path from 'path'
import { createLocationSpaces, isAuthenticatedRoute, isLocationSpacesActive } from '../../../router'
import { ShareTypes } from '../../../helpers/share'
import { useRouteParam, useRouter } from 'web-pkg/src/composables'
import { getIndicators } from '../../../helpers/statusIndicators'
import copyToClipboard from 'copy-to-clipboard'
import { encodePath } from 'web-pkg/src/utils'
import pathMappings from '../../../helpers/path/pathMappings'

export default defineComponent({
  name: 'FileDetails',
  mixins: [Mixins, MixinResources],

  inject: ['displayedItem'],
  setup() {
    const sharedParentDir = ref('')
    const router = useRouter()
    const currentStorageId = useRouteParam('storageId')

    const sharedParentRoute = computed(() => {
      if (isLocationSpacesActive(router, 'files-spaces-project')) {
        return createLocationSpaces('files-spaces-project', {
          params: { storageId: unref(currentStorageId), item: unref(sharedParentDir) }
        })
      }

      return createLocationSpaces('files-spaces-personal', {
        params: { item: unref(sharedParentDir) }
      })
    })

    return {
      sharedParentDir,
      sharedParentRoute,
      currentStorageId
    }
  },

  data: () => ({
    loading: false,
    sharedByName: '',
    sharedByDisplayName: '',
    sharedTime: 0,
    sharedItem: null,
    shareIndicators: [],
    copiedDirect: false,
    copiedEos: false,
    copiedSamba: false,
    timeout: null
  }),
  computed: {
    ...mapGetters('Files', ['versions', 'sharesTree', 'sharesTreeLoading']),
    ...mapGetters(['user', 'getToken', 'configuration']),

    file() {
      return this.displayedItem.value
    },
    runningOnEos() {
      return !!this.configuration?.options?.runningOnEos
    },
    cernFeatures() {
      return !!this.configuration?.options?.cernFeatures
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
      return this.$gettext('Shared')
    },
    sharedViaLabel() {
      return this.$gettext('Shared via')
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
        this.file.path !== this.sharedParentDir &&
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
    sharedByLabel() {
      return this.$gettext('Shared by')
    },
    hasTimestamp() {
      return this.file.mdate?.length > 0
    },
    timestampLabel() {
      return this.$gettext('Last modified')
    },
    ownerLabel() {
      return this.$gettext('Owner')
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
    directLink() {
      return `${this.configuration.server}files/spaces${encodePath(this.file.path)}`
    },
    directLinkLabel() {
      return this.$gettext('Direct link')
    },
    copyDirectLinkLabel() {
      return this.$gettext('Copy direct link')
    },
    eosPathLabel() {
      return this.$gettext('EOS Path')
    },
    copyEosPathLabel() {
      return this.$gettext('Copy EOS path')
    },
    sambaPathLabel() {
      return this.$gettext('Windows Path')
    },
    copySambaPathLabel() {
      return this.$gettext('Copy Windows path')
    },
    showSize() {
      return this.getResourceSize(this.file.size) !== '?'
    },
    sizeLabel() {
      return this.$gettext('Size')
    },
    showVersions() {
      if (this.file.type === 'folder') {
        return
      }
      return this.versions.length > 0 && isAuthenticatedRoute(this.$route)
    },
    versionsLabel() {
      return this.$gettext('Versions')
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
      this.loadData().then(this.refreshShareDetailsTree)
    },
    sharesTree() {
      // missing early return
      this.sharedItem = null
      this.shareIndicators = getIndicators(this.file, this.sharesTree)
      const sharePathParentOrCurrent = this.getParentSharePath(this.file.path, this.sharesTree)
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
    async refreshShareDetailsTree() {
      await this.loadSharesTree({
        client: this.$client,
        path: this.file.path,
        $gettext: this.$gettext,
        ...(this.currentStorageId && { storageId: this.currentStorageId })
      })
      this.shareIndicators = getIndicators(this.file, this.sharesTree)
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
    },
    copyEosPathToClipboard() {
      copyToClipboard(this.file.path)
      this.copiedEos = true
      this.clipboardSuccessHandler()
      this.showMessage({
        title: this.$gettext('EOS path copied'),
        desc: this.$gettext('The EOS path has been copied to your clipboard.')
      })
    },
    copySambaPathToClipboard() {
      copyToClipboard(this.getSambaPath(this.file.path))
      this.copiedSamba = true
      this.clipboardSuccessHandler()
      this.showMessage({
        title: this.$gettext('Windows path copied'),
        desc: this.$gettext('The Windows path has been copied to your clipboard.')
      })
    },
    getSambaPath(path) {
      const pathComponents = path?.split('/').filter(Boolean)
      if (pathComponents.length > 2 && pathComponents[0] === 'eos') {
        const translated = pathMappings[pathComponents[1]]
        return translated && `${translated}${pathComponents.slice(2).join('\\')}`
      }
    },
    copyDirectLinkToClipboard() {
      copyToClipboard(this.directLink)
      this.copiedDirect = true
      this.clipboardSuccessHandler()
      this.showMessage({
        title: this.$gettext('Direct link copied'),
        desc: this.$gettext('The direct link has been copied to your clipboard.')
      })
    },
    clipboardSuccessHandler() {
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        this.copiedDirect = false
        this.copiedEos = false
        this.copiedSamba = false
      }, 550)
    }
  }
})
</script>
<style lang="scss" scoped>
.details-table {
  text-align: left;

  tr {
    height: 1.5rem;

    td {
      max-width: 0;
      width: 100%;

      div {
        min-width: 0;
      }
    }
  }

  th {
    font-weight: 600;
    white-space: nowrap;
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
