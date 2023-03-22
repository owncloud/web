<template>
  <div id="tags-panel">
    <div id="tags-form" class="oc-background-highlight oc-p-m">
      <oc-loader v-if="loadAvailableTagsTask.isRunning" />
      <oc-select
        v-else
        ref="tagSelect"
        v-model="selectedTags"
        class="oc-mb-s"
        multiple
        :options="availableTags"
        taggable
        push-tags
        :label="$gettext('Add or edit tags')"
        :create-option="createOption"
        :selectable="isOptionSelectable"
        :fix-message-line="true"
      >
        <template #selected-option="{ label }">
          <span class="oc-flex oc-flex-center">
            <avatar-image
              class="oc-flex oc-align-self-center oc-mr-s"
              :width="16.8"
              :userid="label"
              :user-name="label"
            />
            <span>{{ label }}</span>
          </span>
        </template>
        <template #option="{ label, error }">
          <div class="oc-flex">
            <span v-if="showSelectNewLabel(label)" class="oc-mr-s" v-text="$gettext('New')" />
            <span class="oc-flex oc-flex-center">
              <avatar-image
                class="oc-flex oc-align-self-center oc-mr-s"
                :width="16.8"
                :userid="label"
                :user-name="label"
              />
              <span>{{ label }}</span>
            </span>
          </div>
          <div v-if="error" class="oc-text-input-danger">{{ error }}</div>
        </template>
      </oc-select>
      <compare-save-dialog
        class="edit-compare-save-dialog oc-mb-l"
        :original-object="{ tags: resource.tags }"
        :compare-object="{ tags: selectedTags }"
        @revert="revertChanges"
        @confirm="save"
      ></compare-save-dialog>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject, onMounted, ref, unref, watch } from 'vue'
import CompareSaveDialog from 'web-pkg/src/components/sideBar/CompareSaveDialog.vue'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { useTask } from 'vue-concurrency'
import { useClientService, useStore } from 'web-pkg/src/composables'
import { Resource } from 'web-client'
import diff from 'lodash-es/difference'
import { useGettext } from 'vue3-gettext'

const tagsMaxCount = 100

export default defineComponent({
  name: 'TagsPanel',
  components: {
    CompareSaveDialog
  },
  setup() {
    const store = useStore()
    const clientService = useClientService()
    const { $gettext } = useGettext()

    const injectedResource = inject<Resource>('resource')
    const resource = computed(() => unref(injectedResource))
    const selectedTags = ref([])
    const availableTags = ref([])
    const tagSelect = ref(null)

    const loadAvailableTagsTask = useTask(function* () {
      const {
        data: { value: tags = [] }
      } = yield clientService.graphAuthenticated.tags.getTags()
      availableTags.value = [...tags]
    })

    const revertChanges = () => {
      selectedTags.value = [...unref(resource).tags]
    }
    const createOption = (option) => {
      if (!option.trim().length) {
        return {
          label: option,
          error: $gettext('Tag must not consist of blanks only'),
          selectable: false
        }
      }
      return option.toLowerCase().trim()
    }
    const isOptionSelectable = (option) => {
      return unref(selectedTags).length <= tagsMaxCount && option.selectable !== false
    }
    const showSelectNewLabel = (option) => {
      return !unref(tagSelect).$refs.select.optionExists(option)
    }

    const save = async () => {
      try {
        const { id, tags, fileId } = unref(resource)
        const tagsToAdd = diff(selectedTags.value, tags)
        const tagsToRemove = diff(tags, selectedTags.value)

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
          value: [...unref(selectedTags)]
        })

        eventBus.publish('sidebar.entity.saved')
      } catch (e) {
        console.error(e)
      }
    }

    watch(resource, () => {
      if (unref(resource)?.tags) {
        revertChanges()
      }
    })

    onMounted(() => {
      if (unref(resource)?.tags) {
        selectedTags.value = [...unref(resource).tags]
      }
      loadAvailableTagsTask.perform()
    })

    return {
      loadAvailableTagsTask,
      availableTags,
      tagsMaxCount,
      selectedTags,
      resource,
      tagSelect,
      revertChanges,
      createOption,
      isOptionSelectable,
      showSelectNewLabel,
      save
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
</style>
