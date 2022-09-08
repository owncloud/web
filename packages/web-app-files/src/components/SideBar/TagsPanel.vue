<template>
  <div>
    <div class="oc-background-highlight oc-p-m">
      <oc-loader v-if="loadAllTagsTask.isRunning" />
      <oc-select
        v-else
        ref="tagSelect"
        v-model="editAssignedTags"
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
    </div>
    <compare-save-dialog
      class="edit-compare-save-dialog"
      :original-object="{ tags: resource.tags }"
      :compare-object="{ tags: editAssignedTags }"
      @revert="revertChanges"
      @confirm="save"
    ></compare-save-dialog>
  </div>
</template>

<script lang="ts">
import { mapActions, mapMutations } from 'vuex'
import { defineComponent, ref } from '@vue/composition-api'
import CompareSaveDialog from 'web-pkg/src/components/sideBar/CompareSaveDialog.vue'
import { bus } from 'web-pkg/src/instance'
import { useTask } from 'vue-concurrency'
import { useRequest, useStore } from 'web-pkg/src/composables'

const tagsMaxCount = 100

export default defineComponent({
  name: 'Tags',
  components: {
    CompareSaveDialog
  },
  inject: ['displayedItem'],
  setup() {
    const store = useStore()
    const allTags = ref([])
    const { makeRequest } = useRequest()
    const loadAllTagsTask = useTask(function* (signal, ref) {
      const {
        data: { tags = [] }
      } = yield makeRequest('GET', `${store.getters.configuration.server}experimental/tags`, {})
      allTags.value = tags
    })

    return {
      loadAllTagsTask,
      allTags,
      tagsMaxCount
    }
  },
  data: function () {
    return {
      editAssignedTags: []
    }
  },
  computed: {
    resource() {
      return this.displayedItem.value
    }
  },
  mounted() {
    this.editAssignedTags = [...this.resource.tags]
    this.loadAllTagsTask.perform(this)
  },
  methods: {
    ...mapActions(['showMessage']),
    ...mapMutations('Files', ['UPDATE_RESOURCE_FIELD']),

    revertChanges() {
      this.editAssignedTags = [...this.resource.tags]
    },
    async save() {
      try {
        const tagsToAdd = this.editAssignedTags.filter((tag) => !this.resource.tags.includes(tag))
        const tagsToRemove = this.resource.tags.filter(
          (tag) => !this.editAssignedTags.includes(tag)
        )

        if (tagsToAdd.length) {
          await this.$client.tags.addResourceTag(this.resource.fileId, tagsToAdd)
        }

        if (tagsToRemove.length) {
          await this.$client.tags.removeResourceTag(this.resource.fileId, tagsToRemove)
        }

        this.UPDATE_RESOURCE_FIELD({
          id: this.resource.id,
          field: 'tags',
          value: [...this.editAssignedTags]
        })
        this.displayedItem.value.tags = [...this.editAssignedTags]

        bus.publish('sidebar.entity.saved')
      } catch (e) {
        console.error(e)
      }
    },
    createOption(option) {
      return option.toLowerCase()
    },
    showSelectNewLabel(option) {
      return !this.$refs.tagSelect.$refs.select.optionExists(option)
    }
  }
})
</script>

<style lang="scss"></style>
