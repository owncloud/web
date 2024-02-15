<template>
  <div class="epub-reader oc-flex">
    <oc-list class="epub-reader-chapters-list oc-pl-s oc-visible@l">
      <li
        v-for="chapter in chapters"
        :key="chapter.id"
        class="epub-reader-chapters-list-item oc-mt-xs"
        :class="{ active: currentChapter.id === chapter.id }"
      >
        <oc-button class="oc-text-truncate" appearance="raw" @click="showChapter(chapter)">
          <span
            v-oc-tooltip="chapter.label"
            class="oc-text-truncate oc-text-small oc-mr-s"
            v-text="chapter.label"
          />
        </oc-button>
      </li>
    </oc-list>
    <div class="oc-flex oc-flex-center oc-width-1-1">
      <div class="oc-flex oc-flex-middle oc-mx-l">
        <oc-button :disabled="navigateLeftDisabled" appearance="raw" @click="navigateLeft">
          <oc-icon name="arrow-left-s" fill-type="line" size="xlarge" />
        </oc-button>
      </div>
      <div id="reader" ref="bookContainer" class="oc-flex oc-flex-center" />
      <div class="oc-flex oc-flex-middle oc-mx-l">
        <oc-button :disabled="navigateRightDisabled" appearance="raw" @click="navigateRight">
          <oc-icon name="arrow-right-s" fill-type="line" size="xlarge" />
        </oc-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, PropType, ref, unref, watch } from 'vue'
import { Resource } from '@ownclouders/web-client/src/helpers/resource/types'
import { AppConfigObject, Key, useKeyboardActions, useThemeStore } from '@ownclouders/web-pkg'
import ePub, { Book, NavItem, Rendition } from 'epubjs'

const DARK_THEME_CONFIG = {
  html: {
    '-webkit-filter': 'invert(1) hue-rotate(180deg)',
    filter: 'invert(1) hue-rotate(180deg)'
  },
  img: {
    '-webkit-filter': 'invert(1) hue-rotate(180deg)',
    filter: 'invert(1) hue-rotate(180deg)'
  }
}

const LIGHT_THEME_CONFIG = {
  html: { background: 'white' }
}

export default defineComponent({
  name: 'EpubReader',
  props: {
    applicationConfig: { type: Object as PropType<AppConfigObject>, required: true },
    currentContent: {
      type: String,
      required: true
    },
    isReadOnly: { type: Boolean, required: false },
    resource: { type: Object as PropType<Resource>, required: true }
  },
  emits: ['close'],
  setup(props) {
    const keyboardActions = useKeyboardActions()
    const bookContainer = ref<Element>()
    const chapters = ref<NavItem[]>([])
    const currentChapter = ref<NavItem>()
    const navigateLeftDisabled = ref(true)
    const navigateRightDisabled = ref(false)
    const themeStore = useThemeStore()
    let book: Book
    let rendition: Rendition

    const navigateLeft = () => {
      rendition.prev()
    }

    const navigateRight = () => {
      rendition.next()
    }

    const showChapter = (chapter: NavItem) => {
      rendition.display(chapter.href)
    }

    keyboardActions.bindKeyAction({ primary: Key.ArrowLeft }, () => navigateLeft())
    keyboardActions.bindKeyAction({ primary: Key.ArrowRight }, () => navigateRight())

    watch(
      () => props.currentContent,
      async () => {
        await nextTick()

        if (book) {
          book.destroy()
        }

        book = ePub(props.currentContent)
        book.loaded.navigation.then(({ toc }) => {
          chapters.value = toc
          currentChapter.value = toc[0]
        })

        rendition = book.renderTo(unref(bookContainer), {
          flow: 'paginated',
          width: 650,
          height: '100%'
        })

        rendition.themes.register('dark', DARK_THEME_CONFIG)
        rendition.themes.register('light', LIGHT_THEME_CONFIG)
        rendition.themes.select(themeStore.currentTheme.isDark ? 'dark' : 'light')
        rendition.display()

        rendition.on('keydown', (event: KeyboardEvent) => {
          if (event.key === Key.ArrowLeft) {
            navigateLeft()
          }
          if (event.key === Key.ArrowRight) {
            navigateRight()
          }
        })

        rendition.on('relocated', () => {
          const currentLocation = rendition.currentLocation() as any
          const locationCfi = currentLocation.start.cfi
          const spineItem = book.spine.get(locationCfi)
          const navItem = book.navigation.get(spineItem.href)

          // Might be sub nav item and therefore undefined
          if (navItem) {
            currentChapter.value = navItem
          }

          navigateLeftDisabled.value = currentLocation.atStart === true
          navigateRightDisabled.value = currentLocation.atEnd === true
        })
      },
      {
        immediate: true
      }
    )

    return {
      bookContainer,
      navigateLeft,
      navigateLeftDisabled,
      navigateRight,
      navigateRightDisabled,
      currentChapter,
      chapters,
      showChapter
    }
  }
})
</script>
<style lang="scss">
.epub-reader {
  &-chapters-list {
    background: var(--oc-color-background-muted);
    border-right: 1px solid var(--oc-color-border);
    width: 240px;
    overflow-y: auto;

    &-item:not(:last-child) {
      border-bottom: 1px solid var(--oc-color-border);
      padding-bottom: var(--oc-space-xsmall);
    }

    &-item.active {
      .oc-button {
        color: var(--oc-color-swatch-primary-default);
      }
    }
  }
}
</style>
