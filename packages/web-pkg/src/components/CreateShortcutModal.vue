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
        filename
        <oc-text-input v-model="inputFilename" />
      </template>
    </oc-modal>
  </portal>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, unref, computed } from 'vue'
import { $gettext } from '../router/utils'
import { SpaceResource } from '@ownclouders/web-client'
import { useClientService, useStore } from '../composables'
import { urlJoin } from '@ownclouders/web-client/src/utils'

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
    const store = useStore()
    const inputUrl = ref('')
    const inputFilename = ref('')
    const confirmButtonDisabled = computed(() => !(unref(inputUrl) && unref(inputFilename)))

    const currentFolder = computed(() => {
      return store.getters['Files/currentFolder']
    })

    const createShortcut = async () => {
      const content = `[InternetShortcut]\nURL=${unref(inputUrl)}`
      const path = urlJoin(unref(currentFolder).path, `${unref(inputFilename)}.url`)
      const resource = await clientService.webdav.putFileContents(props.space, {
        path,
        content
      })
      store.commit('Files/UPSERT_RESOURCE', resource)
      props.cancel()
    }

    return {
      confirmButtonDisabled,
      createShortcut,
      inputUrl,
      inputFilename
    }
  },
  methods: { $gettext }
})
</script>
