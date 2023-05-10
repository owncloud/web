<template>
  <nav :id="id" :class="`oc-breadcrumb oc-breadcrumb-${variation}`">
    <ol class="oc-breadcrumb-list oc-flex oc-m-rm oc-p-rm">
      <li
        v-for="(item, index) in allItemsIncludingThreeDots"
        :key="index"
        :data-key="index"
        :class="[
          'oc-breadcrumb-list-item',
          'oc-flex',
          'oc-flex-middle',
          {
            hide:
              hiddenItems.indexOf(item) !== -1 ||
              (item.isPreviousHiddenFolder && hiddenItems.length === 0)
          }
        ]"
      >
        <router-link
          v-if="item.to"
          :aria-current="getAriaCurrent(index)"
          :to="item.isPreviousHiddenFolder ? lastHiddenItem.to : item.to"
        >
          <span class="oc-breadcrumb-item-text">{{ item.text }}</span>
        </router-link>
        <oc-icon
          v-if="item.to"
          color="var(--oc-color-text-default)"
          name="arrow-right-s"
          class="oc-mx-xs"
          fill-type="line"
        />
        <oc-button
          v-else-if="item.onClick"
          :aria-current="getAriaCurrent(index)"
          appearance="raw"
          class="oc-flex"
          @click="item.onClick"
        >
          <span class="oc-breadcrumb-item-text">{{ item.text }}</span>
        </oc-button>
        <span
          class="oc-breadcrumb-item-text"
          v-else
          :aria-current="getAriaCurrent(index)"
          tabindex="-1"
          v-text="item.text"
        />
        <template v-if="showContextActions && index === allItemsIncludingThreeDots.length - 1">
          <oc-button
            id="oc-breadcrumb-contextmenu-trigger"
            v-oc-tooltip="contextMenuLabel"
            :aria-label="contextMenuLabel"
            appearance="raw"
          >
            <oc-icon name="more-2" color="var(--oc-color-text-default)" />
          </oc-button>
          <oc-drop
            drop-id="oc-breadcrumb-contextmenu"
            toggle="#oc-breadcrumb-contextmenu-trigger"
            mode="click"
            close-on-click
            :padding-size="contextMenuPadding"
          >
            <!-- @slot Add context actions that open in a dropdown when clicking on the "three dots" button -->
            <slot name="contextMenu" />
          </oc-drop>
        </template>
      </li>
    </ol>
    <oc-button
      v-if="allItemsIncludingThreeDots.length > 1"
      appearance="raw"
      type="router-link"
      :aria-label="$gettext('Navigate one level up')"
      :to="parentFolderTo"
      class="oc-breadcrumb-mobile-navigation"
    >
      <oc-icon name="arrow-left-s" fill-type="line" size="large" class="oc-mr-m" />
    </oc-button>
  </nav>
  <div v-if="allItemsIncludingThreeDots.length > 1" class="oc-breadcrumb-mobile-current">
    <span class="oc-text-truncate" aria-current="page" v-text="currentFolder.text" />
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  PropType,
  ref,
  unref,
  watch
} from 'vue'
import { useGettext } from 'vue3-gettext'

import { AVAILABLE_SIZES } from '../../helpers/constants'

import OcButton from '../OcButton/OcButton.vue'
import OcDrop from '../OcDrop/OcDrop.vue'
import OcIcon from '../OcIcon/OcIcon.vue'
import uniqueId from '../../utils/uniqueId'

import { BreadcrumbItem } from './types'

/**
 * Displays a breadcrumb. Each item in the items property has the following elements:
 *
 *  - text: mandatory element, holds the text which is to be displayed in the breadcrumb
 *  - to: optional element, the vue router link
 */
export default defineComponent({
  name: 'OcBreadcrumb',
  status: 'ready',
  release: '1.0.0',

  components: {
    OcDrop,
    OcIcon,
    OcButton
  },
  props: {
    /**
     * Id for the breadcrumbs. If it's empty, a generated one will be used.
     */
    id: {
      type: String,
      required: false,
      default: () => uniqueId('oc-breadcrumbs-')
    },
    /**
     * Array of breadcrumb items
     */
    items: {
      type: Array as PropType<BreadcrumbItem[]>,
      required: true
    },
    /**
     * Variation of breadcrumbs
     * Can be `default` or `lead`
     */
    variation: {
      type: String,
      required: false,
      default: 'default',
      validator: (value) => value === 'lead' || value === 'default'
    },
    /**
     * Defines the padding size around the drop content. Defaults to `medium`.
     *
     * @values xsmall, small, medium, large, xlarge, xxlarge, xxxlarge, remove
     */
    contextMenuPadding: {
      type: String,
      required: false,
      default: 'medium',
      validator: (value) => {
        return [...AVAILABLE_SIZES, 'remove'].some((e) => e === value)
      }
    },

    calculateBreadcrumbMaxWidth: {
      type: Function,
      required: false,
      default: () => () => {
        return 500
      }
    },
    /**
     * Determines if the last breadcrumb item should have context menu actions.
     */
    showContextActions: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const { $gettext } = useGettext()
    const visibleItems = ref([])
    const hiddenItems = ref([])
    const allItemsIncludingThreeDots = ref(props.items.slice())

    const getBreadcrumbElement = (key): HTMLElement => {
      return document.querySelector(`[data-key="${key}"]`)
    }

    const calculateTotalBreadcrumbWidth = () => {
      let totalBreadcrumbWidth = 0
      visibleItems.value.forEach((item, index) => {
        const breadcrumbElement = getBreadcrumbElement(index)
        const itemClientWidth = breadcrumbElement?.offsetWidth + 10
        const itemWidth = itemClientWidth
        totalBreadcrumbWidth += itemWidth
      })
      return totalBreadcrumbWidth
    }

    const reduceBreadcrumb = (offsetIndex) => {
      const breadcrumbMaxWidth = props.calculateBreadcrumbMaxWidth()
      const totalBreadcrumbWidth = calculateTotalBreadcrumbWidth()

      const isOverflowing = breadcrumbMaxWidth < totalBreadcrumbWidth
      if (!isOverflowing) {
        return
      }
      // Remove from the left side
      const removed = visibleItems.value.splice(offsetIndex, 1)

      hiddenItems.value.push(removed[0])
      reduceBreadcrumb(offsetIndex)
    }

    const lastHiddenItem = computed(() => {
      if (hiddenItems.value.length >= 1) {
        return unref(hiddenItems)[unref(hiddenItems).length - 1]
      }
      return { to: {} }
    })

    const renderBreadcrumb = () => {
      allItemsIncludingThreeDots.value = props.items.slice()
      if (allItemsIncludingThreeDots.value.length > 1) {
        allItemsIncludingThreeDots.value.splice(1, 0, {
          text: '...',
          allowContextActions: false,
          to: {},
          isPreviousHiddenFolder: true
        })
      }
      visibleItems.value = allItemsIncludingThreeDots.value.slice()
      hiddenItems.value = []

      nextTick(() => {
        reduceBreadcrumb(2)
      })
    }

    const resizeObserver = new ResizeObserver((entries) => {
      renderBreadcrumb()
    })

    watch(
      () => props.items,
      () => {
        renderBreadcrumb()
      }
    )
    onMounted(() => {
      renderBreadcrumb()
      window.addEventListener('resize', renderBreadcrumb)
      resizeObserver.observe(document.getElementById('files-app-bar'))
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', renderBreadcrumb)
      resizeObserver.disconnect()
    })

    const currentFolder = computed<BreadcrumbItem>(() => {
      if (props.items.length === 0 || !props.items) {
        return undefined
      }
      return [...props.items].reverse()[0]
    })
    const parentFolderTo = computed(() => {
      return [...props.items].reverse()[1].to
    })

    const contextMenuLabel = computed(() => {
      return $gettext('Show actions for current folder')
    })

    const getAriaCurrent = (index): 'page' | null => {
      return props.items.length - 1 === index ? 'page' : null
    }

    return {
      currentFolder,
      parentFolderTo,
      contextMenuLabel,
      getAriaCurrent,
      visibleItems,
      hiddenItems,
      renderBreadcrumb,
      allItemsIncludingThreeDots,
      lastHiddenItem
    }
  }
})
</script>

<style lang="scss">
.hide {
  display: none;
}
.oc-breadcrumb {
  overflow: hidden;
  &-item-text {
    display: flex !important;
    max-width: 100px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  &-mobile-current,
  &-mobile-navigation {
    @media (min-width: $oc-breakpoint-small-default) {
      display: none !important;
    }
  }

  &-list {
    @media (max-width: $oc-breakpoint-xsmall-max) {
      display: none !important;
    }

    list-style: none;
    align-items: baseline;
    flex-wrap: nowrap;

    span {
      white-space: nowrap;
    }

    #oc-breadcrumb-contextmenu-trigger > span {
      vertical-align: middle;
      border: 3px solid transparent;
    }

    #oc-breadcrumb-contextmenu li button {
      display: inline-flex;
    }

    > li button {
      display: inline;
    }

    > :nth-child(n + 2)::before {
      color: var(--oc-color-text-default);
      display: inline-block;
    }

    > :last-child > span {
      color: var(--oc-color-text-default);
    }

    > li a:hover,
    > li span:not([aria-current='page']):not(.oc-icon):hover,
    > li button:hover {
      text-decoration: underline;
    }
  }

  /* stylelint-disable */
  &-list-item {
    a:first-of-type,
    button:first-of-type,
    span:first-of-type {
      font-size: var(--oc-font-size-medium);
      color: var(--oc-color-text-default);
      display: inline-block;
    }
  }

  &-lead &-list-item {
    a,
    button,
    span {
      font-size: var(--oc-font-size-large);
    }
  }
}
</style>

<docs>
```js
<template>
<section>
  <div>
    <oc-breadcrumb :items="items" />
  </div>
  <div>
    <oc-breadcrumb :items="items" variation="lead" />
    <oc-breadcrumb :items="items" >
      <template v-slot:contextMenu>
        <p class="oc-my-rm">I'm an example item</p>
      </template>
    </oc-breadcrumb>
  </div>
</section>
</template>
<script>
  export default {
    data: () => {
      return {
        items: [
          {text:'First folder',to:{path:'folder'}},
          {text:'Subfolder', to: {path: 'subfolder'}},
          {text:'Deep',to:{path:'deep'}},
          {text:'Deeper ellipsize in responsive mode'},
        ]
      }
    }
  }
</script>
```
</docs>
