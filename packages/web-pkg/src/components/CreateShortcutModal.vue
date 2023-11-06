<template>
  <portal to="app.runtime.modal">
    <oc-modal
      :title="$gettext('Create a Shortcut')"
      :button-cancel-text="$gettext('Cancel')"
      :button-confirm-text="$gettext('Create')"
      :button-confirm-disabled="confirmButtonDisabled"
      @cancel="cancel"
      @confirm="createShortcut(inputUrl, inputFilename)"
      @keydown.enter="onKeyDownEnter"
    >
      <template #content>
        <oc-text-input
          id="create-shortcut-modal-url-input"
          v-model="inputUrl"
          :label="$gettext('Shortcut to a webpage or file')"
        />
        <oc-drop
          v-if="showDrop"
          ref="dropRef"
          class="oc-pt-s"
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
        <div class="oc-flex oc-width-1-1 oc-mt-m">
          <oc-text-input
            v-model="inputFilename"
            class="oc-width-1-1"
            :label="$gettext('Shortcut name')"
            :error-message="inputFileNameErrorMessage"
            :fix-message-line="true"
          />
          <span class="oc-ml-s oc-flex oc-flex-bottom create-shortcut-modal-url-extension"
            >.url</span
          >
        </div>
      </template>
    </oc-modal>
  </portal>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, unref, computed, watch, nextTick } from 'vue'
import { Resource, SpaceResource } from '@ownclouders/web-client'
import { useClientService, useStore } from '../composables'
import { urlJoin } from '@ownclouders/web-client/src/utils'
import { useGettext } from 'vue3-gettext'
import DOMPurify from 'dompurify'
import { OcDrop } from '@ownclouders/design-system/src/components'
import { resolveFileNameDuplicate } from '../helpers'

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

    const dropItemUrl = computed(() => {
      let url = unref(inputUrl).trim()

      if (isMaybeUrl(url)) {
        return url
      }

      return `https://${url}`
    })

    const showDrop = computed(() => unref(inputUrl).trim())
    const confirmButtonDisabled = computed(
      () => unref(fileAlreadyExists) || !unref(inputFilename) || !unref(inputUrl)
    )
    const currentFolder = computed(() => store.getters['Files/currentFolder'])
    const files = computed((): Array<Resource> => store.getters['Files/files'])
    const fileAlreadyExists = computed(
      () => !!unref(files).find((file) => file.name === `${unref(inputFilename)}.url`)
    )

    const inputFileNameErrorMessage = computed(() => {
      if (unref(fileAlreadyExists)) {
        return $gettext('%{name} already exists', { name: `${unref(inputFilename)}.url` })
      }

      return ''
    })

    const isMaybeUrl = (input: string) => {
      const urlPrefixes = ['http://', 'https://']
      return urlPrefixes.some((prefix) => prefix.startsWith(input) || input.startsWith(prefix))
    }

    const dropItemUrlClicked = () => {
      inputUrl.value = unref(dropItemUrl)
      try {
        let fileName = new URL(unref(dropItemUrl)).host
        if (unref(files).some((f) => f.name === `${fileName}.url`)) {
          fileName = resolveFileNameDuplicate(`${fileName}.url`, 'url', unref(files)).slice(0, -4)
        }
        inputFilename.value = fileName
      } catch (_) {}
    }

    const onKeyDownEnter = () => {
      if (!unref(confirmButtonDisabled)) {
        createShortcut(unref(inputUrl), unref(inputFilename))
      }
    }

    const createShortcut = async (url: string, filename: string) => {
      // Closes the modal
      props.cancel()

      try {
        // Omit possible xss code
        const sanitizedUrl = DOMPurify.sanitize(url, { USE_PROFILES: { html: true } })

        const content = `[InternetShortcut]\nURL=${sanitizedUrl}`
        const path = urlJoin(unref(currentFolder).path, `${filename}.url`)
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

    watch(inputUrl, async () => {
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
      confirmButtonDisabled,
      inputFileNameErrorMessage,
      onKeyDownEnter
    }
  }
})
</script>
<style lang="scss" scoped>
.create-shortcut-modal {
  &-url-extension {
    margin-bottom: calc(var(--oc-space-xsmall) + 1.3125rem);
  }
}

#create-shortcut-modal-contextmenu {
  width: 458px;

  li:hover {
    background-color: var(--oc-color-background-highlight);
  }
}
</style>
