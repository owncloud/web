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
        <oc-text-input
          id="create-shortcut-modal-url-input"
          v-model="inputUrl"
          :label="$gettext('Shortcut to a webpage or file')"
        />
        <oc-drop
          v-if="showDrop"
          class="oc-pt-s"
          ref="dropRef"
          padding-size="remove"
          drop-id="create-shortcut-modal-contextmenu"
          toggle="#create-shortcut-modal-url-input"
          :close-on-click="true"
        >
          <oc-list>
            <li class="oc-p-s">
              <oc-button
                class="oc-width-1-1"
                appearance="raw"
                justify-content="left"
                @click="dropItemUrlClicked"
              >
                <oc-icon name="external-link" />
                <span v-text="dropItemUrl" />
              </oc-button>
            </li>
          </oc-list>
        </oc-drop>
        <div class="oc-flex oc-flex-bottom oc-width-1-1 oc-mt-m">
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
import { defineComponent, PropType, ref, unref, computed, watch, nextTick } from 'vue'
import { SpaceResource } from '@ownclouders/web-client'
import { useClientService, useStore } from '../composables'
import { urlJoin } from '@ownclouders/web-client/src/utils'
import { useGettext } from 'vue3-gettext'
import DOMPurify from 'dompurify'
import { OcDrop } from '@ownclouders/design-system/src/components'

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
    const dropRef = ref(null)
    const inputUrl = ref('')
    const inputFilename = ref('')

    const showDrop = computed(() => unref(inputUrl).trim())

    const isMaybeUrl = (input: string) => {
      const urlPrefixes = ['http://', 'https://']
      return urlPrefixes.some((prefix) => prefix.startsWith(input) || input.startsWith(prefix))
    }

    const dropItemUrl = computed(() => {
      let url = unref(inputUrl).trim()

      if (isMaybeUrl(url)) {
        return url
      }

      return `https://${url}`
    })

    const confirmButtonDisabled = computed(() => !(unref(inputUrl) && unref(inputFilename)))

    const currentFolder = computed(() => {
      return store.getters['Files/currentFolder']
    })

    const dropItemUrlClicked = () => {
      inputUrl.value = unref(dropItemUrl)
      try {
        inputFilename.value = new URL(unref(dropItemUrl)).host
      } catch (e) {}
    }

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

    watch(inputUrl, async (value) => {
      await nextTick()
      if (unref(showDrop) && unref(dropRef)) {
        ;(unref(dropRef) as InstanceType<typeof OcDrop>).show()
      }
    })

    return {
      inputUrl,
      inputFilename,
      showDrop,
      dropRef,
      dropItemUrl,
      dropItemUrlClicked,
      createShortcut,
      confirmButtonDisabled
    }
  }
})
</script>
<style lang="scss" scoped>
#create-shortcut-modal-contextmenu {
  width: 458px;

  li:hover {
    background-color: var(--oc-color-background-highlight);
  }
}
</style>
