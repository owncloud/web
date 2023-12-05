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
        class="details-table oc-width-1-1"
        :aria-label="$gettext('Overview of the information about the selected file')"
      >
        <col class="oc-width-1-3" />
        <col class="oc-width-2-3" />
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
        <tr v-if="resource.locked" data-testid="locked-by">
          <th scope="col" class="oc-pr-s oc-font-semibold" v-text="$gettext('Locked by')" />
          <td>
            <span>{{ resource.lockOwnerName }} ({{ formatDateRelative(resource.lockTime) }})</span>
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
        <web-dav-details v-if="showWebDavDetails" />
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
        <portal-target
          name="app.files.sidebar.file.details.table"
          :slot-props="{ space, resource }"
          :multiple="true"
        />
        <tr v-if="hasTags" data-testid="tags">
          <th scope="col" class="oc-pr-s oc-font-semibold">
            {{ $gettext('Tags') }}
            <oc-contextual-helper
              v-if="contextualHelper?.isEnabled"
              v-bind="contextualHelper?.data"
              class="oc-pl-xs"
            ></oc-contextual-helper>
          </th>
          <td>
            <tags-select :resource="resource"></tags-select>
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
import { ImageDimension, useConfigurationManager } from '@ownclouders/web-pkg'
import upperFirst from 'lodash-es/upperFirst'
import { ShareTypes } from '@ownclouders/web-client/src/helpers/share'
import {
  useCapabilityFilesTags,
  useClientService,
  usePublicLinkContext,
  useStore,
  usePreviewService,
  useGetMatchingSpace
} from '@ownclouders/web-pkg'
import { getIndicators } from '@ownclouders/web-pkg'
import {
  formatDateFromHTTP,
  formatFileSize,
  formatRelativeDateFromJSDate
} from '@ownclouders/web-pkg'
import { eventBus } from '@ownclouders/web-pkg'
import { SideBarEventTopics } from '@ownclouders/web-pkg'
import { Resource, SpaceResource } from '@ownclouders/web-client'
import { useTask } from 'vue-concurrency'
import { useGettext } from 'vue3-gettext'
import { getSharedAncestorRoute } from '@ownclouders/web-pkg'
import { AncestorMetaData } from '@ownclouders/web-pkg'
import { tagsHelper } from '../../../helpers/contextualHelpers'
import { ContextualHelper } from '@ownclouders/design-system/src/helpers'
import TagsSelect from './TagsSelect.vue'
import WebDavDetails from '@ownclouders/web-pkg/src/components/SideBar/WebDavDetails.vue'

export default defineComponent({
  name: 'FileDetails',
  components: { TagsSelect, WebDavDetails },
  props: {
    previewEnabled: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  setup(props) {
    const configurationManager = useConfigurationManager()
    const store = useStore()
    const clientService = useClientService()
    const { getMatchingSpace } = useGetMatchingSpace()
    const language = useGettext()

    const resource = inject<Resource>('resource')
    const space = inject<Ref<SpaceResource>>('space')
    const isPublicLinkContext = usePublicLinkContext({ store })
    const previewService = usePreviewService()
    const preview = ref(undefined)

    const loadData = async () => {
      const calls = []
      if (unref(resource).type === 'file' && !unref(isPublicLinkContext)) {
        calls.push(
          store.dispatch('Files/loadVersions', {
            client: clientService.webdav,
            fileId: unref(resource).id
          })
        )
      }
      await Promise.all(calls.map((p) => p.catch((e) => e)))
    }

    const isPreviewEnabled = computed(() => {
      if (unref(resource).isFolder) {
        return false
      }
      return props.previewEnabled
    })
    const loadPreviewTask = useTask(function* (signal, resource) {
      if (!unref(isPreviewEnabled)) {
        preview.value = undefined
        return
      }
      preview.value = yield previewService.loadPreview({
        space: unref(space),
        resource,
        dimensions: ImageDimension.Preview
      })
    }).restartable()
    const isPreviewLoading = computed(() => {
      if (!unref(isPreviewEnabled)) {
        return false
      }
      return loadPreviewTask.isRunning || !loadPreviewTask.last
    })

    const ancestorMetaData: Ref<AncestorMetaData> = computed(
      () => store.getters['runtime/ancestorMetaData/ancestorMetaData']
    )
    const sharedAncestor = computed(() => {
      return Object.values(unref(ancestorMetaData)).find(
        (a) =>
          a.path !== unref(resource).path &&
          ShareTypes.containsAnyValue(ShareTypes.authenticated, a.shareTypes)
      )
    })
    const sharedAncestorRoute = computed(() => {
      return getSharedAncestorRoute({
        sharedAncestor: unref(sharedAncestor),
        matchingSpace: unref(space) || getMatchingSpace(unref(resource))
      })
    })
    const showWebDavDetails = computed(() => {
      return store.getters['Files/areWebDavDetailsShown']
    })
    const formatDateRelative = (date) => {
      return formatRelativeDateFromJSDate(new Date(date), language.current)
    }

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

    const contextualHelper = {
      isEnabled: configurationManager.options.contextHelpers,
      data: tagsHelper({ configurationManager: configurationManager })
    } as ContextualHelper

    return {
      preview,
      isPublicLinkContext,
      space,
      resource,
      hasTags: useCapabilityFilesTags(),
      isPreviewLoading,
      ancestorMetaData,
      sharedAncestor,
      sharedAncestorRoute,
      formatDateRelative,
      contextualHelper,
      showWebDavDetails
    }
  },
  computed: {
    ...mapGetters('Files', ['versions']),
    ...mapGetters(['user', 'configuration']),

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
    }
  },
  methods: {
    expandVersionsPanel() {
      eventBus.publish(SideBarEventTopics.setActivePanel, 'versions')
    }
  }
})
</script>
<style lang="scss" scoped>
.details-table {
  text-align: left;
  table-layout: fixed;

  tr {
    height: 1.5rem;
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
