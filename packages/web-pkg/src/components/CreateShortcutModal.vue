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
            <li class="oc-p-xs">
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
            <li v-if="searchTask.isRunning" class="oc-p-xs oc-flex oc-flex-center">
              <oc-spinner />
            </li>
            <li v-for="(resource, index) in searchResults" :key="index" class="oc-p-xs">
              <oc-button
                class="oc-width-1-1"
                appearance="raw"
                justify-content="left"
                @click="dropItemResourceClicked(resource)"
              >
                <oc-resource
                  :resource="resource"
                  :is-resource-clickable="false"
                  :path-prefix="getPathPrefix(resource)"
                  :is-path-displayed="true"
                  :folder-link="getFolderLink(resource)"
                  :parent-folder-link-icon-additional-attributes="
                    getParentFolderLinkIconAdditionalAttributes(resource)
                  "
                  :parent-folder-name="getParentFolderName(resource)"
                />
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
import { useClientService, useFolderLink, useStore } from '../composables'
import { urlJoin } from '@ownclouders/web-client/src/utils'
import { useGettext } from 'vue3-gettext'
import DOMPurify from 'dompurify'
import { OcDrop } from '@ownclouders/design-system/src/components'
import { resolveFileNameDuplicate } from '../helpers'
import { DavProperties } from '@ownclouders/web-client/src/webdav'
import { useTask } from 'vue-concurrency'
import { debounce } from 'lodash-es'

const SEARCH_LIMIT = 7
const SEARCH_DEBOUNCE_TIME = 200
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
    const {
      getPathPrefix,
      getParentFolderName,
      getParentFolderLink,
      getParentFolderLinkIconAdditionalAttributes,
      getFolderLink
    } = useFolderLink()

    const dropRef = ref(null)
    const inputUrl = ref('')
    const inputFilename = ref('')
    const searchResults = ref(null)

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

    const searchTask = useTask(function* (signal, searchTerm: string) {
      searchTerm = `name:"*${searchTerm}*"`

      try {
        const { resources } = yield clientService.webdav.search(searchTerm, {
          searchLimit: SEARCH_LIMIT,
          davProperties: DavProperties.Default
        })

        searchResults.value = resources
      } catch (e) {
        // Don't show user facing error, as the core functionality does work without an intact search
        console.error(e)
        searchResults.value = []
      }
    })

    const debouncedSearch = debounce(() => {
      searchTask.perform(unref(inputUrl))
    }, SEARCH_DEBOUNCE_TIME)

    const isMaybeUrl = (input: string) => {
      const urlPrefixes = ['http://', 'https://']
      return urlPrefixes.some((prefix) => prefix.startsWith(input) || input.startsWith(prefix))
    }

    const dropItemUrlClicked = () => {
      inputUrl.value = unref(dropItemUrl)
      try {
        let filename = new URL(unref(dropItemUrl)).host
        if (unref(files).some((f) => f.name === `${filename}.url`)) {
          filename = resolveFileNameDuplicate(`${filename}.url`, 'url', unref(files)).slice(0, -4)
        }
        inputFilename.value = filename
      } catch (_) {}
    }

    const dropItemResourceClicked = (resource: Resource) => {
      const webURL = new URL(window.location.href)
      let filename = resource.name

      inputUrl.value = `${webURL.origin}/f/${resource.id}`

      if (unref(files).some((f) => f.name === `${filename}.url`)) {
        filename = resolveFileNameDuplicate(`${filename}.url`, 'url', unref(files)).slice(0, -4)
      }

      inputFilename.value = filename
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
        debouncedSearch()
      }
    })

    return {
      inputUrl,
      inputFilename,
      showDrop,
      dropRef,
      dropItemUrl,
      searchResults,
      confirmButtonDisabled,
      inputFileNameErrorMessage,
      searchTask,
      createShortcut,
      onKeyDownEnter,
      dropItemUrlClicked,
      dropItemResourceClicked,
      getPathPrefix,
      getFolderLink,
      getParentFolderLink,
      getParentFolderName,
      getParentFolderLinkIconAdditionalAttributes
    }
  }
})
</script>
<style lang="scss">
.create-shortcut-modal {
  &-url-extension {
    margin-bottom: calc(var(--oc-space-xsmall) + 1.3125rem);
  }
}

#create-shortcut-modal-contextmenu {
  width: 458px;

  .oc-resource-name {
    text-decoration: none !important;
  }

  li:hover {
    background-color: var(--oc-color-background-highlight);
  }
}
</style>
