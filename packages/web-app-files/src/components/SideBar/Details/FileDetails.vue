<template>
  <div id="oc-file-details-sidebar">
    <div v-if="hasContent">
      <div
        v-if="resource.thumbnail"
        key="file-thumbnail"
        :style="{
          'background-image': loadPreviewTask.isRunning ? 'none' : `url(${preview})`
        }"
        class="details-preview oc-flex oc-flex-middle oc-flex-center oc-mb"
        data-testid="preview"
      >
        <oc-spinner v-if="loadPreviewTask.isRunning" />
      </div>
      <div
        v-else
        class="details-icon-wrapper oc-width-1-1 oc-flex oc-flex-middle oc-flex-center oc-mb"
      >
        <oc-resource-icon class="details-icon" :resource="resource" size="xxxlarge" />
      </div>
      <div
        v-if="!isPublicLinkContext && shareIndicators.length"
        key="file-shares"
        data-testid="sharingInfo"
        class="oc-flex oc-flex-middle oc-my-m"
      >
        <oc-status-indicators :resource="resource" :indicators="shareIndicators" />
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
        <tr v-if="runningOnEos && !isPublicLinkContext && !isFederatedShare">
          <th scope="col" class="oc-pr-s" v-text="eosPathLabel" />
          <td>
            <div class="oc-flex oc-flex-middle oc-flex-between oc-width-1-1">
              <p
                ref="filePath"
                v-oc-tooltip="resource.path"
                class="oc-my-rm oc-text-truncate"
                v-text="resource.path"
              />
              <oc-button
                v-if="isClipboardCopySupported"
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
        <tr
          v-if="
            cernFeatures && getSambaPath(resource.path) && !isPublicLinkContext && !isFederatedShare
          "
        >
          <th scope="col" class="oc-pr-s" v-text="sambaPathLabel" />
          <td>
            <div class="oc-flex oc-flex-middle oc-flex-between oc-width-1-1">
              <p
                ref="sambaFilePath"
                v-oc-tooltip="getSambaPath(resource.path)"
                class="oc-my-rm oc-text-truncate"
                v-text="getSambaPath(resource.path)"
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
        <tr v-if="runningOnEos && !isFederatedShare">
          <th scope="col" class="oc-pr-s" v-text="directLinkLabel" />
          <td>
            <div class="oc-flex oc-flex-middle oc-flex-between oc-width-1-1">
              <p v-oc-tooltip="directLink" class="oc-my-rm oc-text-truncate" v-text="directLink" />
              <oc-button
                v-if="isClipboardCopySupported"
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
            <span v-for="(tag, index) in resource.tags" :key="tag">
              <component
                :is="isUserContext ? 'router-link' : 'span'"
                v-bind="getTagComponentAttrs(tag)"
              >
                <span v-if="index + 1 < resource.tags.length">{{ tag }}</span>
                <span v-else v-text="tag" /></component
              ><span v-if="index + 1 < resource.tags.length" class="oc-mr-xs">,</span>
            </span>
          </td>
        </tr>
      </table>
    </div>
    <p v-else data-testid="noContentText" v-text="noContentText" />
  </div>
</template>
<script lang="ts">
import { computed, ComputedRef, defineComponent, inject, ref, unref, watch } from 'vue'
import { mapGetters } from 'vuex'
import { ImageDimension } from 'web-pkg/src/constants'
import { loadPreview } from 'web-pkg/src/helpers/preview'
import upperFirst from 'lodash-es/upperFirst'
import { basename, dirname } from 'path'
import { createLocationSpaces, createLocationCommon } from '../../../router'
import { ShareTypes } from 'web-client/src/helpers/share'
import {
  useAccessToken,
  useCapabilityFilesTags,
  useClientService,
  usePublicLinkContext,
  useStore,
  useUserContext
} from 'web-pkg/src/composables'
import { getIndicators } from '../../../helpers/statusIndicators'
import { useClipboard } from '@vueuse/core'
import { encodePath } from 'web-pkg/src/utils'
import { formatDateFromHTTP, formatFileSize } from 'web-pkg/src/helpers'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { SideBarEventTopics } from 'web-pkg/src/composables/sideBar'
import { Resource } from 'web-client'
import { buildShareSpaceResource } from 'web-client/src/helpers'
import { configurationManager } from 'web-pkg/src/configuration'
import { createFileRouteOptions } from 'web-pkg/src/helpers/router'
import { useTask } from 'vue-concurrency'
import { useGettext } from 'vue3-gettext'
import pathMappings from '../../../helpers/path/pathMappings'

export default defineComponent({
  name: 'FileDetails',
  setup() {
    const store = useStore()
    const { $gettext } = useGettext()

    const copiedDirect = ref(false)
    const copiedEos = ref(false)
    const copiedSamba = ref(false)
    const {
      copy,
      copied,
      isSupported: isClipboardCopySupported
    } = useClipboard({ legacy: true, copiedDuring: 550 })

    const resource = inject<Resource>('resource')
    const isPublicLinkContext = usePublicLinkContext({ store })
    const accessToken = useAccessToken({ store })
    const clientService = useClientService()
    const preview = ref(undefined)

    const directLink = computed(() => {
      return !unref(isPublicLinkContext)
        ? `${store.getters.configuration.server}files/spaces${encodePath(unref(resource).path)}`
        : `${store.getters.configuration.server.replace(/\/+$/, '')}${unref(resource).downloadURL}`
    })

    const copyEosPathToClipboard = () => {
      copy(unref(resource).path)
      copiedEos.value = unref(copied)
      store.dispatch('showMessage', {
        title: $gettext('FUSE path copied'),
        desc: $gettext('The FUSE path has been copied to your clipboard.')
      })
    }

    const copySambaPathToClipboard = () => {
      copy(getSambaPath(unref(resource).path))
      copiedSamba.value = unref(copied)
      store.dispatch('showMessage', {
        title: $gettext('Windows path copied'),
        desc: $gettext('The Windows path has been copied to your clipboard.')
      })
    }

    const getSambaPath = (path) => {
      const pathComponents = path?.split('/').filter(Boolean)
      if (pathComponents.length > 1 && pathComponents[0] === 'eos') {
        const translated = pathMappings[pathComponents[1]]
        return translated && `${translated}${pathComponents.slice(2).join('\\')}`
      }
    }

    const copyDirectLinkToClipboard = () => {
      copy(unref(directLink))
      copiedDirect.value = unref(copied)
      store.dispatch('showMessage', {
        title: $gettext('Direct link copied'),
        desc: $gettext('The direct link has been copied to your clipboard.')
      })
    }

    const loadData = async () => {
      const calls = []
      if (unref(resource).type === 'file' && !unref(isPublicLinkContext)) {
        calls.push(
          store.dispatch('Files/loadVersions', {
            client: unref(clientService).owncloudSdk,
            fileId: unref(resource).id
          })
        )
      }
      await Promise.all(calls.map((p) => p.catch((e) => e)))
    }

    const loadPreviewTask = useTask(function* (signal, resource) {
      preview.value = yield loadPreview({
        resource,
        isPublic: unref(isPublicLinkContext),
        dimensions: ImageDimension.Preview,
        server: store.getters.configuration.server,
        userId: store.getters.user.id,
        token: unref(accessToken)
      })
    }).restartable()

    watch(
      resource,
      () => {
        if (unref(resource)) {
          loadData()
          loadPreviewTask.perform(unref(resource))
        }
      },
      { immediate: true }
    )

    return {
      copiedEos,
      preview,
      copyEosPathToClipboard,
      copySambaPathToClipboard,
      getSambaPath,
      copiedDirect,
      copyDirectLinkToClipboard,
      isClipboardCopySupported,
      isUserContext: useUserContext({ store }),
      isPublicLinkContext,
      accessToken,
      space: inject<ComputedRef<Resource>>('space'),
      directLink,
      resource,
      hasTags: useCapabilityFilesTags(),
      loadPreviewTask
    }
  },
  computed: {
    ...mapGetters('runtime/spaces', ['spaces']),
    ...mapGetters('Files', ['ancestorMetaData', 'versions', 'sharesTree', 'sharesTreeLoading']),
    ...mapGetters(['user', 'configuration']),

    matchingSpace() {
      return this.space || this.spaces.find((space) => space.id === this.resource.storageId)
    },
    isFederatedShare() {
      return this.resource?.share?.shareType === 6
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
        this.sharedByName !== this.resource.ownerId
      )
    },
    showSharedVia() {
      return (
        this.showShares &&
        !this.sharesTreeLoading &&
        this.resource.path !== this.sharedParentDir &&
        this.sharedParentDir
      )
    },
    sharedParentRoute() {
      if (this.resource.shareId) {
        if (this.resource.path === '') {
          return {}
        }
        const space = buildShareSpaceResource({
          shareId: this.resource.shareId,
          shareName: basename(this.resource.shareRoot),
          serverUrl: configurationManager.serverUrl
        })
        return createLocationSpaces(
          'files-spaces-generic',
          createFileRouteOptions(space, { path: this.resource.path, fileId: this.resource.fileId })
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
      if (this.resource.type === 'folder') {
        return this.$gettext('This folder has been shared.')
      }
      return this.$gettext('This file has been shared.')
    },
    sharedByLabel() {
      return this.$gettext('Shared by')
    },
    hasTimestamp() {
      return this.resource.mdate?.length > 0
    },
    timestampLabel() {
      return this.$gettext('Last modified')
    },
    ownerLabel() {
      return this.$gettext('Owner')
    },
    ownerDisplayName() {
      return (
        this.resource.ownerDisplayName ||
        this.resource.shareOwnerDisplayname ||
        this.resource.owner?.[0].displayName
      )
    },
    ownerAdditionalInfo() {
      return this.resource.owner?.[0].additionalInfo
    },
    directLinkLabel() {
      return this.$gettext('Direct link')
    },
    copyDirectLinkLabel() {
      return this.$gettext('Copy direct link')
    },
    eosPathLabel() {
      return this.$gettext('FUSE Path')
    },
    copyEosPathLabel() {
      return this.$gettext('Copy FUSE path')
    },
    sambaPathLabel() {
      return this.$gettext('Windows Path')
    },
    copySambaPathLabel() {
      return this.$gettext('Copy Windows path')
    },
    resourceSize() {
      return formatFileSize(this.resource.size, this.$language.current)
    },
    showSize() {
      return this.resourceSize !== '?'
    },
    sizeLabel() {
      return this.$gettext('Size')
    },
    showVersions() {
      if (this.resource.type === 'folder' || this.isPublicLinkContext) {
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
      const displayDate = formatDateFromHTTP(this.resource.mdate, this.$language.current)
      return upperFirst(displayDate)
    },
    showTags() {
      return this.hasTags && this.resource.tags?.length
    },
    tagsLabel() {
      return this.$gettext('Tags')
    },
    hasAnyShares() {
      return (
        this.resource.shareTypes?.length > 0 ||
        this.resource.indicators?.length > 0 ||
        this.sharedItem !== null
      )
    },
    ownedByCurrentUser() {
      return (
        this.resource.ownerId === this.user.id ||
        this.resource.owner?.[0].username === this.user.id ||
        this.resource.shareOwner === this.user.id
      )
    },
    shareIndicators() {
      return getIndicators({ resource: this.resource, ancestorMetaData: this.ancestorMetaData })
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
      return this.getParentSharePath(this.resource.path, this.sharesTree)
    },
    sharedParentFileId() {
      return this.sharedItem?.file?.source
    }
  },
  methods: {
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
