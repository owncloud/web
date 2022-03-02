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
          class="oc-width-1-1 oc-height-1-1 oc-text-input"
          rows="30"
        ></textarea>
      </template>
    </oc-modal>
  </portal>
</template>

<script>
import { mapActions, mapMutations } from 'vuex'
export default {
  name: 'SpaceReadmeContentModal',
  props: {
    space: {
      type: Object,
      required: true
    },
    cancel: {
      type: Function,
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
      return this.$gettextInterpolate(this.$gettext('Edit description for space %{name}'), {
        name: this.space.name
      })
    }
  },
  watch: {
    'space.spaceQuota': {
      handler: function (val) {
        if (!val) return
        this.setOptions()
      },
      deep: true
    }
  },
  async mounted() {
    const webDavPathComponents = this.space.spaceReadmeData.webDavUrl.split('/')
    const path = webDavPathComponents.slice(webDavPathComponents.indexOf('dav') + 1).join('/')
    this.readmeContent = await this.$client.files.getFileContents(path)
  },
  methods: {
    ...mapActions(['showMessage']),
    ...mapMutations('Files', ['UPDATE_RESOURCE_FIELD']),
    setReadmeContent() {
      const webDavPathComponents = this.space.spaceReadmeData.webDavUrl.split('/')
      const path = webDavPathComponents.slice(webDavPathComponents.indexOf('dav') + 1).join('/')

      this.$client.files.getFileContents(path).then((readmeContent) => {
        this.readmeContent = readmeContent
      })
    },
    editReadme() {
      const webDavPathComponents = this.space.spaceReadmeData.webDavUrl.split('/')
      const path = webDavPathComponents.slice(webDavPathComponents.indexOf('dav') + 1).join('/')

      return this.$client.files
        .putFileContents(path, this.readmeContent)
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
          this.showMessage({
            title: this.$gettext('Failed to edit space description'),
            status: 'danger'
          })
        })
    }
  }
}
</script>
