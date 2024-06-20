<template>
  <oc-text-input
    id="create-shortcut-modal-url-input"
    v-model="inputUrl"
    :label="$gettext('Shortcut to a webpage or file')"
    @keydown.up="onKeyUpDrop"
    @keydown.down="onKeyDownDrop"
    @keydown.esc="onKeyEscDrop"
    @keydown.enter="onKeyEnterDrop"
    @input="onInputUrlInput"
    @click="onClickUrlInput"
  />
  <oc-drop
    ref="dropRef"
    class="oc-pt-s"
    padding-size="remove"
    drop-id="create-shortcut-modal-contextmenu"
    mode="manual"
    position="bottom-start"
    :close-on-click="true"
    @hide-drop="onHideDrop"
    @show-drop="onShowDrop"
  >
    <oc-list>
      <li
        class="oc-p-xs selectable-item selectable-item-url"
        :class="{
          active: isDropItemActive(0)
        }"
      >
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
      <template v-if="searchResult?.values?.length">
        <li class="create-shortcut-modal-search-separator oc-text-muted oc-text-small oc-pl-xs">
          <span v-text="$gettext('Link to a file')" />
        </li>
        <li
          v-for="(value, index) in searchResult.values"
          :key="index"
          class="oc-p-xs selectable-item"
          :class="{
            active: isDropItemActive(index + 1)
          }"
        >
          <oc-button
            class="oc-width-1-1"
            appearance="raw"
            justify-content="left"
            @click="dropItemResourceClicked(value)"
          >
            <resource-preview :search-result="value" :is-clickable="false" />
          </oc-button>
        </li>
      </template>
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
    <span class="oc-ml-s oc-flex oc-flex-bottom create-shortcut-modal-url-extension">.url</span>
  </div>
  <div class="oc-flex oc-flex-right oc-flex-middle oc-mt-m">
    <oc-button
      class="oc-modal-body-actions-cancel oc-ml-s"
      appearance="outline"
      variation="passive"
      @click="onCancel"
      >{{ $gettext('Cancel') }}
    </oc-button>
    <oc-button
      class="oc-modal-body-actions-confirm oc-ml-s"
      appearance="filled"
      variation="primary"
      :disabled="confirmButtonDisabled"
      @click="onConfirm"
      >{{ $gettext('Create') }}
    </oc-button>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  ref,
  unref,
  computed,
  nextTick,
  Ref,
  watch,
  onMounted
} from 'vue'
import { Resource, SpaceResource } from '@ownclouders/web-client'
import { useClientService, useFolderLink, useRouter, useSearch, useStore } from '../composables'
import { urlJoin } from '@ownclouders/web-client/src/utils'
import { useGettext } from 'vue3-gettext'
import DOMPurify from 'dompurify'
import Mark from 'mark.js'
import { OcDrop } from '@ownclouders/design-system/src/components'
import { resolveFileNameDuplicate } from '../helpers'
import { useTask } from 'vue-concurrency'
import { debounce } from 'lodash-es'
import ResourcePreview from './Search/ResourcePreview.vue'
import { SearchResult, SearchResultValue } from './Search'
import { isLocationPublicActive } from '../router'

const SEARCH_LIMIT = 7
const SEARCH_DEBOUNCE_TIME = 200

export default defineComponent({
  name: 'CreateShortcutModal',
  components: { ResourcePreview },
  props: {
    space: {
      type: Object as PropType<SpaceResource>,
      required: true
    }
  },
  setup(props, { expose }) {
    const clientService = useClientService()
    const { $gettext } = useGettext()
    const store = useStore()
    const router = useRouter()
    const { search } = useSearch()
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
    const searchResult: Ref<SearchResult> = ref(null)
    const activeDropItemIndex = ref(null)
    const isDropOpen = ref(false)
    let markInstance = null

    const getInputUrlWithProtocol = (input: string) => {
      let url = input.trim()
      if (isMaybeUrl(url)) {
        return url
      }
      return `https://${url}`
    }

    const dropItemUrl = computed(() => {
      return getInputUrlWithProtocol(unref(inputUrl))
    })

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
      searchResult.value = null
      searchTerm = `name:"*${searchTerm}*" NOT name:"*.url"`

      try {
        searchResult.value = yield search(searchTerm, SEARCH_LIMIT)
      } catch (e) {
        // Don't show user facing error, as the core functionality does work without an intact search
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
      searchResult.value = null
      inputUrl.value = unref(dropItemUrl)
      try {
        let filename = new URL(unref(dropItemUrl)).host
        if (unref(files).some((f) => f.name === `${filename}.url`)) {
          filename = resolveFileNameDuplicate(`${filename}.url`, 'url', unref(files)).slice(0, -4)
        }
        inputFilename.value = filename
      } catch (_) {}
    }

    const dropItemResourceClicked = (item: SearchResultValue) => {
      searchResult.value = null
      const webURL = new URL(window.location.href)
      let filename = item.data.name

      inputUrl.value = `${webURL.origin}/f/${item.id}`

      if (unref(files).some((f) => f.name === `${filename}.url`)) {
        filename = resolveFileNameDuplicate(`${filename}.url`, 'url', unref(files)).slice(0, -4)
      }

      inputFilename.value = filename
    }

    const isDropItemActive = (index) => {
      return unref(activeDropItemIndex) === index
    }

    const findNextDropItemIndex = (previous = false) => {
      const elements = Array.from(document.querySelectorAll('li.selectable-item'))
      let index =
        unref(activeDropItemIndex) !== null
          ? unref(activeDropItemIndex)
          : previous
            ? elements.length
            : -1
      const increment = previous ? -1 : 1

      do {
        index += increment
        if (index < 0 || index > elements.length - 1) {
          return null
        }
      } while (elements[index].classList.contains('disabled'))

      return index
    }

    const onKeyUpDrop = () => {
      activeDropItemIndex.value = findNextDropItemIndex(true)
    }

    const onKeyDownDrop = () => {
      activeDropItemIndex.value = findNextDropItemIndex(false)
    }

    const onKeyEscDrop = (e: Event) => {
      if (!unref(isDropOpen)) {
        return
      }

      e.stopPropagation()
      ;(unref(dropRef) as InstanceType<typeof OcDrop>).hide()
    }

    const onKeyEnterDrop = (e: Event) => {
      if (!unref(isDropOpen)) {
        return
      }

      e.stopPropagation()
      if (unref(activeDropItemIndex) === null) {
        return
      }

      if (unref(activeDropItemIndex) === 0) {
        dropItemUrlClicked()
      } else {
        dropItemResourceClicked(unref(searchResult)?.values?.[unref(activeDropItemIndex) - 1])
      }

      ;(unref(dropRef) as InstanceType<typeof OcDrop>).hide()
    }

    const onHideDrop = () => {
      isDropOpen.value = false
      activeDropItemIndex.value = null
    }

    const onShowDrop = () => {
      isDropOpen.value = true
      activeDropItemIndex.value = 0
    }

    const onClickUrlInput = () => {
      const showDrop = inputUrl.value.trim().length

      if (showDrop) {
        ;(unref(dropRef) as InstanceType<typeof OcDrop>).show()
      }
    }

    const onInputUrlInput = async () => {
      await nextTick()

      const hideDrop = !inputUrl.value.trim().length

      if (hideDrop) {
        ;(unref(dropRef) as InstanceType<typeof OcDrop>).hide()
        return
      }

      ;(unref(dropRef) as InstanceType<typeof OcDrop>).show()

      if (!isLocationPublicActive(router, 'files-public-link')) {
        debouncedSearch()
      }
    }

    const onConfirm = async () => {
      try {
        // Omit possible xss code
        const sanitizedUrl = DOMPurify.sanitize(getInputUrlWithProtocol(unref(inputUrl)), {
          USE_PROFILES: { html: true }
        })

        const content = `[InternetShortcut]\nURL=${sanitizedUrl}`
        const path = urlJoin(unref(currentFolder).path, `${unref(inputFilename)}.url`)
        const resource = await clientService.webdav.putFileContents(props.space, {
          path,
          content
        })
        store.commit('Files/UPSERT_RESOURCE', resource)
        store.dispatch('hideModal')
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

    const onCancel = () => {
      store.dispatch('hideModal')
    }

    onMounted(async () => {
      await nextTick()
      markInstance = new Mark(unref(dropRef)?.$refs?.drop)
    })

    watch(
      searchResult,
      async () => {
        await nextTick()
        if (!unref(isDropOpen) || !markInstance) {
          return
        }

        markInstance.unmark()
        markInstance.mark(unref(inputUrl), {
          element: 'span',
          className: 'mark-highlight',
          exclude: ['.selectable-item-url *', '.create-shortcut-modal-search-separator *']
        })
      },
      { deep: true }
    )

    watch(activeDropItemIndex, () => {
      if (!unref(isDropOpen) || typeof unref(dropRef)?.$el?.scrollTo !== 'function') {
        return
      }

      const elements = unref(dropRef).$el.querySelectorAll('.selectable-item')

      unref(dropRef).$el.scrollTo(
        0,
        unref(activeDropItemIndex) === null
          ? 0
          : elements[unref(activeDropItemIndex)].getBoundingClientRect().y -
              elements[unref(activeDropItemIndex)].getBoundingClientRect().height
      )
    })

    expose({ onConfirm, onCancel })

    return {
      inputUrl,
      inputFilename,
      dropRef,
      dropItemUrl,
      searchResult,
      confirmButtonDisabled,
      inputFileNameErrorMessage,
      searchTask,
      onConfirm,
      onCancel,
      dropItemUrlClicked,
      dropItemResourceClicked,
      getPathPrefix,
      getFolderLink,
      getParentFolderLink,
      getParentFolderName,
      getParentFolderLinkIconAdditionalAttributes,
      onKeyEnterDrop,
      onKeyDownDrop,
      onKeyUpDrop,
      onKeyEscDrop,
      onHideDrop,
      onShowDrop,
      onInputUrlInput,
      onClickUrlInput,
      isDropItemActive
    }
  }
})
</script>
<style lang="scss">
.create-shortcut-modal {
  &-url-extension {
    margin-bottom: calc(var(--oc-space-xsmall) + 1.3125rem);
  }

  &-search-separator:hover {
    background: none !important;
  }
}

#create-shortcut-modal-contextmenu {
  width: 458px;

  .oc-resource-name {
    text-decoration: none !important;
  }

  li:hover,
  li.active {
    background-color: var(--oc-color-background-highlight);
  }
}
</style>
