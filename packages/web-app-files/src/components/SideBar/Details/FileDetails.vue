<template>
  <div id="oc-file-details-sidebar">
    <div v-if="hasContent">
      <div
        v-if="isPreviewLoading || preview"
        key="file-thumbnail"
        :style="{
          'background-image': isPreviewLoading ? 'none' : `url(${preview})`
        }"
        class="details-preview oc-flex oc-flex-middle oc-flex-center oc-mb"
        data-testid="preview"
      >
        <oc-spinner v-if="isPreviewLoading" />
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
      <table
        class="details-table"
        :aria-label="$gettext('Overview of the information about the selected file')"
      >
        <tr v-if="hasTimestamp" data-testid="timestamp">
          <th scope="col" class="oc-pr-s oc-font-semibold" v-text="$gettext('Last modified')" />
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
          <th scope="col" class="oc-pr-s oc-font-semibold" v-text="$gettext('Shared via')" />
          <td>
            <router-link :to="sharedAncestorRoute">
              <span v-oc-tooltip="sharedViaTooltip" v-text="sharedAncestor.path" />
            </router-link>
          </td>
        </tr>
        <tr v-if="showSharedBy" data-testid="shared-by">
          <th scope="col" class="oc-pr-s oc-font-semibold" v-text="$gettext('Shared by')" />
          <td>
            <span v-text="sharedByDisplayName" />
          </td>
        </tr>
        <tr v-if="ownerDisplayName" data-testid="ownerDisplayName">
          <th scope="col" class="oc-pr-s oc-font-semibold" v-text="$gettext('Owner')" />
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
          <th scope="col" class="oc-pr-s oc-font-semibold" v-text="$gettext('Size')" />
          <td v-text="resourceSize" />
        </tr>
        <tr v-if="showVersions" data-testid="versionsInfo">
          <th scope="col" class="oc-pr-s oc-font-semibold" v-text="$gettext('Versions')" />
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
        <tr v-if="runningOnEos && !isPublicLinkContext" data-testid="eosPath">
          <th scope="col" class="oc-pr-s oc-font-semibold" v-text="$gettext('FUSE Path')" />
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
        <tr v-if="cernFeatures && sambaPath && !isPublicLinkContext" data-testid="sambaPath">
          <th scope="col" class="oc-pr-s oc-font-semibold" v-text="$gettext('Windows Path')" />
          <td>
            <div class="oc-flex oc-flex-middle oc-flex-between oc-width-1-1">
              <p
                ref="sambaFilePath"
                v-oc-tooltip="sambaPath"
                class="oc-my-rm oc-text-truncate"
                v-text="sambaPath"
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
        <tr v-if="runningOnEos" data-testid="eosDirectLink">
          <th scope="col" class="oc-pr-s oc-font-semibold" v-text="$gettext('Direct link')" />
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
          <th scope="col" class="oc-pr-s oc-font-semibold" v-text="$gettext('Tags')" />
          <td>
            <span v-for="(tag, index) in resource.tags" :key="tag">
              <component
                :is="!isPublicLinkContext ? 'router-link' : 'span'"
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
    <p v-else data-testid="noContentText" v-text="$gettext('No information to display')" />
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, inject, Ref, ref, unref, watch } from 'vue'
import { mapGetters } from 'vuex'
import { ImageDimension } from 'web-pkg/src/constants'
import upperFirst from 'lodash-es/upperFirst'
import { createLocationCommon } from '../../../router'
import { ShareTypes } from 'web-client/src/helpers/share'
import {
  useCapabilityFilesTags,
  useClientService,
  usePublicLinkContext,
  useStore,
  usePreviewService
} from 'web-pkg/src/composables'
import { getIndicators } from '../../../helpers/statusIndicators'
import { useClipboard } from '@vueuse/core'
import { encodePath } from 'web-pkg/src/utils'
import { formatDateFromHTTP, formatFileSize } from 'web-pkg/src/helpers'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { SideBarEventTopics } from 'web-pkg/src/composables/sideBar'
import { Resource, SpaceResource } from 'web-client'
import { useTask } from 'vue-concurrency'
import { useGettext } from 'vue3-gettext'
import { getSharedAncestorRoute } from 'web-app-files/src/helpers/share'
import { AncestorMetaData } from 'web-app-files/src/helpers/resource/ancestorMetaData'

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
    const space = inject<SpaceResource>('space')
    const isPublicLinkContext = usePublicLinkContext({ store })
    const clientService = useClientService()
    const previewService = usePreviewService()
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
      const pathMappings = {
        user: '\\\\cernbox-smb\\eos\\user\\',
        project: '\\\\eosproject-smb\\eos\\project\\',
        public: '\\\\eospublic-smb\\eos\\',
        media: '\\\\eosmedia-smb\\eos\\'
      }
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
            client: clientService.owncloudSdk,
            fileId: unref(resource).id
          })
        )
      }
      await Promise.all(calls.map((p) => p.catch((e) => e)))
    }

    const loadPreviewTask = useTask(function* (signal, resource) {
      preview.value = yield previewService.loadPreview({
        space: unref(space),
        resource,
        dimensions: ImageDimension.Preview
      })
    }).restartable()
    const isPreviewLoading = computed(() => {
      return loadPreviewTask.isRunning || !loadPreviewTask.last
    })

    const ancestorMetaData: Ref<AncestorMetaData> = computed(
      () => store.getters['Files/ancestorMetaData']
    )
    const sharedAncestor = computed(() => {
      return Object.values(unref(ancestorMetaData)).find(
        (a) =>
          a.path !== unref(resource).path &&
          ShareTypes.containsAnyValue(ShareTypes.authenticated, a.shareTypes)
      )
    })

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
      copiedSamba,
      preview,
      copyEosPathToClipboard,
      copySambaPathToClipboard,
      getSambaPath,
      copiedDirect,
      copyDirectLinkToClipboard,
      isClipboardCopySupported,
      isPublicLinkContext,
      space,
      directLink,
      resource,
      hasTags: useCapabilityFilesTags(),
      isPreviewLoading,
      ancestorMetaData,
      sharedAncestor
    }
  },
  computed: {
    ...mapGetters('runtime/spaces', ['spaces']),
    ...mapGetters('Files', ['versions']),
    ...mapGetters(['user', 'configuration']),

    matchingSpace() {
      return this.space || this.spaces.find((space) => space.id === this.resource.storageId)
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
    sharedViaTooltip() {
      return this.$gettext(
        "Navigate to '%{folder}'",
        { folder: this.sharedAncestor.path || '' },
        true
      )
    },
    showSharedBy() {
      return this.showShares && !this.ownedByCurrentUser && this.sharedByDisplayName
    },
    showSharedVia() {
      return this.showShares && this.sharedAncestor
    },
    sharedAncestorRoute() {
      return getSharedAncestorRoute({
        resource: this.resource,
        sharedAncestor: this.sharedAncestor,
        matchingSpace: this.matchingSpace
      })
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
    hasTimestamp() {
      return this.resource.mdate?.length > 0
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
    copyDirectLinkLabel() {
      return this.$gettext('Copy direct link')
    },
    copyEosPathLabel() {
      return this.$gettext('Copy FUSE path')
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
    showVersions() {
      if (this.resource.type === 'folder' || this.isPublicLinkContext) {
        return
      }
      return this.versions.length > 0
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
    hasAnyShares() {
      return (
        this.resource.shareTypes?.length > 0 ||
        this.resource.indicators?.length > 0 ||
        this.sharedAncestor
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
    sharedByDisplayName() {
      return this.resource.share?.fileOwner?.displayName
    },
    sambaPath() {
      return this.getSambaPath(this.resource.path)
    }
  },
  methods: {
    expandVersionsPanel() {
      eventBus.publish(SideBarEventTopics.setActivePanel, 'versions')
    },
    getTagLink(tag) {
      return createLocationCommon('files-common-search', {
        query: { term: `Tags:"${tag}"`, provider: 'files.sdk' }
      })
    },
    getTagComponentAttrs(tag) {
      if (this.isPublicLinkContext) {
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
