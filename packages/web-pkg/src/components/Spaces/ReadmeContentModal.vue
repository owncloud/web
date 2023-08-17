<template>
  <portal to="app.runtime.modal">
    <oc-modal
      focus-trap-initial="#description-input-area"
      :title="modalTitle"
      :button-cancel-text="$gettext('Cancel')"
      :button-confirm-text="$gettext('Confirm')"
      @confirm="editReadme"
      @cancel="cancel"
    >
      <template #content>
        <label v-translate class="oc-label" for="description-input-area">Space description</label>
        <textarea
          id="description-input-area"
          v-model="readmeContent"
          class="oc-width-1-1 oc-height-1-1 oc-input oc-text-input"
        ></textarea>
      </template>
    </oc-modal>
  </portal>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

import { mapActions, mapMutations } from 'vuex'
export default defineComponent({
  name: 'SpaceReadmeContentModal',
  props: {
    space: {
      type: Object,
      required: true
    },
    cancel: {
      type: Function as PropType<(...args: any) => unknown>,
      required: true
    }
  },
  data: function () {
    return {
      readmeContent: ''
    }
  },
  computed: {
    modalTitle() {
      return this.$gettext('Edit description for space %{name}', {
        name: this.space.name
      })
    }
  },
  async mounted() {
    const webDavPathComponents = this.space.spaceReadmeData.webDavUrl.split('/')
    const path = webDavPathComponents.slice(webDavPathComponents.indexOf('dav') + 1).join('/')
    this.readmeContent = await this.$client.files.getFileContents(decodeURI(path))
  },
  methods: {
    ...mapActions(['showMessage', 'showErrorMessage']),
    ...mapMutations('Files', ['UPDATE_RESOURCE_FIELD']),

    editReadme() {
      const webDavPathComponents = this.space.spaceReadmeData.webDavUrl.split('/')
      const path = webDavPathComponents.slice(webDavPathComponents.indexOf('dav') + 1).join('/')

      return this.$client.files
        .putFileContents(decodeURI(path), this.readmeContent)
        .then((readmeMetaData) => {
          this.cancel()
          this.UPDATE_RESOURCE_FIELD({
            id: this.space.id,
            field: 'spaceReadmeData',
            value: { ...this.space.spaceReadmeData, ...{ etag: readmeMetaData.ETag } }
          })
          this.showMessage({
            title: this.$gettext('Space description was edited successfully')
          })
        })
        .catch((error) => {
          console.error(error)
          this.showErrorMessage({
            title: this.$gettext('Failed to edit space description'),
            error
          })
        })
    }
  }
})
</script>
<style lang="scss" scoped>
#description-input-area {
  height: 40vh;
}
</style>
