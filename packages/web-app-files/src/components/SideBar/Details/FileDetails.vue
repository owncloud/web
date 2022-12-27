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
        v-else
        class="details-icon-wrapper oc-width-1-1 oc-flex oc-flex-middle oc-flex-center oc-mb"
      >
        <oc-resource-icon class="details-icon" :resource="file" size="xxxlarge" />
      </div>
      <div
        v-if="!isPublicLinkContext && shareIndicators.length"
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
          <td v-text="resourceSize" />
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
                v-if="isSupported"
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
                v-if="isSupported"
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
        <tr v-if="showTags" data-testid="tags">
          <th scope="col" class="oc-pr-s" v-text="tagsLabel" />
          <td>
            <span v-for="(tag, index) in file.tags" :key="tag">
              <component
                :is="isUserContext ? 'router-link' : 'span'"
                v-bind="getTagComponentAttrs(tag)"
              >
                <span v-if="index + 1 < file.tags.length">{{ tag }}</span>
                <span v-else v-text="tag" /></component
              ><span v-if="index + 1 < file.tags.length" class="oc-mr-xs">,</span>
            </span>
          </td>
        </tr>
      </table>
    </div>
    <p v-else data-testid="noContentText" v-text="noContentText" />
  </div>
</template>
<script lang="ts">
import { ComputedRef, defineComponent, inject, ref } from 'vue'
import { mapActions, mapGetters } from 'vuex'
import { ImageDimension } from '../../../constants'
import { loadPreview } from 'web-pkg/src/helpers/preview'
import upperFirst from 'lodash-es/upperFirst'
import { basename, dirname } from 'path'
import { createLocationSpaces, createLocationCommon } from '../../../router'
import { ShareTypes } from 'web-client/src/helpers/share'
import {
  useAccessToken,
  useCapabilityFilesTags,
  usePublicLinkContext,
  useStore,
  useTranslations,
  useUserContext
} from 'web-pkg/src/composables'
import { getIndicators } from '../../../helpers/statusIndicators'
import { useClipboard } from '@vueuse/core'
import { encodePath } from 'web-pkg/src/utils'
import { formatDateFromHTTP, formatFileSize } from 'web-pkg/src/helpers'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { SideBarEventTopics } from '../../../composables/sideBar'
import { Resource } from 'web-client'
import { buildShareSpaceResource } from 'web-client/src/helpers'
import { configurationManager } from 'web-pkg/src/configuration'
import { createFileRouteOptions } from 'web-pkg/src/helpers/router'

export default defineComponent({
  name: 'FileDetails',
  setup() {
    const store = useStore()
    const { $gettext } = useTranslations()

    const copiedDirect = ref(false)
    const copiedEos = ref(false)
    const { copy, copied, isSupported } = useClipboard({ legacy: true, copiedDuring: 550 })

    const copyEosPathToClipboard = () => {
      copy(inject<ComputedRef<Resource>>('displayedItem').value.path)
      copiedEos.value = copied.value
      store.dispatch('showMessage', {
        title: $gettext('EOS path copied'),
        desc: $gettext('The EOS path has been copied to your clipboard.')
      })
    }

    const copyDirectLinkToClipboard = () => {
      copy(
        `${store.getters.configuration.server}files/spaces/personal/home${
          inject<ComputedRef<Resource>>('displayedItem').value.path
        }`
      )
      copiedDirect.value = copied.value
      store.dispatch('showMessage', {
        title: $gettext('Direct link copied'),
        desc: $gettext('The direct link has been copied to your clipboard.')
      })
    }

    return {
      copiedEos,
      copyEosPathToClipboard,
      copiedDirect,
      copyDirectLinkToClipboard,
      isSupported,
      isUserContext: useUserContext({ store }),
      isPublicLinkContext: usePublicLinkContext({ store }),
      accessToken: useAccessToken({ store }),
      space: inject<ComputedRef<Resource>>('displayedSpace'),
      file: inject<ComputedRef<Resource>>('displayedItem'),
      hasTags: useCapabilityFilesTags()
    }
  },
  data: () => ({
    loading: false
  }),
  computed: {
    ...mapGetters('runtime/spaces', ['spaces']),
    ...mapGetters('Files', ['versions', 'sharesTree', 'sharesTreeLoading', 'highlightedFile']),
    ...mapGetters(['user', 'configuration']),

    matchingSpace() {
      return this.space || this.spaces.find((space) => space.id === this.file.storageId)
    },
    runningOnEos() {
      return !!this.configuration?.options?.runningOnEos
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
        this.sharedParentDir
      )
    },
    sharedParentRoute() {
      if (this.file.shareId) {
        if (this.file.path === '') {
          return {}
        }
        const space = buildShareSpaceResource({
          shareId: this.file.shareId,
          shareName: basename(this.file.shareRoot),
          serverUrl: configurationManager.serverUrl
        })
        return createLocationSpaces(
          'files-spaces-generic',
          createFileRouteOptions(space, { path: this.file.path, fileId: this.file.fileId })
        )
      }
      if (!this.matchingSpace) {
        return {}
      }
      return createLocationSpaces(
        'files-spaces-generic',
        createFileRouteOptions(this.matchingSpace, {
          path: this.sharedParentDir,
          fileId: this.sharedParentFileId
        })
      )
    },
    showShares() {
      if (this.isPublicLinkContext) {
        return false
      }
      return this.hasAnyShares
    },
    detailSharingInformation() {
      if (this.file.type === 'folder') {
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
      return `${this.configuration.server}files/spaces/personal/home${encodePath(this.file.path)}`
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
    resourceSize() {
      return formatFileSize(this.file.size, this.$language.current)
    },
    showSize() {
      return this.resourceSize !== '?'
    },
    sizeLabel() {
      return this.$gettext('Size')
    },
    showVersions() {
      if (this.file.type === 'folder' || this.isPublicLinkContext) {
        return
      }
      return this.versions.length > 0
    },
    versionsLabel() {
      return this.$gettext('Versions')
    },
    seeVersionsLabel() {
      return this.$gettext('See all versions')
    },
    capitalizedTimestamp() {
      const displayDate = formatDateFromHTTP(this.file.mdate, this.$language.current)
      return upperFirst(displayDate)
    },
    showTags() {
      return this.hasTags && this.file.tags?.length
    },
    tagsLabel() {
      return this.$gettext('Tags')
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
    },
    shareIndicators() {
      return getIndicators(this.file, this.sharesTree)
    },
    shares() {
      if (this.sharedParentDir === null) {
        return []
      }
      return this.sharesTree[this.sharedParentDir]?.filter((s) =>
        ShareTypes.containsAnyValue(
          [...ShareTypes.individuals, ...ShareTypes.unauthenticated],
          [s.shareType]
        )
      )
    },
    sharedItem() {
      return this.shares.length ? this.shares[0] : null
    },
    sharedByName() {
      return this.sharedItem?.owner?.name
    },
    sharedByDisplayName() {
      let sharedByDisplayName = this.sharedItem?.owner?.displayName
      if (this.sharedItem?.owner?.additionalInfo) {
        sharedByDisplayName += ' (' + this.sharedItem.owner.additionalInfo + ')'
      }
      return sharedByDisplayName
    },
    sharedParentDir() {
      return this.getParentSharePath(this.file.path, this.sharesTree)
    },
    sharedParentFileId() {
      return this.sharedItem?.file?.source
    }
  },
  watch: {
    file: {
      handler: function () {
        this.loadData()
      },
      immediate: true
    }
  },
  asyncComputed: {
    preview: {
      async get() {
        // TODO: this timeout resolves flickering of the preview because it's rendered multiple times. Needs a better solution.
        await new Promise((resolve) => setTimeout(resolve, 500))
        return loadPreview({
          resource: this.file,
          isPublic: this.isPublicLinkContext,
          dimensions: ImageDimension.Preview,
          server: this.configuration.server,
          userId: this.user.id,
          token: this.accessToken
        })
      },
      lazy: true,
      watch: ['file.id']
    }
  },
  methods: {
    ...mapActions('Files', ['loadPreview', 'loadVersions']),

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
        currentPath = dirname(currentPath)
      }
      return null
    },
    expandVersionsPanel() {
      eventBus.publish(SideBarEventTopics.setActivePanel, 'versions')
    },
    async loadData() {
      const calls = []
      if (this.file.type === 'file' && !this.isPublicLinkContext) {
        calls.push(this.loadVersions({ client: this.$client, fileId: this.file.id }))
      }
      await Promise.all(calls.map((p) => p.catch((e) => e)))
      this.loading = false
    },
    getTagLink(tag) {
      return createLocationCommon('files-common-search', {
        query: { term: `Tags:${tag}`, provider: 'files.sdk' }
      })
    },
    getTagComponentAttrs(tag) {
      if (!this.isUserContext) {
        return {}
      }

      return {
        to: this.getTagLink(tag)
      }
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
      overflow-wrap: break-word;

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

.details-preview,
.details-icon-wrapper {
  background-color: var(--oc-color-background-muted);
  border: 10px solid var(--oc-color-background-muted);
  height: 230px;

  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.details-icon > svg {
  height: 192px !important;
  max-height: 192px !important;
  max-width: 192px !important;
  width: 192px !important;
}
</style>
