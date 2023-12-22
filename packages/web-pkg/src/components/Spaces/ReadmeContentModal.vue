<template>
  <label class="oc-label" for="description-input-area" v-text="$gettext('Space description')" />
  <textarea
    id="description-input-area"
    v-model="readmeContent"
    class="oc-width-1-1 oc-height-1-1 oc-input oc-text-input"
  ></textarea>
</template>

<script lang="ts">
import { defineComponent, PropType, onMounted, ref, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { SpaceResource } from '@ownclouders/web-client/src'
import { getRelativeSpecialFolderSpacePath } from '@ownclouders/web-client/src/helpers'
import { Modal, useClientService, useStore } from '../../composables'

export default defineComponent({
  name: 'SpaceReadmeContentModal',
  props: {
    modal: { type: Object as PropType<Modal>, required: true },
    space: {
      type: Object as PropType<SpaceResource>,
      required: true
    }
  },
  setup(props, { expose }) {
    const store = useStore()
    const { $gettext } = useGettext()
    const clientService = useClientService()

    const readmeContent = ref<string>()

    const onConfirm = async () => {
      try {
        const readmeMetaData = await clientService.webdav.putFileContents(props.space, {
          path: getRelativeSpecialFolderSpacePath(props.space, 'readme'),
          content: unref(readmeContent)
        })

        store.commit('Files/UPDATE_RESOURCE_FIELD', {
          id: props.space.id,
          field: 'spaceReadmeData',
          value: { ...props.space.spaceReadmeData, ...{ etag: readmeMetaData.etag } }
        })
        store.dispatch('showMessage', {
          title: $gettext('Space description was edited successfully')
        })
      } catch (error) {
        console.error(error)
        store.dispatch('showErrorMessage', {
          title: $gettext('Failed to edit space description'),
          error
        })
      }
    }

    expose({ onConfirm })

    onMounted(async () => {
      readmeContent.value = (
        await clientService.webdav.getFileContents(props.space, {
          path: getRelativeSpecialFolderSpacePath(props.space, 'readme')
        })
      ).body
    })

    return {
      readmeContent,

      // unit tests
      onConfirm
    }
  }
})
</script>
<style lang="scss" scoped>
#description-input-area {
  height: 40vh;
}
</style>
