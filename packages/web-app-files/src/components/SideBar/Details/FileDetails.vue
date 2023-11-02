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
        <tr data-testid="tags">
          <th scope="col" class="oc-pr-s oc-font-semibold">
            {{ $gettext('Tags') }}
            <oc-contextual-helper
              v-if="contextualHelper?.isEnabled"
              v-bind="contextualHelper?.data"
              class="oc-pl-xs"
            ></oc-contextual-helper>
          </th>
          <td>
            <oc-select
              ref="tagSelect"
              v-model="selectedTags"
              :multiple="true"
              :disabled="readonly"
              :options="availableTags"
              taggable
              :select-on-key-codes="[keycode('enter'), keycode(',')]"
              :create-option="createOption"
              :selectable="isOptionSelectable"
              :map-keydown="keydownMethods"
              @update:model-value="save"
            >
              <template #selected-option-container="{ option, deselect }">
                <oc-tag
                  class="tags-control-tag oc-ml-xs"
                  :rounded="true"
                  size="small"
                  @click="goToSearchWithTagsFilter(option.label)"
                >
                  <oc-icon name="price-tag-3" size="small" />
                  <span class="oc-text-truncate">{{ option.label }}</span>
                  <span class="oc-flex oc-flex-middle oc-ml-s oc-mr-xs">
                    <oc-icon
                      v-if="option.readonly"
                      class="vs__deselect-lock"
                      name="lock"
                      size="small"
                    />
                    <oc-button
                      v-else
                      appearance="raw"
                      :title="$gettext('Deselect %{label}', { label: option.label })"
                      :aria-label="$gettext('Deselect %{label}', { label: option.label })"
                      class="vs__deselect oc-mx-rm"
                      @mousedown.stop.prevent
                      @click="deselect(option)"
                    >
                      <oc-icon name="close" size="small" />
                    </oc-button>
                  </span>
                </oc-tag>
              </template>
              <template #option="{ label, error }">
                <div class="oc-flex">
                  <span class="oc-flex oc-flex-center">
                    <oc-tag class="tags-control-tag oc-ml-xs" :rounded="true" size="small">
                      <oc-icon name="price-tag-3" size="small" />
                      <span class="oc-text-truncate">{{ label }}</span>
                    </oc-tag>
                  </span>
                </div>
                <div v-if="error" class="oc-text-input-danger">{{ error }}</div>
              </template>
            </oc-select>
          </td>
        </tr>
      </table>
    </div>
    <p v-else data-testid="noContentText" v-text="$gettext('No information to display')" />
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, inject, onMounted, Ref, ref, unref, watch } from 'vue'
import { mapGetters } from 'vuex'
import { ImageDimension, useConfigurationManager, useRouter } from '@ownclouders/web-pkg'
import upperFirst from 'lodash-es/upperFirst'
import { createLocationCommon } from '@ownclouders/web-pkg'
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
import { VNodeRef } from 'vue/dist/vue'
import diff from 'lodash-es/difference'
import keycode from 'keycode'
import { tagsHelper } from '../../../helpers/contextualHelpers'
import { ContextualHelper } from '@ownclouders/design-system/src/helpers'

type TagOption = {
  label: string
  error?: string
  selectable?: boolean
}

const tagsMaxCount = 100

export default defineComponent({
  name: 'FileDetails',
  setup() {
    const store = useStore()
    const clientService = useClientService()
    const { getMatchingSpace } = useGetMatchingSpace()
    const language = useGettext()
    const $router = useRouter()

    const resource = inject<Resource>('resource')
    const space = inject<Ref<SpaceResource>>('space')
    const isPublicLinkContext = usePublicLinkContext({ store })
    const previewService = usePreviewService()
    const preview = ref(undefined)

    const matchingSpace = computed(() => {
      return getMatchingSpace(unref(resource))
    })

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

    const isFolder = computed(() => {
      return unref(resource).isFolder
    })
    const loadPreviewTask = useTask(function* (signal, resource) {
      if (unref(isFolder)) {
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
      if (unref(isFolder)) {
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

    /* begin tags */
    const configurationManager = useConfigurationManager()
    const { $gettext } = useGettext()
    const readonly = computed(
      () =>
        unref(resource).locked === true ||
        (typeof resource.canEditTags === 'function' && resource.canEditTags() === false) // where is canEditTags implemented? it's not present here...
    )
    const selectedTags = ref<TagOption[]>([])
    const availableTags = ref<TagOption[]>([])
    let allTags: string[] = []
    const tagSelect: VNodeRef = ref(null)

    const currentTags = computed<TagOption[]>(() => {
      return [...unref(resource).tags.map((t) => ({ label: t }))]
    })

    const loadAvailableTagsTask = useTask(function* () {
      const {
        data: { value: tags = [] }
      } = yield clientService.graphAuthenticated.tags.getTags()

      allTags = tags
      const selectedLabels = new Set(unref(selectedTags).map((o) => o.label))
      availableTags.value = tags
        .filter((t) => selectedLabels.has(t) === false)
        .map((t) => ({ label: t }))
    })

    const revertChanges = () => {
      selectedTags.value = unref(currentTags)
    }
    const createOption = (label: string): TagOption => {
      if (!label.trim().length) {
        return {
          label: label.toLowerCase().trim(),
          error: $gettext('Tag must not consist of blanks only'),
          selectable: false
        }
      }
      return { label: label.toLowerCase().trim() }
    }
    const isOptionSelectable = (option: TagOption) => {
      return unref(selectedTags).length <= tagsMaxCount && option.selectable !== false
    }
    const showSelectNewLabel = (option: TagOption) => {
      return !unref(tagSelect).$refs.select.optionExists(option)
    }

    const save = async (e: TagOption[] | string[]) => {
      try {
        selectedTags.value = e.map((x) => (typeof x === 'object' ? x : { label: x }))
        const allAvailableTags = new Set([...allTags, ...unref(availableTags).map((t) => t.label)])

        availableTags.value = diff(
          Array.from(allAvailableTags),
          unref(selectedTags).map((o) => o.label)
        ).map((label) => ({
          label
        }))

        const { id, tags, fileId } = unref(resource)
        const selectedTagLabels = unref(selectedTags).map((t) => t.label)
        const tagsToAdd = diff(selectedTagLabels, tags)
        const tagsToRemove = diff(tags, selectedTagLabels)

        if (tagsToAdd.length) {
          await clientService.graphAuthenticated.tags.assignTags({
            resourceId: fileId,
            tags: tagsToAdd
          })
        }

        if (tagsToRemove.length) {
          await clientService.graphAuthenticated.tags.unassignTags({
            resourceId: fileId,
            tags: tagsToRemove
          })
        }

        store.commit('Files/UPDATE_RESOURCE_FIELD', {
          id: id,
          field: 'tags',
          value: [...selectedTagLabels]
        })

        eventBus.publish('sidebar.entity.saved')
        if (unref(tagSelect) !== null) {
          unref(tagSelect).$refs.search.focus()
        }

        allTags.push(...tagsToAdd)
      } catch (e) {
        console.error(e)
        store.dispatch('showErrorMessage', {
          title: $gettext('Failed to edit tags'),
          error: e
        })
      }
    }

    watch(resource, () => {
      if (unref(resource)?.tags) {
        revertChanges()
        loadAvailableTagsTask.perform()
      }
    })

    onMounted(() => {
      if (unref(resource)?.tags) {
        selectedTags.value = unref(currentTags)
      }
      loadAvailableTagsTask.perform()
    })

    const keydownMethods = (map, vm) => {
      const objectMapping = {
        ...map
      }
      objectMapping[keycode('backspace')] = async (e) => {
        if (e.target.value || selectedTags.value.length === 0) {
          return
        }

        e.preventDefault()

        availableTags.value.push(selectedTags.value.pop())
        await save(unref(selectedTags))
      }

      return objectMapping
    }

    const contextualHelper = {
      isEnabled: configurationManager.options.contextHelpers,
      data: tagsHelper({ configurationManager: configurationManager })
    } as ContextualHelper
    /* end tags */

    const generateTagLink = (tag: string) => {
      const currentTerm = unref($router.currentRoute).query?.term
      return createLocationCommon('files-common-search', {
        query: { provider: 'files.sdk', q_tags: tag, ...(currentTerm && { term: currentTerm }) }
      })
    }

    const goToSearchWithTagsFilter = (label) => {
      $router.push(generateTagLink(label))
    }

    return {
      preview,
      isPublicLinkContext,
      space,
      resource,
      hasTags: useCapabilityFilesTags(),
      isPreviewLoading,
      ancestorMetaData,
      sharedAncestor,
      formatDateRelative,
      matchingSpace,
      /* tags */
      loadAvailableTagsTask,
      availableTags,
      tagsMaxCount,
      selectedTags,
      tagSelect,
      currentTags,
      revertChanges,
      createOption,
      isOptionSelectable,
      showSelectNewLabel,
      save,
      keycode,
      keydownMethods,
      contextualHelper,
      readonly,
      goToSearchWithTagsFilter
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
    sharedAncestorRoute() {
      return getSharedAncestorRoute({
        sharedAncestor: this.sharedAncestor,
        matchingSpace: this.space || this.matchingSpace
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

.oc-tag:hover {
  cursor: pointer;
}
</style>
