<template>
  <nav :class="`oc-breadcrumb oc-breadcrumb-${variation}`">
    <ol class="oc-breadcrumb-list oc-flex oc-m-rm oc-p-rm">
      <li
        v-for="(item, index) in items"
        :key="index"
        class="oc-breadcrumb-list-item oc-flex oc-flex-middle"
      >
        <router-link v-if="item.to" :aria-current="getAriaCurrent(index)" :to="item.to">
          <span v-if="shortenItemShown(item.text)" v-oc-tooltip="item.text">{{
            getItemText(item.text)
          }}</span>
          <span v-else>{{ item.text }}</span>
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
          @click="item.onClick"
        >
          <span v-if="shortenItemShown(item.text)" v-oc-tooltip="item.text">{{
            getItemText(item.text)
          }}</span>
          <span v-else>{{ item.text }}</span>
        </oc-button>
        <span
          v-else-if="shortenItemShown(item.text)"
          v-oc-tooltip="item.text"
          :aria-current="getAriaCurrent(index)"
          tabindex="-1"
          v-text="getItemText(item.text)"
        />
        <span v-else :aria-current="getAriaCurrent(index)" tabindex="-1" v-text="item.text" />
        <template v-if="showContextMenu && index === items.length - 1">
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
    <div class="oc-breadcrumb-drop">
      <label
        ref="mobileDropdown"
        tabindex="0"
        class="oc-breadcrumb-drop-label oc-flex oc-flex-middle oc-flex-between"
        @keydown.enter="clickMobileDropdown"
      >
        <span
          v-if="currentFolder"
          class="oc-breadcrumb-drop-label-text oc-text-truncate"
          aria-current="page"
          v-text="currentFolder.text"
        />
        <oc-icon
          class="oc-breadcrumb-drop-label-icon"
          name="arrow-down-s"
          :accessible-label="$gettext('Expand more')"
        />
      </label>
      <oc-drop v-if="dropdownItems">
        <ol>
          <li v-for="(item, index) in dropdownItems" :key="index">
            <router-link v-if="item.to" :aria-current="getAriaCurrent(index)" :to="item.to">
              {{ item.text }}
            </router-link>
            <oc-button
              v-else-if="item.onClick"
              justify-content="left"
              appearance="raw"
              :aria-current="getAriaCurrent(index)"
              @click="item.onClick"
            >
              {{ item.text }}
            </oc-button>
            <span v-else :aria-current="getAriaCurrent(index)" v-text="item.text" />
          </li>
        </ol>
      </oc-drop>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

import { AVAILABLE_SIZES } from '../../helpers/constants'

import OcButton from '../OcButton/OcButton.vue'
import OcDrop from '../OcDrop/OcDrop.vue'
import OcIcon from '../OcIcon/OcIcon.vue'
import { BreadcrumbItem } from 'web-app-files/src/helpers/breadcrumbs'

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
    /**
     * Defines the maximal length of a breadcrumb item. By longer item adds '...'. Defaults to 0 (no maximal length).
     */
    itemMaxLength: {
      type: Number,
      required: false,
      default: 0,
      validator: (value: number) => Number.isInteger(value) && value >= 0
    }
  },
  computed: {
    dropdownItems() {
      if (this.items.length <= 1 || !this.items) {
        return false
      }
      return [...this.items].reverse().slice(1)
    },
    currentFolder() {
      if (this.items.length === 0 || !this.items) {
        return false
      }
      return [...this.items].reverse()[0]
    },
    contextMenuLabel() {
      return this.$gettext('Show actions for current folder')
    },
    showContextMenu() {
      const contextMenuSlot = this.$slots.contextMenu
      if (!contextMenuSlot) {
        return false
      }
      const slotContent = contextMenuSlot()[0] ?? null
      return !!slotContent?.type?.name
    }
  },
  methods: {
    getAriaCurrent(index) {
      return this.items.length - 1 === index ? 'page' : null
    },
    clickMobileDropdown() {
      this.$refs.mobileDropdown.click()
    },
    getItemText(itemText) {
      return `${itemText.slice(0, this.itemMaxLength - 1)}...`
    },
    shortenItemShown(itemText) {
      return this.itemMaxLength && itemText.length - this.itemMaxLength > 3
    }
  }
})
</script>

<style lang="scss">
.oc-breadcrumb {
  overflow: hidden;

  &-list {
    @media (max-width: $oc-breakpoint-xsmall-max) {
      display: none !important;
    }

    list-style: none;
    align-items: baseline;
    flex-wrap: wrap;

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
  /* stylelint-enable */

  &-drop {
    @media (min-width: $oc-breakpoint-small-default) {
      display: none !important;
    }

    .oc-drop > .oc-card > ol {
      margin: 0;
      padding: 0;
      list-style: none;

      > li a,
      > li button,
      > li span {
        color: var(--oc-color-text-default);
        font-size: 0.875rem;
      }

      > li a:hover,
      > li span:hover,
      > li button:hover {
        color: var(--oc-color-swatch-brand-default);
      }

      li button {
        width: 100%;
      }
    }

    &-label {
      border: $global-border-width solid var(--oc-color-swatch-primary-muted);
      cursor: pointer;
      height: $global-control-height;
      padding: var(--oc-space-small);
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
