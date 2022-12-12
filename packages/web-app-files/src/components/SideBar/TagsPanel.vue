<template>
  <div id="tags-panel">
    <div id="tags-form" class="oc-background-highlight oc-p-m">
      <oc-loader v-if="loadAllTagsTask.isRunning" />
      <oc-select
        v-else
        ref="tagSelect"
        v-model="editAssignedTags"
        class="oc-mb-s"
        multiple
        :options="allTags"
        taggable
        push-tags
        :label="$gettext('Add or edit tags')"
        :create-option="createOption"
        :selectable="() => editAssignedTags.length <= tagsMaxCount"
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
        :compare-object="{ tags: editAssignedTags }"
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
import { useClientService, useRequest, useStore } from 'web-pkg/src/composables'
import { Resource } from 'web-client'

const tagsMaxCount = 100

export default defineComponent({
  name: 'TagsPanel',
  components: {
    CompareSaveDialog
  },
  setup() {
    const store = useStore()
    const clientService = useClientService()
    const allTags = ref([])
    const { makeRequest } = useRequest()
    const loadAllTagsTask = useTask(function* (signal) {
      const {
        data: { tags = [] }
      } = yield makeRequest('GET', `${store.getters.configuration.server}experimental/tags`, {})
      allTags.value = tags
    })

    const displayedItem = inject<Resource>('displayedItem')
    const resource = computed(() => unref(displayedItem))
    const editAssignedTags = ref([])
    const tagSelect = ref(null)
    const revertChanges = () => {
      editAssignedTags.value = [...unref(resource).tags]
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
        const tagsToAdd = unref(editAssignedTags).filter((tag) => !tags.includes(tag))
        const tagsToRemove = tags.filter((tag) => !unref(editAssignedTags).includes(tag))

        if (tagsToAdd.length) {
          await unref(clientService).owncloudSdk.tags.addResourceTag(fileId, tagsToAdd)
        }

        if (tagsToRemove.length) {
          await unref(clientService).owncloudSdk.tags.removeResourceTag(fileId, tagsToRemove)
        }

        store.commit('Files/UPDATE_RESOURCE_FIELD', {
          id: id,
          field: 'tags',
          value: [...unref(editAssignedTags)]
        })

        unref(resource).tags = [...unref(editAssignedTags)]
        eventBus.publish('sidebar.entity.saved')
      } catch (e) {
        console.error(e)
      }
    }

    watch(resource, () => {
      revertChanges()
    })

    onMounted(() => {
      editAssignedTags.value = [...unref(resource).tags]
      loadAllTagsTask.perform()
    })

    return {
      loadAllTagsTask,
      allTags,
      tagsMaxCount,
      editAssignedTags,
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
