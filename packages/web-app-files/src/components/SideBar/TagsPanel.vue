<template>
  <div id="tags-panel">
    <div id="tags-form" class="oc-background-highlight oc-p-m">
      <oc-loader v-if="loadAvailableTagsTask.isRunning" />
      <oc-select
        v-else
        ref="tagSelect"
        v-model="selectedTags"
        class="oc-mb-s"
        :multiple="true"
        :options="availableTags"
        :contextual-helper="contextualHelper"
        taggable
        :select-on-key-codes="[keycode('enter'), keycode(',')]"
        :label="$gettext('Add or edit tags')"
        :create-option="createOption"
        :selectable="isOptionSelectable"
        :fix-message-line="true"
        :map-keydown="keydownMethods"
        @update:model-value="save"
      >
        <template #selected-option-container="{ option, deselect }">
          <oc-tag class="tags-control-tag oc-ml-xs" :rounded="true" size="small">
            <oc-icon name="price-tag-3" size="small" />
            <span class="oc-text-truncate">{{ option.label }}</span>
            <span class="oc-flex oc-flex-middle oc-ml-s oc-mr-xs">
              <oc-icon v-if="option.readonly" class="vs__deselect-lock" name="lock" size="small" />
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
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject, onMounted, ref, unref, VNodeRef, watch } from 'vue'
import { eventBus } from '@ownclouders/web-pkg'
import { useTask } from 'vue-concurrency'
import { useClientService, useConfigurationManager, useStore } from '@ownclouders/web-pkg'
import { Resource } from 'web-client'
import diff from 'lodash-es/difference'
import { useGettext } from 'vue3-gettext'
import keycode from 'keycode'
import { tagsHelper } from 'web-app-files/src/helpers/contextualHelpers'
import { ContextualHelper } from 'design-system/src/helpers'

const tagsMaxCount = 100

type TagOption = {
  label: string
  error?: string
  selectable?: boolean
}

export default defineComponent({
  name: 'TagsPanel',
  setup() {
    const store = useStore()
    const clientService = useClientService()
    const { $gettext } = useGettext()
    const configurationManager = useConfigurationManager()

    const injectedResource = inject<Resource>('resource')
    const resource = computed<Resource>(() => unref(injectedResource))
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

    return {
      loadAvailableTagsTask,
      availableTags,
      tagsMaxCount,
      selectedTags,
      resource,
      tagSelect,
      currentTags,
      revertChanges,
      createOption,
      isOptionSelectable,
      showSelectNewLabel,
      save,
      keycode,
      keydownMethods,
      contextualHelper
    }
  }
})
</script>

<style lang="scss">
#tags-panel {
  #tags-form {
    border-radius: 5px;
  }
}
.tags-control-tag {
  max-width: 12rem;
  height: var(--oc-space-large);
}
</style>
