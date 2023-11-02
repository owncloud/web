<template>
  <portal to="app.runtime.modal">
    <oc-modal
      :title="$gettext('Create a Shortcut')"
      :button-cancel-text="$gettext('Cancel')"
      :button-confirm-text="$gettext('Create')"
      :button-confirm-disabled="confirmButtonDisabled"
      @cancel="cancel"
      @confirm="createShortcut"
    >
      <template #content>
        url
        <oc-text-input v-model="inputUrl" />
        <div v-if="inputUrl" class="oc-flex oc-flex-bottom oc-width-1-1 oc-mt-m">
          <oc-text-input
            v-model="inputFilename"
            class="oc-width-1-1"
            :label="$gettext('Shortcut name')"
          />
          <span class="oc-ml-s">.url</span>
        </div>
      </template>
    </oc-modal>
  </portal>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, unref, computed } from 'vue'
import { SpaceResource } from '@ownclouders/web-client'
import { useClientService, useStore } from '../composables'
import { urlJoin } from '@ownclouders/web-client/src/utils'
import { useGettext } from 'vue3-gettext'
import DOMPurify from 'dompurify'

export default defineComponent({
  name: 'CreateShortcutModal',
  props: {
    space: {
      type: Object as PropType<SpaceResource>,
      required: true
    },
    cancel: {
      type: Function as PropType<(...args: any) => unknown>,
      required: true
    }
  },
  setup(props) {
    const clientService = useClientService()
    const { $gettext } = useGettext()
    const store = useStore()
    const inputUrl = ref('')
    const inputFilename = ref('')
    const confirmButtonDisabled = computed(() => !(unref(inputUrl) && unref(inputFilename)))

    const currentFolder = computed(() => {
      return store.getters['Files/currentFolder']
    })

    const createShortcut = async () => {
      // Closes the modal
      props.cancel()

      try {
        // Omit possible xss code
        const sanitizedUrl = DOMPurify.sanitize(unref(inputUrl), { USE_PROFILES: { html: true } })

        const content = `[InternetShortcut]\nURL=${unref(sanitizedUrl)}`
        const path = urlJoin(unref(currentFolder).path, `${unref(inputFilename)}.url`)
        const resource = await clientService.webdav.putFileContents(props.space, {
          path,
          content
        })
        store.commit('Files/UPSERT_RESOURCE', resource)
        store.dispatch('showMessage', {
          title: $gettext('Shortcut was created successfully')
        })
      } catch (e) {
        console.error(e)
        store.dispatch('showErrorMessage', {
          title: $gettext('Failed to create shortcut'),
          error: e
        })
      }
    }

    return {
      confirmButtonDisabled,
      createShortcut,
      inputUrl,
      inputFilename
    }
  }
})
</script>
