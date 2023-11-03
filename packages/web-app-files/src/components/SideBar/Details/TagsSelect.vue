<template>
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
    data-test-id="tags-select"
    @update:model-value="save"
  >
    <template #selected-option-container="{ option, deselect }">
      <oc-tag class="tags-control-tag oc-ml-xs" :rounded="true" size="small">
        <router-link class="oc-flex oc-flex-middle" :to="generateTagLink(option.label)">
          <oc-icon name="price-tag-3" class="oc-mr-xs" size="small" />
          <span class="oc-text-truncate">{{ option.label }}</span>
        </router-link>

        <span class="oc-flex oc-flex-middle oc-mr-xs">
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
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  PropType,
  ref,
  toRef,
  unref,
  VNodeRef,
  watch
} from 'vue'
import {
  createLocationCommon,
  eventBus,
  useClientService,
  useGetMatchingSpace,
  useRouter,
  useStore
} from '@ownclouders/web-pkg/src'
import { useGettext } from 'vue3-gettext'
import { useTask } from 'vue-concurrency'
import diff from 'lodash-es/difference'
import keycode from 'keycode'
import { Resource } from '@ownclouders/web-client'

type TagOption = {
  label: string
  error?: string
  selectable?: boolean
}

const tagsMaxCount = 100

export default defineComponent({
  name: 'TagsSelect',
  props: {
    /**
     * The resource
     */
    resource: {
      type: Object as PropType<Resource>,
      required: true
    }
  },
  setup(props) {
    const store = useStore()
    const clientService = useClientService()
    const { getMatchingSpace } = useGetMatchingSpace()
    const language = useGettext()
    const $router = useRouter()

    const resource = toRef(props, 'resource')
    const { $gettext } = useGettext()
    const readonly = computed(
      () =>
        unref(resource).locked === true ||
        (typeof unref(resource).canEditTags === 'function' &&
          unref(resource).canEditTags() === false) // where is canEditTags implemented? it's not present here...
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

    const generateTagLink = (tag: string) => {
      const currentTerm = unref($router.currentRoute).query?.term
      return createLocationCommon('files-common-search', {
        query: { provider: 'files.sdk', q_tags: tag, ...(currentTerm && { term: currentTerm }) }
      })
    }

    return {
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
      readonly,
      generateTagLink
    }
  }
})
</script>

<style scoped lang="scss">
.oc-tag {
  height: 1.5rem;
}
</style>
