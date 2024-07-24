<template>
  <div v-if="isFolderLoading" class="oc-width-1-1">
    <div class="oc-position-center">
      <oc-spinner :aria-label="$gettext('Loading media file')" size="xlarge" />
    </div>
  </div>
  <div
    v-else
    ref="preview"
    class="oc-flex oc-width-1-1 oc-height-1-1"
    tabindex="-1"
    @keydown.left="goToPrev"
    @keydown.right="goToNext"
  >
    <div class="stage" :class="{ lightbox: isFullScreenModeActivated }">
      <div class="stage_media">
        <div v-if="!activeMediaFileCached || activeMediaFileCached.isLoading" class="oc-width-1-1">
          <div class="oc-position-center">
            <oc-spinner :aria-label="$gettext('Loading media file')" size="xlarge" />
          </div>
        </div>
        <div
          v-else-if="activeMediaFileCached.isError"
          class="oc-width-1-1 oc-flex oc-flex-column oc-flex-middle oc-flex-center"
        >
          <oc-icon name="file-damage" variation="danger" size="xlarge" />
          <p>
            {{ $gettext('Failed to load "%{filename}"', { filename: activeMediaFileCached.name }) }}
          </p>
        </div>
        <media-image
          v-else-if="activeMediaFileCached.isImage"
          :file="activeMediaFileCached"
          :current-image-rotation="currentImageRotation"
          :current-image-zoom="currentImageZoom"
          :current-image-position-x="currentImagePositionX"
          :current-image-position-y="currentImagePositionY"
          @pan-zoom-change="onPanZoomChanged"
        />
        <media-video
          v-else-if="activeMediaFileCached.isVideo"
          :file="activeMediaFileCached"
          :is-auto-play-enabled="isAutoPlayEnabled"
        />
        <media-audio
          v-else-if="activeMediaFileCached.isAudio"
          :file="activeMediaFileCached"
          :resource="activeFilteredFile"
          :is-auto-play-enabled="isAutoPlayEnabled"
        />
      </div>
      <media-controls
        class="stage_controls"
        :files="filteredFiles"
        :active-index="activeIndex"
        :is-full-screen-mode-activated="isFullScreenModeActivated"
        :is-folder-loading="isFolderLoading"
        :show-image-controls="activeMediaFileCached?.isImage && !activeMediaFileCached?.isError"
        :current-image-rotation="currentImageRotation"
        :current-image-zoom="currentImageZoom"
        @set-rotation="currentImageRotation = $event"
        @set-zoom="currentImageZoom = $event"
        @reset-image="resetImage"
        @toggle-full-screen="toggleFullScreenMode"
        @toggle-previous="goToPrev"
        @toggle-next="goToNext"
      />
    </div>
  </div>
</template>
<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  unref,
  PropType,
  nextTick,
  getCurrentInstance,
  watch,
  Ref
} from 'vue'
import { RouteLocationRaw } from 'vue-router'
import { Resource } from '@ownclouders/web-client'
import {
  AppFileHandlingResult,
  AppFolderHandlingResult,
  FileContext,
  ProcessorType,
  SortDir,
  createFileRouteOptions,
  queryItemAsString,
  sortHelper,
  useRoute,
  useRouteQuery,
  useRouter,
  usePreviewService
} from '@ownclouders/web-pkg'
import MediaControls from './components/MediaControls.vue'
import MediaAudio from './components/Sources/MediaAudio.vue'
import MediaImage from './components/Sources/MediaImage.vue'
import MediaVideo from './components/Sources/MediaVideo.vue'
import { CachedFile } from './helpers/types'
import {
  useFileTypes,
  useFullScreenMode,
  useImageControls,
  usePreviewDimensions
} from './composables'
import { mimeTypes } from './mimeTypes'

export const appId = 'preview'
const PRELOAD_COUNT = 5

export default defineComponent({
  name: 'Preview',
  components: {
    MediaControls,
    MediaAudio,
    MediaImage,
    MediaVideo
  },
  props: {
    activeFiles: { type: Object as PropType<Resource[]>, required: true },
    currentFileContext: { type: Object as PropType<FileContext>, required: true },
    loadFolderForFileContext: {
      type: Function as PropType<AppFolderHandlingResult['loadFolderForFileContext']>,
      required: true
    },
    getUrlForResource: {
      type: Function as PropType<AppFileHandlingResult['getUrlForResource']>,
      required: true
    },
    revokeUrl: { type: Function as PropType<AppFileHandlingResult['revokeUrl']>, required: true },
    isFolderLoading: { type: Boolean, required: true }
  },
  emits: ['update:resource'],
  setup(props, { emit }) {
    const router = useRouter()
    const route = useRoute()
    const contextRouteQuery = useRouteQuery('contextRouteQuery') as unknown as Ref<
      Record<string, string>
    >
    const { isFileTypeAudio, isFileTypeImage, isFileTypeVideo } = useFileTypes()
    const previewService = usePreviewService()
    const { dimensions } = usePreviewDimensions()

    const activeIndex = ref<number>()
    const cachedFiles = ref<Record<string, CachedFile>>({})
    const folderLoaded = ref(false)
    const isAutoPlayEnabled = ref(true)
    const preview = ref<HTMLElement>()

    const sortBy = computed(() => {
      if (!unref(contextRouteQuery)) {
        return 'name'
      }
      return unref(contextRouteQuery)['sort-by'] ?? 'name'
    })
    const sortDir = computed<SortDir>(() => {
      if (!unref(contextRouteQuery)) {
        return SortDir.Desc
      }
      return (unref(contextRouteQuery)['sort-dir'] as SortDir) ?? SortDir.Asc
    })

    const filteredFiles = computed(() => {
      if (!props.activeFiles) {
        return []
      }

      const files = props.activeFiles.filter((file) => {
        return mimeTypes.includes(file.mimeType?.toLowerCase())
      })

      return sortHelper(files, [{ name: unref(sortBy) }], unref(sortBy), unref(sortDir))
    })
    const activeFilteredFile = computed(() => {
      return unref(filteredFiles)[unref(activeIndex)]
    })
    const activeMediaFileCached = computed(() => {
      return unref(cachedFiles)[unref(activeFilteredFile)?.id]
    })

    const loadFileIntoCache = async (file: Resource) => {
      if (Object.hasOwn(unref(cachedFiles), file.id)) {
        return
      }

      const cachedFile: CachedFile = {
        id: file.id,
        name: file.name,
        url: undefined,
        ext: file.extension,
        mimeType: file.mimeType,
        isVideo: isFileTypeVideo(file),
        isImage: isFileTypeImage(file),
        isAudio: isFileTypeAudio(file),
        isLoading: ref(true),
        isError: ref(false)
      }
      cachedFiles.value[file.id] = cachedFile

      try {
        if (cachedFile.isImage) {
          cachedFile.url = await previewService.loadPreview(
            {
              space: unref(props.currentFileContext.space),
              resource: file,
              dimensions: unref(dimensions),
              processor: ProcessorType.enum.fit
            },
            false,
            false
          )
          return
        }
        cachedFile.url = await props.getUrlForResource(unref(props.currentFileContext.space), file)
      } catch (e) {
        console.error(e)
        cachedFile.isError.value = true
      } finally {
        cachedFile.isLoading.value = false
      }
    }

    const updateLocalHistory = () => {
      // this is a rare edge case when browsing quickly through a lot of files
      // we workaround context being null, when useDriveResolver is in loading state
      if (!props.currentFileContext) {
        return
      }

      const { params, query } = createFileRouteOptions(
        unref(props.currentFileContext.space),
        unref(activeFilteredFile)
      )
      router.replace({
        ...unref(route),
        params: { ...unref(route).params, ...params },
        query: { ...unref(route).query, ...query }
      })
    }

    const instance = getCurrentInstance()
    watch(
      props.currentFileContext,
      async () => {
        if (!props.currentFileContext) {
          return
        }

        if (!unref(folderLoaded)) {
          await props.loadFolderForFileContext(props.currentFileContext)
          folderLoaded.value = true
        }

        ;(instance.proxy as any).setActiveFile(unref(props.currentFileContext.driveAliasAndItem))
      },
      { immediate: true }
    )

    watch(activeFilteredFile, (file) => {
      emit('update:resource', file)
    })

    const loading = computed(() => {
      if (props.isFolderLoading) {
        return true
      }
      const file = unref(activeMediaFileCached)
      if (!file) {
        return true
      }
      return unref(file.isLoading)
    })
    watch(
      loading,
      async (loading) => {
        if (!loading) {
          await nextTick()
          unref(preview).focus()
        }
      },
      { immediate: true }
    )

    return {
      ...useImageControls(),
      ...useFullScreenMode(),
      activeFilteredFile,
      activeIndex,
      activeMediaFileCached,
      cachedFiles,
      filteredFiles,
      updateLocalHistory,
      isAutoPlayEnabled,
      preview,
      isFileTypeImage,
      loadFileIntoCache
    }
  },

  watch: {
    activeIndex(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.loadFileIntoCache(this.activeFilteredFile)
        this.preloadImages()
      }

      if (oldValue !== null) {
        this.isAutoPlayEnabled = false
      }

      this.currentImageZoom = 1
      this.currentImageRotation = 0
    }
  },

  mounted() {
    // keep a local history for this component
    window.addEventListener('popstate', this.handleLocalHistoryEvent)
  },

  beforeUnmount() {
    window.removeEventListener('popstate', this.handleLocalHistoryEvent)

    Object.values(this.cachedFiles).forEach((cachedFile) => {
      this.revokeUrl(cachedFile.url)
    })
  },

  methods: {
    setActiveFile(driveAliasAndItem: string) {
      for (let i = 0; i < this.filteredFiles.length; i++) {
        if (
          unref(this.currentFileContext.space)?.getDriveAliasAndItem(this.filteredFiles[i]) ===
          driveAliasAndItem
        ) {
          this.activeIndex = i
          return
        }
      }
    },
    // react to PopStateEvent ()
    handleLocalHistoryEvent() {
      const result = this.$router.resolve(document.location as unknown as RouteLocationRaw)
      this.setActiveFile(queryItemAsString(result.params.driveAliasAndItem))
    },
    goToNext() {
      if (this.activeIndex + 1 >= this.filteredFiles.length) {
        this.activeIndex = 0
        this.updateLocalHistory()
        return
      }
      this.activeIndex++
      this.updateLocalHistory()
    },
    goToPrev() {
      if (this.activeIndex === 0) {
        this.activeIndex = this.filteredFiles.length - 1
        this.updateLocalHistory()
        return
      }
      this.activeIndex--
      this.updateLocalHistory()
    },
    preloadImages() {
      const preloadFile = (preloadFileIndex: number) => {
        let cycleIndex =
          (((this.activeIndex + preloadFileIndex) % this.filteredFiles.length) +
            this.filteredFiles.length) %
          this.filteredFiles.length

        const file = this.filteredFiles[cycleIndex]
        this.loadFileIntoCache(file)
      }

      for (let followingFileIndex = 1; followingFileIndex <= PRELOAD_COUNT; followingFileIndex++) {
        preloadFile(followingFileIndex)
      }

      for (
        let previousFileIndex = -1;
        previousFileIndex >= PRELOAD_COUNT * -1;
        previousFileIndex--
      ) {
        preloadFile(previousFileIndex)
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.stage {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  text-align: center;

  &_media {
    flex-grow: 1;
    overflow: hidden;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &_controls {
    height: auto;
    margin: 10px auto;
  }
}
</style>
