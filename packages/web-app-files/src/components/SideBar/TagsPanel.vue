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
        :selectable="() => selectedTags.length <= tagsMaxCount"
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
        <template #option="{ label }">
          <div class="oc-flex">
            <span v-if="showSelectNewLabel(label)" v-translate class="oc-mr-s">New</span>
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
import { useStore, useGraphClient } from 'web-pkg/src/composables'
import { Resource } from 'web-client'
import diff from 'lodash-es/difference'

const tagsMaxCount = 100

export default defineComponent({
  name: 'TagsPanel',
  components: {
    CompareSaveDialog
  },
  setup() {
    const store = useStore()
    const { graphClient } = useGraphClient()

    const displayedItem = inject<Resource>('displayedItem')
    const resource = computed(() => unref(displayedItem))
    const selectedTags = ref([])
    const availableTags = ref([])
    const tagSelect = ref(null)

    const loadAvailableTagsTask = useTask(function* () {
      const {
        data: { value: tags = [] }
      } = yield unref(graphClient).tags.getTags()
      availableTags.value = [...tags]
    })

    const revertChanges = () => {
      selectedTags.value = [...unref(resource).tags]
    }
    const createOption = (option) => {
      return option.toLowerCase()
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
          await unref(graphClient).tags.assignTags({ resourceId: fileId, tags: tagsToAdd })
        }

        if (tagsToRemove.length) {
          await unref(graphClient).tags.unassignTags({ resourceId: fileId, tags: tagsToRemove })
        }

        store.commit('Files/UPDATE_RESOURCE_FIELD', {
          id: id,
          field: 'tags',
          value: [...unref(selectedTags)]
        })

        unref(resource).tags = [...unref(selectedTags)]
        eventBus.publish('sidebar.entity.saved')
      } catch (e) {
        console.error(e)
      }
    }

    watch(resource, () => {
      if (unref(resource).canEditTags()) {
        revertChanges()
      }
    })

    onMounted(() => {
      selectedTags.value = [...unref(resource).tags]
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
